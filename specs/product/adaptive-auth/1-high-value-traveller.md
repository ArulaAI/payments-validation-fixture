# F2.1: Fewer false declines on high-value purchases

Owner: Priya N., product manager, checkout. Version 0.9 (handed to engineering).
Related: [overview](../overview.md), [card testing](2-card-testing.md),
[architecture](../../architecture/adaptive-auth.md),
[design](../../design/adaptive-auth/1-checkout-challenge.md)

## Problem

A cardholder on holiday in Tokyo tries to buy a 2,499 pound television from a UK
electricals retailer for delivery home. We decline it. They try again and we decline
it again, because our launch rule refuses any payment of 1,000 pounds or more when the
shopper's IP address is in a different country from the card's issuer. They buy the
television from a competitor whose payment provider let it through.

Merchants tell us high-value, infrequent purchases are where they lose the most revenue
to false declines, and these are their most valuable customers. Support tickets tagged
"declined, genuine" doubled last quarter. The rule was written at launch, before we had
any fraud data, and nobody has revisited it.

## Users

- A cardholder making a rare, expensive purchase, often while travelling, who is refused
  with no explanation and no way to prove it is them.
- A merchant who loses the sale, and often the customer, and cannot tell them why.
- A fraud operations analyst who sees the rule fire hundreds of times a day and has no
  way to tell the genuine travellers from the fraud.

## User Stories

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| ST1 | As a cardholder making an unusual high-value purchase, I want to confirm it is me, so that my payment goes through instead of being refused | Given a high-value payment from abroad that the risk assessment considers plausible, When it is authorised, Then the cardholder is asked to confirm through their bank instead of being declined | Must |
| ST2 | As a merchant, I want each payment assessed on its overall risk, so that one rule does not refuse my best customers | Given a payment, When it is assessed, Then the outcome reflects more than the amount and the country of the shopper | Must |
| ST3 | As a cardholder, I want to know why my payment was refused, so that I know what to do next | Given a declined payment, When the cardholder sees the result, Then they are told why in plain language | Should |
| ST4 | As a fraud analyst, I want borderline payments held for my review, so that I make the call on the cases a model is unsure about | Given a payment the assessment cannot decide, When it is authorised, Then it is held for an analyst to approve or decline | Should |
| ST5 | As a merchant, I want a step-up that fails to fall back sensibly, so that a bank outage does not cost me the sale | Given a step-up challenge that cannot be completed, When the bank does not respond, Then the payment is handled consistently with our risk policy | Must |

## User Flows

**Traveller confirms and pays.** The cardholder is abroad and buys a 2,499 pound
television. The payment is assessed as plausible but unusual. The checkout shows a
"confirm with your bank" step. The cardholder approves in their banking app and the
payment is authorised.

**Traveller fails to confirm.** As above, but the cardholder does not approve in their
banking app. The payment is declined and the checkout explains that their bank could not
confirm the payment.

**Borderline payment held.** The assessment cannot decide. The payment is held while a
fraud analyst reviews it. The analyst approves or declines it from the review queue.

**Clearly fraudulent payment.** The assessment is confident the payment is fraudulent. It
is declined without a step-up.

## Success Criteria

- [ ] False declines on high-value cross-border purchases fall by 30%
- [ ] No material increase in fraud losses
- [ ] At least 80% of step-up challenges presented are completed by the cardholder
- [ ] Every declined payment carries a reason the merchant can show the cardholder

## Scope

### In Scope

- Replacing the high-value cross-border rule with a risk assessment
- Step-up challenge through the cardholder's bank (3-D Secure)
- A review queue for payments the assessment cannot decide
- Decline reasons returned to the merchant

### Out of Scope (and why)

- **Merchant-configurable risk thresholds.** Merchants have asked for this, but we need
  one policy we understand before we let each merchant tune their own.
- **Changes to the velocity rule.** Card testing is covered by
  [F2.2](2-card-testing.md), which has its own owner and timeline.
- **Retraining the model in production.** The first release uses a model trained
  offline. Retraining is a later data platform project.

## RFC Decomposition

| User Story IDs | Child RFC | Depends On | Testable Output |
|----------------|-----------|------------|-----------------|
| ST1, ST2, ST5 | `specs/tech/adaptive-auth/1-high-value-traveller.md` | None | The traveller is stepped up, not declined; an unavailable provider holds the payment |
| ST3 | `specs/tech/adaptive-auth/1-high-value-traveller.md` | None | A decline carries an allowlisted reason |
| ST4 | `specs/tech/adaptive-auth/1-high-value-traveller.md` | None | A held payment is approved or declined from the review queue, audit logged |

## Dependencies

- F1 authorise, specifically `PaymentsService.authorise` and the gateway in front of it.
- A 3-D Secure provider for the step-up challenge. Commercial terms are signed.
- The risk scoring model from the data science team (see the architecture).
- [F2.2](2-card-testing.md) changes the same authorisation path.

## Security & Controls

- Decline reasons shown to merchants and cardholders must not help a fraudster tune
  their next attempt.
- Card data handling stays within the vault boundary (overview principle 4).
- Every hold, release, approval and decline by an analyst is audit logged with the
  analyst's identity.
- Legal has asked that automated declines can be explained to a cardholder who asks,
  under UK GDPR rules on automated decision-making.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Step-up adds friction and some genuine customers abandon | Medium | Only step up when the assessment is unsure, never by default |
| Loosening the rule lets more fraud through | High | Hold borderline payments for review |
| The 3-D Secure provider is slow or down | Medium | See ST5 |

## Open Questions

1. What fraud rate are we willing to accept in exchange for fewer false declines? To be
   agreed with Risk.
2. How long can a payment be held for review before the merchant has to be told
   something?
3. Which 3-D Secure exemptions do we apply, if any? Waiting on Legal.
