# 301.2E Execute, Integrate, Learn

A 120-minute engineering course that continues the same payments fixture and adaptive-
authorisation feature from 301.1E. Engineers supervise `speed run`, investigate a failure,
inspect `speed integrate`, use `speed learn` and hand the candidate and its evidence to
301.3E. 

**Governing question:** Did the reviewed intent become the intended implementation,
what can we safely learn from that execution, and what must the next engineer validate?

## One fixture across the pathway

| Course | Input and responsibility | Output used by the next course |
| --- | --- | --- |
| 301.1E Define, Audit, Plan | Existing payments code, Product/Architecture/Design and both F2 RFCs; reconcile decisions, author, audit, plan and verify | Exact source baseline, reviewed RFC revisions, actual task graph/contract, planning and verification evidence, owner decisions and blockers |
| 301.2E Execute, Integrate, Learn | That same repository and handoff; supervise execution, recover, inspect integration and review learning | Candidate SHA, original intent, actual included scope, command/check evidence, learning provenance and unresolved owners |
| 301.3E Tooled Judgment | That candidate and evidence; independently diagnose risks, select methods, repair and revalidate | A technical disposition supported by bounded evidence |

The whole feature remains F2.1 genuine travellers and F2.2 cross-merchant card testing.
Related context does not prove a saved plan covers both. Execute only the scope admitted
in the actual 301.1E handoff. Product acceptance, operational readiness and production
promotion remain with their named owners.

## Audience and entry

Experienced engineers who can read a specification and diff, explain task dependencies
and run repository tests. Prerequisite: 301.1E capability and its reviewed handoff.
The trainer provisions independent continuation workspaces and source-matched checkpoint
records before class. No additional learner homework or installation is required.

The current authoring checkout contains draft RFCs and no populated adaptive-auth task
set. It is not a ready execution packet. Do not invent acceptance, fabricate a plan or
relabel another fixture to conceal that gap. The [trainer brief](trainer-brief.md)
defines the required delivery preparation.

## The 120-minute progression

All briefing, command waits, transitions, assessment and wrap-up fit inside these slots.
There is no additional live setup block or time added for slow providers.

| Stage | Minutes | Learner responsibility | Retained output |
| --- | ---: | --- | --- |
| 1 Admit the handoff and inspect the harness | 15 | Match source/spec/plan revisions, approved scope, dependencies, actual models, target and configured checks | Entry decision, baseline and annotated task graph |
| 2 Supervise Run | 20 | Predict eligibility and context; inspect worktrees, commits, dependency merges and task gates | Execution ledger linked to actual artifacts |
| 3 Diagnose and recover | 15 | Establish one cause, preserve useful work and choose bounded retry or owner action | Failed evidence, recovery decision and comparison |
| 4 Admit and inspect integration | 20 | Reconcile branches, Review/Coherence and owner blockers; inspect merges and each target check | Candidate SHA and integration admission |
| 5 Learn from the evidence | 20 | Preview/extract observations, inspect synthesis and trace a learning into future context | Learning review with source IDs, scope and rejected claims |
| 6 Transfer independently | 20 | Diagnose one unfamiliar packet, cite evidence and answer a counterfactual | Individual scored disposition |
| 7 Hand off to 301.3E | 10 | Make candidate, checks, memory changes and unanswered decisions reproducible | Completed handoff and closing review |
| Total | 120 | | |

At a stage deadline, move to the trainer's labelled recorded checkpoint from the same
301.1E baseline and reviewed scope. Do not interrupt or reset active work merely to fit
the clock. Keep live and recorded workspaces separate; record what the learner actually
executed. A replay supports evidence interpretation, not a claim of live operation.

## Outcomes, practice and assessment

| Capability | Guided practice | Independent evidence |
| --- | --- | --- |
| Admit the original handoff | Trace one F2 requirement to task, files, dependency and owner decision | Detect missing scope, dependency or target evidence |
| Explain the harness | Follow controller, context, tools, worktrees, completion and checks | Distinguish provider output, task status and actual code |
| Recover without losing valid work | Inspect one failure and preserve branches/patches before retry | Justify the cause, allowed correction and next check |
| Inspect the assembled candidate | Reconstruct the baseline-to-target diff and individual reports | Refuse unsupported completion or acceptance claims |
| Close the learning loop | Trace observation to source, synthesized entry and actual context | Reject an unsupported generalization or policy change |
| Hand off with limits | Assemble provenance, candidate, checks, learning and owners | Give a reproducible candidate, bounded partial scope or justified block |

## Through-line in the actual F2 fixture

Follow the shared gateway and bank-confirmation contracts across both RFCs. The trainer
selects an already admitted producer/consumer seam in the saved plan: for example,
F2.1's decision/step-up contract consumed by F2.2's block-match handling. These are source
relationships to inspect, not invented task IDs or an instruction to implement all F2 in
20 minutes. Keep unplanned or unverified F2.2 scope visible.

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

## Completion and resources

Submit the annotated plan, execution/recovery ledger, integration admission, learning
review, individual transfer and 301.3E handoff. A justified blocker can meet the decision
objective when its evidence, owner and next action are precise. Record live versus
recorded participation; the two-hour assessment is not proof of operating every command
independently on a full F2 implementation.

| Resource | Use |
| --- | --- |
| [Speaker script](speaker-script.md) | Timed Say/Do sequence and checkpoints |
| [Learner workbook](../learner/learner-workbook.md) | Actual feature commands and submitted evidence |
| [Fixture continuity](adaptive-auth-lab.md) | Original F2 inputs, dependencies and owner boundaries |
| [Learn](../learner/learn.md) | Required extraction, synthesis, review and context exercise |
| [Recovery](../learner/recovery-flow.md) | Evidence-preserving operator decisions |
| [Assessment](assessment.md) | Unfamiliar packets, rubric and limits |
| [Facilitator guide](facilitator-guide.md) | Private keys, interventions and timing |
| [SPEED reference](../learner/speed-reference.md) | Inspected command/source behavior |
| [Trainer brief](trainer-brief.md) | Admission, provisioning and delivery readiness |
| [Source delta and rehearsal](rehearsal.md) | Verified changes, actual checks and limits |
| [Overview PDF](../overview.pdf) | Course overview in the 301.1E visual format |
