# 04. Build plan

Status: phases 1 to 4 and 6 complete, phase 5 partially complete. See the state column. Derived from [00-analysis.md](00-analysis.md),
[01-prd.md](01-prd.md), [02-requirements.md](02-requirements.md) and
[03-manifest-schema.md](03-manifest-schema.md). Every task cites the requirements it
satisfies. A task with no citation does not belong in the plan.

## Sequencing principle

Section 5 of the analysis says write the manifests before the service. The plan follows
that. Phase 1 declares the eight classes and the check set as data. Phase 2 builds the
service to give those classes somewhere natural to live. Building in the other order
produces seeded defects that read as planted.

## Phase 1. Declarations first

| # | Task | Satisfies | State |
| --- | --- | --- | --- |
| 1.1 | `workbench/checks.ts`: every check declared once, with kind, covers, evidence type and cost | FR-11, FR-18, NFR-8 | done |
| 1.2 | `corpus/manifest.schema.json` and a validator | CR-8 | done |
| 1.3 | `corpus/classes.ts`: the eight failure classes as data, so `notExamined` can be computed | FR-21 | done |

## Phase 2. The service

| # | Task | Satisfies | State |
| --- | --- | --- | --- |
| 2.1 | `src/domain/money.ts`: integer minor units, allocation and rounding | FR-3, F7 home | done |
| 2.2 | `src/domain/ledger.ts`: double-entry, balanced pairs | FR-4, FR-9 | done |
| 2.3 | `src/domain/invariants.ts`: the four named invariants | FR-9, FR-10 | done |
| 2.4 | `src/payments/service.ts`: authorise, capture, refund, void | FR-1, FR-2, FR-5, FR-6 | done |
| 2.5 | `src/obs/`: logger, webhook, telemetry, exception serialiser as five PAN sinks | FR-7, F2 home | done |
| 2.6 | `src/vault.ts`: tokenisation, so `NO_PAN_AT_REST` is meaningful | FR-9 | done |
| 2.7 | `test/`: a suite with real coverage and one deliberately weak test | FR-3, F3 home | done |

## Phase 3. The checks

| # | Task | Satisfies | State |
| --- | --- | --- | --- |
| 3.1 | `workbench/hooks/pan-scan.ts`: Luhn, BIN range, allowlist | FR-13, FR-14 | done |
| 3.2 | `workbench/hooks/secret-scan.ts`: patterns and entropy | FR-13 | done |
| 3.3 | `workbench/hooks/taint.ts`: PAN-typed source to sink | FR-13, FR-7 | done |
| 3.4 | `workbench/hooks/scope-guard.ts`: allowed-paths manifest against the diff | FR-13, F6 home | done |
| 3.5 | `workbench/hooks/dep-provenance.ts`: lockfile agreement, no new packages | FR-13 | done |
| 3.6 | `workbench/hooks/typecheck.ts`: resolves every relative import and verifies named imports exist, with no `tsc` required | FR-13, NFR-9, NFR-10 | done |
| 3.7 | `workbench/commands/test.ts` and `invariant.ts` | FR-15, FR-9 | done |
| 3.8 | `workbench/commands/mutation.ts`: changed files only, reports survivors, refuses to run against a red suite | FR-15, FR-16 | done |
| 3.9 | `workbench/commands/property.ts`: generated operation sequences | FR-10, FR-15 | done |
| 3.10 | `workbench/commands/differential.ts`: golden corpus replay | FR-15, F7 home | done |
| 3.11 | `workbench/skills/*.md`: four skill contracts, no agent required to run a chain | FR-18 | done |

## Phase 4. The chain runner

| # | Task | Satisfies | State |
| --- | --- | --- | --- |
| 4.1 | `workbench/chain.yaml`: ordered chain, gates, budget, declared omissions | FR-19 | done |
| 4.2 | `workbench/run.ts`: execute the chain, emit a bundle | FR-20, FR-23, FR-24 | done |
| 4.3 | Compute `notExamined` by subtraction, refuse to emit without it | FR-21, FR-22 | done |
| 4.4 | Budget accounting against the declared limit, plus `--no-gates` | FR-19, NFR-1 | done |

## Phase 5. Corpus

| # | Task | Satisfies | State |
| --- | --- | --- | --- |
| 5.1 | `corpus/round-0/manifest.json`: five defects, one reserved, one pathology | CR-1 to CR-4, CR-6 | done |
| 5.2 | `round-0` branch carrying the seeded diff | CR-1, CR-6 | done |
| 5.3 | `npm run score`: recall, waste, misjudgment, boundary | FR-25, FR-26 | done |
| 5.4 | Paired fixture tags for every check | CR-7 | **not started**, see below |
| 5.5 | Rounds 1 to 5 | CR-1 to CR-5 | **not started**, see below |

## Phase 7. Commands the course already promises

The course site tells learners these exist. They did not. Found by auditing the site's
prepare page against this repository's scripts.

| # | Task | Satisfies | State |
| --- | --- | --- | --- |
| 7.1 | `workbench/doctor.ts`, wired as `npm run workbench:doctor` to match the name the site uses | FR-27 | done |
| 7.2 | `workbench/diff.ts`, wired as `npm run diff`, producing the Chapter 6 re-validation delta | FR-28, FR-29 | done |
| 7.3 | Correct the site's prepare page: it tells learners to run `npm ci` and `npm install`, which NFR-9 forbids, and names `baseline.yaml`, which is `chain.yaml` | NFR-9 | done |
| 7.4 | A profile command for Chapter 1 profile cards | CR-7 | **blocked on 5.4**, the paired fixture tags |

## Phase 6. Delivery

| # | Task | Satisfies | State |
| --- | --- | --- | --- |
| 6.1 | `.github/workflows/chain.yml`, bundle published as an artifact | NFR-6 | done |
| 6.2 | `README.md` with the learner path | G4 | done |
| 6.3 | `npm run verify`: schema, chain, score, the AP style rule, the no-install rule and every command the README names | NFR-7, NFR-11, CR-8 | done |
| 6.4 | `corpus/decisions.example.json`, documented exit codes, and the reason `--no-gates` is needed on round 0 | FR-25, G4 | done |

## Deliberately not done in this pass

**5.4, paired fixture tags.** CR-7 needs roughly 40 annotated tags, each a real ref where
one check's target defect is present or a plausible lookalike is absent. That is content
authoring against the finished check set, and the check set only settled in Phase 3. The
schema and naming convention are fixed, so this is now mechanical rather than uncertain.

**5.5, rounds 1 to 5.** Round 0 proves the manifest, the seeding model and the scorer end
to end. The remaining five rounds are the same shape with different defects, and each
needs its evidence pathology chosen deliberately per CR-4. Estimated at one to two days
of authoring, not of engineering.

**The fluent wrong review pathology.** CR-4 lists it, and it can only be produced by a
skill, which needs a coding agent. The contract is declared in
`workbench/skills/zero-context-review.md`. Recording a canned wrong review for offline
use is the obvious next step and is not yet done.

## Found while building, and fixed

Recording these because each one is a defect the course itself is about.

**Mutation against a red suite reports a confident zero.** A mutant is killed when the
suite fails with it applied. If the suite already fails, every mutant looks killed. The
command now refuses to run and reports silence. This is the exact shape of the lesson:
the check was not wrong, it was answering a different question than the one being asked.

**The first F7 seed was almost an equivalent mutant.** Deriving net from the rate instead
of subtracting the fee changes the result only when the fee lands on exactly half a minor
unit, which no corpus row hit. Replaced with floor rounding on the fee, which diverges on
four of six rows and stays invisible to the suite because fee plus net still equals the
captured amount.

**`NO_PAN_AT_REST` matched every timestamp.** A millisecond timestamp is 13 digits, so a
length-only rule reported every record carrying an `at` field. Now Luhn-validated over
string fields only. The same mistake in a scanner is the difference between a hook people
keep enabled and one they turn off.

**The answer key failed the gate.** The round 0 manifest quoted the test card literally,
and pan-scan scans the whole tree, so a clean main failed on its own documentation. The
manifest names the constant instead.

**The documented learner path did not work.** The README told a learner to pass
`decisions.json` to the scorer, and nothing created it, described its shape or shipped a
template. Following the instructions exactly produced "boundary calibration failed" with
no explanation. There is now a template, the scorer says what is missing and why, and
`npm run verify` fails if the README names a script or file that does not exist. That
last guard is there because the same class of mistake, documentation naming something
nobody kept, had already broken the sibling website's stylesheet.

**A false positive at a gate blinds the chain.** pan-scan gates, and its documented false
positive stopped every check after it on round 0. Kept, because it is a real composition
tradeoff worth arguing about, with `--no-gates` as the escape and a note in the chain file.

## Risks carried

| Risk | Consequence | Mitigation |
| --- | --- | --- |
| Equivalent mutant is fragile | FR-17 fails silently if the mutator changes | `npm run verify` asserts the documented survivor still survives |
| 90-second budget erodes as the corpus grows | NFR-1 fails and the course loses its loop | The runner records `withinBudget` on every run, and CI fails on breach |
| Test BINs trip the host's own scanners | Onboarding friction, possible push protection block | Documented in the README and in the analysis open questions |
| Repository outgrows readability | G3 inverts, reading becomes impossible for the wrong reason | Keep the service under roughly 1,500 lines. Depth comes from blast radius, not volume |
