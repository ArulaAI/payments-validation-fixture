# payments-validation-fixture

The codebase the Engineering 301 pathway works on. A small card-payments
authorisation service with a double-entry ledger, a vendored set of checks, a workflow
runner that emits evidence bundles, and a versioned corpus of seeded defects.

It is not a payments product. It is a teaching artifact that behaves like one, built so
that every defect a learner meets was placed there on purpose and is written down in a
manifest before they meet it.

## Run it

No install. No accounts. No network.

```sh
git clone <this repo> && cd payments-validation-fixture
node --version          # 22 or later
npm test                # the suite
workbench validate         # the whole workflow, emits an evidence bundle
npm run verify          # the repository's rules about itself
npm run workbench:doctor  # what will actually run if you start a workflow now
```

For the course command interface, add the repository's vendored executable to this
shell's path. This does not install anything:

```sh
export PATH="$PWD/bin:$PATH"
workbench diagnose
workbench plan
workbench validate
workbench report
```

There is no `npm install` step and no build step. `package.json` declares no
dependencies, and `npm run verify` fails if that ever stops being true. TypeScript runs
directly through Node's native type stripping.

## What a workflow run tells you

```
  hook     taint                  1 finding    proof
           src/payments/service.ts:67  req reaches application log
  command  mutation               1 finding    counterexample
  command  differential           4 findings   statistical
  skill    zero-context-review    not run      silence      no coding agent configured

  classes not examined
    F5  No check in this workflow examined F5 on this run.
    F6  No check in this workflow examined F6 on this run.
    F8  No check covers F8. It is human-reserved by design.
```

The bottom half is the point. Findings are the easy part. A bundle is honest because it
names every failure class nothing looked at, and the runner computes that list itself by
subtracting what ran from the eight classes. It will not emit a bundle without it.

A skipped check appears with evidence `silence`, never by being absent. Silence and
absence look identical on a dashboard, and telling them apart is the whole skill.

## Vocabulary

The workbench ships three kinds of thing, and the difference matters.

| Kind | Fires when | Evidence it tends to produce |
| --- | --- | --- |
| **hook** | On an event. Nobody has to remember to run it | Proof, within its ruleset |
| **command** | The engineer runs it deliberately | Counterexample or statistical |
| **skill** | The coding agent invokes it by name | Opinion, never proof |

There is no generic noun for all three beyond "check". Do not reintroduce one.

Workflows run without a coding agent. Skills then report silence, which is honest and is
usually a learner's first encounter with the idea.

## Layout

```
specs/          The payments service, as specified. Product, design, architecture, tech
src/            The service. Money, ledger, invariants, payments, risk, the PAN sinks
test/           The suite
workbench/      checks.ts declares everything. hooks/ commands/ skills/ run.ts score.ts
corpus/         Failure classes, the manifest schema, one directory per seeded round
course/         The three Engineering 301 courses, one folder each
docs/           How this teaching repository is built. Ours, not the learner's
```

Start with [`specs/README.md`](specs/README.md) if you are here to work on the service,
and with [`course/README.md`](course/README.md) if you are here to teach or take a course.
[`docs/04-plan.md`](docs/04-plan.md) cites the requirement behind every fixture task and
says plainly what is not built yet.

## Courses and start states

Engineering 301 follows one change, adaptive authorisation, from definition to delivery
across three courses. Each course starts from a tagged commit on this branch, so it can
be run fresh or on its own:

| Tag | Course | Starts from |
| --- | --- | --- |
| `301.1E-start` | Define, Audit, Plan | The baseline: upstream documents, code and tests |
| `301.2E-start` | Execute, Integrate, Learn | The reviewed 301.1E output packet |
| `301.3E-start` | Payments Change Validation | The 301.2E candidate, with planted problems |

A seeded change carries a manifest of ground truth under `corpus/round-N/`. Score your
evidence ledger against it when the course asks you to:

```sh
cp corpus/decisions.example.json decisions.json   # then edit it as you work the round
node workbench/score.ts bundles/<latest>.json corpus/round-N/manifest.json decisions.json
```

`decisions.json` is your evidence ledger. It records what you confirmed, refuted,
escalated and invented. The workflow measures what was surfaced. The ledger is the only
thing that measures your judgment, and boundary calibration cannot pass without it.

To compare a change before and after a repair, diff the two bundles:

```sh
npm run diff -- bundles/<before>.json bundles/<after>.json
```

It separates `newly clean` from `newly silent`, and that distinction is the whole
command. A check that stopped running has no findings, exactly like a check that started
passing. On any summary that counts findings they are the same number. One means the
defect is gone. The other means nobody looked.

Do not read `corpus/round-N/manifest.json` before working the round. It is the answer key.

### Exit codes

| Command | 0 | 1 | 2 |
| --- | --- | --- | --- |
| `workbench validate` | ran, no findings | ran, findings present | refused to emit a bundle |
| `npm run score` | scored, boundary held | boundary calibration failed | bad arguments |
| `npm run verify` | rules hold | a rule is broken | |
| `npm run workbench:doctor` | every hook and command usable | a hook or command is not | |
| `npm run diff` | no check went silent | a check stopped running, or the repair added findings | bad arguments |

A workflow exiting 1 is not a failure. It means checks found something, which is what they
are for. CI treats it that way too.

On the baseline, every check is clean and the workflow exits 0, so any finding on a
seeded round was introduced by that round. Skills report silence until a coding agent is
configured, which is honest and is usually a learner's first encounter with the idea.

## Card data

Every card number here is a published scheme test BIN, and they are Luhn-valid on
purpose. Expect your organisation's secret scanning, push protection or DLP to have
opinions about this repository. Tell your security team before it lands, not after. The
Chapter 4 lesson depends on those numbers being present and on the allowlist being
visibly incomplete.

## House rules

Prose follows AP style. No em-dashes, no mirrored sentence pairs, no
negative-then-positive constructions. `npm run verify` enforces the mechanical parts.

`docs/` and `specs/` are exempt only where they quote a third party verbatim.
