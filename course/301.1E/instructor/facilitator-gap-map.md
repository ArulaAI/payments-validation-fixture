# Adaptive authorization: where the upstream documents fall short

Facilitator reference for 301.1E. **Ours, not the learner's.** Learners never see this
file, and nothing in `specs/` points to it.

The PRDs, architecture and designs under `specs/` were written the way those documents
usually get written. Each author did their own job well and left the gaps their role
tends to leave. Nothing here is a puzzle with a planted answer. Several gaps have more
than one reasonable resolution, and the course only cares that the engineer finds them,
sends them to the right owner, and keeps the tech spec honest about what is still open.

## Which version of the documents this map describes

This map was first written against the October 8 documents. The documents in the
snapshot are a later revision: architecture version 0.8, F2.2 version 1.1, and edits to
F2.1 and both designs. That revision closed several gaps. Their rows stay, with the same
IDs, so earlier notes still line up, but **Found by** marks them **Resolved** and says
what the document now says. Do not expect learners to find a resolved gap. Accept it
if a learner points at the resolution and asks whether it is right.

## How to read the table

- **Where** is the file and section a learner would point a Define suggestion at.
- **Owner** is the function that has to decide. Engineers give input; they do not decide.
- **Found by** says what surfaces it. `audit` means `speed audit`, run on the relevant
  spec file (it takes one file per run), should report it, `validate` means
  `speed validate specs`, `guardian` means the pre-plan vision check, `plan` means the
  decomposition gate or `speed verify`, and `engineer` means only a person reading
  across documents and code will notice. **Resolved** and **Partly resolved** mean the
  current documents have closed or narrowed the gap.

The split between `audit` and `engineer` rows is the point of Audit. Passing the audit
does not mean the requirements are right.

## Product: F2.1 high-value purchases

| # | Where | Gap | Owner | Found by |
|---|---|---|---|---|
| P1 | Success Criteria | "Fall by 30%" has no baseline, no measurement window and no definition of a false decline | PM | audit (traceability), engineer |
| P2 | Success Criteria | "No material increase in fraud losses" is not a number | PM with Risk | audit |
| P3 | Open Questions | Risk appetite is "to be agreed with Risk", with no person and no date. The decision policy thresholds in the architecture cannot be set without it | Risk | engineer |
| P4 | User Flows | "Held while an analyst reviews it" never says what the cardholder sees at checkout during the hold | PM with CX | **Partly resolved.** The checkout design now has a Held State: "We're checking this payment. The shop will confirm your order." The PRD flow itself is still silent |
| P5 | ST3 vs Security & Controls | Tell the cardholder why, but do not help a fraudster tune the next attempt. Nobody has said which reasons are safe to show | PM with Legal | **Partly resolved.** The architecture now says cardholder reasons come only from an allowlist reviewed by Legal. No upstream document lists the reasons; the tech draft puts the allowlist in `src/risk/reasons.ts` |
| P6 | ST5 | "Handled consistently with our risk policy" when the bank does not respond | PM with Risk | **Partly resolved.** The architecture's Failure Modes now say an unavailable or slow provider holds the payment for review. The ST5 wording is unchanged, so audit may still call it vague |
| P7 | RFC Decomposition | "TBD with engineering" | PM, after engineering input | **Resolved.** The table now maps ST1 to ST5 to `specs/tech/adaptive-auth/1-high-value-traveller.md` with testable outputs |
| P8 | Open Questions | Which 3-D Secure exemptions apply is waiting on Legal. It decides whether low-risk payments skip step-up at all | Legal | engineer |

## Product: F2.2 card testing

| # | Where | Gap | Owner | Found by |
|---|---|---|---|---|
| C1 | ST6, ST7 | "From one source" is never defined. The 3 October attack rotated IP country on every attempt, so IP is not the source | PM with data science | engineer (try the fixture). The card-testing tech draft proposes `(BIN, small amount)`; that is an engineering proposal the PM still has to accept |
| C2 | RFC Decomposition | The PM has named engineering's files and their dependency order (card testing depends on the traveler RFC). The mapping puts every F2.2 story in one RFC | PM, after engineering input | engineer, audit (sizing) |
| C3 | Merchant notified flow | No design covers the merchant notification | Design | audit (Design vs PRD coverage) |
| C4 | Open Questions | Block length and block scope are open, and the security section requires blocks to expire | PM with Risk | engineer |
| C5 | Success Criteria vs F2.1 | Blocking "the source" can catch genuine travelers behind a shared network, which is the problem F2.1 exists to fix. The two PMs have not talked | Both PMs | **Partly resolved.** F2.2 version 1.1 steps up a blocked shopper instead of declining (ST7, Risks), so a genuine traveler is challenged, not refused. Block scope is still open (C4). In the recorded run a block covered a whole BIN, traveler included; that became 301.3E gap G5 |

## Architecture: adaptive authorization

| # | Where | Gap | Owner | Found by |
|---|---|---|---|---|
| A1 | Scoring service | A stateless scorer cannot see card testing spread across merchants, and the platform overview gives a four-week lead time for a shared store | Architect | **Resolved.** A separate card-testing detector keeps attempt and block tables on the primary Postgres cluster; the scorer stays stateless. The Decisions table records why Redis, Kafka and per-replica memory were rejected |
| A2 | Decision flow | The risk narrative sat between scoring and the decision: a hosted LLM call over HTTPS inside a 40 ms budget, prompted with the merchant-controlled descriptor | Architect | **Resolved.** The narrative now runs asynchronously, only for held payments, outside the authorization path, and never receives the merchant descriptor. Guardian still matters if a learner's draft puts it back on the path |
| A3 | Risk narrative | "Prompted with the scored request." The request contains the PAN | Architect | **Resolved.** The narrative receives reason codes, the score, an amount band, merchant category and issuer and IP countries only; never the request, card number, BIN, token or last four |
| A4 | Scoring service | Output was one integer, but the PRD, the checkout design and the review queue all need a reason | Architect with data science | **Resolved.** The scorer returns a score and the top 1 to 3 reason codes |
| A5 | Decision flow | Thresholds (300, 700, 850) are configuration owned by Risk, but Risk has not agreed them (see P3) | Risk | engineer |
| A6 | Step-up | The provider can return "unavailable", and the architecture did not say what happens next | Architect with PM | **Resolved.** Failure Modes: an unavailable or slow provider on an F2.1 challenge holds the payment for review; an uncompleted challenge on a card-testing block match is declined as card testing |
| A7 | Verification | Shadow mode compares decisions for two weeks, but there is no labeled outcome to compare them against in that time | Architect with data science | engineer |
| A8 | Quality Constraints vs F2.1 Success Criteria | The PRD says every declined payment carries a reason the merchant can show the cardholder. The architecture covers automated declines only and leaves analyst declines and 72-hour expiries open, pointing at the F2.1 tech draft's Unresolved Question 6 | PM with Legal | validate (decline-reason finding), engineer |

## Design: checkout step-up

| # | Where | Gap | Owner | Found by |
|---|---|---|---|---|
| D1 | States | No state for a challenge the cardholder abandons or that times out at the bank. The error state covers "not confirmed" only | Design | engineer (writing the state machine) |
| D2 | Pages / Routes | The held-for-review outcome from F2.1 had no result screen | Design | **Resolved.** A route and a Held State now cover a `held` result, both from the initial authorization and from a challenge the bank could not complete |
| D3 | Data Binding | `reason` was bound to an authorization response field that did not exist | Design with architect | **Resolved upstream.** `StepUpResult.reason` is bound to `GatewayResult.reason`. Today's gateway returns only `code` (GW-03), so the tech spec has to add that field |

## Design: risk review queue

| # | Where | Gap | Owner | Found by |
|---|---|---|---|---|
| R1 | Empty State | Was left as a TODO for fraud ops | Design | **Resolved.** Empty states for held payments and attacks are written, with copy and no call to action |
| R2 | Data Binding | QueueRow.reason was bound to a model reason the model did not emit | Design with architect | **Resolved.** `QueueRow.reason` is bound to `ReviewItem.analystReason`, and the detail pane shows the reasons |
| R3 | Product link | The queue serves both PRDs, but links only F2.2, so the audit never checks it against the held-payment flows in F2.1 | Design | engineer |

## Brownfield facts the tech spec has to account for

| Fact | Where it shows |
|---|---|
| The traveler is declined today by `HIGH_VALUE_CROSS_BORDER` | `test/gateway.test.ts` GW-02 |
| A decline tells the merchant nothing | GW-03 |
| The 3 October burst is approved in full | GW-05 |
| Velocity is per replica, so six replicas means six counts | GW-06, architecture overview |
| An unknown BIN is treated as domestic | `src/risk/issuers.ts` |
| `PaymentsService.authorise` never declines; the gateway is the only decision point | `src/payments/gateway.ts`, architecture overview |

## What SPEED's checks will and will not show on this fixture

| Check | Expected on this fixture | Why it matters |
|---|---|---|
| Define codebase dimension and plan spec alignment | Confirms backticked references to `gateway.ts`, `rules.ts`, `issuers.ts`; marks invented ones missing | Catches a draft that cites code that does not exist. Does not catch a draft that misreads code that does |
| Decomposition gate, task size | Passes every task. The largest file is 215 lines and `src/` is about 880, far below the 3,000-line warning | Taught as a limit: green because the measure cannot see the problem |
| Decomposition gate, file ownership | Should fail or force dependencies, because F2.1 and F2.2 both change `src/payments/gateway.ts` and `src/risk/` | The clearest place the plan reflects the two PMs not having talked (C5) |
| Decomposition gate, clusters and bridge symbols | Depends on the semantic graph built from TypeScript imports by regex. Not yet confirmed on this fixture | Run the index before relying on it |
| Guardian | Should flag or reject a tech spec that puts the risk narrative back in the authorization path, against the overview's anti-goals | A2 and A3 are resolved upstream; this is the gate that holds the line if a draft undoes that |
| Coverage verifier | In the recorded run, Plan's coverage check found 5 critical gaps, all UI or production-store work in other repositories, and Verify's repair added two tasks (see the rehearsal record) | The plan learners read was not written by the Architect alone |

## What the audit should do with the drafted tech specs

The snapshot already splits the work into two tech drafts, one per PRD, under
`specs/tech/adaptive-auth/`. Learners finish them; they do not start a single RFC. In the
recorded run, the audit of the traveler draft returned WARN with 14 warnings and its
sizing suggested four child specs (about 18 tasks). Sizing is a warning, never a failure.
The split does not show as phases in the plan: the fixture's `[plan] max_tasks = 8` turns
phasing off, and the recorded plan had 8 tasks before Verify's repair took it to 10. If
a draft's audit suggests far fewer tasks, check whether it has dropped the card-testing
state or the step-up fallback.
