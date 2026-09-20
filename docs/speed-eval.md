# Run SPEED eval with task-derived mappings

## Goal and baseline

This checkout is `/Users/mohitpatel/Desktop/inrhythm/payments-validation-fixture`, branch `test/speed-eval`, derived from `round-0` (`965029f`). It retains the seeded payment implementation and all existing assertions. The only changes to the 18 test cases are stable scenario-ID prefixes in their titles.

The test specification precedes task planning, so ownership now lives in existing task acceptance criteria. The test spec has no Task/Selector/Test name mapping table. The course's `workbench validate` and external `speed eval` remain separate workflows. Passing weak existing tests does not prove every seeded defect is absent.

## Inputs and ownership

- [Test specification](../specs/tests/payments.md): 22 scenarios, outcomes, traceability and explicit deferrals. It is read-only during eval.
- [Task fixture](../specs/tests/speed-eval-tasks.json): existing task fields with `[SCENARIO-ID]` criteria and `verify_by: test`. Criteria are stored as bullet text, matching the existing task writer. No schema fields were added.
- [Service tests](../test/service.test.ts), [money tests](../test/money.test.ts), [ledger tests](../test/ledger.test.ts), [refund retry test](../test/refund-retry.test.ts): individual titles carry matching IDs.
- [Runner configuration](../speed.toml): Node JUnit command and allowed test file pattern.
- [Setup script](../bin/setup-speed-eval.py): seeds the two done fixture tasks and idle feature state. This reproducible fixture is not an actual LLM-generated plan or completed SPEED integration.

Task 1 owns AC-01 and AC-02 in service tests plus VAL-01 in money tests. Task 2 owns the other 19 scenarios across four files, including four missing tests. Both tasks share files but have distinct individual selections.

## Fresh setup and run

```bash
cd /Users/mohitpatel/Desktop/inrhythm/payments-validation-fixture
export SPEED_CLI=/Users/mohitpatel/Desktop/inrhythm/Workbench/.claude/worktrees/task-scoped-eval/speed
export SPEED_PYTHON=/Users/mohitpatel/Desktop/inrhythm/Workbench/.venv/bin/python
export SPEED_PROJECT_ROOT="$PWD"
export PATH="/opt/homebrew/bin:$PATH"

python3 bin/setup-speed-eval.py --reset

bash "$SPEED_CLI" eval --feature payments --task 1 --strict --skip-judge --no-defects
bash "$SPEED_CLI" eval --feature payments --strict --skip-judge --no-defects
bash "$SPEED_CLI" eval --feature payments --task 2 --strict --skip-judge --no-defects
```

`--reset` replaces only `.speed/features/payments` and records the active feature. It does not reset source commits. Switching branches alone does not regenerate `.speed`. Node must support TypeScript stripping; this machine uses Node 24.4.1. The SPEED Python runtime needs its JS/TS tree-sitter grammar packages.

Do not join all three eval commands with `&&`: strict exit 2 is an expected completed, unaccepted evaluation. Automated missing tests do not go to an LLM judge. `--no-defects` avoids changing the seeded corpus during validation.

## Flow and outputs

```text
Scenario catalog, authored before planning
  -> task criteria with scenario IDs + files_touched
  -> implemented tests with the same IDs
  -> eval selects task or feature scope
  -> discover individual tests in configured candidate files
  -> generate test-plan.json
  -> run exact title selectors; collect JUnit evidence
  -> scenario-results.json
  -> aggregate scenario rows + criterion rows + coverage/build gates
  -> report.json + summary.md + residue.json + evaluation YAML
```

Criteria reuse scenario evidence; they do not run tests again. Thus report-row counts exceed actual executed-test counts. A title mismatch or missing test stays unverified even when every other test in that file passes. Full feature evaluation also flags catalog scenarios omitted by task planning.

| Scope | Exact tests expected | Scenario/criterion rows | Final YAML |
|---|---|---|---|
| Task 1 | 3 across 2 files | 3 scenarios + 3 criteria | `.speed/features/payments/evaluation-task-1.yaml` |
| Task 2 | 15 across 4 files | 19 scenarios + 19 criteria | `.speed/features/payments/evaluation-task-2.yaml` |
| Feature | 18 across 4 files | 22 scenarios + 22 criteria + 2 gates | `.speed/features/payments/evaluation.yaml` |

RISK-01 (PAN in error logs), RISK-02 (capture fee rounding), AC-12 (capture idempotency) and EDGE-01 (exact full-refund boundary) intentionally lack tests. They block their owning task and the feature. Feature gates additionally report TR12's absent scenario coverage and incomplete `speed integrate`. Done fixture tasks do not establish integration.

AC-01's ledger net zero means two accounting entries balance, not that a customer's card balance became zero. RETRY-01 records the round-0 two-refund assertion; it neither validates the retry helper nor resolves OOS-01's refund idempotency decision.

### Open generated artifacts

- Task 1: [plan](../.speed/features/payments/eval/task-1/test-plan.json), [report](../.speed/features/payments/eval/task-1/report.json), [summary](../.speed/features/payments/eval/task-1/summary.md), [YAML](../.speed/features/payments/evaluation-task-1.yaml).
- Task 2: [plan](../.speed/features/payments/eval/task-2/test-plan.json), [report](../.speed/features/payments/eval/task-2/report.json), [summary](../.speed/features/payments/eval/task-2/summary.md), [YAML](../.speed/features/payments/evaluation-task-2.yaml).
- Feature: [plan](../.speed/features/payments/eval/test-plan.json), [report](../.speed/features/payments/eval/report.json), [summary](../.speed/features/payments/eval/summary.md), [YAML](../.speed/features/payments/evaluation.yaml).
- [Validation metadata](../.speed/features/payments/logs/validation.json) and stdout/stderr logs are under `.speed/features/payments/logs/`.

Each output root retains `runs/<id>/` input snapshots and `commands/<id>/` raw reports/logs. `residue.json` is for unresolved semantic criteria; missing automated tests stay in the deterministic report. The current runtime does not generate `gaps.json`. Task runs do not overwrite feature results. `.speed` stays Git-ignored and must be regenerated in another checkout.

## Observed fresh results

Validated 2026-09-20 against clean fixture input commit `924a28e`, using Workbench implementation `ee22459` and Node 24.4.1. This documentation update does not change the tested source or inputs.

| Scope | Actual tests passed | Full report: pass / unverified | Accepted | Strict exit | Run ID |
|---|---|---|---|---|---|
| Task 1 | 3 | 6 / 0 | Yes | 0 | `9b8818c518cf4fb3b4a426f395f0773d` |
| Feature | 18 | 36 / 10 | No | 2 | `db577c75b0f843a68997b896c047806d` |
| Task 2 | 15 | 30 / 8 | No | 2 | `61607ceb2f0d4d21a3b59442a3ddf9dd` |

The four missing scenarios each also have an unverified owning criterion, accounting for eight unverified rows. Feature evaluation adds the two coverage/integration gate rows. No assertion failed among the selected implemented tests.

Verified:

- [x] Source and assertions match round-0 after removing only test-title ID prefixes.
- [x] Task 1 runs exactly its three tests across two files; task 2 runs its 15 across four files.
- [x] Every execution produces exactly one passing JUnit testcase with an exact test-name filter.
- [x] All generated plans identify `selection.source` as `task_criteria`.
- [x] Missing tests remain visible at task and feature levels.
- [x] Task JSON and test specification are unchanged by eval.
- [x] Task 2 leaves the completed feature plan/report/YAML unchanged.
- [x] Published JSON and YAML fields agree; JSON also carries the existing `applicable` summary count.
- [x] Evidence paths point into this actual repository, with clean tested build provenance.
- [x] `npm test` passes all 18 tests.

`npm run verify` still reports the existing course-corpus failure: "the course teaches F1, F4, F5, F6 but no round seeds a defect for them." The same failure was previously reproduced on an untouched round-0 archive; it is outside this mapping change. Its output is retained in `.speed/features/payments/logs/npm-verify.log`.

Workbench also passed 233 distinct Python cases plus three subtests across two installed runtimes, and 132 shell checks. The five-tests/shared-file regression proves that tests 3 and 4 pass their task even when unrelated test 2 fails; the feature run catches test 2. Mixed pytest backend and Vitest/Jest frontend selection is tested separately from this Node-only payments repository.
