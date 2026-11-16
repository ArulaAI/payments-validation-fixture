# 301.2E recovery: preserve the same F2 work

Use 15 minutes for one observed failure or one marked constructed case. Continue the
301.1E baseline, accepted RFCs and actual task plan. Record the original evidence before
retry, Recover, branch deletion or any other mutation. This guide does not authorize
new product decisions or resetting a user's repository.

## The recovery decision

| Step | Inspect | Retain or decide |
| --- | --- | --- |
| Preserve | Command, raw provider/gate output, task state, branch tips, worktrees and original baseline | Snapshot the failed attempt and valuable commits/uncommitted patches |
| Locate | Did failure occur before provider startup, during code generation, at a gate or during merge? | Separate verified facts from hypotheses |
| Attribute | Environment, implementation, task dependency, shared contract or unresolved owner decision | Choose one supported cause and accountable correction |
| Bound | Current accepted specification, affected files, dependency and prior valid work | State what may change and what must remain |
| Retry or hand back | Actual task state and useful branch contents | Append guidance, inspect state, run eligible work or return the blocker |
| Compare | New candidate, same requirement and actual checks | Retain both attempts and the remaining limits |

## Case 1 Provider startup failure

An earlier technical rehearsal, on the now-retired smoke project, observed `Not logged in`
before implementation. That is evidence about an execution environment, not an F2
product defect. In this fixture, require the actual raw response before assigning the
same diagnosis. Inspect whether the branch contains useful implementation before any
branch recreation. Correct the environment through its operator; preserve requirements.

## Case 2 Constructed bank-confirmation mismatch

Teaching input, not a claimed observed native F2 run: a block-match challenge uses the
F2.1 policy fallback when its bank provider cannot confirm it. The candidate returns a
held result, and a task test has been changed to expect that result.

Ask the learner to read the accepted F2.1 and F2.2 state-machine/API contracts, establish
which challenge source the input represents, and compare the actual diff and changed
assertion with the intended outcome. F2.1's policy unavailable path and F2.2's block-match
unavailable path differ. Reuse of a shared adapter does not authorize one shared policy.

Preserve the failing input/output and original assertions. Request the contract-consistent
bounded repair or return an actual unresolved decision to its owner. Do not weaken a
fixture/test to fit the implementation. Recheck both paths on the resulting candidate.
Carry the same distinction into Learn; “all unavailable challenges hold” is unsafe advice.

## Case 3 Interrupted producer/consumer work

Constructed input: the shared-contract producer is done and already merged; a dependent
consumer has a partial commit and an uncommitted test edit; the original controller is
gone. Inspect tracked processes, locks, actual worktree and refs. Preserve the partial
commit, binary patch, task JSON, logs and target before choosing Recover.

`speed recover --feature adaptive-auth` can kill tracked agents, break locks, reset running
state and remove worktrees. Use it only after establishing that the original run is dead
and preserving valuable work. Keep the completed producer. Do not reset the whole plan.
A live controller remains under its operator's control even when the class changes to a
recorded checkpoint for timing.

## Supported commands and stopping conditions

```sh
speed retry --feature adaptive-auth --task-id ACTUAL_ID \
  --context "Evidence, permitted correction, retained valid work and discriminating next check."
speed status --feature adaptive-auth
# A subsequent Run executes pending work after its actual state is inspected.
```

`--reset-branch` is destructive and requires a deliberate decision about inspected contents.
An ancestor branch can be audited as integrated, including a branch with no useful code;
verify actual implementation. An unsupported `integrate --continue` suggestion is not a
valid command in this parser. Distinguish a Git merge in progress, a completed partial
integration and a failed target check before choosing a supported recovery route.

For an integration failure, keep the candidate blocked for the affected scope and preserve
each individual report even if feature state says completed. For unsafe learned advice,
retain observation/entry IDs and before/after memory, stop future agent use of that state,
and request an accountable correction. A human review note alone does not change memory.
