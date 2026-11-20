# Adaptive authorization: what the run leaves open

Facilitator reference for 301.2E. **Ours, not the learner's.** Learners never see this
file, and nothing in the snapshot points to it.

The 301.2E snapshot carries the reviewed 301.1E plan with its owner questions still open,
and the recorded run adds stops of its own. None of them is planted. Each is something an
engineer supervising this run has to notice, attribute and send to the right owner.

## How to read the table

- **Where** is the file, task or log a learner would point to.
- **Owner** is the function that has to decide. Engineers give input; they do not decide.
- **Found by** says what surfaces it: `verify` (the 301.1E Verify log), `run`, `review`,
  `learn`, or `engineer` when only a person reading across records will notice.

## Owner questions the plan carries

| # | Where | Gap | Owner | Found by |
|---|---|---|---|---|
| O1 | Tech specs, Unresolved Questions | F2.1 risk thresholds and acceptable fraud rate. Blocks: Cutover; the draft describes a shadow-mode path | Risk | engineer |
| O2 | Tech specs, Unresolved Questions | Held copy and cardholder reason wording. Blocks: Relevant cutover behavior | CX and Legal | engineer |
| O3 | Tech specs, Unresolved Questions | Merchant learning of an analyst approval or decline. Blocks: Review-queue cutover; independent build work can continue | Product, merchant experience and Legal | engineer |
| O4 | Tech specs, Unresolved Questions | F2.2 block length and scope. Blocks: Enabling blocking | Product and Risk | engineer |
| O5 | Tech specs, Unresolved Questions | Merchant notification design. Blocks: Notifications | Design | engineer |
| O6 | Tech specs, Unresolved Questions | Recording attempts that match an active block. Blocks: Follow-up notification and timeline coverage | Risk, Product and platform engineering | engineer |
| O7 | Tech specs, Unresolved Questions | Shadow-mode length: one week (F2.2) or two (architecture)? (Q006). Blocks: Enabling blocking | Architecture | engineer |
| O8 | Verify log | Verify critical: closing the challenge sheet must cancel the payment. Blocks: Checkout cutover | F2.1 PM, checkout repository | verify |
| O9 | Verify log | Verify critical: a card-testing decline cannot be traced to one purchase. Blocks: Cardholder explanations | F2.1 and F2.2 PMs | verify |

The full list, with owners, is in `.speed/authoring/adaptive-auth/questions.md` in the
snapshot. These are the ones that shape the run. None is approved.

An implementation agent can expose these questions and explain consequences. It cannot
approve the policy. If an admitted task requires an unanswered decision, keep that scope
blocked and return the question to its owner.

## What the recorded run surfaces

| # | Where | Gap | Owner | Found by |
|---|---|---|---|---|
| R1 | Task 4, round 2 | May a status check after the ten-minute deadline settle the challenge, when polling must have no side effects? The agent stops as blocked | F2.1 owner | run |
| R2 | Tasks 9 and 10 | Removing the old rule and gating rollout need dated production sign-offs that cannot exist here | Risk, PM and Legal | run |
| R3 | Every built task | Review asked for changes on all eight tasks in round 1 and on the five reworked tasks in round 2; 28 major and 2 minor findings stay open, so nothing is integrated | Engineering | review |
| R4 | `main` during Run | Run merges each passing task into `main` before Review sees it, so the target moves before Integrate | Engineering | engineer |
| R5 | Task records and the context bridge | Tasks declare `files_touched`; the bridge reads `files_to_modify`, so every agent gets the three top-weight learnings instead of scoped ones | SPEED maintainers | learn |
| R6 | `inspect-handoff.py` | Verify did not pass and task 10 declares no files; the handoff admits tasks 1 to 8 with both Verify criticals open | F2.1 and F2.2 PMs | verify |
