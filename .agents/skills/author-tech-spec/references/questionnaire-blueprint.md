# Questionnaire blueprint

Generate questions from evidence, accepted answers, and the installed RFC template.
These prompts describe design dimensions, not an answer key or a predetermined list
of feature gaps. Link each question to one or more exact loaded RFC headings.

## Question record

For each question record:

- Stable ID, short question, and current status.
- Source paths and sections or lines; distinguish disagreement from missing detail.
- Why the answer matters and which stories or constraints it affects.
- Options and tradeoffs, with any suggested answer labelled as a proposal.
- Owner, blocking phase, and affected RFC paths and template headings.
- Parent question, answer, and resulting decision ID when applicable.

Statuses: `open`, `discussing`, `answered`, `owner-needed`, and `superseded`.
An answer documented consistently in the inputs can be `answered` with
`source-derived` provenance. A recommendation alone cannot.

## Design dimensions and RFC destinations

| Investigate | What the engineer needs to establish | RFC destinations |
| --- | --- | --- |
| Concrete behaviour | An observable example for each intended scenario | Basic Example; Testing / Acceptance Criteria |
| Shared contracts | Existing boundaries, exact consumed and produced types, failure results, and sibling dependencies | Interface Contract / Consumes; Interface Contract / Produces; API Surface; Dependencies |
| Persistence | Entities, identity, uniqueness, retention, ownership, and concurrency across replicas | Data Model; Search / Query Strategy; Security & Controls |
| Lifecycle | Valid transitions, triggers, idempotency, cancellation, expiry, and side effects | State Machine; API Surface; Testing / Edge Cases |
| Decision rules | Required and forbidden behaviour, configurable policy, defaults, and rejected inputs | Validation Rules; Key Decisions; Unresolved Questions |
| Failure and recovery | Observable behaviour when dependencies time out, disagree, duplicate work, or become unavailable | State Machine; Testing / Risks and Coverage; Testing / Edge Cases |
| Performance and operations | Critical-path budgets, consistency lag, metrics, alerting, retention, rollout, and rollback | Search / Query Strategy; Migration Strategy; File Impact; Key Decisions |
| Trust and permissions | Actors, authority, data boundaries, safe reasons, and audit evidence | Security & Controls; API Surface; Data Model |
| Verification | Requirement-to-behaviour mapping, risk coverage, useful test levels, and boundaries of verification | Testing / Acceptance Criteria; Testing / Risks and Coverage; Testing / Test Plan; Testing / Edge Cases; Testing / Out of Scope |
| Design alternatives | Feasible approaches, rationale, cost, maintenance, and remaining dependencies | Key Decisions; Drawbacks; Dependencies; Unresolved Questions |

Use the actual template wording for every destination. In the current template,
`Consumes (from prerequisite RFCs)` and `Produces (for downstream RFCs)` are the full
subsection names. A heading's presence is not evidence that its content is settled.

## Adapt the conversation

Start with behaviour and constraints that shape the rest of the design. Ask about
dependencies before dependent choices. Move between headings when one decision
affects several parts of the RFC; the interview order need not match document order.

Re-read the relevant source sections before asking. Reuse accepted answers and ask
only the necessary follow-up. If a new question contradicts an earlier answer, show
the conflict and affected text. Allow an explicit, reasoned revision.

Use both traveller and cross-merchant card-testing scenarios when examining shared
contracts and infrastructure. Distinguish their required outcomes where the supplied
materials differ. Do not reduce the feature to one checkout finding.

For a policy decision outside engineering authority, show the evidence and what it
blocks, assign the documented owner or ask who owns it, and continue independent
design work. Generate decision options without presenting one as approved policy.

Persist requirement and heading coverage separately from the question queue. A short
questionnaire can cover several headings; a long questionnaire can still miss a
requirement. Read the inputs to judge coverage, rather than counting questions.
