# 301.3E trainer brief

Teach **Diagnose, Judge, Repair** in 120 minutes. Learners validate the integrated 301.2E
candidate, repair the defects that are theirs, and escalate the one decision that is not.

## Pickup order

| Resource | Use |
| --- | --- |
| [Framework](diagnose-judge-repair.md) | Eight timed stages and the completion standard |
| [Speaker script](speaker-script.md) | What to say and do, with prompts and checkpoints |
| [Lab guide](../learner/lab-action-guide.md) | The learners' commands and checklists |
| [Gap design](gap-design.md) | The answer key: every gap, its file and line, and the right action |
| [Facilitator guide](facilitator-guide.md) | Stage keys, interventions and grading |
| [Assessment](assessment.md) | Individual packets and rubric |
| [Rehearsal](rehearsal.md) | What has and has not been run |
| [Overview PDF](../overview.pdf) | One page per section |

## What learners start from

The snapshot, `snapshot/fixture.bundle`, holds the integrated candidate: tasks 1 to 8 built,
reviewed and merged, 239 tests passing, the feature marked complete. Everything says it is
done. It carries five gaps, all written as the agents' own work:

- G1 the review queue stores the held request, card number included;
- G2 the policy tests skip the step-up boundary;
- G3 a partial capture leaves an ordinary payment `authorised`;
- G4 task 1's closing message claims the boundaries are tested;
- G5 a block on a BIN also challenges the traveller's own small payments.

G1 to G4 are confirm-and-repair. G5 is escalate-only: nobody in the room decides it.

## Before class

1. Give each learner or pair a lab folder with the snapshot cloned in it and the branch line
   from the README run. Keep `gap-design.md` out of every learner folder.
2. Check each machine has Bash 3.2 or later, Node 22 or later, Python 3.11 or later, Git, jq
   and Claude Code signed in.
3. Check `command -v speed` points at the SPEED checkout at `a8bde62`.
4. In one clone, run `npm test` (239 pass) and, with `MAIN_BRANCH=baseline`,
   `speed diagnose --feature adaptive-auth --task 2`. It should report signals, not zeros.

## Timing

Slots are 10 / 15 / 15 / 15 / 15 / 15 / 15 / 15 minutes plus a 5-minute close. Review, Eval,
Plan, Verify and Run call models and their waits are inside the slots. They have not been
timed with Claude yet; see [rehearsal.md](rehearsal.md).

## Boundaries

Learners repair only what their own disposition confirmed. They do not choose block policy,
weaken a test to make it pass, or close the G5 escalation. Keep the answer key away from
learner repositories and agent context.
