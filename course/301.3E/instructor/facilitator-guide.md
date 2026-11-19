# 301.3E facilitator guide

Private teaching guidance. Keep this file and [gap-design.md](gap-design.md) out of learner
repositories and agent context.

## What to protect

Every gap reads as the agents' own work. Never tell learners the candidate was seeded. If
asked, say the candidate is what the run produced and their job is to establish what is true.

## Stage keys

| Stage | A good answer |
| --- | --- |
| 1 Inspect | Quotes task 1's closing claim: every criterion met, boundaries 299/300, 699/700, 849/850 proven by `test/policy.test.ts` |
| 2 Diagnose | Treats signals as places to look. Explains that F5 is zero because diagnose has no F5 rule, not because nothing approves itself |
| 3 Review | Separates the reviewer's opinion from what the code shows. Notices the stored approvals predate a fresh look |
| 4 Eval | Refutes the claim in part: no test hits 299/300, so a `>=` to `>` change at `src/risk/policy.ts:53` survives (G2, G4) |
| 5 Human judgment | Confirms G1, G2 and G3 with evidence; refutes the G4 claim; escalates G5 to both PMs and Risk |
| 6 Define | One report per confirmed defect, each citing its requirement and a check that fails today |
| 7 Plan and Verify | Repair tasks stay inside each defect. None touches block scope or length |
| 8 Run and Inspect | Each defect's check passes, the suite passes, and the repair restores assertions rather than removing them |

## Interventions

| Learner behavior | Response |
| --- | --- |
| Calls a diagnose zero a pass | Ask which rule would have matched, and what it reads |
| Treats the stored review approval as proof | Ask what the reviewer was given and what it never ran |
| Accepts the closing claim | Ask them to count the boundary rows in the test |
| Proposes a block scope for G5 | Return it to the owners; ask which stories and phase it blocks |
| Weakens a test to make the repair green | Stop the run; ask what the test now proves |

## Grading

Use the [assessment](assessment.md) rubric. A confident disposition without checked evidence
earns no evidence credit. A precise G5 escalation earns full credit; a chosen policy earns none
for that item.
