# 301.3E Diagnose, Judge, Repair

A 120-minute engineering course that ends the pathway. Engineers take the adaptive
authorization candidate from 301.2E, which every check calls done, and establish what is
actually true about it.

**Governing question:** Which claims about this change are true, which defects are ours to
fix, and which decisions belong to someone else?

## One fixture across the pathway

| Course | Input | Output |
| --- | --- | --- |
| 301.1E Define, Audit, Plan | Upstream documents, code, two draft tech specs | Reviewed specs, owner questions, a verified plan |
| 301.2E Execute, Integrate, Learn | That plan | An integrated candidate with its evidence and learning |
| 301.3E Diagnose, Judge, Repair | That candidate | A disposition for every finding, a bounded repair and an escalation |

## Audience and entry

Experienced engineers who can read a diff, a test and a spec. Prerequisite: 301.1E and 301.2E
capability. Each learner clones the 301.3E snapshot. No homework or extra installation.

## The 120-minute progression

| Stage | Minutes | Learner responsibility | Retained output |
| --- | ---: | --- | --- |
| 1 Inspect | 10 | Read the candidate and its claims without changing anything | The claims to test, word for word |
| 2 Diagnose | 15 | Read failure-class signals and their evidence | Three signals worth checking, and why |
| 3 Review | 15 | Get a clean-context opinion and compare it with the stored approval | One finding confirmed or refuted from the code |
| 4 Eval | 15 | Test a claim against the tests it cites | A verdict on the closing claim |
| 5 Human judgment | 15 | Give every item a disposition: confirm, refute or escalate | The disposition list with evidence and owners |
| 6 Define | 15 | Write a defect report per confirmed defect, and the escalation note | Defect reports and one escalation |
| 7 Plan and Verify | 15 | Plan the repair from the reports and verify it | A verified repair plan |
| 8 Run and Inspect | 15 | Run the repair and check each defect's own test | The repaired candidate and its evidence |
| Close | 5 | Name one green check at home that proves nothing | |
| Total | 120 | | |

## Outcomes

| Capability | Evidence |
| --- | --- |
| Read a tool's output for what it can and cannot see | Explains a diagnose zero and a review approval correctly |
| Test a claim against what it cites | Refutes the closing claim in task 1's log with the test lines |
| Separate defects from decisions | Confirms G1 to G3, escalates G5 without choosing a policy |
| Specify a repair others can check | Each defect report names a check that fails now and passes after |
| Repair without weakening evidence | The repair adds or restores tests; none is removed |

## Completion and resources

Submit the disposition list, the defect reports, the escalation note and the repair evidence.
The assessment packet is handed out at the close and completed after class.
A precise escalation meets the objective for G5; a chosen block policy does not.

| Resource | Use |
| --- | --- |
| [Speaker script](speaker-script.md) | Timed say/do sequence |
| [Lab guide](../learner/lab-action-guide.md) | Learner commands and checklists |
| [Facilitator gap map](facilitator-gap-map.md) | Answer key |
| [Facilitator guide](facilitator-guide.md) | Stage keys and interventions |
| [Assessment](assessment.md) | Packets and rubric |
| [Trainer brief](trainer-brief.md) | Preparation and timing |
| [Rehearsal](rehearsal.md) | What has been run |
