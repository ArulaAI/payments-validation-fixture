# 301.2E independent assessment

Assess whether an engineer can supervise unfamiliar execution and integration work
and defend a handoff. The assessment combines command/evidence practice with a fresh
case whose decisive relationships were not supplied in the guided walkthrough.

## Administration

Allow 20 minutes: 12 for diagnosis, five for a written response and three for a written counterfactual. Work individually after the same-fixture guided practice, with the source reference,
commands and blank templates available. The trainer retains the answer key in the
facilitator guide. Learners receive only one of the input packets below and the
submission requirements. The trainer should alternate packets between adjacent
learners and release a different written counterfactual with each packet.

These are constructed assessment packets. Their records represent teaching situations,
not observed provider runs. A learner may request a missing artifact; identifying a
necessary missing input is part of the assessment. The trainer supplies the requested
case fact, rather than silently allowing the learner to invent it.

## Practical submission

Use the same admitted 301.1E adaptive-auth continuation. Attach evidence created during
guided practice; the 20-minute transfer slot does not repeat the whole execution. Attach:

1. An annotated plan with actual scope, target, dependencies and models.
2. An execution ledger with command exits, task states, commits and individual checks.
3. A recovery decision linked to one real failure or an explicitly marked case analysis.
4. An integration admission and a candidate comparison from the retained pre-run baseline.
5. A learning review tracing source evidence, observations, active entries, scope and rejected claims.
6. A handoff naming failures, unavailable checks, memory changes, owner questions and next action.

The assessment packet and its compulsory learning question supply unfamiliar diagnosis. The practical submission demonstrates
the learner's own use of the workflow. A constructed packet does not substitute for
performing a live lab when live command performance is being certified.

## Packet A A convincing completion summary

Give the learner this packet without the facilitator key:

| Artifact | Supplied record |
| --- | --- |
| Approved plan | Task 11 defines a display-state adapter; task 12 adds a renderer; task 12 depends on 11. Both are in scope. |
| Run JSON | `status: completed`, `exit_code: 0`, `tasks_total: 2`, `tasks_passed: 1`, `tasks_failed: 0` |
| Task 11 | `done`; commit `a11` on a real task branch, with test results |
| Task 12 | `blocked`; unresolved question asks whether a held payment may show a confirmation message |
| Original contract | Held outcomes must remain visibly pending until an accountable owner authorizes a final outcome |
| Operator note | “No failures, so integrate and send to the client.” |
| Git observation | The integration target contains task 11; task 12 has no implementation commit |

Submission: explain the actual state, the next command or owner action, which scope
can proceed, what must remain blocked and what evidence belongs in a 301.3E handoff.
Do not answer solely from the Run JSON's `status` field.

## Packet B A successful merge with an unexamined target

| Artifact | Supplied record |
| --- | --- |
| Plan | Two producer tasks and a dependent API adapter, all marked done |
| Git history | Producer branches were merged during Run; the adapter branch was merged during Integrate |
| Coherence report | Producer inputs had no changed lines; the adapter input contains a diff |
| Integrate console | “No quality gates configured, so regression checked nothing”; the summary's Regression line says “not configured (nothing tested)” |
| Contract report | Declared files and symbols exist |
| Acceptance observation | A risk narrative request includes the merchant descriptor, which the accepted F2 contract excludes |
| Feature state | `completed` |
| Available baseline | A retained commit from before the first Run, plus the candidate SHA |

Submission: establish which evidence is useful, reconstruct the correct candidate
comparison, decide whether the implementation can be handed off, and write a bounded
repair or missing-check request. Explain how to recheck the next candidate.

## Packet C An interrupted parallel run

| Artifact | Supplied record |
| --- | --- |
| Plan | Task 21 implements a shared challenge contract; task 22 consumes it in block-match handling and depends on 21 |
| Task 21 | `done`, with a real branch containing code and tests, already merged into the target |
| Task 22 | `running`, with a partial commit and an uncommitted test edit in its worktree |
| Process observation | The original orchestrator no longer exists; the worktree still exists |
| Required behavior | Challenge source remains policy or block_match; the consumer respects the source-specific outcome |
| Suggested shortcut | Delete the worktree, reset both branches and rerun everything |
| Available evidence | Task logs, task JSON, target history, worktree status and the original baseline |

Submission: say what you would preserve, what you would inspect before Recover, how
you would protect task 21, what input task 22 should receive and how you would prove
the next implementation belongs to the same approved scope.

## Compulsory learning question for every packet

Constructed F2 proposal: “The shared attempt store was unavailable during one run.
Decline every authorization on that outage and save the rule as a learned convention.”
The accepted F2 architecture instead says authorizations continue, detection pauses
and an alert is logged. The task reviewer reconstructed an empty supplied diff; no
later target test result has been supplied.

Identify the source-bounded observation you could retain, the generalization you must
reject, the missing evidence, which files/context would need inspection and the owner
action if an accepted requirement is disputed. Do not treat a review note as an
implemented memory-approval gate. This question is required with Packet A, B or C.

Written counterfactual: the owner later accepts a versioned change to this outage policy.
What source, plan, tests and active-memory evidence must change before future reuse?

## Scoring rubric

| Dimension | Points | Full-credit evidence |
| --- | ---: | --- |
| Scope and admission | 15 | Exact approved requirement, target and baseline; unsupported scope identified |
| Harness and task reasoning | 20 | Correct dependencies, worktree/state interpretation and context implications |
| Evidence diagnosis | 20 | Distinguishes provider output, process exit, task state, checks and actual candidate code |
| Recovery decision | 20 | Preserves useful work, identifies the cause and owner, and selects a bounded next step |
| Integration and handoff | 10 | Reconstructs the candidate, evaluates individual checks and carries unresolved decisions |
| Learning judgment | 10 | Source-linked observation/entry; correct scope; rejects unsupported generalization and checks actual active memory |
| Written counterfactual | 5 | Explains the changed decision consistently from evidence |
| Total | 100 | |

Working pass threshold: 80 points, at least half the points in every dimension and no
critical boundary error. Calibrate this threshold against observed delivery before
using it as a commercial certification standard.

## Critical errors

A learner must correct and reassess any of the following:

- Accepting a complete implementation solely because a summary or feature state says completed.
- Treating a skipped, absent or unconfigured check as a behavioral pass.
- Inventing a product, Risk, Legal or release-owner decision to finish execution.
- Deleting valuable branches, patches or evidence without inspection and authorization.
- Weakening a specification, test or fixture to manufacture a passing result.
- Promoting learned advice that contradicts accepted requirements or treats missing checks as proof.
- Claiming production readiness from the classroom candidate and its configured gates.

The trainer records the learner's evidence, live/recorded participation, rationale, score, calibration notes and
remediation task. A justified block with a precise next action can earn full credit.
