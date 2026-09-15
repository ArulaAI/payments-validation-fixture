# 02. Requirements

Status: draft for review. Built on [01-prd.md](01-prd.md). Every plan task in
[04-plan.md](04-plan.md) cites at least one requirement id from this file.

> **This is our build spec for the teaching repository. Learners never see it.**
>
> It says what this repository must do, in RFC-2119 language, with ids the plan cites.
>
> The document learners actually read is
> [`specs/product/requirement.md`](product/requirement.md), the in-world payments
> requirement. That one is deliberately incomplete. This one explains why.

Keywords follow RFC 2119. MUST is binding. SHOULD is a strong default that needs a
recorded reason to break.

## Functional: the service

**FR-1** The service MUST support authorise, capture, refund and void over an in-memory
store, with no network or database dependency.

**FR-2** Capture MUST support partial capture, and captured MUST never exceed authorised.

**FR-3** All monetary values MUST be integer minor units. Floating point MUST NOT appear
in any money path.

**FR-4** Every state change MUST write a balanced double-entry pair to the ledger.

**FR-5** Authorise and capture MUST accept an idempotency key and MUST return the
original result for a repeated key.

**FR-6** Refund MUST NOT accept an idempotency key. This is the F8 specification gap and
it is deliberate. Any change that adds one MUST also update the requirement document,
which is the point of the exercise.

**FR-7** The service MUST expose an observability surface with at least five distinct
sinks capable of carrying a PAN: application log, webhook error body, telemetry
attributes, test fixture files and a serialised exception path.

**FR-8** Card data used anywhere in the repository MUST be a scheme test BIN. Real or
plausible non-test PANs MUST NOT appear, including in git history.

## Functional: invariants

**FR-9** The repository MUST assert these invariants and expose them to the command tier:

- `LEDGER_BALANCED`: every ledger pair nets to zero
- `CAPTURE_WITHIN_AUTH`: sum of captures never exceeds the authorised amount
- `REFUND_TRACES_CAPTURE`: every refund references a capture that exists
- `NO_PAN_AT_REST`: no stored record contains a full PAN outside the token vault

**FR-10** Invariants MUST be assertable after an arbitrary generated sequence of
operations, not only after a fixed scenario.

## Functional: the checks

**FR-11** Checks MUST be declared in one place, with a machine-readable kind of `hook`,
`command` or `skill`.

**FR-12** Hooks MUST run offline with no account, and SHOULD complete in under ten
seconds in total.

**FR-13** The repository MUST vendor these hooks: `typecheck`, `pan-scan`, `secret-scan`,
`scope-guard`, `dep-provenance`, `taint`.

**FR-14** `pan-scan` MUST apply Luhn validation and a BIN range test, and MUST support an
allowlist. The allowlist MUST be populated with scheme test BINs so that a learner meets
a documented false positive in Chapter 4.

**FR-15** The repository MUST vendor these commands: `test`, `mutation`, `property`,
`invariant`, `differential`.

**FR-16** `mutation` MUST operate over changed files only, and MUST report surviving
mutants with file and line.

**FR-17** The corpus MUST contain at least one equivalent mutant, documented as such, so
that every learner meets a survivor that should not be fixed.

**FR-18** Skills MUST be declared with the same schema as hooks and commands, and MUST
carry the prompt contract the coding agent needs. The repository MUST NOT require a
coding agent in order to run a chain.

## Functional: the chain runner

**FR-19** A chain MUST be declared as data in `workbench/chain.yaml`, giving ordered
checks, gates, a budget and declared omissions.

**FR-20** The runner MUST emit an evidence bundle containing, for every check: the check
id, its kind, its outcome, its evidence type and any findings with file and line.

**FR-21** The bundle MUST contain a `notExamined` array listing every failure class no
check in the chain covers. The runner MUST compute this from the check declarations
rather than accept it as input.

**FR-22** The runner MUST refuse to emit a bundle whose `notExamined` array is absent. An
empty array is permitted only when every class is genuinely covered, which cannot happen
while F8 exists.

**FR-23** Evidence types MUST be one of `counterexample`, `proof`, `statistical`,
`corroborated`, `opinion`, `silence`.

**FR-24** A check that did not run MUST appear in the bundle with evidence type
`silence`. Absence from the bundle MUST NOT be how a skipped check is represented.

## Functional: the corpus

**CR-1** Each round MUST be a git branch carrying `corpus/round-N/manifest.json`.

**CR-2** A manifest entry MUST give: defect id, failure class, file and line, the check
expected to catch it, the evidence type that would count as a catch, and the correct
learner action.

**CR-3** Every round MUST contain exactly one reserved defect that no check reaches.

**CR-4** Every round MUST contain at least one evidence pathology, tagged as one of
`false-positive`, `fluent-wrong-review`, `equivalent-mutant` or `green-because-unexamined`.

**CR-5** Assessment rounds MUST contain a clean control, meaning a change with no seeded
defect, so that a learner who always finds something is detected.

**CR-6** Round 0 MUST seed five defects and MUST be readable as a diff of roughly 210
lines.

**CR-7** Each check MUST have a positive ref where its target defect is present and a
negative ref where a plausible lookalike is absent. Refs MUST be annotated tags named
`fx/<check-id>/positive` and `fx/<check-id>/negative`.

**CR-8** Manifests MUST validate against `corpus/manifest.schema.json`.

## Functional: scoring

**FR-25** `npm run score` MUST compare a bundle against a round manifest and report
recall, waste, evidence misjudgment and boundary calibration.

**FR-26** Boundary calibration MUST reward escalating the reserved defect and MUST
penalise inventing a defect that the manifest does not contain.

## Functional: readiness and re-validation

**FR-27** `npm run workbench:doctor` MUST report every check as `ready`, `misconfigured`
or `unavailable`, and MUST report the environment it depends on. It MUST exit non-zero
when a hook or command is not ready, and MUST exit zero when only skills are unavailable.
An unavailable skill is survivable because a chain runs without a coding agent. An
unavailable hook is not.

**FR-28** `npm run diff` MUST compare two evidence bundles and report, per check:
`newly clean`, `newly failing`, `unchanged` and `newly silent`. It MUST also diff the
`notExamined` lists.

**FR-29** `newly silent` MUST be reported separately from `newly clean`. A check that
stopped running looks identical to a check that started passing on any summary that
counts findings, and mistaking one for the other is how a repair hides a regression.

## Non-functional

**NFR-1** A full chain MUST complete in under 90 seconds on a laptop. The hook tier
SHOULD complete in under ten seconds.

**NFR-2** A clean clone MUST run every hook and command with no network access.

**NFR-3** Runtime dependencies MUST be zero.

**NFR-4** The repository MUST run on Node 22 or later using native type stripping, with
no build step.

**NFR-5** History MUST be stable. Round branches and fixture tags MUST NOT be
force-pushed once published, because learners pin against them.

**NFR-6** CI MUST run the chain on push and MUST publish the bundle as an artifact.

**NFR-7** Prose in this repository follows AP style. No em-dashes, no mirrored sentence
pairs, no negative-then-positive constructions. Verbatim third-party text is exempt.

**NFR-8** The vocabulary is hooks, commands and skills. The word "instrument" MUST NOT be
used as a generic noun. An ordered set of checks is a **chain**. The word "battery" MUST
NOT be used, even though the client used it once in MS3, because the course settled on
"chain" and one word has to win. Verbatim quotation of the client is the only exception.

**NFR-9** The entire codebase MUST run locally with no install step. `git clone` followed
by `npm test`, `npm run chain`, `npm run score` and `npm run verify` MUST all work
before `npm install` has ever been run, and with no network access. There MUST be no
required `dependencies` or `devDependencies` in `package.json`.

**NFR-10** Any tool that cannot meet NFR-9, such as `tsc`, MUST be optional. A check that
depends on an absent optional tool MUST report `ran: false` with evidence `silence` per
FR-24, rather than failing the chain. This is deliberate: a learner meeting a real
silence in their first chain run is the cheapest possible introduction to the idea.

**NFR-11** `npm run verify` MUST assert NFR-9 by failing if `package.json` declares any
required dependency.

## Traceability

| Goal | Requirements |
| --- | --- |
| G1 every defect documented | CR-1, CR-2, CR-3, CR-6, CR-8 |
| G2 runner reports omissions | FR-21, FR-22, FR-24 |
| G3 hand reading fails | FR-7, CR-6, and the blast-radius design in 00-analysis |
| G4 nothing blocks on an account | FR-12, FR-18, NFR-2, NFR-3, NFR-9, NFR-10, NFR-11 |
| G5 one class unreachable | FR-6, FR-21, CR-3 |
