# 301.2E fixture continuity: the same adaptive-authorization feature

This is the required course fixture. Continue the payments-validation-fixture repository,
reviewed specifications and task plan from 301.1E: F2.1 genuine travelers and F2.2
cross-merchant card testing. The 120-minute session follows an admitted execution checkpoint,
using clearly labeled recorded checkpoints from that same source when required.

## Admit the actual 301.1E packet

The 301.2E snapshot holds the whole packet in three commits: the 301.1E start state, the
reviewed tech specs, and the plan with its `.speed/` records (tasks, contract, authoring
decisions, verify log). `learner/assets/handoff-301-1e.json` names the baseline commit and
the digest of every file the plan depends on.

| Input | Required review |
| --- | --- |
| Product, architecture and designs | Identify the exact revisions, both F2 scenarios and shared gateway/bank-confirmation behavior |
| Technical RFCs | Read their Interface Contract, Testing, File Impact, Dependencies and Unresolved Questions sections |
| Task plan | Inspect the actual feature task files, references, dependencies, declared files, models and scope |
| Plan/Verify evidence | Establish which documents were primary planned inputs, which were related context and what was actually verified |
| Owner decisions | Retain accepted answers, unresolved questions, responsible owners and the phase each question blocks |
| Existing implementation/tests | Establish the code baseline and characterization results before changes |
| Execution environment | Verify target selection, clean Git state, provider access, configured gates and available tools |

Copying only RFCs provides no execution plan. Copying only `.speed/features/` provides
no guarantee that the code and specifications match the plan. The baseline, inputs,
task records and admission decision must describe the same accepted work.

## Inspect the feature dependencies

The saved plan has 10 tasks:

| Task | Title | Depends on |
| --- | --- | --- |
| 1 | Scoring, decision policy and reason maps | none |
| 2 | Capture blocks and append-only audit storage | none |
| 3 | Held-payment review, expiry and narratives | 1, 2 |
| 4 | Replica-local step-up lifecycle | 1 |
| 5 | Scored authorization and policy challenges at the gateway | 1, 3, 4 |
| 6 | Shared attempt detection and replica-local block lookup | none |
| 7 | Attack operations, expiry and merchant notifications | 2, 6 |
| 8 | Block challenges and the combined authorization path | 5, 6, 7 |
| 9 | Remove `HIGH_VALUE_CROSS_BORDER` after full merchant cutover (added by Verify) | 8 |
| 10 | Gate and verify the production rollout (added by Verify, no files) | 8 |

This map shows which source contracts each area depends on.

| Work area | Source contract | Execution or integration question |
| --- | --- | --- |
| Shared decision types and reasons | F2.1 Interface Contract and Data Model | Do downstream agents receive the exact result shapes and permitted reason behavior? |
| Scoring and policy interpretation | F2.1 decision State Machine and Validation Rules | Are defaults and owner-approved thresholds distinguished from production cutover decisions? |
| Bank-confirmation flow | F2.1 challenge State Machine and API Surface | Are acknowledgement timeout and challenge expiry kept distinct, with the original request protected? |
| Held payments and review queue | F2.1 review State Machine, audit and queue interfaces | Are capture blocking, analyst identity, notes and audit behavior preserved? |
| Attack detection and shared attempt store | F2.2 Data Model and Acceptance Criteria AC1/AC3 | Does detection compose across gateway instances, rather than remain per replica? |
| Block matching and challenge outcome | F2.2 Consumes and Acceptance Criteria AC2/AC10/AC11 | Does F2.2 use the F2.1 challenge flow while preserving its different unavailable outcome? |
| Merchant notifications and analyst release | F2.2 API Surface, Testing and Unresolved Questions | Which notification behavior is defined, blocked or explicitly outside the current build scope? |
| Shared gateway integration | Both RFCs' File Impact and Dependencies | Which tasks own the shared files, and what order prevents conflicting implementations? |

F2.2 consumes F2.1's gateway result, step-up adapter and completion API, reason handling,
audit contract and analyst session. A plan that schedules those consumers before their
interfaces are available needs correction or an explicit stub/contract strategy.

## Carry the known owner boundaries

The full list, with owners, is in `.speed/authoring/adaptive-auth/questions.md` in the
snapshot. These are the ones that shape the run. None is approved.

| Recorded question | Responsible functions | Affected boundary |
| --- | --- | --- |
| F2.1 risk thresholds and acceptable fraud rate | Risk | Cutover; the draft describes a shadow-mode path |
| Held copy and cardholder reason wording | CX and Legal | Relevant cutover behavior |
| Merchant learning of an analyst approval or decline | Product, merchant experience and Legal | Review-queue cutover; independent build work can continue |
| F2.2 block length and scope | Product and Risk | Enabling blocking |
| Merchant notification design | Design | Notifications |
| Recording attempts that match an active block | Risk, Product and platform engineering | Follow-up notification and timeline coverage |
| Shadow-mode length: one week (F2.2) or two (architecture)? (Q006) | Architecture | Enabling blocking |
| Verify critical: closing the challenge sheet must cancel the payment | F2.1 PM, checkout repository | Checkout cutover |
| Verify critical: a card-testing decline cannot be traced to one purchase | F2.1 and F2.2 PMs | Cardholder explanations |
| Task 4 in the recorded run: may a status check after the deadline settle the challenge? | F2.1 owner | Tasks 4, 5 and 8 |
| Tasks 9 and 10: cutover and rollout sign-offs | Risk, PM and Legal | Removing the old rule; production |

An implementation agent can expose these questions and explain consequences. It cannot
approve the policy. If an admitted task requires an unanswered decision, keep that scope
blocked and return the question to its owner.

## Run and inspect the admitted feature

In the learner's clone of the snapshot, the target is `main` and the baseline is the
snapshot's HEAD. The task graph and checks come from the reviewed 301.1E handoff.

```sh
speed run --feature adaptive-auth --max-parallel 2 --verbose
speed status --feature adaptive-auth
speed review --feature adaptive-auth
speed coherence --feature adaptive-auth
speed integrate --feature adaptive-auth
speed learn --feature adaptive-auth --dry-run
speed learn --feature adaptive-auth
speed learn --synthesize
```

These are stage commands, not a batch to paste without inspection. Apply the workbook's
evidence capture and checkpoints between them. A failed run, requested change or owner
blocker changes the next action. Regenerate a plan only through an approved return to
301.1E, preserving the previous plan and implementation work.

During Run, follow one shared-interface producer and one F2.2 consumer. Show the
predecessor merge, new worktree and actual code/context the consumer receives. Use
existing tests and the reviewed RFC's acceptance paths to inspect the assembled target.
Retain any replaced characterization assertions and explain why the accepted behavior
changes them; do not weaken acceptance tests to match the generated code.

## Learn on the same feature

Use the required [Learn exercise](../learner/learn.md). Trace observations to this
feature's actual task and review artifacts. A single-player extraction writes shared
project memory for later agents. Review active entries, convention discovery and scope
fallbacks; a statement about one bank-confirmation path must not silently redefine the
other RFC's unavailable outcome. Preserve owner decisions and source authority.

## Handoff to 301.3E

The packet names the original baseline, candidate SHA, exact F2.1/F2.2 scope, specification
versions, task branches, configured check results, learning provenance/active memory and unresolved owners. It distinguishes
the feature's functional examples, data handling, shared-state behavior and timing claims.
An in-memory classroom test cannot establish production latency or deployment behavior.

For example, evidence for the traveler path does not establish cross-replica card-testing
detection. A replay assertion about an attack does not settle its production blocking
policy. The receiving 301.3E engineer chooses independent methods for those risks from
the original intent and the candidate, rather than inheriting a blanket approval.
