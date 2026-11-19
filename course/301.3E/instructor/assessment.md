# 301.3E independent assessment

Each learner is scored on their own work in the lab, plus one short unfamiliar packet. The
packets are constructed teaching cases, not records from the run. Release one per learner and
keep the keys in this file.

## Practical submission

From the lab, each learner submits:

1. The disposition list: every item, its evidence, its disposition and its owner.
2. Their defect reports.
3. The escalation note.
4. The repair evidence: each defect's check before and after, and the suite result.

## Packet A A green suite and a claim

A task's closing message says: "All acceptance criteria are met; `test/limits.test.ts` covers
every limit." The test checks limits of 100 and 10,000. The spec lists limits of 100, 1,000
and 10,000.

Write your disposition, the evidence, and the check that would settle it.

**Key:** Refute the claim in part. 1,000 is never tested, so a change to that limit would pass.
Confirm a weak-test defect and name the missing case.

## Packet B A tidy-looking store

A review queue keeps a copy of each held request "so the console can show it". The request
holds the full card number. Tests and review are green.

Write your disposition, the requirement involved, and the owner.

**Key:** Confirm. Card numbers must stay in the vault (TR9). Engineering owns the repair: store
nothing beyond the masked card.

## Packet C A fix that changes policy

A repair task for a false decline also lowers the block ceiling "to reduce false challenges".

Write your disposition for that change.

**Key:** Escalate the ceiling change to its owners (PM with Risk). Keep the repair to the
defect's scope.

## Scoring rubric

| Dimension | Maximum |
| --- | ---: |
| Evidence checked by the learner, not taken from a tool | 25 |
| Correct dispositions (confirm, refute, escalate) | 25 |
| Defect reports with a check that fails now and passes after | 20 |
| Escalation names owners, stories and the blocked phase | 15 |
| Repair keeps every assertion and passes its own checks | 15 |
| Total | 100 |

## Critical errors

Weakening or deleting a test to make a repair pass, or choosing a block policy for G5, caps the
score at 50 until the learner corrects it.
