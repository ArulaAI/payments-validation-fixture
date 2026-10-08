# F2: Authorisation risk check

Owner: payments-product. Version 0.1, draft for engineering.
Related: [`specs/product/payments.md`](payments.md),
[`specs/design/authorisation-risk.md`](../design/authorisation-risk.md),
[`specs/architecture/authorisation-risk.md`](../architecture/authorisation-risk.md),
[`specs/compliance/authorisation-risk.md`](../compliance/authorisation-risk.md)

This is a fictional scenario written for training. Numbers marked *scenario value* were set
for this exercise. Treat them as approved inputs.

## Problem

The problem as it reached product:

> Legitimate users are facing false declines on high-value, infrequent purchases (e.g.,
> buying a rare TV abroad), while highly adaptive fraudsters are leveraging GenAI to
> rapidly test compromised 16-digit card numbers across online merchants.

The gateway authorises every request it receives. It has no view of risk. Card testing
runs through it unchecked: scripted, often GenAI-generated, attempts try card after card at
one merchant to find numbers that still work. Each attempt costs the merchant a scheme fee,
and every number that passes is used for fraud elsewhere.

Issuers respond by tightening their own rules, and the good customer pays for it. A
cardholder buying something expensive abroad, once, looks unusual. Today that purchase can
only be approved or declined. A declined good customer rarely tries again.

Both failures meet at one decision: whether to send an authorisation forward. Tightening it
to stop testers declines more good customers. Loosening it lets testers through.

## Users

- A merchant who needs card testing stopped without losing genuine sales, and needs to know
  what to do when a payment is not approved.
- A cardholder making an unusual but genuine purchase, who expects a way to prove it is
  them rather than a flat decline.
- A fraud analyst who has to explain, after the fact, why any attempt was approved,
  challenged or declined.
- A risk manager who has to change thresholds quickly when attackers adapt.

## User Stories

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| ST8 | As a merchant, I want rapid attempts across many cards stopped, so that testers cannot use my checkout | Given my store has seen attempts for as many distinct cards as risk policy RP1 allows within its window, When an attempt for another card arrives, Then it is declined and no funds are reserved | Must |
| ST9 | As a merchant, I want repeated attempts on one card stopped, so that a tester cannot cycle expiry dates on a known number | Given a card has reached the attempt limit in risk policy RP2, When another attempt for that card arrives, Then it is declined and no funds are reserved | Must |
| ST10 | As a cardholder, I want an unusual high-value purchase to ask me to verify rather than fail, so that I can complete a genuine purchase abroad | Given a purchase that meets risk policy RP3, When it is authorised, Then the outcome is challenge, not decline, and no funds are reserved | Must |
| ST11 | As a merchant, I want a retried request to return the original decision, so that a timeout never changes the answer | Given an attempt carrying an idempotency key already seen, When it is retried, Then the original outcome is returned and the retry does not count toward any limit | Must |
| ST12 | As a fraud analyst, I want to see why each attempt got its outcome, so that I can answer a merchant or an auditor | Given any attempt, When I look it up, Then I can see the outcome, the rule that decided it and the values that rule saw, with no full card number | Must |
| ST13 | As a risk manager, I want to change thresholds without a code release, so that I can respond when attackers adapt | Given a new threshold value, When it is applied, Then the next attempt is judged against it, and the change is recorded with who made it | Should |
| ST14 | As a cardholder, I want to complete my purchase once I have verified, so that a challenge does not become a dead end | Given an attempt that was challenged, When I verify successfully and the merchant submits a new authorisation carrying the verification result, Then RP3 does not challenge it again. RP1 and RP2 still apply | Must |

## User Flows

**Genuine domestic purchase.** The attempt passes every rule. The outcome is approve and
the existing authorise behaviour runs unchanged.

**Card testing at one merchant.** A script submits attempts for many different cards in
seconds. Once the merchant's limit is reached, further attempts are declined and reserve
nothing. The merchant sees a decline with a reason category.

**Unusual purchase abroad.** A cardholder buys a 1,800.00 television from a merchant in
another country, on a card the gateway has not approved before. The outcome is challenge.
The merchant takes the cardholder through verification and, when it succeeds, submits a new
authorisation carrying the verification result. That authorisation is approved.

**Retry after a timeout.** The merchant retries with the same idempotency key and gets the
original outcome back.

## Success Criteria

- [ ] Every authorisation attempt gets exactly one outcome: approve, challenge or decline
- [ ] A declined or challenged attempt reserves no funds and writes no ledger entries
- [ ] Every outcome can be explained from what was recorded, without a full card number
- [ ] A retried attempt returns its original outcome and does not count toward any limit
- [ ] Approved attempts behave exactly as they do today, and the four existing invariants still hold

Business measures, *scenario values*, tracked after release rather than in tests:

| Measure | Today | Target |
|---------|-------|--------|
| Card-testing attempts forwarded to issuers | All | Under 10% |
| Approval rate, cross-border purchases over 1,000.00 | 82% | 90%, with challenge instead of decline |
| Time added to an authorisation | n/a | Within the budget in the architecture spec |

## Scope

### In Scope

- A risk check on every authorisation attempt, returning approve, challenge or decline
- Completing a challenged purchase with a verification result
- The rules in risk policy RP1 to RP3, with thresholds risk can change
- A record of every decision that a fraud analyst can read
- A reason category returned to the merchant on challenge and decline

### Out of Scope (and why)

- **Machine-learned or GenAI scoring.** Rules come first. A model brings governance work
  (see the compliance spec) that this version is not ready to carry.
- **Running the verification.** The merchant runs 3DS. The gateway only says challenge.
- **Data shared across gateways or with the scheme.** Not available to this service.
- **Currencies other than GBP.** Thresholds are set in GBP. An authorisation in any other
  currency is rejected as unsupported.
- **Persistence.** The service is in memory, so decision records last as long as the process.
- **Per-merchant thresholds and allow lists.** No merchant has been onboarded to them yet.

## Dependencies

- The merchant and the merchant's country come from the authenticated caller, not from the
  request. See the architecture spec.
- Verification results come from the merchant's 3DS provider. Their rules are in the
  compliance spec.
- The card's issuing country arrives with each request from the acquirer. A BIN lookup is
  not available.
- Thresholds come from risk policy RP1 to RP3 in the compliance spec.

## Security & Controls

The existing rule stands: no full card number in any record, log, webhook, telemetry or
error. Decision records are records. The architecture spec carries the threat model.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| A genuine high-volume merchant trips the merchant limit during a sale | High | Open question OQ1 |
| Reasons returned to merchants teach testers how to stay under the limits | High | Reason categories, not rule detail. See the threat model |
| The check fails and lets testing traffic through | Critical | Decided: the attempt is declined. See the compliance spec |

## Open Questions

- **OQ1.** A ticketing merchant opening a big on-sale legitimately sees hundreds of cards a
  minute. Who decides whether that merchant is exempt from RP1, and who settles it when
  product and risk disagree? Owner: payments-product with payments-risk. Accountable: not
  yet assigned.
- **OQ2.** Decided by payments-risk: if the risk check fails, the attempt is declined. See
  the compliance spec, "When the check cannot decide".
- **OQ3.** How much may the reason category tell the merchant? The design spec proposes
  categories that name the limit that was reached, which threat T5 forbids. Owner:
  legal-compliance with payments-risk, informed by payments-design.
- **OQ4.** After a challenge, does the merchant send a new authorisation, as the user flow
  above describes, or does the gateway hold the original open until verification
  completes, as the design spec proposes? Owner: payments-product with payments-design.

## Decision owners

Engineering owns how this is built. These decisions belong to others:

| Decision | Owner |
|----------|-------|
| Thresholds and windows in RP1 to RP3, and the rules for verification results | payments-risk |
| Who may change policy values | payments-risk |
| Trade-off between stopping fraud and approving genuine customers | payments-product with payments-risk (OQ1) |
| Behaviour when the check fails | payments-risk (decided, OQ2) |
| What a merchant is told | legal-compliance (OQ3) |
| How a challenged purchase continues | payments-product with payments-design (OQ4) |
| Time budget for the check | payments-architecture |
| How a decision record is protected and retained | legal-compliance |
