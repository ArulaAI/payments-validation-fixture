# Payments: technical contract

Owner: payments-engineering. Version 1.3.

Related: [`specs/product/payments.md`](../product/payments.md) for the behaviour this
implements.

## Money representation

All monetary values are integer minor units. Floating point must not appear in any money
path, including intermediate calculations.

`src/domain/money.ts` is the only module permitted to construct a monetary value. It
rejects fractional input.

### Allocation

Splitting an amount across parts must conserve the total. `allocate(amount, parts)`
distributes the remainder one minor unit at a time across the leading parts, so that
`sum(allocate(a, n)) === a` for every `a` and `n`.

### Rounding

Rates are applied with half-up rounding on the absolute value, so that negative amounts
round symmetrically. The scheme fee and the net amount must sum exactly to the captured
amount.

## Ledger

Every state change writes a balanced double-entry pair. No module may write a single
entry. `Ledger.post` is the only writer.

Accounts: `cardholder`, `merchant_receivable`, `merchant_settled`, `scheme_fees`,
`refunds_payable`.

## Invariants

These hold after any sequence of operations, not only after a fixed scenario. They are
asserted in `src/domain/invariants.ts`.

| Invariant | Statement |
| --- | --- |
| `LEDGER_BALANCED` | Every ledger pair nets to zero |
| `CAPTURE_WITHIN_AUTH` | The sum of captures never exceeds the authorised amount |
| `REFUND_TRACES_CAPTURE` | Every refund references a capture that exists, and refunds never exceed it |
| `NO_PAN_AT_REST` | No stored record holds a Luhn-valid card number outside the token vault |

`NO_PAN_AT_REST` checks string fields only and applies Luhn. Length alone is not
sufficient, because a millisecond timestamp is thirteen digits.

## Cardholder data

A card number exists only inside `src/vault.ts`, and only as a token, a BIN and a last
four. Everything downstream carries the token.

### Sinks

Five surfaces can carry a value out of the process. Anything reaching one of them must be
tokenised or redacted first.

1. application log
2. webhook error body
3. telemetry attributes
4. test fixture files
5. serialised exception path

The fifth is the one to watch. A value can reach it without ever being written literally,
by travelling inside a request object that is serialised on failure. `redact` is the
sanitiser at that boundary.

## Idempotency

Authorise and capture accept an idempotency key and return the original result for a
repeated key.

Refund takes no key. It guards against refunding more than was captured, and that guard is
all it does.

## Test data

Every card number in this repository is a published scheme test BIN. Real or plausible
non-test card numbers must not appear anywhere, including in git history.
