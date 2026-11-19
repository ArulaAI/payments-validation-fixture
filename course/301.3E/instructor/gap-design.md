# 301.3E gap design

Facilitator reference for 301.3E. **Ours, not the learner's.** It stays in `instructor/`
and out of every snapshot.

This is the answer key for the 301.3E snapshot (`snapshot/fixture.bundle`, HEAD `546f504`).
Files and lines below are fixed against that candidate.

## How the gaps get there

The candidate comes from a real agent run, so it will have gaps of its own. The rule:

1. Read the candidate first. Where it already has a gap of one of the five kinds below,
   use that one and record it here.
2. Add only the kinds it lacks, in one commit on top of the candidate, written the way
   the agent writes: same style, same task branch, same commit message shape.
3. Every gap must trace to something the F2 documents ask for or leave open. Nothing is
   there only to be found.

## The gaps

| # | Kind | Class | Where it is | What learners find | Where it comes from | Right action | Owner |
|---|---|---|---|---|---|---|---|
| G1 | Unrequested sensitive edit | F2 | Added on the task 3 and task 5 branches. `src/review/queue.ts:159` and `:215`; `src/payments/gateway.ts:249` | The queue keeps each held attempt "for the analyst console". The attempt is the whole gateway request, so a stored record holds the card number outside the vault | TR9: no stored record holds a card number outside the vault. F2.1 ReviewItem stores only the masked card | Confirm. Store nothing beyond the ReviewItem | Engineering |
| G2 | Weak test | F3 | Added on the task 1 branch. `test/policy.test.ts:12` and `:26` | The policy tests no longer hit the step-up threshold. A mutant turning `>=` into `>` at `src/risk/policy.ts:53` survives all 239 tests | RFC 1 Test Plan asks for 299/300, 699/700 and 849/850 | Confirm. Add the 299/300 cases | Engineering |
| G3 | Silent regression | F7 | Added on the task 2 branch (review-queue test on task 3). `src/payments/service.ts:148`; tests loosened at `test/service.test.ts:262`, `test/service-operations.test.ts:182`, `test/review-queue.test.ts:67` | A partial capture now leaves an ordinary payment `authorised` instead of `captured`. A partially captured payment can then be held for review. All 239 tests pass | Plan task 2 amends capture for held payments, so it edits code every payment uses. F1 says a captured payment is `captured` | Confirm. Restore the status change and the three test assertions | Engineering |
| G4 | Self-approving summary | F5 | Added in the task record. `.speed/features/adaptive-auth/logs/1.log:398` | Task 1's completion message says every criterion is met and that `test/policy.test.ts` proves 299/300, 699/700 and 849/850. G2 shows 299/300 is not tested | The candidate's own task record | Refute the claim. Keep the message in the evidence | Engineering |
| G5 | Question no check can settle | F8, reserved | Found in the run. `src/risk/blocks.ts:42` | A block matches every amount up to the ceiling on a whole BIN. The attack's BIN is the traveller's (`411111`), so the traveller's own small payments are challenged while a block is active. Every check is green | 301.1E question Q008: block scope and thresholds are for the F2.2 PM with Risk, and F2.1's PM must accept the effect on travelers | Escalate to both PMs and Risk. Do not choose a policy | PM (F2.1), PM (F2.2), Risk |

G2 and G4 meet: the completion message cites the weakened test. Learners who check the
claim against the test find both.

G5 must stay open in class. The engineer names the conflict, the stories it touches and
the owners, and the phase it blocks (enabling block mode). Nobody role-plays the owners.

The candidate also carries the run's own open findings: Review's last verdicts before
approval, task 4's deadline question (settled by the F2.1 owner), and tasks 9 and 10
blocked on production sign-offs.

## Decisions

1. **Checks.** Every check comes from SPEED. Nothing in the fixture runs its own. Which
   SPEED step surfaces each gap is settled once the candidate exists.
2. **Answer key.** This file, once fixed against the candidate. It never goes in a
   snapshot. The trainer releases it when learners compare their findings.

## Lab shape

The lab action guide keeps the eight steps of the earlier refund-retry version: Inspect,
Diagnose, Review, Eval, Human judgment, Define, Plan and Verify, Run and Inspect. Its
interactions are written with the course owner once the snapshot exists. G1 to G4 move
through Define, Plan and Verify to a bounded repair (`speed defect`, `speed plan
--defects`). G5 leaves as an escalation.
