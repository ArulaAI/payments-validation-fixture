# Design: Risk review queue

> See [F2.2 card testing](../../product/adaptive-auth/2-card-testing.md) for product context.

Owner: Tom R., product designer, operations console. Version 0.8.

## Design Intent

**Direction:** A working tool for analysts who clear a queue all shift. Dense, fast to
scan, and keyboard-first, with every decision one keystroke away. Reference: an email
triage client, not a dashboard.

**Do not:** use charts on the queue page, hide the reason behind a click, or let an
action happen without the reason being visible on screen.

## Pages / Routes

| Route | User Flow | Description |
|-------|-----------|-------------|
| `/ops/review` | Borderline payment held | Queue of held payments, oldest first |
| `/ops/review/:paymentId` | Borderline payment held | Single held payment with narrative and actions |
| `/ops/attacks` | Attack detected and blocked | Active card-testing attacks |
| `/ops/attacks/:attackId` | False alarm released | One attack, the merchants hit, and the release action |

## Layout Structure

### Global Layout

Operations console shell: left navigation rail, main content area, no right sidebar.

### Regions

| Region ID | Position | Width | Internal Layout | Scroll |
|-----------|----------|-------|-----------------|--------|
| nav-rail | left, fixed | `--rail-width` | flex-col | no |
| queue-list | main, left | `--list-width` | stack | yes |
| detail-pane | main, right | fluid | stack, gap-md | yes |

## Component Inventory

| Component ID | Type | Parent ID | Description |
|--------------|------|-----------|-------------|
| QueueRow | new | queue-list | Masked card, merchant, amount, score, reason, time held |
| PaymentDetail | new | detail-pane | Request facts, score, narrative |
| NarrativeBlock | new | PaymentDetail | The risk narrative for this payment |
| DecisionBar | new | detail-pane | Approve and decline actions with a required note |
| AttackRow | new | queue-list | Attack source, attempts, merchants hit, started at |
| AttackDetail | new | detail-pane | Timeline of attempts and the merchants hit |
| ReleaseAction | new | AttackDetail | Release the block, with a required reason |

### Component Props

#### QueueRow

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| maskedCard | string | required | BIN and last four |
| merchantName | string | required | Merchant trading name |
| amount | Money | required | Formatted in the payment currency |
| score | number | required | 0 to 1000 |
| reason | string | required | Top reason the payment was held |
| heldSince | timestamp | required | Shown as relative time |

## Spacing

Console dense scale. Row height `--row-height-dense`, detail pane padding `--space-5`.

## Typography

Rows `--type-body-sm`, amounts and scores `--type-mono-sm`, detail headings
`--type-title-xs`.

## Color Application

Score is shown as a number with a neutral bar. No red or green on the queue page.

## Elevation & Depth

Flat. The detail pane is separated by a `--border-subtle` rule, not elevation.

## States

### Page-Level States

#### Empty State

<!-- TODO: confirm with fraud ops what they want to see on a quiet day -->

#### Loading State

Row placeholders at full row height, no shimmer.

#### Populated State

The queue lists held payments oldest first. Selecting a row opens it in the detail pane.

#### Error State

Banner above the list: "The review queue couldn't load. Decisions you've already made
are saved." with a retry action.

### Interactive Element States

Rows have default, hover, selected and focus. DecisionBar buttons are disabled until a
note is entered.

## Data Binding

| Element | Source |
|---|---|
| QueueRow.reason | Model reason for the score |
| NarrativeBlock | Risk narrative |
| AttackRow, AttackDetail | Card-testing detector |

## Interactions & Motion

### Interactions

- `j` and `k` move through the queue, `a` approves, `d` declines, `n` focuses the note.
- Approve and decline move to the next row automatically.

### Motion

None beyond focus transitions.

## Responsive Behavior

Desktop only. Below `--bp-lg` the console shows a "use a larger screen" message.

## Accessibility

### Keyboard Navigation

Every action has a shortcut, listed in a help overlay on `?`.

### ARIA & Screen Reader

The queue is a listbox. The detail pane is a region labelled by the payment.

### Contrast & Targets

WCAG 2.2 AA throughout.

## Content Constraints

Narratives are shown in full. Reasons are truncated at one line with the full text on
hover.

## Implementation Notes

Reuse the console's existing list and pane components.

## Verification Criteria

- [ ] Every row shows a reason without a click
- [ ] An analyst can clear a held payment using only the keyboard
- [ ] Release requires a reason

## Figma / Visual Reference

Operations console file, page "Review queue v0.8".
