# payments-validation-fixture

The codebase the Engineering 301 pathway works on. A small card-payments authorization
service with a double-entry ledger, its specs and its tests.

It is not a payments product. It is a teaching artifact that behaves like one. Every check
a learner runs on it comes from SPEED, not from this repository.

## Run it

No install. No accounts. No network.

```sh
git clone <this repo> && cd payments-validation-fixture
node --version          # 22 or later
npm test                # the suite: 93 tests
```

There is no `npm install` step and no build step. `package.json` declares no dependencies.
TypeScript runs directly through Node's native type stripping.

## The service

**F1 Payments** is what exists today. A gateway authorizes a card payment, captures all or
part of it, refunds against a capture and voids an uncaptured one. Every movement of money is
a balanced pair of ledger entries, and card numbers stay in a vault: the rest of the service
sees a token and a masked card.

**F2 Adaptive authorization** is the change the pathway delivers. It has two parts that share
one bank step-up challenge:

| Part | The problem today | The change |
| --- | --- | --- |
| F2.1 High-value traveler | A genuine customer abroad buying a £2,499 television is declined by a blanket cross-border rule | Score the payment; approve, ask the bank to confirm, hold for review or decline |
| F2.2 Card testing | A script tries 40 stolen cards across 20 merchants, one each, and every attempt is approved | Detect the burst across merchants and challenge further attempts on that card range |

Tests `GW-02` and `GW-05` in `test/gateway.test.ts` record today's behavior: the traveler
is declined and the attack is approved.

## Layout

```
specs/          The service as specified: product, architecture, design, tech, defects
src/            The service: money, ledger, invariants, payments, risk rules, the vault, log sinks
test/           The suite and its fixtures (cards, traffic)
corpus/         The round manifest schema and an example decisions file
course/         The three Engineering 301 courses, one folder each
docs/           How this teaching repository is built. Ours, not the learner's
.claude/, .agents/   The authoring skill used in 301.1E, for Claude Code and Codex
```

Start with [`specs/README.md`](specs/README.md) if you are here to work on the service.
The F2 documents are under `specs/*/adaptive-auth/`, and the existing service is
`specs/product/payments.md` and `specs/tech/payments.md`.

## SPEED settings

SPEED reads three files from this repository:

| File | What SPEED reads |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | The quality gates. Only `test: npm test` is listed, so lint and typecheck do not run |
| [`speed.toml`](speed.toml) | Agent models, the plan task cap (8), and where `speed diagnose` finds its rules and spec |
| [`.speed/classes.yaml`](.speed/classes.yaml) | The F1 to F8 failure-class rules `speed diagnose` counts |

<!-- snapshot:drop -->
## The Engineering 301 pathway

Three 120-minute, hands-on courses follow one change, F2 adaptive authorization, from its
documents to a validated release decision. Each course starts from a snapshot of this
fixture, so any course can run on its own, and each hands the next something a person can
check.

| Course | Starts from | Engineers | Hands on |
| --- | --- | --- | --- |
| [301.1E Define, Audit, Plan](course/301.1E/) | Seven upstream documents, the code and two draft tech specs | Validate the documents, settle what is theirs to decide, audit the specs, plan and verify | Reviewed tech specs, owner questions and a 10-task plan |
| [301.2E Execute, Integrate, Learn](course/301.2E/) | That plan | Supervise agents building it, recover stopped tasks, decide what may be integrated, review what the run teaches | A built candidate with its review findings, blocked tasks and learning |
| [301.3E Payments Change Validation](course/301.3E/) | The integrated candidate, green on every check | Test each claim against what it cites; confirm, refute or escalate; repair what is theirs | Defect reports, a verified repair and one escalation to the owners |

The story is the same at every step. Engineers decide what the sources support, send every
other decision to its named owner, and say what each tool checked and what it could not see.

### Run a course

Every course folder has the same shape:

| Path | What it is |
| --- | --- |
| `README.md` | Set up and run the course. Start here |
| `snapshot/fixture.bundle` | The fixture as the course starts, with its git history |
| `learner/` | What engineers use in the session |
| `instructor/` | Trainer brief, framework, speaker script, facilitator guide, assessment, rehearsal record and answer keys |
| `overview.html`, `overview.pdf` | The course overview, one page per section |

To start, clone that course's snapshot and follow its README:

```sh
git clone course/301.2E/snapshot/fixture.bundle payments-validation-fixture
```

301.2E also has a recorded checkpoint, `instructor/checkpoint/after-run.bundle`, for the
stages a live run cannot reach in the time.

### SPEED version

All three courses run one SPEED build: `ArulaAI/workbench`, branch `301`, commit `a8bde62`.
Put that checkout first on `PATH`. Every command, output and source line the material cites
was checked against it. See [`course/README.md`](course/README.md#speed-version).

### How the snapshots were made

- **301.1E:** this branch's fixture, squashed to one commit, without `course/` and without
  this section.
- **301.2E:** one real run of 301.1E. Its reviewed specs, plan and verify log are committed.
- **301.3E:** the 301.2E run carried on to an integrated candidate, with five gaps written as
  the agents' own work.

The runs used Codex as SPEED's provider. Logs were cleaned afterwards: lab paths, a neutral
learner identity, no provider traces. Each course's `instructor/rehearsal.md` says exactly
what was run and what was not. [`course/make-snapshot.sh`](course/make-snapshot.sh) rebuilds
a bundle.

### Answer keys

Answer keys live in `instructor/` and never go in a snapshot:

- 301.1E: [`facilitator-gap-map.md`](course/301.1E/instructor/facilitator-gap-map.md), the gaps in the upstream documents and their owners;
- 301.2E: the stage keys in [`facilitator-guide.md`](course/301.2E/instructor/facilitator-guide.md);
- 301.3E: [`gap-design.md`](course/301.3E/instructor/gap-design.md), every gap with its file and line.

### Status

All three courses have their snapshot, material and overview. Before live delivery, each
needs one rehearsal with Claude Code as SPEED's provider and a cohort to calibrate timing and
scoring. In 301.3E, review, eval, plan, verify and run have not yet been run on the snapshot.
[`course/README.md`](course/README.md#status) has the detail.

<!-- /snapshot:drop -->
## Card data

Every card number here is a published scheme test number, and they are Luhn-valid on
purpose. Expect your organization's secret scanning, push protection or DLP to flag this
repository. Tell your security team before it lands, not after. The courses depend on those
numbers being present.

## House rules

Prose follows AP style, with American spelling. No em-dashes, no mirrored sentence pairs,
no negative-then-positive constructions.

`docs/` and `specs/` are exempt only where they quote a third party verbatim.
