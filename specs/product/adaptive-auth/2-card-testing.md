# F2.2: Stop card testing across merchants

Owner: Marcus O., product manager, risk platform. Version 1.0 (handed to engineering).
Related: [overview](../overview.md), [high-value purchases](1-high-value-traveller.md),
[architecture](../../architecture/adaptive-auth.md),
[design](../../design/adaptive-auth/2-risk-review-queue.md)

## Problem

Fraudsters buy stolen card numbers in bulk and need to know which ones still work before
they sell them or spend them. They test each number with a small authorisation, often
one pound, at a merchant with weak checks. Generative AI has made this faster and harder
to spot: scripts now write plausible checkout traffic, rotate IP addresses and countries,
and spread one batch across dozens of merchants so no single merchant sees a pattern.

On 3 October one batch of forty numbers was tested across twenty of our merchants in
under three minutes. Every attempt was approved. Our velocity rule counts attempts per
card, and each card was tried once. Merchants paid scheme fees on every test, and
eleven of the numbers were used for large fraudulent purchases within the hour.

## Users

- A merchant whose checkout is used as a testing ground, who pays the fees and absorbs
  the chargebacks.
- A cardholder whose stolen card is confirmed as working and then spent.
- A fraud operations analyst who finds out about an attack from merchant complaints the
  next morning.

## User Stories

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| ST6 | As a fraud analyst, I want card testing detected across all merchants, so that attacks spread thin are still visible | Given a batch of small authorisations on different cards from one source across many merchants, When the pattern emerges, Then it is flagged as card testing | Must |
| ST7 | As a merchant, I want card-testing attempts declined, so that I do not pay fees on them or confirm stolen cards | Given an attack has been flagged, When further attempts arrive from the same source, Then they are declined | Must |
| ST8 | As a merchant, I want to be told when my checkout was used for card testing, so that I can tighten my own controls | Given attempts at my checkout were part of a flagged attack, When the attack is flagged, Then I am notified with the time window and number of attempts | Should |
| ST9 | As a fraud analyst, I want to see active attacks and release a block, so that I can correct a false alarm | Given a flagged attack, When I open the review queue, Then I see the attack, its source, the merchants affected, and I can release the block | Must |

## User Flows

**Attack detected and blocked.** A script starts testing cards across our merchants. After
enough attempts the pattern is recognised. Further attempts from that source are declined
at every merchant. The analyst sees the attack in the review queue.

**Merchant notified.** Once an attack is flagged, each affected merchant receives a
notification listing the time window and the number of attempts at their checkout.

**False alarm released.** A marketplace runs a promotion and many genuine small payments
arrive at once. They are flagged as card testing. The analyst reviews the attack, sees
that it is genuine, and releases the block.

## Success Criteria

- [ ] 95% of card-testing attempts after the tenth in an attack are declined
- [ ] An attack is flagged within 60 seconds of its first attempt
- [ ] Fewer than 1 in 1,000 genuine payments are declined as card testing
- [ ] Affected merchants are notified within 15 minutes of an attack being flagged

## Scope

### In Scope

- Detecting card testing across all merchants on the platform
- Declining further attempts from a flagged source
- Merchant notification
- Attack view and release in the analyst review queue

### Out of Scope (and why)

- **Reporting stolen cards to issuers.** Requires scheme fraud reporting integration,
  which the risk platform team owns and is planning for next year.
- **CAPTCHA or bot challenges at checkout.** The checkout belongs to merchants, not to us.

## RFC Decomposition

| User Story IDs | Child RFC | Depends On | Testable Output |
|----------------|-----------|------------|-----------------|
| ST6, ST7 | `specs/tech/adaptive-auth/2-card-testing.md` | `specs/tech/adaptive-auth/1-high-value-traveller.md` | Attack detector flags the 3 October replay |
| ST8, ST9 | `specs/tech/adaptive-auth/2-card-testing.md` | `specs/tech/adaptive-auth/1-high-value-traveller.md` | Notification and release work against a flagged attack |

## Dependencies

- The adaptive authorisation architecture, in particular the scoring service that this
  detection plugs into.
- The review queue designed for F2.1, extended with an attacks view.
- The merchant notification service, which already sends settlement emails.

## Security & Controls

- Releasing a block is an analyst action, audit logged with identity and reason.
- Attack details shared with merchants must not include card numbers, even masked.
- Blocks must expire. A block nobody reviews must not stay in place forever.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| A flash sale looks like card testing | High | Analyst release, and a false-positive success criterion |
| Attackers adapt to whatever pattern we detect | High | Detection is assessed on traffic, not a fixed rule |
| Blocking a source blocks genuine shoppers behind the same network | Medium | Blocks expire |

## Open Questions

1. How long should a block last before it expires?
2. Should a flagged source be blocked across every merchant, or only the merchants it has
   already hit?
