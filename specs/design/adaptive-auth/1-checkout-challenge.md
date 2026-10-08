# Design: Checkout step-up challenge

> See [F2.1 high-value purchases](../../product/adaptive-auth/1-high-value-traveller.md) for product context.

Owner: Leah S., product designer, checkout. Version 1.2.

## Design Intent

**Direction:** Calm and reassuring at the moment a cardholder's payment is in doubt. The
step-up should read as their bank looking after them, not as us suspecting them. Quiet
surfaces, one clear action, and plain words. Reference: the confirmation sheet in the
major UK banking apps.

**Do not:** use red or warning colours before anything has failed, use the words "fraud"
or "suspicious" anywhere a cardholder can see, show a countdown timer, or add our logo
inside the bank's challenge frame.

## Pages / Routes

The step-up appears inside the merchant's checkout as an overlay served from our
hosted checkout library. It has no route of its own.

| Route | User Flow | Description |
|-------|-----------|-------------|
| `/checkout/confirm` (overlay) | Traveller confirms and pays | Explains the step, then hosts the bank challenge frame |
| `/checkout/confirm` (overlay, result) | Traveller fails to confirm | Shows that the bank could not confirm, with the reason |
| `/checkout/confirm` (overlay, result) | Clearly fraudulent payment | Shows the decline with its reason |

## Layout Structure

### Global Layout

Single centred column inside a modal sheet, max width `--sheet-width-sm`, over the
merchant's page with `--scrim`. On small screens the sheet fills the viewport.

### Regions

| Region ID | Position | Width | Internal Layout | Scroll |
|-----------|----------|-------|-----------------|--------|
| sheet-header | top | full | flex, space-between | no |
| sheet-body | middle | full | stack, gap-md | yes |
| sheet-footer | bottom | full | flex-col, gap-sm | no |

## Component Inventory

| Component ID | Type | Parent ID | Description |
|--------------|------|-----------|-------------|
| StepUpIntro | new | sheet-body | Short explanation that the bank needs to confirm the payment |
| BankChallengeFrame | new | sheet-body | Hosts the 3-D Secure provider's challenge |
| StepUpResult | new | sheet-body | Outcome after the challenge, success or failure |
| DeclineReason | new | StepUpResult | "Why was this declined?" disclosure with the reason text |
| ContinueButton | modified | sheet-footer | Primary action, existing checkout button |

### Component Props

#### StepUpResult

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| outcome | "confirmed" \| "not_confirmed" \| "declined" | required | Which result to show |
| reason | string | undefined | Plain-language reason, shown in DeclineReason |
| merchantName | string | required | Used in the copy |

## Spacing

All spacing from the checkout scale. Sheet padding `--space-6`, gap between body blocks
`--space-4`, footer buttons `--space-3` apart.

## Typography

Heading `--type-title-sm`, body `--type-body-md`, reason text `--type-body-sm`. No other
sizes.

## Color Application

Neutral surfaces throughout. `--color-success` appears only on the confirmed result.
`--color-critical` appears only on the declined result and only on the icon, never on
text blocks.

## Elevation & Depth

The sheet uses `--elevation-modal`. Nothing inside the sheet is elevated.

## States

### Page-Level States

#### Empty State

N/A. The overlay only opens with a payment to confirm.

#### Loading State

While the provider prepares the challenge, StepUpIntro shows with a quiet progress
indicator under the copy "Contacting your bank".

#### Populated State

StepUpIntro above BankChallengeFrame. The cardholder completes the challenge in the
frame or in their banking app.

#### Error State

The bank did not confirm the payment. StepUpResult with outcome `not_confirmed` and the
copy "Your bank couldn't confirm this payment. You haven't been charged." with a
secondary action to choose another way to pay.

### Interactive Element States

ContinueButton uses the existing checkout button states. The DeclineReason disclosure
has closed, open and focus states from the disclosure component.

## Data Binding

| Element | Source |
|---|---|
| StepUpResult.outcome | Authorisation response `status` |
| StepUpResult.reason | Authorisation response `reason` |
| merchantName | Hosted checkout session |

## Interactions & Motion

### Interactions

- The cardholder can close the sheet at any point. Closing before the bank answers
  cancels the payment and returns to the checkout.
- DeclineReason opens on click or Enter.

### Motion

Sheet enters with `--motion-enter-sheet`. Result swaps with a cross-fade
`--motion-fade-fast`. Respect reduced-motion settings.

## Responsive Behavior

Below `--bp-sm` the sheet becomes full screen and the footer sticks to the bottom.

## Accessibility

### Keyboard Navigation

Focus moves into the sheet on open and is trapped until it closes. Escape closes the
sheet. Focus returns to the pay button on close.

### ARIA & Screen Reader

The sheet is a dialog labelled by its heading. Result changes are announced through a
polite live region.

### Contrast & Targets

All text meets WCAG 2.2 AA. Targets are at least `--target-min`.

## Content Constraints

Reason text is at most 140 characters, plain language, second person, no codes.

## Implementation Notes

The challenge frame belongs to the provider. We do not style inside it.

## Verification Criteria

- [ ] The words "fraud" and "suspicious" do not appear anywhere in the overlay
- [ ] Each result shows the reason text when one is supplied
- [ ] Focus returns to the pay button when the sheet closes

## Figma / Visual Reference

Checkout library file, page "Step-up v1.2".
