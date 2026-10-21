# Specs

The payments service. **This is where you work.**

Everything here describes what the service is supposed to do. When you are judging whether
a change is correct, these are the documents you judge it against.

| Path | Contains | Read it when |
| --- | --- | --- |
| [`product/payments.md`](product/payments.md) | What the service does, in product language. Owner, scope, behaviour, what is out of scope for this version | Deciding whether a change does what was asked |
| [`tech/payments.md`](tech/payments.md) | Money representation, the ledger contract, the four invariants, the cardholder-data sinks | Deciding whether a change is correct in its details |
| [`product/overview.md`](product/overview.md) | The product vision: who the platform serves, its principles and anti-goals | Checking whether a feature belongs in the product |
| [`product/adaptive-auth/`](product/adaptive-auth/) | F2 adaptive authorisation, from the two product managers | Writing the adaptive authorisation tech spec |
| [`architecture/`](architecture/) | The platform architecture, and the architecture for adaptive authorisation | Deciding how a feature fits the system as built |
| [`design/adaptive-auth/`](design/adaptive-auth/) | The checkout step-up and the risk review queue | Writing anything a cardholder or analyst sees |
| [`tech/adaptive-auth/`](tech/adaptive-auth/) | F2 tech specs: [`1-high-value-traveller.md`](tech/adaptive-auth/1-high-value-traveller.md) scored decisions and step-up (F2.1), [`2-card-testing.md`](tech/adaptive-auth/2-card-testing.md) card-testing detection (F2.2), which depends on F2.1. Each shares its filename with its product spec | Planning or building adaptive authorisation |
| [`defects/`](defects/) | Defect reports. File what you find here | You have confirmed a finding and want it recorded |

## SPEED feature spec bundles

These specs describe SPEED itself, not the payments service. They break the feature spec
bundles RFC into seven features, S1 to S7.

| Path | Contains |
| --- | --- |
| [`product/speed-overview.md`](product/speed-overview.md) | SPEED product vision. One section per feature, one subsection per subfeature |
| `product/speed-<feature>.md` | Feature spec: user stories grouped by subfeature |
| `tech/speed-<feature>.md` | Tech spec: technical requirements grouped by subfeature |

Each product spec has a tech spec with the same filename. Subfeature `Sn.m` has the same
section number in the overview, the product spec and the tech spec.

Product and tech specs that share a filename describe the same feature and are read
together. A feature with several documents of one kind gets its own folder under each
kind, as `adaptive-auth/` does.

## What is not here

Notes on how this teaching repository itself is built live in [`../docs/`](../docs/).
Those are about the fixture as a product. They are not the specification of the payments
service, and a change to the service is not judged against them.
