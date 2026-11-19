# 301.2E facilitator guide

Private teaching guidance. Keep this file, assessment keys and any reference solution
outside the learner's execution repository and agent context.

## What to protect

Teach the same payments fixture, both reviewed F2 RFCs and the 301.1E plan in 120
minutes. The snapshot carries all of it. Do not hide that Verify failed or that the plan
has two tasks beyond the cap; both are part of the lesson.

## Timed intervention

Use stage lengths 15 / 20 / 15 / 20 / 20 / 20 / 10. At the end of stage 2, move everyone
to the recorded checkpoint in a separate folder. Label the switch and record
participation. Leave active work with its operator. No learner setup
or extra homework is added. Written assessment takes 12 + 5 + 3 minutes; grading occurs
after the session if needed.

| Moment | Expected observation | Prompt if missed |
| --- | --- | --- |
| Admission | Baseline/spec/plan/Verify scope match; both RFCs remain visible | Which F2.2 behavior was actually planned? |
| Harness | Models are participants in controller/context/tools/checks/memory | Which source and task fields reach this consumer? |
| Run | Producer merges can move the target before Integrate | Locate the producer merge and retained original baseline |
| Recovery | Environment, implementation and owner-policy causes differ | Show the original failing input and raw response |
| Integration | Task status, input coverage and target results are separate evidence | What did each configured command actually examine? |
| Learn | Extracted type labels and structural synthesis are fallible | Follow one entry ID back to the original passing/failing result |
| Context | Scope matching can fall back; conventions can activate automatically | Show what the actual context bridge emitted |
| Handoff | Recipient can reproduce candidate and learning provenance | Locate the source, candidate, active memory and remaining owner |

## Stage keys from the recorded run

| Stage | A good answer |
| --- | --- |
| 1 Admit | Run tasks 1 to 8 with the two Verify criticals recorded as open owner questions. Hold tasks 9 and 10: they need sign-offs no class can produce. Name the gate gap: only `npm test` runs |
| 2 Run | Notice that each passing task is merged into `main` during Run, so `main` moves before Integrate |
| 3 Recover | Task 4 goes to the F2.1 owner with both conflicting requirements quoted; retry will not answer it. Tasks 9 and 10 stay blocked. The "Empty diff" attempt is an environment cause |
| 4 Integrate | Blocked. Review asked for changes on every task, so there is nothing approved to integrate. 186 passing tests do not answer the 28 major findings |
| 5 Learn | The task 1 context got three learnings by fallback, not by scope: tasks declare `files_touched`, the bridge reads `files_to_modify` |

## Guided F2 recovery and Learn key

Use the marked cases in the recovery and Learn guides. F2.1 policy-provider unavailability
can hold; F2.2 block-match failure to confirm declines under its accepted contract.
A shared adapter does not collapse those policies. Preserve both path tests and the
owner's accepted decisions. A learner must reject “all unavailable challenges hold” as
an unsupported generalization. Changing an accepted requirement needs its owner and
new source/plan/test/memory evidence, not a more confident agent answer.

A useful source-bounded observation is a review finding tied to one file and line, for
example task 1's: a rejected Promise from the model can end the gateway process
(`src/risk/scoring.ts:52`). It describes that code at that commit. It is not a rule for
every model call. A single-player review note does not implement an
approval gate. Stop future use of unsafe active advice and route an accountable correction.

In the recorded run, synthesis kept 42 entries and rejected 214. Ask learners why so many
were rejected, and whether a kept entry could still be wrong. Structural filters check
form and size, not truth.

## Assessment key

### Packet A

Task 12 is blocked and unimplemented even though failed count is zero and the JSON says
completed. The original contract excludes a held confirmation message. The learner
should preserve task 11, keep task 12's affected scope blocked, identify the conflicting
request and route any policy change to the accountable owner. They may propose a
contract-consistent correction if the supplied evidence makes that scope clear. They
must not integrate and report the entire feature as implemented.

Counterfactual: task 12 becomes pending with no blocker. Expected change: investigate
eligibility, dependencies and context before choosing Run; pending work remains incomplete.

### Packet B

The target includes the branches, but there is no configured regression evidence. The
contract checker establishes artifact existence. Producer Coherence inputs with no
changed lines have limited input coverage. Use the retained pre-run baseline to inspect the complete
candidate. The merchant descriptor in the narrative violates the accepted F2 data-handling
contract, so that scope remains blocked. The learner should specify a bounded payload
repair and a reproducible target acceptance/regression run, preserving prior reports.

Counterfactual: the narrative-payload probe passes but target tests are still unconfigured. Expected
change: the named probe cases have evidence; general regression remains unexamined.

### Packet C

Preserve task 22's branch commit, uncommitted diff, status and logs before Recover.
Confirm the original orchestrator is dead and inspect tracked agents/locks rather than
assuming a disappeared UI proves that. Keep task 21 and its merged code. Recovery should
reconcile task 22 and let it resume from a correct target/context, not recreate the
whole plan. Recheck the new candidate against the same challenge-source/API requirement.

Counterfactual: the original orchestrator is alive. Expected change: coordinate with the
operator; do not run Recover against a live session.

### Compulsory learning question key

Retain the source-bounded reviewer-input limitation with its exact artifact and scope.
Reject declining all authorizations on a shared-store outage: the supplied architecture
requires authorizations to continue, detection to pause and an alert to be logged.
Inspect target results, active learning/convention files and actual assembled context;
do not accept a missing test result or a claimed memory approval screen. If an owner
later accepts a versioned policy change, update the authoritative source, reviewed plan,
path-specific tests and applicable active memory through the agreed change process.
Retain the old evidence and prove which new revision future execution uses.

## Practical grading

Use the published assessment rubric. Retain evidence references, scores and the learner's written counterfactual. Inspect at least one original log, one task/branch relationship and the full
candidate comparison. A confident explanation unsupported by those artifacts earns no
evidence credit for the claim.

The assessment packets are complete constructed cases with facilitator ground truth.
They assess unfamiliar reasoning. Certification of live operation also requires the
learner's own command/evidence submission. A packet-only delivery is a different assessed
scope and should be described that way.

## Facilitation and remediation

| Learner behavior | Response |
| --- | --- |
| Repeats a failed command without diagnosis | Ask for the changed cause and expected discriminating evidence |
| Asks the agent to decide Product or Legal policy | Return to the requirement owner and record the affected blocker |
| Calls every warning a failed implementation | Ask which rule ran and what fact or limit it reports |
| Calls every green check complete coverage | Ask for its inputs, named cases and unexamined behavior |
| Resets the whole exercise to make progress | Inspect preserved work; require a smaller recovery decision |
| Produces an incomplete handoff | Have another learner attempt to locate the candidate and original intent |

After delivery, review time spent, provider waiting, support interventions, evidence
quality and assessor disagreements. Calibrate the next class from those observations.
