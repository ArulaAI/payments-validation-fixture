# 301.3E speaker script

Say and do, stage by stage. Timings match the [framework](framework.md).

## Presenter setup

Before learners arrive, clone the snapshot once, run the branch line from the README, and
check `npm test` (239 pass) and `MAIN_BRANCH=baseline speed diagnose --feature adaptive-auth
--task 2` (signals, not zeros). Keep [facilitator-gap-map.md](facilitator-gap-map.md) on your
own screen only.

### Opening

#### Say

> Everything about this change says it is finished. Tests are green, review approved every
> task, integration passed and the feature is marked complete. Today we find out what is true.
> Some of what you find is yours to fix. One thing is not, and the job there is to say so
> clearly.

## 1 Inspect: 10 minutes

### Do

Show `speed status` and the first-parent history of `main`. Open `logs/integration.log`, then
the end of `logs/1.log`.

### Ask

> What does task 1 claim, exactly? Write it down. We will test it in stage 4.

### Checkpoint

Every learner has the closing claim word for word.

## 2 Diagnose: 15 minutes

### Say

> Diagnose reads the diff and counts patterns. It runs no tests and asks no model. A signal
> means look here. A zero means nothing matched.

### Do

Run `speed diagnose --feature adaptive-auth --task 2` with `MAIN_BRANCH=baseline`. Open
`risk-surface.yaml` and follow one signal to its line.

### Ask

> F5 is zero on every task. Does that mean nothing here approves itself?

The answer is no: diagnose has no F5 rule. Hold that thought until stage 4.

## 3 Review: 15 minutes

### Say

> The reviewer starts clean. It sees the diff and the declared files. Its verdict is an
> opinion, and opinions disagree.

### Do

Run `speed review --feature adaptive-auth --task 3`. Put the new review beside the stored
approval in `tasks/3.json`.

### Ask

> Which finding can you check against the code yourself, right now?

## 4 Eval: 15 minutes

### Say

> A passing test proves what it asserts, no more. Let's test the claim from stage 1 against
> the tests it cites.

### Do

Open `test/policy.test.ts` beside the F2.1 Test Plan. Count the boundaries. Ask Claude Code
which tests would fail if `>=` became `>` on the step-up threshold.

### Checkpoint

Learners can say the claim is partly true: 699/700 and 849/850 are tested, 299/300 is not.

## 5 Human judgment: 15 minutes

### Say

> Confirm, refute or escalate. Each item, one disposition, with evidence you checked. The
> tools have had their turn.

### Do

Walk one item of each kind on screen. For escalation, use the BIN-wide block and the
traveller's card. Name the owners and the phase it blocks. Do not role-play the owners.

### Prompts if the room stalls

- Where does the pending request go after a hold?
- What is a payment's status after a partial capture, and what does F1 say?

## 6 Define: 15 minutes

### Do

Scaffold one report with `speed new defect`. Fill in the requirement, the reproduction and
the check that proves the fix. Write the escalation as a note, not a defect.

## 7 Plan and Verify: 15 minutes

### Do

Run `speed plan --defects … --feature adaptive-auth-repair`, then `speed verify`. Read one
repair task's scope against its report.

### Ask

> Does any repair task touch the block policy? If so, it is out of scope.

## 8 Run and Inspect: 15 minutes

### Do

Run the repair. Run each defect's own check, then the suite. Look for removed or loosened
assertions in the repair's diff.

## Close: 5 minutes

### Say

> Which green check in your own project would still pass if the code were wrong?

### Do

Release one assessment packet per learner; they complete it after class.
