# Facilitator notes

Facilitator only. Not present at the `301.1-learner-start` checkpoint.

## Open questions in the inputs

Nothing is hidden in the upstream specs. Every open decision is written down with its
owner. The skill being taught is keeping them open: a technical spec that answers one of
these by assumption has overstepped.

| # | Open question | Where | Expected response |
|---|---------------|-------|-------------------|
| OQ1 | Who decides exemptions from RP1 for genuine high-volume sales | PRD | Keeps RP1 as written, carries OQ1 with its owner, adds no exemption list |
| OQ3 | How much a reason category may reveal | PRD, design spec Open Questions, threat model T5 | Uses no category that reveals a limit, and carries OQ3 with its owner |
| OQ4 | Whether a challenge holds the original authorisation open | PRD, design spec Open Questions | Picks a flow only as a stated, reversible assumption, and carries OQ4 with its owner |

PRD OQ2, behaviour when the check fails, is decided in the compliance spec: fail closed.

## Found in the repository

Not written in the inputs. Reading `src/` reveals them.

| # | Finding | Where | Why it matters |
|---|---------|-------|----------------|
| R1 | The vault issues a new token on every `tokenise()` call | `src/vault.ts` | The token cannot recognise the same card, so RP2 and RP3 cannot use it. The compliance spec requires a keyed hash inside the vault |
| R2 | `tokenise()` runs before any check | `authorise()` in `src/payments/service.ts` | Every testing attempt adds a vault entry. That is threat T6 |
| R3 | The idempotency lookup runs first | `authorise()` | Retries already return early, which suits RP1 and RP2. The check must sit after it |
| R4 | The request has no card country or verification result | `AuthoriseRequest` | Needed by RP3 and ST14 |
| R5 | Time comes from `Date.now()` | `service.ts`, `ledger.ts` | Rolling windows and reproducible decisions need a time source tests can control |
| R6 | `Payment.status` has no state for challenge or decline | `service.ts` | The spec must decide whether a non-approved attempt is stored at all |
| R7 | `authorise()` takes no caller context | `service.ts` | Merchant identity must come from a caller context (T1). The signature changes, and so does every caller, including three Workbench commands |

## Teaching defects in the example tech spec

The example tech spec at `301.1-audit-start` stands in for `speed define` output. It handles
R1 to R7 well, and every other part is intended to be sound. These three defects are
deliberate and are the only deliberate ones. Report anything else as a genuine defect.

| # | Defect | Where in the tech spec | What it violates |
|---|--------|------------------------|------------------|
| M1 | Approves when the risk check fails | Key Decisions | The compliance spec's fail-closed rule |
| M2 | Uses the design spec's reason categories as settled, including the two that reveal a limit, and does not carry OQ3 | Data Model, Validation Rules, Unresolved Questions | PRD OQ3 and threat T5 |
| M3 | Follows the new-authorisation flow without recording that OQ4 is open | State Machine, Unresolved Questions | PRD OQ4 |

The corrected tech spec at `301.1-plan-start` fixes all three: it fails closed, returns only
`verify_cardholder` and `not_approved`, and carries OQ1, OQ3 and OQ4 with their owners.

## Timeboxes and expected observations

| Part | Time | Participants should observe |
|------|------|-----------------------------|
| Opening | 10 min | Five inputs from four teams, none of them engineering. Three questions are still open, and OQ2 is decided |
| 1 · Define | 30 min | The tech spec traces to its inputs and handles the code findings, but approves on failure (M1) and treats OQ3 and OQ4 as settled (M2, M3). The strongest groups also find R1 in the code themselves |
| 2 · Audit | 25 min | The audit reports structure and sizing. It does not report M1, M2 or M3, because it reads only the product spec and the vision, not compliance, the threat model or the design spec's open questions. Participants correct the tech spec themselves |
| 3 · Plan | 35 min | The planner includes compliance, architecture and the threat model through related-spec scoring. In the dry run, planning the flawed spec carried M1 into a task as an instruction. Planning the corrected spec is still to be confirmed in the full dry run |
| Close | 10 min | A passing check covers only what it read. Open questions stay with their owners |

## Facilitation notes

- M1 is the clearest: the rule is written, and the spec contradicts it.
- M2 and M3 test whether participants notice an answered question that was never theirs.
- R1 is the most instructive code finding: it appears only to those who read the code, and
  it brings the compliance spec, the architecture spec and an existing invariant into one
  decision.
- Credit routing a question to its owner. Do not credit a confident answer an agent
  invented.

## Pre-running the plan for Part 3

1. Load the corrected tech spec: `git checkout 301.1-plan-start -- specs/tech/authorisation-risk.md`.
2. Run `export CLAUDE_BIN="$PWD/bin/claude-no-mcp"`.
3. Delete `.speed/features/authorisation-risk/cache/architect*` if any earlier plan run failed.
4. Run `speed plan specs/tech/authorisation-risk.md --specs-dir specs --force`.
5. Check the log shows a task count above zero for every phase before relying on it.
