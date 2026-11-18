# 301.2E Execute, Integrate, Learn

Engineers hand the reviewed 301.1E plan to agents, supervise the run, decide what may
reach the candidate, and check what the run teaches future agents. 120 minutes, live,
hands-on.

| Starts from | Hands on to 301.3E |
| --- | --- |
| The reviewed 301.1E work: spec changes, owner questions, 10 task records, contract, verify log | A candidate revision, every check result, the review findings, the blocked tasks and the learning records |

## Set up

You need Node 22 or later, Python 3.11 or later, jq, Claude Code, and the SPEED build all
three courses use, commit `a8bde62` (see [SPEED version](../README.md#speed-version)).

```sh
git clone course/301.2E/snapshot/fixture.bundle payments-validation-fixture
cd payments-validation-fixture
npm test                                   # 93 pass
speed status --feature adaptive-auth       # 10 tasks, all pending
```

`course/make-snapshot.sh 301.2E <repo>` rebuilds the bundle from a repository that has
run 301.1E.

## What the starting state holds

Three commits: the 301.1E start state, the reviewed tech specs, and the plan with its
Verify result.

- `specs/tech/adaptive-auth/`: both tech specs as reviewed in 301.1E. Topic 1 (trusting the
  bank's answer) was decided by the engineer. Topics 2 to 8 took the recommended option.
- `.speed/authoring/adaptive-auth/`: the decisions, the owner questions and who owns each.
- `.speed/features/adaptive-auth/`: 10 tasks, the contract, the cross-cutting rules and
  `logs/plan-verification.log`.
- Verify **failed**. It covered 8 of 14 requirements on its first pass. After three repair
  passes, two critical issues remain, both owner questions:
  1. Closing the bank's challenge sheet must cancel the payment. That lives in the
     checkout repository.
  2. A card-testing decline cannot be traced to one purchase when a cardholder asks.
- Verify's repair added tasks 9 and 10. Task 9 removes the old cross-border rule after
  every merchant has moved over. Task 10 gates the production rollout. The plan is now
  above the course cap of 8 tasks.
- [`learner/assets/handoff-301-1e.json`](learner/assets/handoff-301-1e.json) records the
  baseline, file digests, scope and blockers.

## What a run produces

The course was run once from this snapshot. Its end state is
[`instructor/checkpoint/after-run.bundle`](instructor/checkpoint/after-run.bundle). Use it
when a live run overruns its slot.

- Round 1 built tasks 1 to 8 in 33 minutes and merged each one into `main` as it passed.
  Tasks 9 and 10 stopped: both need production sign-offs that cannot exist here.
- Review asked for changes on all 8 tasks.
- Round 2 reworked tasks 1, 2, 3, 6 and 7. Task 4 stopped on a real spec question: may a
  status check after the ten-minute deadline settle the challenge itself? Review again
  asked for changes on all five. Each task's latest review lists its open findings: 28
  major and 2 minor in all.
- Coherence and Integrate found no approved tasks, so nothing was integrated.
- `main` holds the built work and passes 186 tests. Learn kept 42 learnings from 158
  observations.

[`instructor/rehearsal.md`](instructor/rehearsal.md) has the full record.

## For learners

Open [`learner/learner-workbook.md`](learner/learner-workbook.md). The Learn and recovery
stages have their own guides in [`learner/`](learner/). The record templates are in
[`learner/assets/templates/`](learner/assets/templates/).

## For instructors

Read [`instructor/trainer-brief.md`](instructor/trainer-brief.md) first, then
[`instructor/speaker-script.md`](instructor/speaker-script.md) and
[`instructor/facilitator-guide.md`](instructor/facilitator-guide.md). The transfer packets
are in [`instructor/assessment.md`](instructor/assessment.md); release one per engineer.
[`overview.pdf`](overview.pdf) is the one-page-per-section course overview.
