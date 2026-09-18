# Test Spec: Payments

> See [specs/tech/payments.md](specs/tech/payments.md) for the technical contract under evaluation.
> See [specs/product/payments.md](specs/product/payments.md) for the user stories and acceptance criteria.

## Sources and Review

| Source | Version / revision | Requirements or sections used |
|---|---|---|
| [specs/tech/payments.md](specs/tech/payments.md) | Version 1.3 at commit 652a864 | TR1 to TR12; Non-Functional Requirements; Out of Scope |
| [specs/product/payments.md](specs/product/payments.md) | Version 1.3 at commit 652a864 | ST1 to ST7 acceptance criteria; Success Criteria; Risks; Open Questions |

- **Spec owner:** payments-engineering, with payments-product for acceptance criteria
- **Review status:** Draft
- **Reviewer and review date:** Not yet reviewed

## Scope

Evaluates the payments service (authorise, capture, refund, void, settlement schedules, money and ledger) against user stories ST1 to ST7 and technical requirements TR1 to TR12, using the suite as it exists under `test/`. Every scenario below comes from a clause in one of the two specs; none invents behaviour. Scenarios the specs require but no test executes yet are kept in the catalog and stay unverifiable until a test exists. Three product decisions are open and recorded under Out of Scope: refund idempotency, fee rate by card type, and void after authorisation expiry.

## Test Levels

| Level | Meaning | Tooling | Environment |
|---|---|---|---|
| unit | One module (money, ledger) with no service wiring | node:test on Node 22 with type stripping | Local process |
| integration | PaymentsService with its ledger, vault and observability sinks, all in memory | node:test on Node 22 with type stripping | Local process |

## Entry Conditions

- **Build and configuration:** Node 22 with `--experimental-strip-types` (22.18 or later needs no flag); no install step, no build step.
- **Services and storage:** None. The service, ledger and vault are in memory.
- **Access and data:** Scheme test cards and expiry from `test/fixtures/cards.ts`. No secrets.
- **Blocking dependencies:** None for execution. RISK-01, RISK-02, AC-12 and EDGE-01 have no test yet and cannot pass until one is written.

## Scenario Catalog

### Authorise

| ID | Scenario | Level | Expected outcome |
|---|---|---|---|
| AC-01 | Given a valid card, when 2500 is authorised, then the amount is reserved and a balanced pair is posted | integration | authorised is 2500; status authorised; ledger nets to 0; exactly two entries for the payment |
| AC-02 | Given an authorised payment, when its stored record is inspected, then it carries only a token and the last four digits | integration | last4 is 1111; the serialised record contains no 16-digit card number |
| AC-03 | Given an authorise carrying idempotency key k1, when the same request is repeated with k1, then the original payment is returned and no second record exists | integration | same payment id; one payment stored |
| RISK-01 | Given an authorise request that fails, when the failure is serialised to the application log, then no field holds a full card number | integration | the logged record shows the pan field as redacted |

### Capture

| ID | Scenario | Level | Expected outcome |
|---|---|---|---|
| AC-04 | Given an authorisation of 10000, when it is captured in full, then fee and net both post and sum to the capture | integration | capture total 10000; ledger nets to 0 |
| AC-05 | Given an authorisation of 10000, when 6000 and then 4000 are captured, then both succeed and a third capture is rejected | integration | captured 10000; the next capture throws RangeError |
| AC-06 | Given an authorisation of 1000, when 1001 is captured, then the capture is rejected rather than truncated | integration | RangeError; no capture recorded |
| AC-12 | Given a capture carrying idempotency key c1, when the same request is repeated with c1, then the original capture is returned and no second capture is recorded | integration | same capture id; one capture on the payment |
| RISK-02 | Given captures of 200 and 9999, when the scheme fee is taken at the capture boundary, then it is rounded half up | integration | fees 3 and 149; merchant net 197 and 9850 |

### Refund and void

| ID | Scenario | Level | Expected outcome |
|---|---|---|---|
| AC-07 | Given a capture of 5000 with 3000 already refunded, when 2001 more is refunded, then it is rejected and the ledger stays balanced | integration | RangeError; ledger nets to 0 |
| AC-08 | Given an uncaptured authorisation, when it is voided, then the reservation is released | integration | status voided; ledger nets to 0 |
| AC-09 | Given a captured payment, when it is voided, then the request is rejected | integration | RangeError |
| EDGE-01 | Given a capture of 5000, when exactly 5000 is refunded against it, then the refund is accepted and a further refund of 1 is rejected | integration | refund of 5000 recorded; the next refund throws RangeError |

### Settlement and invariants

| ID | Scenario | Level | Expected outcome |
|---|---|---|---|
| AC-10 | Given a capture of 10000, when schedules of 1, 2, 3 and 7 instalments are produced, then each sums exactly to 10000 | integration | every schedule sums to 10000 |
| AC-11 | Given two captures and a refund on one payment, when the four invariants are checked, then none is violated | integration | checkAll returns an empty list |

### Money

| ID | Scenario | Level | Expected outcome |
|---|---|---|---|
| VAL-01 | When a fractional minor unit is constructed, then it is rejected | unit | RangeError |
| VAL-02 | Given amounts from 1 to 123457 and part counts from 1 to 11, when allocate splits them, then the parts sum to the amount | unit | sum equals the amount; length equals the part count |
| VAL-03 | Given 1000 in 3 parts, when allocated, then the remainder is front-loaded | unit | [334, 333, 333] |
| VAL-04 | Given 1000 and -1000 at 1.49%, when applyRate runs, then both round half up symmetrically | unit | 15 and -15 |

### Ledger

| ID | Scenario | Level | Expected outcome |
|---|---|---|---|
| LEDGER-01 | When one movement is posted, then exactly two entries of opposite sign are written | unit | 2 entries; net 0 |
| LEDGER-02 | When 50 movements are posted, then the ledger nets to zero | unit | net 0 |

## Scenario Classification

| Scenario ID | Categories | Priority / risk | Execution mode |
|---|---|---|---|
| AC-01 to AC-11 | functional | Required for acceptance | Automated |
| AC-12 | functional | Required for acceptance | Automated, test not yet written |
| VAL-01 to VAL-04 | validation | Required for acceptance | Automated |
| LEDGER-01, LEDGER-02 | functional, regression | Required for acceptance | Automated |
| RISK-01 | security | Required for acceptance; product risk rated Critical | Automated, test not yet written |
| RISK-02 | regression | Required for acceptance; product risk rated High | Automated, test not yet written |
| EDGE-01 | edge case | Required for acceptance | Automated, test not yet written |

## Acceptance Traceability

| RFC acceptance criterion | Covering scenarios |
|---|---|
| ST1: given a valid card, authorising reserves the amount and no money moves | AC-01 |
| ST2: capturing 6.00 then 4.00 of a 10.00 authorisation succeeds and a third capture is rejected | AC-05 |
| ST3: the merchant receives the capture less the 1.49% fee and the two sum to the capture | AC-04, RISK-02 |
| ST4: a refund references its capture and cannot exceed it | AC-07, EDGE-01 |
| ST5: voiding an uncaptured authorisation releases it; voiding a captured payment is rejected | AC-08, AC-09 |
| ST6: a retried authorise or capture with a seen idempotency key returns the original result and creates no second record | AC-03, AC-12 |
| ST7: instalments for a capture of 99.99 in 7 parts sum exactly to 99.99 | AC-10 |

### Additional Coverage

| Source requirement / risk | Covering scenarios | Gap or deferral reference |
|---|---|---|
| TR1: integer minor units, no floating point in money paths | VAL-01 | none |
| TR2: allocate conserves the total for every amount and part count | VAL-02, VAL-03, AC-10 | none |
| TR3: fee and net sum exactly to the capture | AC-04 | exact split values only in RISK-02, which has no test |
| TR4: rates round half up on the absolute value | VAL-04 covers the rate function | the capture boundary is RISK-02, which has no test |
| TR5: every state change writes a balanced pair | LEDGER-01, AC-01 | none |
| TR6: LEDGER_BALANCED | LEDGER-02, AC-11 | generated sequences: OOS-04 |
| TR7: CAPTURE_WITHIN_AUTH | AC-05, AC-06, AC-11 | none |
| TR8: REFUND_TRACES_CAPTURE and refunds never exceed the capture | AC-07, AC-11 | boundary case is EDGE-01, which has no test |
| TR9: NO_PAN_AT_REST | AC-02, AC-11 | none |
| TR10: idempotency on authorise and capture | AC-03 | capture half is AC-12, which has no test |
| TR11: values reaching an observability surface are tokenised or redacted | RISK-01 | no executing test |
| TR12: only scheme test BINs anywhere in the repository | none | OOS-05, a repository rule checked by pan-scan |
| Product risk, High: rounding drift between fee and net leaves the ledger short | RISK-02 | no executing test |
| Product risk, Critical: a card number reaches an observability surface | RISK-01 | no executing test |
| Product risk, Medium: instalment schedules lose or create a minor unit | VAL-02, AC-10 | none |

## Fixtures and Test Data

| Fixture / data set | Used by scenarios | Setup and controlled values | Reset / cleanup |
|---|---|---|---|
| TEST_CARDS and EXPIRY from `test/fixtures/cards.ts` | AC-01 to AC-12, RISK-01, RISK-02, EDGE-01 | Published scheme test BINs; visa 4111111111111111; expiry 12/30 | Constants |
| Fresh PaymentsService | every integration scenario | New service, ledger and payment store per test | Discarded per test |
| Observability sinks | RISK-01 | Call resetSinks() before the scenario | Reset per test |

## Execution and Evidence

- **Execution mapping:** The table below. Selectors are test files, so a scenario passes only when its whole file passes. RISK-01, RISK-02, AC-12 and EDGE-01 have no selector yet and report as not examined; each sits in its functional area above, and the empty Selector cell is what records the gap.
- **Runner configuration:** `speed.toml`, section `[eval]`, the Node test runner with the built-in JUnit reporter. Eval supplies `SPEED_EVAL_JUNIT_FILE`; `{selectors}` limits each invocation to the mapped test file.
- **Result report:** `.speed/features/payments/eval/report.json` and `summary.md`, written by `speed eval`.

| Scenario | Selector | Command |
|---|---|---|
| AC-01 | test/service.test.ts | |
| AC-02 | test/service.test.ts | |
| AC-03 | test/service.test.ts | |
| AC-04 | test/service.test.ts | |
| AC-05 | test/service.test.ts | |
| AC-06 | test/service.test.ts | |
| AC-07 | test/service.test.ts | |
| AC-08 | test/service.test.ts | |
| AC-09 | test/service.test.ts | |
| AC-10 | test/service.test.ts | |
| AC-11 | test/service.test.ts | |
| VAL-01 | test/money.test.ts | |
| VAL-02 | test/money.test.ts | |
| VAL-03 | test/money.test.ts | |
| VAL-04 | test/money.test.ts | |
| LEDGER-01 | test/ledger.test.ts | |
| LEDGER-02 | test/ledger.test.ts | |
| RISK-01 |  | |
| RISK-02 |  | |
| AC-12 |  | |
| EDGE-01 |  | |

An automated scenario passes only when its mapped test is discovered, executes, and its assertions pass. A green suite that does not include the mapped selector is not evidence for that scenario, and a scenario with no selector is not a pass.

## Exit Criteria

- **Merge gate:** every catalog scenario passes under `speed eval --strict`. Not met while RISK-01, RISK-02, AC-12 and EDGE-01 have no test.
- **Release gate:** bounded while OOS-01 is undecided; the release claim must name it.
- **Coverage review:** every ST criterion and every TR requirement above maps to at least one scenario or to an Out of Scope row.
- **Exceptions:** none permitted. A skipped, unverifiable or not-run scenario is not a pass.
- **Flaky tests:** none known.

## Out of Scope

| Excluded behavior / category | Not applicable or deferred | Reason and risk | Decision owner / follow-up |
|---|---|---|---|
| OOS-01 Refund idempotency: whether two identical refund requests are one refund or two | Deferred | ST6 covers authorise and capture only; asserting either answer would invent policy | payments-product to decide; release claim bounded until then |
| OOS-02 Scheme fee rate varying by card type | Deferred | Open question in the product spec; blocks commercial card fees | scheme relations |
| OOS-03 Void after the authorisation has expired | Deferred | Open question in the product spec; blocks the expiry path | payments-operations |
| OOS-04 Invariants after generated operation sequences | Not applicable to this spec | Covered by the workbench invariant and property commands | Course workflow |
| OOS-05 TR12 test-BIN rule, PAN scanning, taint, mutation, differential replay | Not applicable to this spec | Repository and workflow checks, not runtime scenarios | Course workflow |
| OOS-06 Chargebacks, multi-currency, partial reversal of a refund, network tokenisation, persistence, concurrency | Not applicable | Out of scope for version 1.3 in both specs | Spec owners |
