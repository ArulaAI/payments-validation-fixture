# RFC: Adaptive authorisation, card-testing detection (F2.2)

> See [F2.2 card testing](../../product/adaptive-auth/2-card-testing.md) for product context.
> Parent RFC: [1-high-value-traveller.md](1-high-value-traveller.md)
> Depends on: [1-high-value-traveller.md](1-high-value-traveller.md)
> See [architecture](../../architecture/adaptive-auth.md) and [platform architecture](../../architecture/overview.md).
> See [review queue design](../../design/adaptive-auth/2-risk-review-queue.md).

Owner: payments-engineering. Version 0.1 (draft, 9 October 2026).

Detects card testing spread across merchants, declines further attempts that match a
flagged attack, notifies affected merchants, and lets analysts see and release blocks.

The architecture says the scoring service is stateless, and the platform has no shared
cache. Card testing can only be seen across requests, merchants and replicas, so this RFC
adds shared state on the primary Postgres cluster, which every replica can already reach.
It needs no new infrastructure and no change to the scoring service.

## Basic Example

```ts
// The 3 October replay from test/fixtures/traffic.ts: 40 cards, 1.00 GBP each,
// 20 merchants, IP country rotating GB, NL, US, DE, one attempt every 4 seconds.
const results = cardTestingBurst(40).map(r => gateway.authorise(r.request));

results.slice(0, 10).every(r => r.status === 'approved');   // before the attack is flagged
results.slice(11).every(r => r.status === 'declined');      // at most one attempt slips through

detector.activeAttacks();
// → [{ id: 'atk_000001', bin: '411111', amount: 100, cards: 10, merchants: 10, status: 'blocked', ... }]

attacks.release('atk_000001', 'analyst@ops', 'Marketplace promotion, genuine traffic');
```

## Interface Contract

### Consumes (from prerequisite RFCs)

From [1-high-value-traveller.md](1-high-value-traveller.md):

- `GatewayResult`, including `{ status: 'declined'; code: 'do_not_honour'; reason?: string }`.
- `ReasonCode` value `card_testing_pattern` and `cardholderReason(code)`.
- `AuditLog.record(entry: AuditEntry)` with `action: 'release' | 'expire'`.
- The review queue console session, which supplies analyst identity.

From existing code: the card key `${bin}:${last4}` already used by `RiskRules.evaluate`
in `src/risk/rules.ts`, and `AuthorisationGateway.authorise` in `src/payments/gateway.ts`.

### Produces (for downstream RFCs)

- `AttackDetector.activeAttacks(): Attack[]` and `AttackDetector.getAttack(id): Attack | undefined`.
- `BlockList.matches(req: { bin: string; amount: number }): Block | undefined`.
- `Attacks.release(id, analyst, reason): Attack`.

## Data Model

As in 1-high-value-traveller.md, every store is an interface with an in-memory implementation in this
repository and a Postgres implementation in production.

**AttemptRecord** (`src/risk/attempts.ts`), recorded for small-amount authorisations only

| Field | Type | Notes |
|---|---|---|
| cardKey | string | `${bin}:${last4}`, the key `RiskRules` uses. Never the PAN |
| bin | string | First six digits |
| amount | Minor | At or below `smallAmountCeiling` |
| merchantId | string | |
| ipCountry | string | Kept for the timeline; not part of the attack key |
| at | epoch ms | |

Retention: one hour, then deleted.

**Attack** (`src/risk/attacks.ts`)

| Field | Type | Notes |
|---|---|---|
| id | string | `atk_` prefix |
| bin | string | Attack key, part 1 |
| amount | Minor | Attack key, part 2 |
| firstSeenAt | epoch ms | First attempt in the window that triggered the flag |
| flaggedAt | epoch ms | |
| cards | integer | Distinct `cardKey` count |
| merchants | `{ merchantId, attempts, firstAt, lastAt }[]` | Merchants hit |
| status | `'blocked' \| 'released' \| 'expired'` | |
| releasedBy | string or null | |
| releaseReason | string or null | |

**Block** (`src/risk/blocks.ts`)

| Field | Type | Notes |
|---|---|---|
| attackId | string | FK to `Attack.id` |
| bin | string | |
| amountCeiling | Minor | Equals `smallAmountCeiling` |
| scope | `'all_merchants'` | See Key Decisions |
| expiresAt | epoch ms | `flaggedAt` + `blockTtl` |

**DetectorConfig** (configuration, owned by Risk)

| Field | Default | Meaning |
|---|---|---|
| smallAmountCeiling | 500 (5.00) | Only attempts at or below this are recorded or blocked |
| window | 120 s | Sliding window for detection |
| minCards | 10 | Distinct cards sharing the attack key |
| minMerchants | 5 | Distinct merchants sharing the attack key |
| blockTtl | 60 min | Block lifetime before expiry |
| refreshInterval | 1 s | How often replicas reload blocks and the detector runs. Attempts flush on the same interval, so a flag reaches every replica within about 3 s, inside the 4 s gap between burst attempts |

## State Machine

**Attack**

| From | Trigger | To | Effect |
|---|---|---|---|
| none | `minCards` distinct cards and `minMerchants` merchants share `(bin, amount)` within `window` | blocked | Block created; merchant notifications queued |
| blocked | analyst releases with reason | released | Block removed; audit `release` with analyst and reason |
| blocked | `expiresAt` passes | expired | Block removed; audit `expire` by `system` |
| released or expired | new attempts meet the threshold again | (new attack) blocked | A new attack id; history is kept |

Not allowed: releasing without a reason; releasing an attack that is not blocked;
extending a block in place (a renewed attack is a new record).

**Authorisation path** (added before scoring from 1-high-value-traveller.md)

| Condition | Result |
|---|---|
| `BlockList.matches({ bin, amount })` | `declined`, `do_not_honour`, reason code `card_testing_pattern`, cardholder reason from the allowlist |
| otherwise, amount ≤ `smallAmountCeiling` | Attempt recorded asynchronously; continue to scoring |
| otherwise | Continue to scoring |

## API Surface

**`AuthorisationGateway.authorise`** (changed again): checks `BlockList.matches` before
scoring. A block lookup is an in-memory read on the replica, refreshed every
`refreshInterval`, so it adds no network call to the authorisation path.

**`AttemptRecorder.record(attempt: AttemptRecord): void`**: buffers in memory and
flushes to the shared store every second. A flush failure is logged and retried; it never
fails an authorisation.

**`AttackDetector.run(now: number): Attack[]`**: runs every `refreshInterval` on one
elected replica. Returns attacks flagged on this run.

**Attacks console API** (operations console backend)

| Method | Input | Result and errors |
|---|---|---|
| `listAttacks()` | none | Blocked attacks, newest first |
| `getAttack(id)` | attack id | Attack with per-merchant timeline; `ATTACK_NOT_FOUND` |
| `release(id, analyst, reason)` | id, identity, reason | Released attack; `REASON_REQUIRED` when blank after trimming; `NOT_BLOCKED` when already released or expired |

**Merchant notification**: on flag, one message per affected merchant through the
existing merchant notification service (the one that sends settlement emails), then a
follow-up every 5 minutes while the block is active if more attempts were seen.

| Payload field | Content |
|---|---|
| attackId | Attack id |
| windowStart, windowEnd | First and last attempt at this merchant |
| attempts | Attempt count at this merchant |

No card data in the payload, not even masked or the BIN.

## Validation Rules

| Field | Constraints |
|-------|-------------|
| `DetectorConfig` | Positive integers; `minCards` ≥ 2; `minMerchants` ≥ 2; `blockTtl` between 5 minutes and 24 hours. Invalid configuration fails start-up |
| `AttemptRecord.cardKey` | Exactly `${bin}:${last4}`; a PAN-shaped value is rejected before storage |
| Release reason | Non-empty after trimming, at most 1,000 characters |
| Analyst identity | From the console session, never the request body |
| Notification payload | Rejected if any field contains a digit run of 6 or more that is not an id or count |

## Testing

### Acceptance Criteria

| ID | Observable behaviour | Product story or criterion |
|---|---|---|
| AC1 | Replaying `cardTestingBurst(40)` flags one attack within 60 seconds of its first attempt | ST6, 60-second criterion |
| AC2 | At least 95% of the burst's attempts after the tenth are declined. GW-05 changes to assert this | ST7, 95% criterion |
| AC3 | Detection works when the burst is spread across two gateway instances sharing one attempt store. GW-06's per-replica problem does not apply | ST6, platform runtime |
| AC4 | While the block is active, `travellerTelevision` and `domesticGroceries` are not declined by it | ST7 vs F2.1 |
| AC5 | Each affected merchant receives one notification with window and count, and no card data, within 15 minutes | ST8, 15-minute criterion |
| AC6 | An analyst can list attacks, open one with its merchants and timeline, and release it with a reason; the release is audit logged with identity and reason | ST9, Security |
| AC7 | Release without a reason is rejected | Security |
| AC8 | An unreleased block expires after `blockTtl` and stops declining | Security, blocks must expire |
| AC9 | The block check adds under 1 ms p99 to the authorisation path | Platform latency budget |

### Risks and Coverage

| Risk | Severity | Test Approach |
|------|----------|---------------|
| A flash sale looks like card testing | High | Genuine-traffic fixture with many small payments on one BIN at many merchants; measure false declines; release path (AC6) |
| Block catches genuine travellers (F2.1's problem) | High | High-value and domestic fixtures during an active block (AC4) |
| Detection lag lets the burst through | High | Replay with real timings; count declines after the tenth attempt (AC2) |
| Attackers rotate BIN or amount | Medium | Variant bursts with two BINs and varying amounts; record what is and is not caught |
| Shared store unavailable | Medium | Store failure stub: authorisations continue, detection pauses, an alert is logged |
| Card data in notifications | High | Payload validation and snapshot (AC5) |

### Test Plan

**Unit tests**

`src/risk/attacks.ts`: thresholds at `minCards` − 1 and `minMerchants` − 1, window edges,
renewed attack after release. `src/risk/blocks.ts`: match, ceiling edge, expiry.
`src/risk/attempts.ts`: buffering and PAN rejection.

**Integration tests**

`test/gateway.test.ts`: GW-05 and GW-06 rewritten as AC2 and AC3, with a fake clock
driving `AttackDetector.run` and the replica refresh. Notification and release against an
in-memory notification sink.

**End-to-end tests**

The attacks pages live in the operations console repository and are tested there.

**Visual/UI tests**

Out of this repository. See the review queue design.

### Edge Cases

- Exactly `minCards` cards at exactly `minMerchants` merchants on the window edge.
- Same card retried many times: one distinct card, not an attack.
- Two simultaneous attacks on different BINs.
- Release, then the attack resumes: a new attack id.
- Clock skew between replicas of up to 1 second.
- Amount exactly at `smallAmountCeiling`.

### Out of Scope

Reporting stolen cards to issuers and checkout bot challenges (out of scope in the PRD).
Changing `CARD_VELOCITY`; it stays as it is.

## Security & Controls

- Attempt records hold `${bin}:${last4}`, never the PAN or token, and are deleted after one
  hour.
- Merchant notifications carry no card data, not even masked.
- Release is an analyst action from an authenticated console session, audit logged with
  identity and reason. Expiry is audit logged as `system`.
- Blocks expire. No block outlives `blockTtl` without a new attack being flagged.

## Key Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|----------|--------|------------------------|-----------|
| What "one source" means | `(BIN, small amount)` seen on many distinct cards at many merchants | IP address; device fingerprint | The 3 October burst rotated IP country on every attempt. It shared a BIN and a 1.00 amount. We receive no device data |
| Shared state | Attempt and block tables on the primary Postgres cluster | Managed Redis or Kafka; per-replica memory | Postgres exists today. Redis and Kafka have a four-week lead time. Per-replica memory is the GW-06 failure |
| Detection placement | Asynchronous detector; in-memory block check on the path | Synchronous cross-replica query per authorisation | Keeps the risk decision inside 40 ms |
| Block scope | All merchants, small amounts on the flagged BIN only | Only merchants already hit | The attack moves between merchants by design; limiting to amounts below the ceiling keeps travellers out (C5) |
| Stateless scorer | Unchanged | Give the scorer cross-request features | Keeps 1-high-value-traveller.md's model contract; detection is a separate component the gateway consults |

## Drawbacks

- Genuine small payments on a flagged BIN are declined for up to `blockTtl`.
- An attacker who varies amount or spreads across BINs can stay under the threshold.
- The first ten or so attempts in every attack are approved by design.
- Adds write load to the primary Postgres cluster, which also holds the ledger.

## Search / Query Strategy

The detector queries attempts in the last `window` grouped by `(bin, amount)` with
`count(distinct card_key)` and `count(distinct merchant_id)`. Index on `(at, bin, amount)`.
Small-amount attempts only, so volume is a fraction of authorisations.

## Migration Strategy

Ship in shadow mode: detect and log attacks, notify nobody, block nothing. After a week
of comparing flagged attacks with confirmed fraud, enable blocking, then notifications.
Rollback is a configuration flag. New tables only; no existing data changes.

## File Impact

| File | Change |
|---|---|
| `src/payments/gateway.ts` | Block check before scoring; attempt recording |
| `src/risk/attempts.ts` (new) | `AttemptRecorder`, `AttemptRecord` |
| `src/risk/attacks.ts` (new) | `AttackDetector`, `Attack` |
| `src/risk/blocks.ts` (new) | `BlockList`, `Block`, refresh |
| `src/review/attacks.ts` (new) | Attacks console API, release |
| `src/notify/merchant.ts` (new) | Merchant notification payloads |
| `test/gateway.test.ts` | GW-05 and GW-06 rewritten; new detection cases |
| `test/fixtures/traffic.ts` | Add a genuine flash-sale fixture |

## Dependencies

- [1-high-value-traveller.md](1-high-value-traveller.md): `GatewayResult` with reasons, the reason allowlist, the audit log and the
  analyst console session.
- Attempt and block tables on the primary Postgres cluster (platform engineering).
- The merchant notification service, with a new message type.

## Unresolved Questions

1. **Block length** (blocks enabling blocking): proposed 60 minutes. PM with Risk to
   confirm.
2. **Block scope** (blocks enabling blocking): proposed all merchants, small amounts only.
   PM with Risk to confirm. F2.1's PM should agree that this cannot catch travellers.
3. **Detection thresholds** (does not block shadow mode): `minCards` 10 and
   `minMerchants` 5 catch the 3 October replay. Data science to check against genuine
   traffic for the 1-in-1,000 false-decline criterion.
4. **Merchant notification design** (blocks notifications): there is no design for the
   merchant message. Design to add one.
5. **Review queue design product link** (does not block): the queue design links only
   F2.2 but also serves F2.1's held payments.
