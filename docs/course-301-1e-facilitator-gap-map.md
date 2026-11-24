# Adaptive authorisation: where the upstream documents fall short

Facilitator reference for 301.1E. **Ours, not the learner's.** Learners never see this
file, and nothing in `specs/` points to it.

The PRDs, architecture and designs under `specs/` were written the way those documents
usually get written. Each author did their own job well and left the gaps their role
tends to leave. Nothing here is a puzzle with a planted answer. Several gaps have more
than one reasonable resolution, and the course only cares that the engineer finds them,
sends them to the right owner, and keeps the tech spec honest about what is still open.

## How to read the table

- **Where** is the file and section a learner would point a Define suggestion at.
- **Owner** is the function that has to decide. Engineers give input; they do not decide.
- **Found by** says what surfaces it. `audit` means `speed audit --feature adaptive-auth`
  should report it, `guardian` means the pre-plan vision check, `plan` means the
  decomposition gate or `speed verify`, and `engineer` means only a person reading across
  documents and code will notice.

The split between `audit` and `engineer` rows is the point of Audit. Passing the audit
does not mean the requirements are right.

## Product: F2.1 high-value purchases

| # | Where | Gap | Owner | Found by |
|---|---|---|---|---|
| P1 | Success Criteria | "Fall by 30%" has no baseline, no measurement window and no definition of a false decline | PM | audit (traceability), engineer |
| P2 | Success Criteria | "No material increase in fraud losses" is not a number | PM with Risk | audit |
| P3 | Open Questions | Risk appetite is "to be agreed with Risk", with no person and no date. The decision policy thresholds in the architecture cannot be set without it | Risk | engineer |
| P4 | User Flows | "Held while an analyst reviews it" never says what the cardholder sees at checkout during the hold. The architecture authorises and blocks capture, so the cardholder is told the payment succeeded | PM with CX | engineer |
| P5 | ST3 vs Security & Controls | Tell the cardholder why, but do not help a fraudster tune the next attempt. Nobody has said which reasons are safe to show | PM with Legal | engineer |
| P6 | ST5 | "Handled consistently with our risk policy" when the bank does not respond. There is no policy to be consistent with | PM with Risk | audit (vague criterion), engineer |
| P7 | RFC Decomposition | "TBD with engineering" | PM, after engineering input | audit (placeholder) |
| P8 | Open Questions | Which 3-D Secure exemptions apply is waiting on Legal. It decides whether low-risk payments skip step-up at all | Legal | engineer |

## Product: F2.2 card testing

| # | Where | Gap | Owner | Found by |
|---|---|---|---|---|
| C1 | ST6, ST7 | "From one source" is never defined. The 3 October attack rotated IP country on every attempt, so IP is not the source | PM with data science | engineer (try the fixture) |
| C2 | RFC Decomposition | The PM has named engineering's files and their dependency order. The mapping puts every story in one RFC | PM, after engineering input | engineer, audit (sizing) |
| C3 | Merchant notified flow | No design covers the merchant notification | Design | audit (Design vs PRD coverage) |
| C4 | Open Questions | Block length and block scope are open, and the security section requires blocks to expire | PM with Risk | engineer |
| C5 | Success Criteria vs F2.1 | Declining "the source" can catch genuine travellers behind a shared network, which is the problem F2.1 exists to fix. The two PMs have not talked | Both PMs | engineer |

## Architecture: adaptive authorisation

| # | Where | Gap | Owner | Found by |
|---|---|---|---|---|
| A1 | Scoring service | "Stateless, every feature derived from the request" cannot see card testing spread across merchants. The platform overview says there is no shared store and a four-week lead time for one | Architect | engineer |
| A2 | Decision flow | The risk narrative sits between scoring and the decision. It is a hosted LLM call over HTTPS inside a 40 ms budget, and it is prompted with the merchant's descriptor, which the merchant controls | Architect | guardian (anti-goals), engineer |
| A3 | Risk narrative | "Prompted with the scored request." The request contains the PAN. The overview forbids card data leaving the network | Architect | engineer |
| A4 | Scoring service | Output is one integer. The PRD wants decline reasons, the checkout design has a reason disclosure, and the review queue shows a "reason" column. Nothing produces a reason | Architect with data science | engineer |
| A5 | Decision flow | Thresholds are configuration owned by Risk, but Risk has not set them (see P3) | Risk | engineer |
| A6 | Step-up | The provider can return "unavailable". The architecture does not say what happens next (see P6) | Architect with PM | engineer |
| A7 | Rollout | Shadow mode compares decisions, but there is no labelled outcome to compare them against for two weeks | Architect with data science | engineer |

## Design: checkout step-up

| # | Where | Gap | Owner | Found by |
|---|---|---|---|---|
| D1 | States | No state for a challenge the cardholder abandons or that times out at the bank. The error state covers "not confirmed" only | Design | engineer (writing the state machine) |
| D2 | Pages / Routes | The held-for-review outcome from F2.1 has no result screen | Design | audit (Design vs PRD coverage) |
| D3 | Data Binding | `reason` is bound to an authorisation response field that does not exist (see A4) | Design with architect | engineer |

## Design: risk review queue

| # | Where | Gap | Owner | Found by |
|---|---|---|---|---|
| R1 | Empty State | Left as a TODO for fraud ops | Design | audit (TODO marker, empty section) |
| R2 | Data Binding | QueueRow.reason is bound to "model reason for the score", which the model does not emit (see A4) | Design with architect | engineer |
| R3 | Product link | The queue serves both PRDs, but links only F2.2, so the audit never checks it against the held-payment flows in F2.1 | Design | engineer |

## Brownfield facts the tech spec has to account for

| Fact | Where it shows |
|---|---|
| The traveller is declined today by `HIGH_VALUE_CROSS_BORDER` | `test/gateway.test.ts` GW-02 |
| A decline tells the merchant nothing | GW-03 |
| The 3 October burst is approved in full | GW-05 |
| Velocity is per replica, so six replicas means six counts | GW-06, architecture overview |
| An unknown BIN is treated as domestic | `src/risk/issuers.ts` |
| `PaymentsService.authorise` never declines; the gateway is the only decision point | `src/payments/gateway.ts`, architecture overview |

## What SPEED's checks will and will not show on this fixture

| Check | Expected on this fixture | Why it matters |
|---|---|---|
| Define codebase dimension and plan spec alignment | Confirms backticked references to `gateway.ts`, `rules.ts`, `issuers.ts`; marks invented ones missing | Catches a draft that cites code that does not exist. Does not catch a draft that misreads code that does |
| Decomposition gate, task size | Passes every task. The largest file is 210 lines and `src/` is about 670, far below the 3,000-line warning | Taught as a limit: green because the measure cannot see the problem |
| Decomposition gate, file ownership | Should fail or force dependencies, because F2.1 and F2.2 both change `src/payments/gateway.ts` and `src/risk/` | The clearest place the plan reflects the two PMs not having talked (C5) |
| Decomposition gate, clusters and bridge symbols | Depends on the semantic graph built from TypeScript imports by regex. Not yet confirmed on this fixture | Run the index before relying on it |
| Guardian | Should flag or reject a tech spec that keeps the risk narrative in the authorisation path, against the overview's anti-goals | Ties A2 and A3 to a gate that can stop the plan |
| Coverage verifier | Likely adds tasks for the step-up fallback (A6) or merchant notification (C3) if the draft dropped them | The plan learners read was not written by the Architect alone |

## What the audit should do with the drafted tech spec

The two PRDs together hold nine stories, four product flows of their own and a new
external integration. A single drafted RFC should exceed the ten-task sizing threshold,
and the audit should recommend splitting it into child RFCs. Learners then see the
split reflected as separate tech files under `specs/tech/adaptive-auth/` and as phases
in the plan. If a drafted RFC comes in under the threshold, that usually means it has
skipped the card-testing state (A1) or the step-up fallback (A6).
