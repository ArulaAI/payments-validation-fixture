# 01. Product requirements

Status: draft for review. Built on [00-analysis.md](00-analysis.md).

## Product

`payments-workbench-fixture` is the codebase the Validation Workbench course validates.
It is a small card-payments authorisation service with a double-entry ledger, shipped
alongside a vendored set of checks, a chain runner that emits evidence bundles and a
versioned corpus of seeded defects.

## Users

| User | What they do with it | What they need from it |
| --- | --- | --- |
| Learner | Forks it, runs chains against seeded rounds, writes a rule in Chapter 7 | Fast feedback, honest evidence, no setup cliff |
| Instructor | Seeds rounds, scores the Chapter 8 run | Manifests as data, a scoreable bundle format |
| Course author | Adds a failure class or a check | One place to declare a check, one place to declare a defect |

The learner is the primary user. Every design tradeoff resolves in favour of a learner
who has 90 seconds of patience and no appetite for toolchain debugging.

## Product goals

**G1. Every defect a learner meets is documented before they meet it.** No defect exists
in a round that is absent from its manifest. This is what makes the course scoreable and
what separates this from a repository that merely has bugs.

**G2. The chain runner reports what it did not examine.** The central lesson is that
silence is not absence. A bundle that lists findings without listing unexamined classes
is a broken bundle, and the runner must make that structurally impossible.

**G3. Hand reading fails on merit.** A learner who tries to read the diff should miss
defects because reading cannot find them, not because the diff is artificially long.

**G4. Nothing blocks on an account.** Hooks and commands run offline against a clean
clone. Only skills need the learner's own coding agent.

**G5. One failure class stays unreachable.** F8, the specification gap, has no check that
decides it. The repository must make that visible rather than merely true.

## Non-goals

- Production readiness. No persistence, no auth, no deployment. It runs in memory.
- Completeness as a payments product. Only the flows the eight failure classes need.
- Real cardholder data of any kind, ever, including in history.
- Replacing the learner's coding agent. Skills are defined here and invoked there.

## The eight failure classes and where each lives

The service exists to give each class a natural home. This table is the bridge from the
course's matrix to this codebase.

| Class | Lives in | Natural defect |
| --- | --- | --- |
| F1 hallucinated surface | Any module | A call to a method or config key that does not exist |
| F2 cardholder data leakage | `obs/` sinks | A PAN into a log line, a webhook error body or a serialised exception |
| F3 weak test | `test/` | An assertion that passes against a balance that never moved |
| F4 broken invariant | `domain/ledger` | Refund applied twice on retry, because refund has no idempotency key |
| F5 sycophantic approval | The authoring transcript | An agent approving its own change |
| F6 wrong problem | Diff shape | A strategy factory where a rounding fix was asked for |
| F7 silent regression | `domain/money` | Partial-capture rounding drifts by one cent |
| F8 specification gap | The requirement | Nothing says whether refunds are idempotent |

F4 and F8 deliberately touch the same behaviour. F4 is the mechanism, a lost update on
retry. F8 is the reason nobody decided what should happen. A learner who fixes F4 without
escalating F8 has patched a symptom, which is the Chapter 5 lesson.

## Success criteria

The repository succeeds when all of the following are true.

1. A clean clone runs `npm run chain` and produces an evidence bundle in under 90
   seconds with no network access.
2. Round 0 seeds five defects. A typical room finds one or two by hand in six minutes.
3. Every check has a positive ref where its target defect is present and a negative ref
   where a plausible lookalike is absent.
4. The bundle names classes not examined, and that list is never empty.
5. The Chapter 4 pathologies are reproducible: the allowlisted test-BIN false positive
   fires for every learner, and the equivalent mutant survives for every learner.
6. `npm run score` computes recall, waste, evidence misjudgment and boundary calibration
   against a round manifest.
