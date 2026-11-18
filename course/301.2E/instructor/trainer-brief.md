# 301.2E trainer brief

Teach **Execute, Integrate, Learn** in 120 minutes. Learners continue the 301.1E work on
adaptive authorisation: they supervise the run, recover a stopped task, decide what may be
integrated, and check what the run teaches future agents.

## Pickup order

| Resource | Use |
| --- | --- |
| [Framework](execute-integrate.md) | Seven timed stages and the completion standard |
| [Speaker script](speaker-script.md) | What to say and do, with prompts and checkpoints |
| [Workbook](../learner/learner-workbook.md) | The learners' commands and records |
| [Fixture continuity](adaptive-auth-lab.md) | The plan, its dependencies and the owners |
| [Learn](../learner/learn.md) | The required feedback-loop exercise |
| [Reference](../learner/speed-reference.md) | SPEED behaviour at `a8bde62` |
| [Recovery](../learner/recovery-flow.md) | The four recovery cases |
| [Assessment](assessment.md) | Individual packets and rubric |
| [Facilitator guide](facilitator-guide.md) | Keys, interventions and grading |
| [Rehearsal](rehearsal.md) | What the recorded run did and what is still unchecked |
| [Overview PDF](../overview.pdf) | One page per section |

## What learners start from

The snapshot, `snapshot/fixture.bundle`, holds the reviewed 301.1E work: both tech specs,
the decisions and owner questions, a 10-task plan, its contract and the verify log.
`learner/assets/handoff-301-1e.json` records the baseline commit and file digests.

Be ready for three things learners will notice in stage 1:

- Verify **failed**. Two critical issues remain, and both are owner questions. The handoff
  admits tasks 1 to 8 with those questions open. Make the learners decide whether that is
  acceptable, rather than deciding for them.
- Verify's repair added tasks 9 and 10, taking the plan above the 301.1E cap of 8.
- `inspect-handoff.py` reports exactly two errors: task 10 declares no files, and Verify
  did not pass. Both are true.

## Before class

1. Give each learner or pair a lab folder with the snapshot cloned in it, an empty evidence
   folder outside it, a copy of `learner/assets/`, and `instructor/checkpoint/after-run.bundle`.
2. Check each machine has Bash 3.2 or later, Node 22 or later, Python 3.11 or later
   (SPEED's start-up check needs it), Git, jq and Claude Code signed in.
3. Check `command -v speed` points at the SPEED checkout at `a8bde62`.
4. In one clone, run `npm test` (93 pass) and `speed status --feature adaptive-auth`
   (10 pending). Run `inspect-handoff.py` and confirm the two expected errors.
5. Clone the checkpoint once and run `npm test` (186 pass).

Learners need no homework and install nothing.

## Timing

The slots are 15 / 20 / 15 / 20 / 20 / 20 / 10 minutes, waits included. Use a visible
timer. Round 1 of Run took 33 minutes in the recorded run, so it will not finish inside
stage 2. At the end of stage 2, every learner moves to the checkpoint in a new folder.
Leave live runs alone; do not stop or reset them to fit the clock, and do not suggest they
produced the checkpoint.

## What the checkpoint holds

The run's end state after two rounds of Run and Review:

- Tasks 1 to 8 built and merged into `main`; 186 tests pass.
- Review asked for changes on every built task. Each task's `review_feedback` holds its
  latest findings, 28 major and 2 minor in all.
- Task 4 blocked on a spec question; tasks 9 and 10 blocked on production sign-offs.
- Coherence and Integrate reported "No completed tasks". Nothing was integrated.
- No learning memory yet. Learners run Learn themselves in stage 5.

[rehearsal.md](rehearsal.md) has the full record, including how the run was made.

## Learning and assessment boundaries

Single-player Learn writes memory that later agents read, with no approval screen.
Learners review it before and after. `--curate` belongs to multi-player mode; it is not an
approval command.

Release one unfamiliar packet per learner at assessment time. Keep the keys out of learner
repositories and agent context. The two-hour class does not show that a learner can run
every stage alone, and it does not authorise a production release. Calibrate timing and
scoring with a real cohort before making certification claims.
