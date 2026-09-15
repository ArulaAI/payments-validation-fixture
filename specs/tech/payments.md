# F1: Card payment capture and refund

Owner: payments-engineering. Version 1.3.
Related: [`specs/product/payments.md`](../product/payments.md)

## Overview

An in-memory payments service covering authorise, capture, refund and void, with a
double-entry ledger and a token vault. No database and no network. Money is integer minor
units throughout.

## Goals

- Every movement of money is recorded as a balanced pair, so the ledger can be reconciled
  without reference to application state.
- The four invariants below hold after any sequence of operations, not only after the
  scenarios anyone thought to write down.
- A card number exists in exactly one module and leaves it only as a token.

## Features

**Money.** `src/domain/money.ts` is the only module permitted to construct a monetary
value. It rejects fractional input. Splitting an amount across parts conserves the total.
Rate application follows TR4.

**Ledger.** `Ledger.post` is the only writer. Accounts are `cardholder`,
`merchant_receivable`, `merchant_settled`, `scheme_fees` and `refunds_payable`.

**Vault.** `src/vault.ts` holds card data. A token, a BIN and a last four leave it.
Nothing else does.

**Observability.** Five surfaces can carry a value out of the process: the application
log, a webhook error body, telemetry attributes, test fixture files and the serialised
exception path.

## Technical Requirements

| ID | Requirement |
|----|-------------|
| TR1 | All monetary values are integer minor units. Floating point must not appear in any money path, including intermediate calculations |
| TR2 | `sum(allocate(a, n)) === a` for every amount `a` and every part count `n` |
| TR3 | The scheme fee and the merchant net sum exactly to the captured amount |
| TR4 | A rate is applied with half-up rounding on the absolute value, so negative amounts round symmetrically. Truncation must not be used |
| TR5 | Every state change writes a balanced double-entry pair. No module writes a single entry |
| TR6 | `LEDGER_BALANCED`: every ledger pair nets to zero |
| TR7 | `CAPTURE_WITHIN_AUTH`: the sum of captures never exceeds the authorised amount |
| TR8 | `REFUND_TRACES_CAPTURE`: every refund references a capture that exists, and refunds never exceed it |
| TR9 | `NO_PAN_AT_REST`: no stored record holds a Luhn-valid card number outside the vault. Length alone is insufficient, because a millisecond timestamp is thirteen digits |
| TR10 | Authorise and capture accept an idempotency key and return the original result for a repeated key |
| TR11 | Any value reaching one of the five observability surfaces is tokenised or redacted first. `redact` is the sanitiser at the serialised exception boundary |
| TR12 | Every card number in the repository is a published scheme test BIN. Real or plausible non-test card numbers must not appear, including in history |

## Non-Functional Requirements

- The invariants are assertable after a generated sequence of operations, not only after a
  fixed scenario.
- The service runs in memory with no external dependency, so a full exercise completes in
  seconds.

## Out of Scope

- Persistence. State lives in memory for the lifetime of the process.
- Concurrency control. Operations are sequential, so contention is out of scope for this
  version.
- Settlement file generation. The schedule is produced; the file format is not.
