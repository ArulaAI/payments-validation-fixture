# Specs

The payments service. **This is where you work.**

Everything here describes what the service is supposed to do. When you are judging whether
a change is correct, these are the documents you judge it against.

| Path | Contains | Read it when |
| --- | --- | --- |
| [`product/payments.md`](product/payments.md) | What the service does, in product language. Owner, scope, behaviour, what is out of scope for this version | Deciding whether a change does what was asked |
| [`tech/payments.md`](tech/payments.md) | Money representation, the ledger contract, the four invariants, the cardholder-data sinks | Deciding whether a change is correct in its details |
| [`defects/`](defects/) | Defect reports. File what you find here | You have confirmed a finding and want it recorded |

Product and tech specs that share a filename describe the same feature and are read
together.

## What is not here

Notes on how this teaching repository itself is built live in [`../docs/`](../docs/).
Those are about the fixture as a product. They are not the specification of the payments
service, and a change to the service is not judged against them.
