# 301.3E gap design

Facilitator reference for 301.3E. **Ours, not the learner's.** It stays in `instructor/`
and out of every snapshot.

Draft. It names the five gaps learners meet in the 301.2E candidate and where each one
comes from in the F2 documents. Exact files and lines are fixed against the real
candidate once 301.2E has been run, and this file then becomes the answer key.

## How the gaps get there

The candidate comes from a real agent run, so it will have gaps of its own. The rule:

1. Read the candidate first. Where it already has a gap of one of the five kinds below,
   use that one and record it here.
2. Add only the kinds it lacks, in one commit on top of the candidate, written the way
   the agent writes: same style, same task branch, same commit message shape.
3. Every gap must trace to something the F2 documents ask for or leave open. Nothing is
   there only to be found.

## The five gaps

| # | Kind | Class | What learners find | Where it comes from | Right action | Owner |
|---|---|---|---|---|---|---|
| G1 | Unrequested sensitive edit | F2 | A step-up log line written for diagnosis logs the whole challenge. The challenge holds the pending request, so the card number reaches the application log | RFC 1 asks only for `stepup.unknown_challenge` with the challenge id, and says the pending request holds the card number (Data Model, Challenge) | Confirm. Log the id, never the challenge | Engineering |
| G2 | Weak test | F3 | The decision policy test checks a score well above and well below `declineFrom`, never 849 and 850. A mutant that turns `>=` into `>` survives | RFC 1 Test Plan asks for boundaries at 299/300, 699/700, 849/850 | Confirm. Add the boundary cases | Engineering |
| G3 | Real defect | F7 | The capture-block change to `PaymentsService` also changes an ordinary payment's capture or refund. The suite stays green; the ledger for some corpus rows differs | Plan task 1 amends capture and void for held payments, so it edits code every payment uses | Confirm. Repair inside the task's scope | Engineering |
| G4 | Self-approving summary | F5 | The run's summary says every acceptance criterion is met and cites the policy test as proof of the boundaries. G2 shows it is not | The candidate's own task records and integration summary | Refute the claim. Keep the summary in the evidence | Engineering |
| G5 | Question no check can settle | F8, reserved | A card-testing block keyed on the attack's source also steps up a genuine traveller behind the same shared network. Every check is green | RFC 2 Unresolved Questions 1 and 2: block length and scope are for PM with Risk, and F2.1's PM has to agree blocks cannot catch travellers. Gap map C1, C5 | Escalate to both PMs and Risk. Do not choose a policy | PM (F2.1), PM (F2.2), Risk |

G2 and G4 are meant to meet: the summary cites the weak test. Learners who check the
claim against the test itself find both.

G5 must stay open in class. The engineer names the conflict, the stories it touches and
the owners, and the phase it blocks (cutover). Nobody role-plays the owners.

If the 301.1E run settles block scope and length instead of leaving them open, use RFC 2
question 6 (whether block-matched attempts are recorded) for G5.

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
