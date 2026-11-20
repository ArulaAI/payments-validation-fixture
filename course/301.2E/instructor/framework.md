# 301.2E Execute, Integrate, Learn

A 120-minute engineering course that continues the same payments fixture and adaptive-
authorization feature from 301.1E. Engineers supervise `speed run`, investigate a failure,
inspect `speed integrate`, use `speed learn` and hand the candidate and its evidence to
301.3E. 

**Governing question:** Did the reviewed intent become the intended implementation,
what can we safely learn from that execution, and what must the next engineer validate?

## One fixture across the pathway

| Course | Input and responsibility | Output used by the next course |
| --- | --- | --- |
| 301.1E Define, Audit, Plan | Existing payments code, Product/Architecture/Design and both F2 RFCs; reconcile decisions, author, audit, plan and verify | Exact source baseline, reviewed RFC revisions, actual task graph/contract, planning and verification evidence, owner decisions and blockers |
| 301.2E Execute, Integrate, Learn | That same repository and handoff; supervise execution, recover, inspect integration and review learning | Candidate SHA, original intent, actual included scope, command/check evidence, learning provenance and unresolved owners |
| 301.3E Diagnose, Judge, Repair | That candidate and evidence; independently diagnose risks, select methods, repair and revalidate | A technical disposition supported by bounded evidence |

The whole feature remains F2.1 genuine travelers and F2.2 cross-merchant card testing.
Related context does not prove a saved plan covers both. Execute only the scope admitted
in the actual 301.1E handoff. Product acceptance, operational readiness and production
promotion remain with their named owners.

## Audience and entry

Experienced engineers who can read a specification and diff, explain task dependencies
and run repository tests. Prerequisite: 301.1E capability. Each learner clones the 301.2E
snapshot, which holds the reviewed 301.1E work and its 10-task plan. The trainer hands out
the recorded checkpoint, `checkpoint/after-run.bundle`, for the stages a live run cannot
reach in time. No homework or extra installation is needed. The
[trainer brief](trainer-brief.md) covers preparation.

## The 120-minute progression

All briefing, command waits, transitions, assessment and wrap-up fit inside these slots.
There is no additional live setup block or time added for slow providers.

| Stage | Minutes | Learner responsibility | Retained output |
| --- | ---: | --- | --- |
| 1 Admit the handoff and inspect the harness | 15 | Match source/spec/plan revisions, approved scope, dependencies, actual models, target and configured checks | Entry decision, baseline and annotated task graph |
| 2 Supervise Run | 20 | Predict eligibility and context; inspect worktrees, commits, dependency merges and task gates | Execution ledger linked to actual artifacts |
| 3 Recover a stopped task | 15 | Establish one cause, preserve useful work and choose bounded retry or owner action | Failed evidence, recovery decision and comparison |
| 4 Admit and inspect integration | 20 | Reconcile branches, Review/Coherence and owner blockers; inspect merges and each target check | Candidate SHA and integration admission |
| 5 Learn from the evidence | 20 | Preview/extract observations, inspect synthesis and trace a learning into future context | Learning review with source IDs, scope and rejected claims |
| 6 Transfer independently | 20 | Diagnose one unfamiliar packet, cite evidence and answer a counterfactual | Individual scored disposition |
| 7 Hand off to 301.3E | 10 | Make candidate, checks, memory changes and unanswered decisions reproducible | Completed handoff and closing review |
| Total | 120 | | |

At a stage deadline, move to the recorded checkpoint (`checkpoint/after-run.bundle`). It
descends from the same snapshot commit. In the recorded run, round 1 alone took 33
minutes, so every cohort uses it from stage 2's deadline onward. Do not interrupt or reset active work merely to fit
the clock. Keep live and recorded workspaces separate; record what the learner actually
executed. A replay supports evidence interpretation, not a claim of live operation.

## Outcomes

| Capability | Guided practice | Independent evidence |
| --- | --- | --- |
| Admit the original handoff | Trace one F2 requirement to task, files, dependency and owner decision | Detect missing scope, dependency or target evidence |
| Explain the harness | Follow controller, context, tools, worktrees, completion and checks | Distinguish provider output, task status and actual code |
| Recover without losing valid work | Inspect one failure and preserve branches/patches before retry | Justify the cause, allowed correction and next check |
| Inspect the assembled candidate | Reconstruct the baseline-to-target diff and individual reports | Refuse unsupported completion or acceptance claims |
| Close the learning loop | Trace observation to source, synthesized entry and actual context | Reject an unsupported generalization or policy change |
| Hand off with limits | Assemble provenance, candidate, checks, learning and owners | Give a reproducible candidate, bounded partial scope or justified block |

## Through-line in the actual F2 fixture

Follow the shared gateway and bank-confirmation contracts across both RFCs. In the saved
plan, task 4 (the F2.1 step-up lifecycle) feeds task 5 (the F2.1 gateway), and both feed
task 8, where F2.2's block-match challenge reuses that flow. Task 6 (F2.2 detection) feeds
tasks 7 and 8. Use one of those seams. In the recorded run, task 4 stopped on a spec
question in round 2, so tasks 5 and 8 were never reworked: the seam shows how one owner
question holds up its consumers.

Run executes eligible pending tasks in the selected feature; it has no classroom-only
filter that silently reduces a plan. A smaller execution scope requires an explicitly
reviewed 301.1E plan and dependency closure. Changing task states to hide remaining work
is not a scope decision.

## The harness includes learning

| Mechanism | Inspect | Human judgment |
| --- | --- | --- |
| Controller and context | Task readiness, actual per-task models, specs, upstream decisions and fallback | Is the graph sufficient and did the agent receive the reviewed intent? |
| Worktrees and target | Isolation, recorded feature base, dependency merges and baseline commit | What shared state can move and what must be preserved? |
| Completion and gates | Raw output, markers, commits, actual commands, warnings and unavailable checks | What was established and which scope remains unexamined? |
| Recovery and integration | Retained work, retry guidance, branch inclusion and target checks | Is another attempt justified and is the candidate ready for independent validation? |
| Learn and future context | Observations, synthesis, conventions, rejects/conflicts and injected text | Is the reusable statement supported, applicable and consistent with current requirements? |

Single-player Learn can write memory used by later agents without a mandatory human
approval screen. A learning review note does not itself control those files. Inspect
active memory, retain evidence and stop subsequent agents if an unsafe entry needs an
accountable correction. Independent validation of the candidate remains in 301.3E.

## Fixture continuity

This is the required course fixture. Continue the payments-validation-fixture repository,
reviewed specifications and task plan from 301.1E: F2.1 genuine travelers and F2.2
cross-merchant card testing. The 120-minute session follows an admitted execution checkpoint,
using clearly labeled recorded checkpoints from that same source when required.

### Admit the actual 301.1E packet

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

### Inspect the feature dependencies

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

### Run and inspect the admitted feature

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

These are stage commands, not a batch to paste without inspection. Apply the lab guide's
evidence capture and checkpoints between them. A failed run, requested change or owner
blocker changes the next action. Regenerate a plan only through an approved return to
301.1E, preserving the previous plan and implementation work.

During Run, follow one shared-interface producer and one F2.2 consumer. Show the
predecessor merge, new worktree and actual code/context the consumer receives. Use
existing tests and the reviewed RFC's acceptance paths to inspect the assembled target.
Retain any replaced characterization assertions and explain why the accepted behavior
changes them; do not weaken acceptance tests to match the generated code.

### Learn on the same feature

Use the required [Learn exercise](../learner/lab-action-guide.md#5-learn-20-min). Trace observations to this
feature's actual task and review artifacts. A single-player extraction writes shared
project memory for later agents. Review active entries, convention discovery and scope
fallbacks; a statement about one bank-confirmation path must not silently redefine the
other RFC's unavailable outcome. Preserve owner decisions and source authority.

### Handoff to 301.3E

The packet names the original baseline, candidate SHA, exact F2.1/F2.2 scope, specification
versions, task branches, configured check results, learning provenance/active memory and unresolved owners. It distinguishes
the feature's functional examples, data handling, shared-state behavior and timing claims.
An in-memory classroom test cannot establish production latency or deployment behavior.

For example, evidence for the traveler path does not establish cross-replica card-testing
detection. A replay assertion about an attack does not settle its production blocking
policy. The receiving 301.3E engineer chooses independent methods for those risks from
the original intent and the candidate, rather than inheriting a blanket approval.

## Completion and resources

Submit the annotated plan, execution/recovery ledger, integration admission, learning
review, individual transfer and 301.3E handoff. A justified blocker can meet the decision
objective when its evidence, owner and next action are precise. Record live versus
recorded participation; the two-hour assessment is not proof of operating every command
independently on a full F2 implementation.

| Resource | Use |
| --- | --- |
| [Speaker script](speaker-script.md) | Timed Say/Do sequence and checkpoints |
| [Lab guide](../learner/lab-action-guide.md) | Actual feature commands and submitted evidence |
| [Fixture continuity](#fixture-continuity) | Original F2 inputs and dependencies |
| [Facilitator gap map](facilitator-gap-map.md) | Owner questions and what the run surfaces |
| [Learn](../learner/lab-action-guide.md#5-learn-20-min) | Required extraction, synthesis, review and context exercise |
| [Recovery](../learner/lab-action-guide.md#3-recover-a-stopped-task-15-min) | Evidence-preserving operator decisions |
| [Assessment](assessment.md) | Unfamiliar packets, rubric and limits |
| [Facilitator guide](facilitator-guide.md) | Private keys, interventions and timing |
| [SPEED reference](../learner/speed-reference.md) | Inspected command/source behavior |
| [Trainer brief](trainer-brief.md) | Admission, provisioning and delivery readiness |
| [Source delta and rehearsal](rehearsal.md) | Verified changes, actual checks and limits |
| [Overview PDF](../overview.pdf) | Course overview in the 301.1E visual format |
