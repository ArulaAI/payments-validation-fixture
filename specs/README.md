# Specs

The payments service. **This is where you work.**

Everything here describes what the service is supposed to do. When you are judging whether
a change is correct, these are the documents you judge it against.

| Path | Contains | Read it when |
| --- | --- | --- |
| [`product/overview.md`](product/overview.md) | The product vision every feature is checked against | Judging whether a feature belongs in this product |
| [`product/payments.md`](product/payments.md) | What the service does, in product language. Owner, scope, behaviour, what is out of scope for this version | Deciding whether a change does what was asked |
| [`tech/payments.md`](tech/payments.md) | Money representation, the ledger contract, the four invariants, the cardholder-data sinks | Deciding whether a change is correct in its details |
| [`defects/`](defects/) | Defect reports. File what you find here | You have confirmed a finding and want it recorded |

Specs in different folders that share a filename describe the same feature and are read
together.

## F2: Authorisation risk check

F2 arrives as inputs from four teams. Engineering owns none of them. Engineering owns the
technical spec, `tech/authorisation-risk.md`, which it writes from these inputs, and the technical
quality of what it describes.

| Path | From | Contains |
|------|------|----------|
| [`product/authorisation-risk.md`](product/authorisation-risk.md) | Product | The problem, stories, scope, open questions and who decides them |
| [`design/authorisation-risk.md`](design/authorisation-risk.md) | Design | What merchants and cardholders see for each outcome |
| [`architecture/authorisation-risk.md`](architecture/authorisation-risk.md) | Architecture | Bounded contexts, language, domain rules and constraints |
| [`architecture/authorisation-risk-threat-model.md`](architecture/authorisation-risk-threat-model.md) | Architecture and risk | Threats, the controls they require and how to check them |
| [`compliance/authorisation-risk.md`](compliance/authorisation-risk.md) | Risk and legal | The risk policy values, card data rules and regulatory position |

Read the product spec first, then architecture. When inputs disagree, do not pick one.
Raise it with the owners named in the product spec.

## What is not here

Notes on how this teaching repository itself is built live in [`../docs/`](../docs/).
Those are about the fixture as a product. They are not the specification of the payments
service, and a change to the service is not judged against them.
