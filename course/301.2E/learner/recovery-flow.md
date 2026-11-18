# 301.2E recovery: deal with a stopped task

Use 15 minutes on one stopped task. Keep the reviewed specs and the plan as they are.
Save the evidence before you change anything. This guide does not let you make product
decisions or reset someone's repository.

## The recovery decision

| Step | Look at | Decide |
| --- | --- | --- |
| Save | The command, raw output, task JSON, branch, worktree and baseline | Copy the failed attempt and any useful commits or changes |
| Locate | Did it stop before the agent started, while it worked, at a gate or at a merge? | Separate what you saw from what you suspect |
| Attribute | Environment, code, a dependency, a shared contract, or an owner's open question | Pick one supported cause and who corrects it |
| Bound | The accepted spec, the files involved, dependencies and earlier good work | Say what may change and what must not |
| Act | The task's state and its branch | Retry with guidance, or hand the question to its owner |
| Compare | The next attempt, against the same requirement | Keep both attempts and what is still open |

## Case 1 The agent wrote nothing

In an earlier attempt of the recorded run, tasks 1, 2 and 6 failed within two minutes:

```text
✗ Empty diff — agent produced no code changes
✗ Missing declared files: src/risk/reasons.ts,src/risk/scoring.ts,src/risk/policy.ts,…
```

The task log showed why. The agent's own global instructions told it to ask for approval
before changing code, so it asked and stopped. Nothing was wrong with the task or the code.
This is an environment cause. Fix the agent's setup through whoever owns it, then retry.
Do not change the task or the spec to get past it.

A later attempt stopped differently: the agent finished the code but could not commit,
because its sandbox blocked writes to the repository's `.git` folder. The work existed only
in the worktree. Again an environment cause: save the worktree before anything removes it.

## Case 2 A spec question (task 4)

Task 4 builds the step-up challenge lifecycle. In round 2 it stopped as blocked:

> May a synchronous status poll process an already-due deadline? A poll arriving after ten
> minutes but before the timer callback sees pending. Returning the final result
> immediately means settling during the poll, which conflicts with the requirement that
> polling have no side effects.

The agent is right that the specs do not say. Retrying will not answer it. Find the two
requirements that pull against each other in the F2.1 tech spec, write the question with
both quotes, and send it to the F2.1 owner. Tasks 5 and 8 depend on task 4, so record
that they wait too.

## Case 3 Work that needs a sign-off (tasks 9 and 10)

Task 9 removes the old cross-border rule only after every merchant has moved to the new
scoring. Task 10 checks the production rollout gates. Both stopped as blocked: there are
no dated sign-offs or production flag changes to check. That is the correct result. Leave
both blocked, and name Risk, PM and Legal as the owners in the handoff.

## Case 4 Teaching case: two challenge paths that look alike

This one is constructed for discussion; it did not happen in the recorded run. A
block-match challenge uses the F2.1 fallback when the bank cannot answer. The payment is
held, and a test was changed to expect that.

Read the F2.1 and F2.2 tech specs. F2.1's "provider unavailable" path and F2.2's
block-match path have different outcomes. Sharing an adapter does not mean sharing a
policy. Keep the original test, ask for a repair that matches each contract, or send the
question to its owner. Do not weaken a test to fit the code.

## Commands

```sh
speed retry --feature adaptive-auth --task-id ACTUAL_ID \
  --context "What failed, the evidence, what may change, what must stay the same."
speed status --feature adaptive-auth
# The next speed run picks up the task.
```

`speed retry` only accepts a task that failed or is blocked. A task that Review sent back
is already pending; the next Run reworks it using its `review_feedback`.

`speed recover --feature adaptive-auth` stops tracked agents, clears locks, resets running
state and removes worktrees. Use it only when the original run is dead and its work is
saved. Keep completed work. Do not reset the whole plan.

`speed retry --reset-branch` deletes the task's branch. Read the branch first.
`speed integrate --continue` does not exist.

If Integrate fails, keep the candidate blocked for the affected tasks and keep each report.
A feature that an earlier Integrate marked complete stays complete when a rerun fails, so
do not read that state as a pass.
