# RFC: Adaptive authorisation, scored decisions and step-up (F2.1)

> See [F2.1 high-value purchases](../../product/adaptive-auth/1-high-value-traveller.md) for product context.
> See [architecture](../../architecture/adaptive-auth.md) and [platform architecture](../../architecture/overview.md).
> See [checkout step-up design](../../design/adaptive-auth/1-checkout-challenge.md) and [review queue design](../../design/adaptive-auth/2-risk-review-queue.md).

Owner: payments-engineering. Version 0.1 (draft, 9 October 2026).

Replaces the `HIGH_VALUE_CROSS_BORDER` rule in `src/risk/rules.ts` with a scored decision
that can approve, step up, hold or decline. Builds the review queue and the audit log that
[2-card-testing.md](2-card-testing.md) (card testing) extends. `CARD_VELOCITY` stays as it is; card testing replaces
it in 2-card-testing.md.

## Basic Example

```ts
const gateway = new AuthorisationGateway(payments, { scorer, policy, stepUp, queue, audit });

// The traveller from test/fixtures/traffic.ts: 2,499.00 GBP, GB card, JP IP address.
const result = gateway.authorise(travellerTelevision.request);
// → { status: 'step_up', challengeId: 'chl_000001', reason: undefined }

const final = gateway.completeStepUp('chl_000001', 'authenticated');
// → { status: 'approved', payment: { id: 'pay_000001', status: 'authorised', ... } }
```

A score of 850 or more declines with a reason the cardholder can be shown:

```ts
// → { status: 'declined', code: 'do_not_honour', reason: 'Your bank could not approve this payment.' }
```

## Interface Contract

### Consumes (from prerequisite RFCs)

None. This is the first RFC in the adaptive authorisation family. It consumes existing
code: `AuthorisationGateway.authorise` in `src/payments/gateway.ts`,
`PaymentsService.authorise` in `src/payments/service.ts`, `issuerCountry` in
`src/risk/issuers.ts`, and `log` and `span` in `src/obs/index.ts`.

### Produces (for downstream RFCs)

Consumed by [2-card-testing.md](2-card-testing.md):

- `ScoringInput` type: `{ bin, amount, currency, issuerCountry, ipCountry, merchantId, merchantCategory, at }`. No PAN, no token.
- `GatewayResult` with the four statuses below, so card testing can decline through the same result type.
- `ReasonCode` union and `cardholderReason(code): string | undefined`.
- `AuditLog.record(entry: AuditEntry): void` and the `AuditEntry` type.
- `ReviewQueue` with the analyst identity and note contract, which 2-card-testing.md extends with attacks.

## Data Model

All stores are interfaces with an in-memory implementation in this repository and a
Postgres implementation in production, on the primary cluster with the ledger (platform
architecture, Runtime).

**ScoreResult** (`src/risk/scoring.ts`)

| Field | Type | Notes |
|---|---|---|
| score | integer 0 to 1000 | Higher is more likely fraudulent |
| reasons | `ReasonCode[]`, 1 to 3 | Top contributing features, most significant first |
| modelVersion | string | From the model file |

**ReasonCode**: `amount_unusual`, `country_mismatch`, `merchant_category_risk`,
`time_of_day`, `issuer_unknown`, `card_testing_pattern` (reserved for 2-card-testing.md).

**Decision** (`src/risk/policy.ts`)

| Field | Type | Notes |
|---|---|---|
| outcome | `'approve' \| 'step_up' \| 'hold' \| 'decline'` | |
| score | integer | |
| reasons | `ReasonCode[]` | |
| thresholdsVersion | string | Identifies the threshold configuration used |

**PolicyThresholds** (configuration, owned by Risk)

| Field | Default | Constraint |
|---|---|---|
| stepUpFrom | 300 | 0 ≤ stepUpFrom ≤ holdFrom |
| holdFrom | 700 | holdFrom ≤ declineFrom |
| declineFrom | 850 | declineFrom ≤ 1000 |
| version | `"arch-0.7-defaults"` | Non-empty |

**ReviewItem** (`src/review/queue.ts`)

| Field | Type | Notes |
|---|---|---|
| id | string | `rev_` prefix |
| paymentId | string | FK to `Payment.id`. The payment is authorised; capture is blocked |
| maskedCard | string | BIN and last four only |
| merchantId | string | |
| amount | Minor | |
| score | integer | |
| analystReason | string | From the top `ReasonCode`, analyst wording |
| narrative | string or null | Filled asynchronously; null until ready |
| heldAt | epoch ms | |
| status | `'held' \| 'approved' \| 'declined' \| 'expired'` | |
| decidedBy | string or null | Analyst identity |
| note | string or null | Required on decision |
| decidedAt | epoch ms or null | |

**AuditEntry** (`src/review/audit.ts`), append-only

| Field | Type | Notes |
|---|---|---|
| id | string | `aud_` prefix |
| action | `'hold' \| 'approve' \| 'decline' \| 'expire' \| 'release'` | `release` used by 2-card-testing.md |
| subjectId | string | Review item or, in 2-card-testing.md, attack id |
| actor | string | Analyst identity, or `system` |
| reason | string | Non-empty for analyst actions |
| at | epoch ms | |

**StepUpChallenge** (`src/risk/stepup.ts`)

| Field | Type | Notes |
|---|---|---|
| id | string | `chl_` prefix |
| request | pending authorisation | Held in memory only until the challenge completes |
| decision | Decision | The step-up decision that started it |
| status | `'pending' \| 'authenticated' \| 'not_authenticated' \| 'unavailable' \| 'cancelled'` | |
| expiresAt | epoch ms | Created + 10 minutes |

## State Machine

**Authorisation decision**

| From | Trigger | To | Effect |
|---|---|---|---|
| received | score < `stepUpFrom` | approved | `PaymentsService.authorise` |
| received | `stepUpFrom` ≤ score < `holdFrom` | step-up pending | Challenge created; result `step_up` |
| received | `holdFrom` ≤ score < `declineFrom` | held | Payment authorised, capture blocked, review item created, audit `hold` by `system` |
| received | score ≥ `declineFrom` | declined | `do_not_honour` with cardholder reason |
| step-up pending | provider `authenticated` | approved | `PaymentsService.authorise` |
| step-up pending | provider `not_authenticated` | declined | Reason "Your bank couldn't confirm this payment." |
| step-up pending | provider `unavailable` or timeout | held | As the held row above |
| step-up pending | cardholder closes sheet, or expiry | cancelled | No payment created |

**Review item**

| From | Trigger | To | Effect |
|---|---|---|---|
| held | analyst approves with note | approved | Capture unblocked; audit `approve` |
| held | analyst declines with note | declined | Payment voided; audit `decline` |
| held | 72 hours with no decision | expired | Payment voided; audit `expire` by `system`; merchant webhook |

Not allowed: approved or declined back to held; any decision without a note; a decision on
an expired item.

## API Surface

**`AuthorisationGateway.authorise(req: GatewayRequest): GatewayResult`** (changed)

```ts
export type GatewayResult =
  | { status: 'approved'; payment: Payment }
  | { status: 'step_up'; challengeId: string }
  | { status: 'held'; payment: Payment; reviewId: string }
  | { status: 'declined'; code: 'do_not_honour'; reason?: string };
```

The decline `code` stays `do_not_honour` for the scheme. `reason` is new and is only ever
a string from the cardholder reason allowlist.

**`AuthorisationGateway.completeStepUp(challengeId: string, outcome: ProviderOutcome): GatewayResult`** (new)

- Unknown or expired `challengeId`: returns `{ status: 'declined', code: 'do_not_honour' }` and logs `stepup.unknown_challenge`.
- A challenge completes once. A second call returns the first result.

**`ReviewQueue`** (new, operations console backend)

| Method | Input | Errors |
|---|---|---|
| `list()` | none | Returns held items oldest first |
| `get(id)` | review id | `REVIEW_NOT_FOUND` |
| `approve(id, analyst, note)` | id, identity, note | `NOTE_REQUIRED` when note is blank after trimming; `ALREADY_DECIDED`; `REVIEW_EXPIRED` |
| `decline(id, analyst, note)` | as above | as above |

**Risk narrative** (new, asynchronous). `NarrativeWriter.describe(item)` runs after a
payment is held, outside the authorisation call. Its result fills `ReviewItem.narrative`.
It never affects the decision.

## Validation Rules

| Field | Constraints |
|-------|-------------|
| `PolicyThresholds` | Integers, 0 ≤ stepUpFrom ≤ holdFrom ≤ declineFrom ≤ 1000, non-empty version. Invalid configuration fails start-up; the gateway never runs with partial thresholds |
| `ScoreResult.score` | Integer 0 to 1000. Out of range or non-integer is treated as a scorer failure |
| `ScoreResult.reasons` | 1 to 3 known `ReasonCode` values |
| Cardholder reason | Only from the allowlist in `src/risk/reasons.ts`; at most 140 characters; never names a model feature, threshold or score |
| Analyst note | Non-empty after trimming, at most 1,000 characters |
| Analyst identity | Non-empty; taken from the console session, never from the request body |
| Narrative input | Reason codes, score, amount band, merchant category, issuer and IP country only. No PAN, BIN, token, last four or merchant descriptor |
| Challenge id | Must exist, be pending and unexpired |

## Testing

### Acceptance Criteria

| ID | Observable behaviour | Product story |
|---|---|---|
| AC1 | `travellerTelevision` returns `step_up`, not `declined`. GW-02 changes to assert this | ST1, ST2 |
| AC2 | `completeStepUp` with `authenticated` returns `approved` with an authorised payment | ST1 |
| AC3 | `completeStepUp` with `not_authenticated` returns `declined` with the bank-could-not-confirm reason | ST1, ST3 |
| AC4 | `completeStepUp` with `unavailable`, or no answer within 10 seconds, returns `held` and creates a review item | ST5 |
| AC5 | A score of 850 or more returns `declined` with an allowlisted `reason`; GW-03 changes to assert the reason is present and contains no score or feature name | ST3 |
| AC6 | A score from 700 to 849 returns `held`; the payment is authorised and capture is rejected until an analyst approves | ST4 |
| AC7 | Approve and decline without a note are rejected; every hold, approve, decline and expiry writes one audit entry with the actor | ST4, Security |
| AC8 | The decision, including scoring and policy, completes within 40 ms p99 on the fixture traffic; the narrative is never called on the authorisation path | Platform latency budget |
| AC9 | No narrative request contains a PAN, BIN, token, last four or merchant descriptor | Platform data handling |
| AC10 | `domesticGroceries` is still approved (GW-01) | ST2 |

### Risks and Coverage

| Risk | Severity | Test Approach |
|------|----------|---------------|
| Step-up provider outage turns into lost sales or let-through fraud | High | Stub provider returns `unavailable` and times out; assert `held` (AC4) |
| Narrative call adds latency or leaks card data | High | Spy on the narrative client during `authorise`; assert zero calls and redacted input (AC8, AC9) |
| Decline reasons teach fraudsters the model | High | Snapshot every allowlisted reason; assert none names a feature, threshold or score (AC5) |
| Bad threshold configuration | Medium | Start-up tests for each invalid ordering |
| Held payment captured before review | High | Capture on a held payment throws (AC6) |
| Model scores drift from the shadow baseline | Medium | Shadow mode compares decisions for two weeks before cutover |

### Test Plan

**Unit tests**

`src/risk/policy.ts` boundaries at 299/300, 699/700, 849/850. `src/risk/reasons.ts`
allowlist mapping and length. `src/review/queue.ts` transitions and errors.
`src/review/audit.ts` append-only behaviour.

**Integration tests**

`test/gateway.test.ts`: GW-01, GW-02 and GW-03 updated as above; new cases for step-up
outcomes, hold, and the narrative never running inline. The scorer is a deterministic stub
keyed by fixture scenario so tests do not depend on a model file.

**End-to-end tests**

Deferred to the operations console and hosted checkout repositories, which own the UI.
This repository verifies the contract they call.

**Visual/UI tests**

Out of this repository. See the checkout and review queue designs.

### Edge Cases

- Score exactly on each threshold.
- Provider answers after the challenge expired.
- `completeStepUp` called twice for one challenge.
- Analyst approves an item that expired a second earlier.
- Unknown BIN (`issuerCountry` returns null): scored with `issuer_unknown`, not treated as domestic.
- Scorer throws or returns an out-of-range score: the decision falls back to `hold`, never to approve.

### Out of Scope

Model training and retraining (data platform). Merchant-configurable thresholds (out of
scope in the PRD). 3-D Secure exemptions (waiting on Legal; v1 applies none).

## Security & Controls

- The full PAN stops at the gateway's request parser and the vault, as today. The scorer
  receives `ScoringInput`, which has no PAN or token.
- The risk narrative is the only call to an external AI service. It receives reason codes
  and coarse bands only, runs off the authorisation path, and never receives the merchant
  descriptor, because the merchant controls that text and could use it to steer the
  model.
- Cardholder reasons come only from an allowlist reviewed by Legal (UK GDPR automated
  decisions). Analyst reasons are separate strings and never reach the merchant.
- Review queue actions require an authenticated analyst session; identity comes from the
  session. Every action is audit logged.
- Logs and spans carry the masked card only, as `recordDecline` does today.

## Key Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|----------|--------|------------------------|-----------|
| Risk narrative placement | Asynchronous, only for held payments | Inline between scoring and policy, as the architecture diagram shows | A hosted LLM call over HTTPS cannot fit the 40 ms risk budget, and its output must not influence an automated decision |
| Narrative input | Reason codes and bands | The scored request and merchant descriptor | The request holds the PAN; the descriptor is merchant-controlled text. Both break platform data handling |
| Where reasons come from | Scorer returns top 1 to 3 reason codes | Derive reasons from the score alone | One integer cannot explain a decision; the PRD, checkout design and queue all need a reason |
| Step-up provider unavailable | Hold for review | Approve; decline | Approve lets fraud through on any outage; decline repeats the false decline F2.1 exists to fix |
| Threshold storage | Configuration with a version string | Constants in code | Risk tunes them without a deploy (architecture) |
| Hold expiry | Void after 72 hours | Hold indefinitely | Capture cannot stay blocked forever; the merchant needs an answer |

## Drawbacks

- A held payment looks successful to the cardholder until an analyst decides. If declined,
  the cardholder learns later.
- Holding on provider outage pushes load onto analysts during an outage.
- The reason allowlist is coarse by design, so cardholders get less detail than ST3 might
  suggest.
- Scorer attribution (reason codes) is extra work for data science.

## Search / Query Strategy

The review queue lists held items oldest first: index on `(status, held_at)`. Expected
volume is in the low hundreds per day at launch. Audit entries are indexed by
`(subject_id, at)`.

## Migration Strategy

1. Ship scorer, policy and queue behind a flag in shadow mode: v1 rules decide, the new
   decision is logged with `thresholdsVersion`. Two weeks.
2. Cut over merchant by merchant. Rollback is the flag; v1 rules stay in the code until
   every merchant has moved.
3. Remove `HIGH_VALUE_CROSS_BORDER` from `RiskRules.evaluate` after full cutover.

No ledger or payment data changes.

## File Impact

| File | Change |
|---|---|
| `src/payments/gateway.ts` | Call scorer and policy; new statuses; `completeStepUp` |
| `src/risk/rules.ts` | `HIGH_VALUE_CROSS_BORDER` behind the shadow flag, then removed |
| `src/risk/scoring.ts` (new) | `Scorer`, `ScoringInput`, `ScoreResult` |
| `src/risk/policy.ts` (new) | `DecisionPolicy`, `PolicyThresholds` |
| `src/risk/reasons.ts` (new) | `ReasonCode`, cardholder and analyst reason maps |
| `src/risk/stepup.ts` (new) | `StepUpAdapter`, challenges |
| `src/risk/narrative.ts` (new) | `NarrativeWriter`, asynchronous |
| `src/review/queue.ts` (new) | `ReviewQueue` |
| `src/review/audit.ts` (new) | `AuditLog` |
| `src/payments/service.ts` | Capture blocked while a review item is held |
| `test/gateway.test.ts` | GW-01 to GW-03 updated; new step-up and hold cases |

## Dependencies

- Fraud model file with per-decision reason attribution, from data science.
- 3-D Secure provider credentials and sandbox; commercial terms are signed.
- Risk-approved thresholds before cutover (shadow mode can start on defaults).
- Legal-approved cardholder reason allowlist before cutover.

## Unresolved Questions

1. **Thresholds** (blocks cutover, not shadow mode): Risk to set `stepUpFrom`,
   `holdFrom` and `declineFrom` and the acceptable fraud rate. Proposed path: run shadow
   mode on the architecture defaults and bring the comparison to Risk.
2. **What the cardholder sees while held** (blocks checkout copy): the payment is
   authorised, so checkout currently reports success. The checkout design has no held
   outcome and no outcome for provider unavailable. Design and CX to add one.
3. **Cardholder reason allowlist** (blocks cutover): Legal to approve the wording.
4. **3-D Secure exemptions** (does not block): v1 applies none until Legal decides.
5. **Shadow-mode comparison** (does not block): chargebacks arrive weeks later, so two
   weeks of shadow mode compares decisions, not outcomes. Data science to propose labels.
