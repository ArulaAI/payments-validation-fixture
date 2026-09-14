# payments-workbench-fixture

The codebase the Validation Workbench course validates. A small card-payments
authorisation service with a double-entry ledger, a vendored set of checks, a chain
runner that emits evidence bundles, and a versioned corpus of seeded defects.

It is not a payments product. It is a teaching artifact that behaves like one, built so
that every defect a learner meets was placed there on purpose and is written down in a
manifest before they meet it.

## Run it

No install. No accounts. No network.

```sh
git clone <this repo> && cd payments-workbench-fixture
node --version          # 22 or later
npm test                # the suite
npm run chain         # the whole chain, emits an evidence bundle
npm run verify          # the repository's rules about itself
```

There is no `npm install` step and no build step. `package.json` declares no
dependencies, and `npm run verify` fails if that ever stops being true. TypeScript runs
directly through Node's native type stripping.

## What a chain run tells you

```
  hook     taint                  1 finding    proof
           src/payments/service.ts:67  req reaches application log
  command  mutation               1 finding    counterexample
  command  differential           4 findings   statistical
  skill    zero-context-review    not run      silence      no coding agent configured

  classes not examined
    F5  No check in this chain examined F5 on this run.
    F6  No check in this chain examined F6 on this run.
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

Chains run without a coding agent. Skills then report silence, which is honest and is
usually a learner's first encounter with the idea.

## Layout

```
specs/          The PRD, requirements and plan. Read these first
src/            The service. Money, ledger, invariants, payments, the PAN sinks
test/           The suite
workbench/      checks.ts declares everything. hooks/ commands/ skills/ run.ts score.ts
corpus/         Failure classes, the manifest schema, one directory per round
docs/           requirement.md, which is what the skills compare the code against
```

Start with [`specs/04-plan.md`](specs/04-plan.md). It cites the requirement behind every
task and says plainly what is not built yet.

## Rounds

Each round is a branch carrying a manifest of ground truth.

```sh
git switch round-0
npm run chain -- --no-gates
node workbench/score.ts bundles/<latest>.json corpus/round-0/manifest.json decisions.json
```

Round 0 seeds five defects. Four are reachable by some check. One is not, and the correct
response to that one is to escalate rather than to fix. It also carries three evidence
pathologies, including a false positive that fires for every learner and an equivalent
mutant that no test can ever kill.

Do not read `corpus/round-N/manifest.json` before working the round. It is the answer key.

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
