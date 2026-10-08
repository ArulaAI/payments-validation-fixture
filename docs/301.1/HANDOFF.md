# 301.1 Review Handoff

## Purpose

This branch carries the attendee material for 301.1 together with the material needed to
review it: an example technical specification, facilitator notes and output from SPEED
dry runs.

## Checkpoints

The branch history is built so that each lab starting point is a tagged commit. Attendees
start from a tag, never from the branch head, which carries the review material.

| Tag | Contains | Used for |
|-----|----------|----------|
| `301.1-learner-start` | Baseline code, upstream specifications, guide and launcher | Attendee start |
| `301.1-audit-start` | Adds the example technical specification, with its three deliberate defects | Part 1 fallback and Part 2 start |
| `301.1-plan-start` | Replaces it with the corrected technical specification | Part 3 start |
| `lab-301.1` (branch head) | Adds this review material | Review only |

Before attendee release, the course should be published from a history that does not
contain the review material.

## Course Summary

- **Audience:** 35 senior engineers and software architects.
- **Duration:** 2 hours.
- **Flow:** upstream specifications → `speed define` → technical specification →
  `speed audit` → `speed plan` and `speed verify`. `speed run` is an optional extension
  after the session.
- **Central principle:** engineers receive specifications from product, design,
  architecture and compliance, and own none of them. Engineering owns the technical
  quality of the feature and the integrity of the technical specification that describes
  it.
- **Business problem:** genuine customers are declined on high-value, infrequent purchases
  abroad, while fraudsters use GenAI to test stolen card numbers across online merchants.
- **Workbench:** unchanged by this work. The Workbench team is extending `speed define` to
  accept the upstream specifications and produce the technical specification.

## Review Scope

| File | Contents | Review focus |
|------|----------|--------------|
| `LAB_ACTION_GUIDE.md` | Attendee guide, in the established Lab Action Guide format | Flow, timing, and a genuine decision point in each part |
| `specs/README.md` | Map of the F2 inputs and their owners | Clarity of the ownership principle |
| `specs/product/overview.md` | Product vision, read by audit and by the plan Guardian | Accuracy and brevity |
| `specs/product/authorisation-risk.md` | Product input | Realism, and the right questions left open |
| `specs/design/authorisation-risk.md` | Design input, in the SPEED design template with UI sections marked N/A | Substance rather than template sections |
| `specs/architecture/authorisation-risk.md` | Architecture input, including bounded contexts and domain language | Clear boundaries without prescribing the design |
| `specs/architecture/authorisation-risk-threat-model.md` | Threats, required controls and how each is checked | Every control is verifiable |
| `specs/compliance/authorisation-risk.md` | Risk policy values, card data rules and regulatory position | Accuracy of the regulatory position |
| `specs/tech/authorisation-risk.md` | **Example technical specification.** The flawed version is at `301.1-audit-start`; the corrected version is at `301.1-plan-start` and the branch head | Quality as a model specification. The flawed version should differ only by defects M1 to M3 |
| `docs/301.1/facilitator-notes.md` | Open questions, findings the code reveals, the three deliberate defects, timeboxes and expected observations | Expected observations are realistic within each timebox |
| `docs/301.1/speed-define-contract.md` | Inputs and required output for `speed define` | Alignment with the Workbench team's implementation |
| `bin/claude-no-mcp` | Launches SPEED agents without personal MCP servers | See finding 4 |
| `docs/301.1/runs/` | `speed audit` output on the example specification | Evidence behind the guide's expectations |

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Extend the existing payments fixture rather than build a new codebase | `authorise()` is the natural home for the feature, and the existing invariants, idempotency and token vault create real design constraints |
| Frame the service as a payment gateway rather than an issuer | It matches the codebase, and gateways are where card testing is stopped |
| Branch from `main` | `main` passes all 17 tests. `round-0` carries planted defects for 301.3 and remains unchanged |
| Scope the first release to one risk check with three outcomes, driven by rules RP1 to RP3 | Addresses both sides of the problem at a size that can be defined and planned in two hours |
| Exclude machine-learned and GenAI scoring | GenAI appears as the threat and as a governance trigger. Rules keep behaviour deterministic and testable |
| Exclude a user interface | The objective is specification ownership. A frontend would add scope and time without adding decisions |
| Deliver planning as a guided demonstration | A full planning run exceeds 20 minutes |
| Keep answer material out of the attendee checkpoint | Consistent with the hidden manifest used for `round-0` |

## Proposed Owner Decisions

Drafted for the exercise and written into the upstream specifications. All are fictional
training decisions, proposed for course lead approval.

| ID | Question | Proposed decision | Where it is recorded |
|----|----------|-------------------|----------------------|
| D1 | One session or two | One 2-hour 301.1 session covering Define, Audit, Plan and Verify | This handoff |
| D2 | What happens when the risk check fails | Fail closed: decline with `not_approved`, record rule `FALLBACK` | Compliance spec; PRD OQ2 |
| D3 | How a verified cardholder completes a challenged purchase | A new authorisation carries a verification result naming the challenged attempt. It is valid once, within 15 minutes, for the same card, merchant and amount | Compliance spec; PRD ST14; threat T8 |
| D4 | Currency scope | GBP only. Other currencies are rejected | PRD scope; compliance RP3 |
| D5 | Trusted merchant identity | A simulated trusted caller context. Request bodies never carry identity | Architecture spec; threat T1 |
| D6 | Who may change policy values | Only the payments-risk role, and only to positive whole numbers | Compliance change control; threat T2 |
| D7 | Retention and limits | Every new in-memory store has a limit and eviction rule. Decision records kept for the life of the process, up to a stated limit | Architecture constraints; compliance decision records |

Three questions remain open by design, each named with its owner: OQ1 (exemptions), OQ3
(what reason categories may reveal) and OQ4 (whether a challenge holds the authorisation
open).

## SPEED Findings

Observed by running the installed SPEED release (`feat/301-latest`) without modification.
These are inputs for the Workbench team and for the attendee setup guide.

1. **Upstream inputs reach the planner without Workbench changes.** `related:` front matter
   in the technical specification, combined with `--specs-dir specs`, gives the
   architecture, compliance and threat model specifications the highest relevance scores.
   See `speed-define-contract.md`.
2. **Audit does not read architecture, compliance or threat model specifications.** It
   reads only the first `> See` link and the product vision, and it did not detect the
   deliberate defects in the example specification. This is the course's central
   teaching point and a gap worth closing in SPEED. The plan Guardian, which reads the
   related specifications, did flag the fail-open decision as requiring risk sign-off, so
   detection depends on which check is consulted.
3. **The design template assumes a user interface.** A backend feature fails the design
   audit with 15 errors unless every UI section is present and marked N/A. An API design
   template would remove this overhead.
4. **Personal MCP servers can break the Architect.** SPEED agents load every MCP server
   configured on the machine, and a single server with an invalid tool schema caused every
   Architect request to fail. `bin/claude-no-mcp`, set through `CLAUDE_BIN`, prevents this
   without modifying SPEED. Attendees will have their own servers configured, so the setup
   guide includes it.
5. **Planning caches failed Architect output.** A subsequent run reuses the empty result.
   `--force` clears the main Architect cache but not the per-phase cache, so a phased plan
   requires `.speed/features/<feature>/cache/architect*` to be removed before re-running.
6. **Audit results vary between runs.** The same specification produced different
   findings on different runs. The guide sets this expectation.
7. **Coverage verification can resolve an input conflict without flagging it.** It treated
   the product flow for challenge as settled and did not report that the design
   specification states the opposite.
8. **Architect Phase 2 can fail on output format.** Phase 1 produced four tasks. Phase 2
   returned output that did not match the required schema five times and stopped with
   `error_max_structured_output_retries`.

## Measured Timings

| Step | Duration |
|------|----------|
| `speed audit` on the technical specification | 2 to 3 minutes |
| `speed plan`, Guardian and three audits before planning | approximately 9 minutes |
| `speed plan`, Architect Phase 1 | approximately 6 minutes |
| `speed plan`, Architect Phase 2 and coverage verification | Not yet completed. Phase 2 failed on output format after 7.5 minutes |

## Review Response

Response to the branch review of commit `0813216`.

| Finding | Response |
|---------|----------|
| F01 Learner start contains answers | Addressed. Tagged checkpoints; attendees start from `301.1-learner-start` |
| F02 Full SPEED flow not proven | Open. Depends on `speed define` |
| F03 Planning proceeds past a blocking decision | Addressed. The failure policy is decided in the inputs (D2). No question is required before Plan |
| F04 Verified cardholder challenged again | Addressed. ST14, verification-result rules in the compliance spec, T8, and matching in the example specification |
| F05 Stores not bounded | Addressed. Architecture requires a limit for every new store; the example specification defines each one |
| F06 Workbench callers missing | Addressed. File Impact covers the three Workbench commands and `checkAll` |
| F07 Currency undefined | Addressed. GBP only; other currencies rejected |
| F08 Identity and policy authority untrusted | Addressed. Simulated trusted caller context; payments-risk role and value validation for policy changes |
| F09 Audit evidence stale | Addressed. Re-run against the current specification; raw JSON and log stored separately with metadata |
| F10 One lab or two | Open. One 301.1 session pending course lead confirmation (D1) |
| F11 Setup, reset and fallback | Partly addressed. Checkpoints and reset commands added. Installation and preflight deferred |
| F12 Regulatory text could read as real guidance | Addressed. Compliance specification labelled as fictional training input |

## Open Items

| Item | Owner | When |
|------|-------|------|
| Approve D1 to D7 and the scenario values: RP1 to RP3, the 15-minute verification window and the 20 ms budget | Course lead | Next |
| Confirm the `speed define` command and that its output follows `speed-define-contract.md` | Workbench team | Next |
| Full dry run: Define, Audit, Plan and Verify from the checkpoints, then refresh Part 3 expectations | Course team | After `speed define` |
| Resolve Architect Phase 2 output failures | Workbench team | Before the dry run |
| Setup guide: installation, preflight, recovery | Course team | Later |
| Windows Git Bash and macOS clean-checkout testing | Course team | Later |
| Facilitator pilot | Course team | Later |
| Publish attendee material from a history without review content | Course team | Before release |
| `npm run verify` failure, "no round seeds a defect for F1, F4, F5, F6", present on `main` before this work | Fixture maintainers | Separate backlog |
