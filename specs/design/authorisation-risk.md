# Design: Authorisation risk check

> See [specs/product/authorisation-risk.md](../product/authorisation-risk.md) for product context.

Owner: payments-design. Version 0.1, proposal for review by product and risk.

## Design Intent

A genuine customer who is not approved should know what to do next. Today every
non-approval looks the same, so customers retry blindly or give up. The three outcomes
should feel different to a merchant and, through the merchant, to the cardholder.

## Pages / Routes

N/A. The gateway has no screens. Its design surface is the outcome and reason category a
merchant receives, and the message the merchant shows the cardholder.

## Layout Structure

### Global Layout

N/A. No screens.

### Regions

N/A. No screens.

## Component Inventory

N/A. Merchants render messages in their own checkout components.

### Component Props

N/A. No components.

## Spacing

N/A. No visual surface.

## Typography

N/A. Merchants apply their own typography.

## Color Application

N/A. Messages must not rely on colour (see Accessibility).

## Elevation & Depth

N/A. No visual surface.

## States

### Page-Level States

#### Empty State

N/A. Every attempt receives an outcome.

#### Loading State

N/A. The outcome is returned within the authorisation response.

#### Populated State

| Outcome | What the merchant receives | What the merchant shows the cardholder |
|---------|----------------------------|----------------------------------------|
| Approve | The authorisation, as today | Nothing new |
| Challenge | A challenge outcome and a reason category | "Your bank needs to confirm it's you." The merchant starts verification |
| Decline | A decline outcome and a reason category | A message matched to the reason, below |

Proposed reason categories and cardholder messages:

| Reason category | Cardholder message |
|-----------------|--------------------|
| `verify_cardholder` | "Your bank needs to confirm it's you." |
| `card_attempts_exceeded` | "Too many attempts on this card. Please wait 10 minutes and try again." |
| `merchant_attempts_exceeded` | "We're seeing unusual activity. Please try again in a minute." |
| `not_approved` | "This payment wasn't approved. Please try another card." |

#### Error State

If the gateway cannot return an outcome, the merchant shows `not_approved` and the
cardholder may try again.

### Interactive Element States

N/A. No interactive components.

## Data Binding

| Field in the response | Used for |
|-----------------------|----------|
| `outcome` | Choosing approve, challenge or decline handling |
| `reason` | Choosing the cardholder message from the table above |

## Interactions & Motion

### Interactions

**Challenge.** The gateway holds the authorisation open while the cardholder verifies.
When verification succeeds, the merchant confirms it and the same authorisation completes,
so the customer does not have to start the purchase again.

**Retry.** A merchant retrying with the same idempotency key receives the same outcome and
the same reason category.

### Motion

N/A. No screen transitions.

## Responsive Behavior

N/A. No screens.

## Accessibility

### Keyboard Navigation

N/A. No interactive components.

### ARIA & Screen Reader

Messages are plain text with no symbols or abbreviations, so they read correctly aloud.

### Contrast & Targets

Messages make sense without colour or icons. They are written at a reading age of 9.

## Content Constraints

- Messages never mention fraud, card testing or security.
- Messages never include any part of the card number.
- The reason category is stable, so merchants can translate and localise it.

## Implementation Notes

The design surface is the response contract. Any change to reason categories is a change
merchants must ship, so categories are added, never renamed.

## Verification Criteria

- [ ] Each outcome returns exactly one reason category from the table above, or none for approve
- [ ] A retried attempt returns the same reason category as the original
- [ ] No response contains any part of the card number

## Figma / Visual Reference

None. The gateway has no visual surface.

## Open Questions

These proposals are not yet agreed. Engineering should not treat either as settled.

- **Reason messages (PRD OQ3).** The messages for `card_attempts_exceeded` and
  `merchant_attempts_exceeded` tell the cardholder which limit was reached and when to try
  again. Threat T5 forbids revealing that. Owner: legal-compliance with payments-risk.
- **Challenge interaction (PRD OQ4).** This spec proposes holding the authorisation open
  during verification. The product spec describes a new authorisation after verification.
  Owner: payments-product with payments-design.
