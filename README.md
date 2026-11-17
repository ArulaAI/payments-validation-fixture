# payments-validation-fixture

The codebase the Engineering 301 pathway works on. A small card-payments
authorisation service with a double-entry ledger, its specs and its tests.

It is not a payments product. It is a teaching artifact that behaves like one.
Every check a learner runs on it comes from SPEED, not from this repository.

## Run it

No install. No accounts. No network.

```sh
git clone <this repo> && cd payments-validation-fixture
node --version          # 22 or later
npm test                # the suite
```

There is no `npm install` step and no build step. `package.json` declares no
dependencies. TypeScript runs directly through Node's native type stripping.

SPEED reads the quality gates from [`AGENTS.md`](AGENTS.md) and its settings from
[`speed.toml`](speed.toml).

## Layout

```
specs/          The payments service, as specified. Product, design, architecture, tech
src/            The service. Money, ledger, invariants, payments, risk, the PAN sinks
test/           The suite
corpus/         The manifest schema and one directory per seeded round
course/         The three Engineering 301 courses, one folder each
docs/           How this teaching repository is built. Ours, not the learner's
```

Start with [`specs/README.md`](specs/README.md) if you are here to work on the service.
[`docs/04-plan.md`](docs/04-plan.md) cites the requirement behind every fixture task and
says plainly what is not built yet.

<!-- snapshot:drop -->
## Courses and start states

Engineering 301 follows one change, adaptive authorisation, from definition to delivery
across three courses. Start with [`course/README.md`](course/README.md) if you are here to
teach or take one. Each course folder under [`course/`](course/) carries a snapshot of
this fixture as that course starts, so it can be run fresh or on its own:

| Course | Starts from |
| --- | --- |
| [301.1E Define, Audit, Plan](course/301.1E/) | The baseline: upstream documents, code and tests |
| [301.2E Execute, Integrate, Learn](course/301.2E/) | The reviewed 301.1E output |
| [301.3E Payments Change Validation](course/301.3E/) | The 301.2E candidate, with gaps added |

<!-- /snapshot:drop -->
## Card data

Every card number here is a published scheme test BIN, and they are Luhn-valid on
purpose. Expect your organisation's secret scanning, push protection or DLP to have
opinions about this repository. Tell your security team before it lands, not after. The
Chapter 4 lesson depends on those numbers being present and on the allowlist being
visibly incomplete.

## House rules

Prose follows AP style. No em-dashes, no mirrored sentence pairs, no
negative-then-positive constructions.

`docs/` and `specs/` are exempt only where they quote a third party verbatim.
