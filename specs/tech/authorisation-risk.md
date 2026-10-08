---
related:
  - specs/architecture/authorisation-risk.md
  - specs/architecture/authorisation-risk-threat-model.md
  - specs/compliance/authorisation-risk.md
---
# RFC: Authorisation risk check

> See [specs/product/authorisation-risk.md](../product/authorisation-risk.md) for product context.
> Depends on: [architecture](../architecture/authorisation-risk.md), [threat model](../architecture/authorisation-risk-threat-model.md), [compliance](../compliance/authorisation-risk.md).

Owner: payments-engineering. Version 0.3, corrected after audit.

## Basic Example

```ts
const svc = new PaymentsService({ clock });
const merchant = { merchantId: 'm_electronics_fr', merchantCountry: 'FR' };

const first = svc.authorise(
  { pan, expiry: '12/30', amount: 180_000, cardCountry: 'GB', idempotencyKey: 'k-tv-1' },
  merchant,
);
// first = { outcome: 'challenge', reason: 'verify_cardholder', attemptId: 'att_000001' }
// No payment stored, no ledger entries. The merchant runs 3DS.

const second = svc.authorise(
  { pan, expiry: '12/30', amount: 180_000, cardCountry: 'GB', idempotencyKey: 'k-tv-2',
    verification: { attemptId: 'att_000001' } },
  merchant,
);
// second = { outcome: 'approve', payment: { ... } }
```

## Data Model

| Type | Fields | Notes |
|------|--------|-------|
| `MerchantContext` | `merchantId`, `merchantCountry` | Supplied by the caller and trusted. Simulates the gateway's authentication layer |
| `AdminContext` | `actor`, `role` | Supplied by the caller and trusted. Only `role: 'payments-risk'` may change policy values |
| `AuthoriseRequest` | existing fields, plus `cardCountry: string` and optional `verification: { attemptId: string }` | Carries no merchant identity. `currency` must be `GBP` |
| `CardReference` | branded `string` | Keyed HMAC-SHA256 of the full card number, produced only by the vault. Not a card number |
| `Attempt` | `attemptId`, `cardRef`, `bin`, `merchantId`, `merchantCountry`, `cardCountry`, `amount: Minor`, `verified: boolean`, `at` | The attempt view. Built by payments, read by risk assessment |
| `Decision` | `outcome: 'approve' \| 'challenge' \| 'decline'`, `rule: 'RP1' \| 'RP2' \| 'RP3' \| 'FALLBACK' \| null`, `reason: ReasonCategory \| null` | `rule` is internal and never returned to the merchant |
| `DecisionRecord` | `attemptId`, `at`, `decision`, `observed` (the counts and values the rule saw), `policy` (the `PolicyValues` in force), `merchantId`, `bin`, `cardRef` | Never holds a card number |
| `PendingChallenge` | `attemptId`, `cardRef`, `merchantId`, `amount`, `at`, `used: boolean` | One per challenge. Matched against a verification result |
| `PolicyValues` | `merchantDistinctCards`, `merchantWindowMs`, `cardAttempts`, `cardWindowMs`, `highValueMinor`, `lookBackMs`, `verificationWindowMs` | Defaults from the compliance spec. All positive integers |
| `PolicyChange` | `before`, `after`, `actor`, `at` | Appended on every accepted change. Frozen once written |
| `AuthoriseResult` | `{ outcome: 'approve', payment: Payment }` or `{ outcome: 'challenge' \| 'decline', reason, attemptId }` | Replaces the bare `Payment` return |

`ReasonCategory` is `verify_cardholder` or `not_approved`. The design spec also proposes
`card_attempts_exceeded` and `merchant_attempts_exceeded`, but those reveal which limit was
reached, which threat T5 forbids. They are not used while PRD OQ3 is open.

## State Machine

`Payment.status` is unchanged: `authorised`, `captured`, `voided`. A challenged or declined
attempt creates no `Payment`. It exists only as a decision record, plus a pending challenge
when challenged. A challenge does not wait for verification. After 3DS the merchant sends a
new authorisation carrying the verification result, which is a new attempt. This follows
the product flow. The design spec proposes holding the original open instead. That
disagreement is PRD OQ4, and this design changes if OQ4 is decided the other way.

A pending challenge moves from open to used when a matching verification result is
accepted, or expires after `verificationWindowMs`.

## API Surface

- `authorise(req, merchant: MerchantContext): AuthoriseResult`. The order inside it becomes:
  1. Idempotency lookup, unchanged. A seen key returns the stored `AuthoriseResult`.
  2. Reject a currency other than `GBP` with a `RangeError`, as other invalid input is today.
  3. `cardReference(req.pan)` from the vault.
  4. If `req.verification` is present, match it against the pending challenges. The attempt
     is `verified` only if the challenge exists, is unused, is within its window, and
     matches this card, merchant and amount. A match marks the challenge used.
  5. `assess(attempt)` from risk assessment, which also records the decision.
  6. On approve only: `tokenise`, store the payment, post the ledger pair, as today.
  7. Store the result against the idempotency key.
- `setPolicy(values: Partial<PolicyValues>, admin: AdminContext): void`. Rejects a caller
  without the payments-risk role and any value that is not a positive integer. In both
  cases the values in force do not change.
- `decisionFor(attemptId)`, `decisions()` and `policyChanges()` for fraud analysts.
- `PaymentsService` takes an optional `{ clock: { now(): number } }`. Default `Date.now`.

## Validation Rules

Evaluated in this order. The first rule that fires decides.

1. **RP1.** Count distinct `cardRef` values seen for the merchant within
   `merchantWindowMs`, including this attempt. More than `merchantDistinctCards` gives
   decline, `not_approved`.
2. **RP2.** Count attempts for `cardRef` within `cardWindowMs`, including this one. More
   than `cardAttempts` gives decline, `not_approved`.
3. **RP3.** Not `verified`, and `amount >= highValueMinor`, and `cardCountry !==
   merchantCountry`, and no approved attempt for `cardRef` within `lookBackMs` gives
   challenge, `verify_cardholder`.
4. Otherwise approve.

Every attempt is added to the RP1 and RP2 windows, whatever its outcome. Idempotent
retries never reach the rules.

## Stores and Limits

Every new in-memory store has a limit, as the architecture spec requires. Limits are
engineering choices and can be tuned.

| Store | Limit | When the limit is reached |
|-------|-------|---------------------------|
| RP1 window per merchant | The most recent `merchantDistinctCards + 1` distinct cards, within the window | Older entries are dropped. That is enough to decide RP1. Empty merchant entries are removed |
| RP2 window per card | The most recent `cardAttempts + 1` attempts, within the window | As above, per card |
| Cards tracked for RP2 | 100,000 | The least recently seen card is dropped |
| Last approval per card, for RP3 | 100,000 cards, 90 days | The least recently approved card is dropped |
| Pending challenges | 100,000, `verificationWindowMs` | Expired first, then oldest |
| Idempotency results | 100,000, 24 hours | Expired first, then oldest. Applies to F1 keys too |
| Decision records | The most recent 100,000 | Oldest dropped |
| Policy changes | No limit | Changes are rare and every one must be kept |

## Testing

### Acceptance Criteria

| ID | Criterion | Source |
|----|-----------|--------|
| AC-F2-01 | The 21st distinct card at one merchant within 60 seconds is declined, and no payment or ledger entry is created | ST8, RP1 |
| AC-F2-02 | Cards seen at a merchant outside the 60-second window do not count | RP1 |
| AC-F2-03 | The 6th attempt on one card within 10 minutes is declined, even with a different expiry each time | ST9, RP2 |
| AC-F2-04 | A GBP 1,000.00 attempt with different card and merchant countries, on a card with no approval in 90 days, is challenged and creates no payment | ST10, RP3 |
| AC-F2-05 | The same attempt on a card approved 30 days earlier is approved | RP3 |
| AC-F2-06 | Decline wins when RP2 and RP3 both apply | Compliance, how the rules combine |
| AC-F2-07 | A retried attempt returns the original result and does not change any window count | ST11 |
| AC-F2-08 | Every attempt has exactly one retained decision record, holding rule, observed values and policy values | ST12, T3 |
| AC-F2-09 | No decision record, log, span or webhook contains a full card number | T4, compliance card data |
| AC-F2-10 | A policy change from the payments-risk role applies to the next attempt and is recorded with before, after, actor and time | ST13, T2 |
| AC-F2-11 | A policy change from another role, or with a value that is not a positive integer, is rejected and changes nothing | T2, compliance change control |
| AC-F2-12 | Approved attempts produce the same payment and ledger entries as before | PRD success criteria |
| AC-F2-13 | Challenge and decline responses contain only `outcome`, `reason` and `attemptId` | T5 |
| AC-F2-14 | A new authorisation carrying a matching verification result within 15 minutes is approved, not challenged | ST14, compliance verification results |
| AC-F2-15 | A verification result that is reused, expired, or for a different card, merchant or amount is ignored | T8 |
| AC-F2-16 | A request body naming another merchant has no effect on which merchant is counted | T1 |
| AC-F2-17 | An authorisation in a currency other than GBP is rejected | PRD scope |
| AC-F2-18 | Every store stays within its limit during 10,000 distinct cards inside one window, and over simulated days | T6, architecture bounded memory |
| AC-F2-19 | If assessment throws, the attempt is declined with `not_approved`, recorded with rule `FALLBACK`, and reserves nothing | Compliance, when the check cannot decide |

### Risks and Coverage

| Risk | Severity | Test Approach |
|------|----------|---------------|
| A testing flood slips under RP1 because window counting is off by one | High | Boundary tests at exactly 60 seconds and at the 20th and 21st card |
| A declined attempt still reserves funds or writes ledger entries | Critical | New invariant `NON_APPROVED_RESERVES_NOTHING`, run by the property command over generated sequences |
| An attempt has no decision record, or two | High | New invariant `ONE_DECISION_PER_ATTEMPT`, run the same way |
| A card number reaches a decision record | Critical | New invariant `NO_PAN_IN_DECISIONS`, plus the existing PAN scan |
| A verified cardholder is challenged again | High | AC-F2-14 |
| A verification result is replayed | High | AC-F2-15 |
| A store grows without limit under a flood | Medium | AC-F2-18 with a fake clock |
| A retry changes a count or an outcome | High | AC-F2-07 |

The three invariants join `checkAll` in `src/domain/invariants.ts`. `checkAll` takes the
risk assessment state as an optional third argument, so existing callers still compile.

### Test Plan

Unit tests for the rules and the stores against a fake clock. Integration tests through
`PaymentsService`. RP1 needs more than 20 distinct Luhn-valid cards. They are generated at
test time from the allowlisted test BIN `411111`, never written as literals, so the PAN
scan rule and TR12 still hold.

The property, differential and invariant commands are updated so their generated sequences
include approvals, challenges, declines, verified retries, idempotent retries and time
moving forward, and they pass risk assessment state to `checkAll`.

No end-to-end tests. The service has no HTTP surface and no external calls, so an
integration test through `PaymentsService` exercises the whole path.

### Edge Cases

- An attempt exactly at the window boundary, at 60 seconds and at 10 minutes
- A retry of a declined attempt
- A verification result arriving exactly at 15 minutes
- A policy change between two attempts on the same card
- The same card at two merchants

### Out of Scope

Machine-learned scoring, running 3DS, per-merchant exemptions, persistence, currencies
other than GBP.

## Security & Controls

| Threat | Control in this design | Checked by |
|--------|------------------------|------------|
| T1 | Merchant identity comes only from `MerchantContext` | AC-F2-16 |
| T2 | `setPolicy` is the only way to change values, requires the payments-risk role, validates values, and appends a frozen `PolicyChange` | AC-F2-10, AC-F2-11 |
| T3 | `assess` records before returning | AC-F2-08 |
| T4 | Risk assessment receives `cardRef`, never the card number | AC-F2-09 |
| T5 | Responses carry the reason category only | AC-F2-13 |
| T6 | Every new store has a limit. Declined attempts are never tokenised | AC-F2-18 |
| T7 | Payments returns the decision as assessed and has no path to alter it | AC-F2-08 |
| T8 | A verification result is matched to one pending challenge, once, within its window | AC-F2-14, AC-F2-15 |

## Key Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|----------|--------|------------------------|-----------|
| Where the check runs | After the idempotency lookup, before tokenisation | After tokenising | Retries must not count (ST11). Assessing after tokenising adds a vault entry for every testing attempt (T6) |
| How a card is recognised | Keyed HMAC-SHA256 of the card number, computed in the vault, key generated at process start with `node:crypto` | Make vault tokens stable per card; unkeyed hash | Tokens are new on every call today, and changing that alters F1. PCI DSS 3.5.1.1 rules out an unkeyed hash |
| How identity reaches the service | A trusted context argument on `authorise` and `setPolicy` | Fields in the request body | The architecture spec requires identity from the caller context (T1) |
| How non-approval is returned | `authorise` returns `AuthoriseResult` | Throw an error for challenge and decline | They are expected outcomes, not failures. Callers change from the payment to `result.payment` |
| How verification is proven | The new request names the challenged attempt, and the gateway checks it against its own pending challenge | Trust a flag in the request | A flag could be set by anyone. Matching against the gateway's own record satisfies the compliance rules and T8 |
| What happens if assessment throws | Decline with `not_approved`, and record rule `FALLBACK` | Approve | Required by the compliance spec, "When the check cannot decide" |
| How time reaches the rules | A clock passed to `PaymentsService`, default `Date.now` | Read `Date.now` inside the rules | Windows become testable and decisions reproducible. The ledger keeps `Date.now` because nothing here depends on its timestamps |

## Drawbacks

- The `authorise` signature change touches every caller.
- When a store is full, the oldest entry is dropped. A tester who waits for their card to be
  evicted from the RP2 store gets a fresh count. At 100,000 cards that needs a very large
  flood, but it is a limit, not a guarantee.
- Idempotency keys older than 24 hours are no longer recognised. F1 had no limit before.

## Search / Query Strategy

No query strategy is needed. Decision records and pending challenges are looked up by
`attemptId` in in-memory maps, and rule windows are read only for the merchant and card in
the current attempt.

## Migration Strategy

No migration is needed. All state is in memory and lasts as long as the process, so there is
no stored data to change.

## File Impact

| File | Change |
|------|--------|
| `src/payments/service.ts` | Merchant context, new request fields, GBP check, verification matching, result type, assessment before tokenising, idempotency limits, clock option |
| `src/risk/assessment.ts` | New. `assess`, windows, stores and limits, pending challenges, decision records, `setPolicy` |
| `src/risk/policy.ts` | New. `PolicyValues`, defaults, validation, `PolicyChange` |
| `src/vault.ts` | Add `cardReference(pan)` |
| `src/domain/invariants.ts` | Three new invariants. `checkAll` takes optional risk state |
| `workbench/commands/property.ts` | Use `AuthoriseResult` and a merchant context. Generate challenges, declines, verified and idempotent retries, and time movement. Pass risk state to `checkAll` |
| `workbench/commands/differential.ts` | Use `AuthoriseResult` and a merchant context |
| `workbench/commands/invariant.ts` | Use `AuthoriseResult` and a merchant context. Pass risk state to `checkAll` |
| `test/risk.test.ts` | New. AC-F2-01 to AC-F2-19 |
| `test/service.test.ts` | Adapt to `AuthoriseResult` and a merchant context |

## Dependencies

None new. HMAC uses `node:crypto`, which ships with Node.

## Unresolved Questions

- **PRD OQ1**, merchant exemption for genuine high-volume sales: not built. Owner:
  payments-product with payments-risk.
- **PRD OQ3**, how much the reason category tells the merchant: until decided, every
  decline returns `not_approved`. Owner: legal-compliance with payments-risk.
- **PRD OQ4**, whether a challenge holds the original authorisation open: this design
  follows the product flow. Owner: payments-product with payments-design.
- **HMAC key management**: generated per process in this version, so card references do not
  survive a restart. Owner: legal-compliance with payments-architecture.
- **Retention of decision records**: the most recent 100,000 are kept in memory. Owner:
  legal-compliance.
