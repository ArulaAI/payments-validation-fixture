# Test Spec: paymentslatest

Maps every test-verified acceptance criterion of the paymentslatest tasks to the tests that prove it.
Scenario IDs are T<task>-<criterion>. Each row runs one named test with Node's test runner;
rows selecting `test/*.test.ts` with no test name run the whole suite (the "npm test passes" criteria).

## Scenario Catalog
| ID | Scenario | Level | Expected outcome |
|---|---|---|---|
| T1-01 | minor(10.5), minor(NaN) and minor(Infinity) each throw RangeError with message starting "money must be integer minor units, got" | unit | Holds |
| T1-02 | minor(1) returns 1 and add/sub of two Minor values return integers | unit | Holds |
| T1-03 | allocate(10000, 3) returns [3334, 3333, 3333] and allocate(9999, 7) sums to 9999 with the remainder on the leading parts | unit | Holds |
| T1-04 | For every amount in a range including 1 and every part count 1..20, sum(allocate(a, n)) === a | unit | Holds |
| T1-05 | allocate(a, 0) throws RangeError "parts must be at least 1" | unit | Holds |
| T1-06 | applyRate(6000, SCHEME_FEE_RATE at 1.49%) === 89 and applyRate(4000, same) === 60 | unit | Holds |
| T1-07 | applyRate rounds half-up at the .5 boundary rather than truncating, and applyRate(-x, r) === -applyRate(x, r) | unit | Holds |
| T1-08 | applyRate computes with an integer-scaled rate, with no floating-point multiplication of amounts in src/domain/money.ts | unit | Holds |
| T1-09 | npm test passes | unit | Holds |
| T2-01 | One Ledger.post call adds exactly two entries that share a pairId and whose signed amounts sum to 0 | unit | Holds |
| T2-02 | Each posted entry records paymentId, kind (authorise\|capture\|refund\|void) and at | unit | Holds |
| T2-03 | After many postings, net over all entries is 0 and the net for each pairId is 0 | unit | Holds |
| T2-04 | Ledger.post with a fractional amount throws RangeError from minor and writes no entries | unit | Holds |
| T2-05 | The Account union is exactly cardholder \| merchant_receivable \| merchant_settled \| scheme_fees \| refunds_payable | unit | Holds |
| T2-06 | The Ledger has no public method that writes a single entry; entries are exposed read-only | unit | Holds |
| T2-07 | npm test passes | unit | Holds |
| T3-01 | After tokenise(pan, expiry), describe(token) returns {token, last4, bin, expiry}, and serialising the vault state or the card record does not contain the PAN | unit | Holds |
| T3-02 | maskedFor(token) shows only the BIN and last four digits, and the middle digits of the PAN do not appear | unit | Holds |
| T3-03 | redact replaces a Luhn-valid 12–19 digit card number in strings, nested objects, arrays and Error message/stack | unit | Holds |
| T3-04 | redact leaves a 13-digit millisecond timestamp and non-Luhn digit runs unchanged | unit | Holds |
| T3-05 | serialiseFailure(error, context) emits output with no PAN when the error message, stack or context contains one | unit | Holds |
| T3-06 | resetSinks() empties the log, span and webhook sinks | unit | Holds |
| T4-01 | authorise with amount 10000 returns a Payment with an id starting pay_, status authorised, currency GBP, empty captures and refunds, and a token rather than the PAN, and posts one cardholder→merchant_receivable pair of kind authorise | unit | Holds |
| T4-02 | authorise with a fractional amount throws "money must be integer minor units, got X" and writes nothing | unit | Holds |
| T4-03 | A tokenisation failure calls serialiseFailure with redacted context and rethrows | unit | Holds |
| T4-04 | capture 6000 then 4000 on a 10000 authorisation gives fees 89 and 60 with nets 5911 and 3940, and a further capture of 1 throws "capture 1 exceeds remaining 0" | unit | Holds |
| T4-05 | capture on an unknown id throws "unknown payment P"; capture on a voided payment throws "cannot capture a voided payment" and the ledger length does not change | unit | Holds |
| T4-06 | capture with no amount captures the whole remaining authorisation | unit | Holds |
| T4-07 | refund above what remains of that capture throws "refund X exceeds refundable Y", where Y is the capture amount less earlier refunds against it; a captureId from another payment throws "no capture C on P" | unit | Holds |
| T4-08 | void on an uncaptured payment posts a merchant_receivable→cardholder pair and sets status voided; void after any capture throws "cannot void a captured payment" | unit | Holds |
| T4-09 | settlementSchedule(id, 0) throws "parts must be at least 1", and settlementSchedule returns allocate(captured total, n) | unit | Holds |
| T4-10 | Repeating authorise or capture with a key already seen returns the stored result and adds no payment, capture or ledger entry | unit | Holds |
| T4-12 | npm test passes | unit | Holds |
| T5-01 | checkAll(ledger, store) returns [] for an empty service and after a valid authorise/capture/refund sequence | unit | Holds |
| T5-02 | LEDGER_BALANCED reports a violation when a pairId's entries do not net to zero | unit | Holds |
| T5-03 | CAPTURE_WITHIN_AUTH reports a payment whose captures sum to more than authorised | unit | Holds |
| T5-04 | REFUND_TRACES_CAPTURE reports a refund whose captureId is not on the same payment, and a capture whose refunds exceed its amount even when the payment-level total is within bounds | unit | Holds |
| T5-05 | NO_PAN_AT_REST reports a Luhn-valid card number in any stored record, including idempotency records, and does not report 13-digit at timestamps | unit | Holds |
| T6-01 | The Basic Example sequence produces pay_/cap_/ref_ results, fees 89 and 60, a rejected capture of 1, the schedule [3334,3333,3333], and checkAll returns [] | unit | Holds |
| T6-02 | Capture of exactly the remaining amount succeeds, and remaining+1 is rejected with "capture X exceeds remaining Y" | unit | Holds |
| T6-03 | fee + net === capture amount for a range of capture amounts | unit | Holds |
| T6-04 | A refund over refundable (including after an earlier partial refund) and a refund against another payment's capture id are both rejected | unit | Holds |
| T6-05 | Void before capture brings the cardholder net for that payment back to zero; void after a partial capture is rejected | unit | Holds |
| T6-06 | Capture after void is rejected with "cannot capture a voided payment" and the ledger entry count does not change | unit | Holds |
| T6-07 | Idempotent replay of authorise and capture (including a capture key repeated after the payment changed) returns the identical result, with no new records or ledger entries | unit | Holds |
| T6-08 | settlementSchedule for 9999 in 7 instalments sums to 9999, and a fractional amount is rejected | unit | Holds |
| T6-09 | After each operation, including a forced tokenisation failure, no fixture PAN appears in the log, span or webhook sinks or in serialised errors | unit | Holds |
| T6-10 | npm test passes | unit | Holds |
| T7-01 | The property command runs seeded operation sequences, including capture-after-void, cross-payment refunds and idempotent replays, and checkAll returns [] after every step | unit | Holds |
| T7-02 | The mutation command includes mutants for applyRate truncation, the allocate remainder, the per-capture refund bound and the void-state capture guard, and each one is killed | unit | Holds |
| T7-03 | The invariant command's run calls capture/refund/void and checkAll and reports no violations | unit | Holds |
| T7-04 | The differential replay of capture/refund/settlementSchedule outputs matches the corpus | unit | Holds |
| T7-05 | bin/workbench validate and npm test both pass, and workbench/hooks/typecheck.ts matches any change to invariant.ts | unit | Holds |

## Execution and Evidence
| Scenario | Selector | Command | Task | Criterion | Runner | Test name |
|---|---|---|---|---|---|---|
| T1-01 | `test/money.test.ts` | node --test | 1 | 1 | node | minor rejects fractional and non-finite values with a clear message |
| T1-02 | `test/money.test.ts` | node --test | 1 | 2 | node | a single minor unit is a valid amount and add/sub stay integer |
| T1-03 | `test/money.test.ts` | node --test | 1 | 3 | node | allocate spreads the remainder one unit at a time across the leading parts |
| T1-04 | `test/money.test.ts` | node --test | 1 | 4 | node | allocate conserves every amount across part counts 1..20, including negatives |
| T1-05 | `test/money.test.ts` | node --test | 1 | 5 | node | allocate rejects fewer than one part |
| T1-06 | `test/money.test.ts` | node --test | 1 | 6 | node | applyRate takes the 1.49% scheme fee with an integer-scaled rate |
| T1-07 | `test/money.test.ts` | node --test | 1 | 7 | node | applyRate rounds half up at the .5 boundary instead of truncating |
| T1-07 | `test/money.test.ts` | node --test | 1 | 7 | node | applyRate is symmetric for negative amounts |
| T1-08 | `test/money.test.ts` | node --test | 1 | 8 | node | applyRate uses integer arithmetic: halves that floating point would round down are rounded up |
| T1-09 | `test/*.test.ts` | node --test | 1 | 9 | node | |
| T2-01 | `test/ledger.test.ts` | node --test | 2 | 1 | node | one post writes exactly two entries sharing a pairId that sum to zero |
| T2-02 | `test/ledger.test.ts` | node --test | 2 | 2 | node | each posted entry records paymentId, kind and at |
| T2-03 | `test/ledger.test.ts` | node --test | 2 | 3 | node | after many postings the ledger and every pair net to zero |
| T2-04 | `test/ledger.test.ts` | node --test | 2 | 4 | node | posting a fractional amount throws RangeError from minor and writes nothing |
| T2-05 | `test/ledger.test.ts` | node --test | 2 | 5 | node | the Account union and the accounts the ledger accepts are exactly the five ledger accounts |
| T2-06 | `test/ledger.test.ts` | node --test | 2 | 6 | node | the ledger exposes no way to write a single entry |
| T2-07 | `test/*.test.ts` | node --test | 2 | 7 | node | |
| T3-01 | `test/vault.test.ts` | node --test | 3 | 1 | node | [VLT-01] tokenise keeps the card record and never the PAN |
| T3-02 | `test/vault.test.ts` | node --test | 3 | 2 | node | [VLT-04] maskedFor shows only the BIN and the last four |
| T3-03 | `test/vault.test.ts` | node --test | 3 | 3 | node | [RED-01] redact replaces card numbers in strings, bare or separated |
| T3-03 | `test/vault.test.ts` | node --test | 3 | 3 | node | [RED-02] redact walks nested objects and arrays |
| T3-03 | `test/vault.test.ts` | node --test | 3 | 3 | node | [RED-03] redact sanitises an Error message, stack and cause |
| T3-03 | `test/obs.test.ts` | node --test | 3 | 3 | node | a 12-digit Luhn-valid card number, the shortest card length, is redacted |
| T3-03 | `test/obs.test.ts` | node --test | 3 | 3 | node | 17- and 19-digit Luhn-valid card numbers, the longest card lengths, are redacted |
| T3-04 | `test/vault.test.ts` | node --test | 3 | 4 | node | [RED-04] redact leaves a millisecond timestamp and non-Luhn digit runs alone |
| T3-05 | `test/vault.test.ts` | node --test | 3 | 5 | node | [OBS-01] serialiseFailure emits no PAN from message, stack or context |
| T3-06 | `test/vault.test.ts` | node --test | 3 | 6 | node | [OBS-03] resetSinks empties the log, span and webhook sinks |
| T4-01 | `test/service-operations.test.ts` | node --test | 4 | 1 | node | [SVC-01] authorise stores a tokenised payment and posts one authorise pair |
| T4-02 | `test/service-operations.test.ts` | node --test | 4 | 2 | node | [SVC-02] authorise with a fractional amount throws and writes nothing |
| T4-03 | `test/service-operations.test.ts` | node --test | 4 | 3 | node | [SVC-03] a tokenisation failure serialises a redacted request and rethrows |
| T4-04 | `test/service-operations.test.ts` | node --test | 4 | 4 | node | [SVC-04] partial captures take a 1.49% fee and the remainder cannot be exceeded |
| T4-05 | `test/service-operations.test.ts` | node --test | 4 | 5 | node | [SVC-05] capture rejects unknown and voided payments without posting |
| T4-06 | `test/service-operations.test.ts` | node --test | 4 | 6 | node | [SVC-06] capture with no amount takes the whole remaining authorisation |
| T4-07 | `test/service-operations.test.ts` | node --test | 4 | 7 | node | [SVC-07] refund is bounded per capture and must belong to the payment |
| T4-08 | `test/service-operations.test.ts` | node --test | 4 | 8 | node | [SVC-09] void releases an uncaptured authorisation and is refused after a capture |
| T4-09 | `test/service-operations.test.ts` | node --test | 4 | 9 | node | [SVC-10] settlementSchedule allocates the captured total |
| T4-10 | `test/service-operations.test.ts` | node --test | 4 | 10 | node | [SVC-11] a repeated idempotency key returns the stored result and writes nothing |
| T4-12 | `test/*.test.ts` | node --test | 4 | 12 | node | |
| T5-01 | `test/invariants.test.ts` | node --test | 5 | 1 | node | [INV-01] checkAll is empty for an empty service |
| T5-01 | `test/invariants.test.ts` | node --test | 5 | 1 | node | [INV-02] checkAll is empty after a valid authorise, capture, refund and void sequence |
| T5-02 | `test/invariants.test.ts` | node --test | 5 | 2 | node | [INV-03] LEDGER_BALANCED reports a pair that does not net to zero |
| T5-03 | `test/invariants.test.ts` | node --test | 5 | 3 | node | [INV-05] CAPTURE_WITHIN_AUTH reports captures summing above the authorisation |
| T5-04 | `test/invariants.test.ts` | node --test | 5 | 4 | node | [INV-06] REFUND_TRACES_CAPTURE reports a refund whose capture is on another payment |
| T5-04 | `test/invariants.test.ts` | node --test | 5 | 4 | node | [INV-07] REFUND_TRACES_CAPTURE is per capture, not a payment-level total |
| T5-05 | `test/invariants.test.ts` | node --test | 5 | 5 | node | [INV-08] NO_PAN_AT_REST reports a Luhn-valid card number in a payment, capture or refund |
| T5-05 | `test/invariants.test.ts` | node --test | 5 | 5 | node | [INV-09] NO_PAN_AT_REST reports a card number in a ledger entry |
| T5-05 | `test/invariants.test.ts` | node --test | 5 | 5 | node | [INV-10] NO_PAN_AT_REST reports a card number in an idempotency key or stored result |
| T5-05 | `test/invariants.test.ts` | node --test | 5 | 5 | node | [INV-11] NO_PAN_AT_REST ignores 13-digit at timestamps, short and long digit runs and Luhn-invalid runs |
| T6-01 | `test/service.test.ts` | node --test | 6 | 1 | node | the Basic Example sequence |
| T6-02 | `test/service.test.ts` | node --test | 6 | 2 | node | capture of exactly the remaining amount succeeds, remaining + 1 is rejected |
| T6-03 | `test/service.test.ts` | node --test | 6 | 3 | node | fee + net === capture for a range of amounts |
| T6-04 | `test/service.test.ts` | node --test | 6 | 4 | node | refund over refundable is rejected, including after an earlier partial refund |
| T6-04 | `test/service.test.ts` | node --test | 6 | 4 | node | refund against a capture id from another payment is rejected |
| T6-05 | `test/service.test.ts` | node --test | 6 | 5 | node | void before capture releases the reservation |
| T6-05 | `test/service.test.ts` | node --test | 6 | 5 | node | void after a partial capture is rejected |
| T6-06 | `test/service.test.ts` | node --test | 6 | 6 | node | capture after void is rejected and posts nothing |
| T6-07 | `test/service.test.ts` | node --test | 6 | 7 | node | idempotent replay of authorise and capture returns the identical result and writes nothing |
| T6-08 | `test/service.test.ts` | node --test | 6 | 8 | node | 99.99 in 7 instalments sums exactly |
| T6-08 | `test/service.test.ts` | node --test | 6 | 8 | node | a fractional amount is rejected and writes nothing |
| T6-09 | `test/service.test.ts` | node --test | 6 | 9 | node | no fixture PAN reaches any sink across every card and operation |
| T6-09 | `test/service.test.ts` | node --test | 6 | 9 | node | a forced tokenisation failure leaks no PAN to the log or the serialised error |
| T6-10 | `test/*.test.ts` | node --test | 6 | 10 | node | |
| T7-01 | `test/workbench-commands.test.ts` | node --test | 7 | 1 | node | [WB-01] the property command reports no violation over its seeded sequences |
| T7-01 | `test/workbench-commands.test.ts` | node --test | 7 | 1 | node | [WB-02] the property generator exercises every operation, including capture-after-void, cross-payment refunds and replays |
| T7-02 | `test/workbench-commands.test.ts` | node --test | 7 | 2 | node | [WB-06] the targeted mutants cover the four named defects and each applies to one line |
| T7-02 | `test/workbench-commands.test.ts` | node --test | 7 | 2 | node | [WB-07] every targeted mutant is killed by the suite |
| T7-03 | `test/workbench-commands.test.ts` | node --test | 7 | 3 | node | [WB-04] the invariant command runs capture, refund and void and reports no violation |
| T7-03 | `test/workbench-commands.test.ts` | node --test | 7 | 3 | node | [WB-09] the invariant command drives capture, refund and void before checkAll |
| T7-04 | `test/workbench-commands.test.ts` | node --test | 7 | 4 | node | [WB-05] the differential replay matches the golden corpus |
| T7-05 | `test/workbench-commands.test.ts` | node --test | 7 | 5 | node | [WB-10] bin/workbench validate passes, typecheck hook included |
