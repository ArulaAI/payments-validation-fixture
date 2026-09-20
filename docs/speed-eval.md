# Run SPEED eval on round 0

## Goal and branch

`test/speed-eval` starts at `round-0` commit `965029f`. The README uses this branch for the course's seeded-defect exercise. Earlier SPEED integration tests used a copy of `codex/payments-test-spec`, which derives from `main`; those results are a different baseline.

This branch keeps the round-0 payment implementation and all four test files intact. It adds the test specification, exact scenario-to-task-to-test mappings, Node runner configuration, and a repeatable local task setup. The `.speed` ignore rule and repository scanner exclusion keep generated runtime evidence out of Git and source checks, matching the later main-branch housekeeping.

The course's `workbench validate` and the external `speed eval` are separate workflows. This exercise runs SPEED eval. Passing the mapped tests cannot prove every seeded defect is absent, especially where the tests have weak assertions or required tests are missing.

## Inputs

- [Test specification](../specs/tests/payments.md): scenario catalog, missing scenarios, explicit task ownership, test files, and exact individual test titles.
- [Task fixture](../specs/tests/speed-eval-tasks.json): two evaluation fixture tasks in the existing task JSON structure. `status: done` makes them eligible for eval; it does not assert that every scenario passes. There are no additional acceptance criteria in these fixtures.
- [Runner configuration](../speed.toml): Node JUnit command and the test file pattern.
- [Setup script](../bin/setup-speed-eval.py): copies the two task definitions into `.speed/features/payments/tasks/` and initializes feature state. It does not generate the test plan or report.

Task 1 maps AC-01 and AC-02 in `service.test.ts`, plus VAL-01 in `money.test.ts`. Task 2 owns the remaining tests across four files and the four declared missing scenarios. The shared files exercise individual test selection. The extra round-0 test is RETRY-01 in `refund-retry.test.ts`; its two-refund assertion records current behavior and does not settle the open refund idempotency policy or test the retry helper.

## Fresh setup and commands

Run from this repository. Use the updated SPEED implementation, because an older installed `speed` may only understand file mappings. The paths below identify the implementation tested on this machine; set them to the corresponding checkout and Python runtime elsewhere.

```bash
cd /Users/mohitpatel/Desktop/inrhythm/payments-validation-fixture
export SPEED_CLI=/Users/mohitpatel/Desktop/inrhythm/Workbench/.claude/worktrees/task-scoped-eval/speed
export SPEED_PYTHON=/Users/mohitpatel/Desktop/inrhythm/Workbench/.venv/bin/python
export SPEED_PROJECT_ROOT="$PWD"

python3 bin/setup-speed-eval.py --reset

bash "$SPEED_CLI" eval --feature payments --task 1 --strict --skip-judge --no-defects
bash "$SPEED_CLI" eval --feature payments --strict --skip-judge --no-defects
bash "$SPEED_CLI" eval --feature payments --task 2 --strict --skip-judge --no-defects
```

`--reset` replaces only the payments feature's local state and generated outputs. Use the setup command without `--reset` in a checkout without payments state. Switching branches alone does not regenerate `.speed`.

The commands are separate: a strict exit of 2 is an expected completed, unaccepted evaluation. Do not join them with `&&` if you want all three to execute. `--skip-judge` keeps this run deterministic; missing automated tests are not sent to a judge. `--no-defects` leaves the seeded corpus unchanged rather than filing defect documents during this evaluation.

## Output flow

```text
specs/tests/payments.md + tasks/*.json + speed.toml
  -> select the feature or task scenarios
  -> test-plan.json
  -> execute exact individual tests and record JUnit evidence
  -> scenario-results.json
  -> combine evidence and coverage gaps
  -> report.json + summary.md + residue.json + evaluation YAML
```

| Scope | Plan and report directory | Final YAML | Expected baseline |
|---|---|---|---|
| Task 1 | `.speed/features/payments/eval/task-1/` | `.speed/features/payments/evaluation-task-1.yaml` | 3 passed, accepted, strict exit 0 |
| Task 2 | `.speed/features/payments/eval/task-2/` | `.speed/features/payments/evaluation-task-2.yaml` | 15 passed, 4 unverified, strict exit 2 |
| Feature | `.speed/features/payments/eval/` | `.speed/features/payments/evaluation.yaml` | 18 passed, 6 unverified, strict exit 2 |

The four missing scenarios are RISK-01, RISK-02, AC-12, and EDGE-01. The feature report also includes COVERAGE-01 for TR12 and BUILD-INTEGRATED because this fresh feature has not completed `speed integrate`. Its 24 rows contain 22 scenarios and two gate results. Exactly 18 tests execute. OOS-01 remains an unresolved product decision even when RETRY-01 passes.

Each output directory contains `test-plan.json`, `scenario-results.json`, `report.json`, `summary.md`, `residue.json`, and `latest-attempt.json`. The `runs/<run-id>/` directory keeps input snapshots and raw evidence under `commands/<command-id>/`: JUnit XML, output log, and structured result JSON. Task runs publish their own outputs and do not replace the feature report. Generated files stay local and Git-ignored; the tracked inputs and setup script reproduce them.

## Validation checklist

- [x] Confirm the branch descends from round-0 and application code/tests have no diff from it.
- [x] Run all 18 existing round-0 tests as the baseline.
- [x] Generate fresh runtime state from the tracked task fixture.
- [x] Run task 1 and confirm exactly three individual selections across two files.
- [x] Run the feature and confirm all 18 individual tests plus visible missing coverage.
- [x] Run task 2 and confirm task 1 scenarios are excluded while missing scenarios remain visible.
- [x] Confirm task evaluation does not overwrite the feature report.
- [x] Verify report/YAML consistency, local evidence paths, and unchanged task JSON.

## Observed live results

Validated on 2026-09-20 using Node 24.4.1 and the updated SPEED checkout at `da7670d` (`feat/eval-test-spec-template`). The three evaluations ran against clean fixture commit `3f2f2bb`; this later documentation update does not change the tested setup, code, or mappings. The raw evidence paths now point to this repository rather than a temporary copy.

| Scope | Strict exit | Tests passed | Unverified results | Run ID |
|---|---|---|---|---|
| task-1 | 0 | 3 | 0 | `10b41d50276f40e49710f3963595f4f3` |
| feature | 2 | 18 | 6 | `c253bd1e281645dfa5be293741889500` |
| task-2 | 2 | 15 | 4 | `c36371820bed4edbbe6647be6928e4e1` |

All 18 tests also passed with `npm test`. Every eval command produced exactly one selected testcase in its JUnit report. Task 1 ran three test bodies across two files; task 2 ran 15 across four files. The task inputs stayed byte-for-byte unchanged, and task 2 left the full feature report unchanged. The JSON and YAML results agree.

`npm run verify` reports one existing failure: "the course teaches F1, F4, F5, F6 but no round seeds a defect for them." Running the same verifier on an unmodified archive of `round-0` produced the same failure. No corpus repair is included in this eval setup.

The feature result remains unaccepted because four automated scenarios have no tests, TR12 has no scenario coverage, and SPEED integration has not been performed. No semantic judge or defect-generation run was needed for these checks.

### Open the live outputs

- [Task 1 plan](../.speed/features/payments/eval/task-1/test-plan.json), [report](../.speed/features/payments/eval/task-1/report.json), [summary](../.speed/features/payments/eval/task-1/summary.md), and [YAML](../.speed/features/payments/evaluation-task-1.yaml).
- [Task 2 plan](../.speed/features/payments/eval/task-2/test-plan.json), [report](../.speed/features/payments/eval/task-2/report.json), [summary](../.speed/features/payments/eval/task-2/summary.md), and [YAML](../.speed/features/payments/evaluation-task-2.yaml).
- [Feature plan](../.speed/features/payments/eval/test-plan.json), [report](../.speed/features/payments/eval/report.json), [summary](../.speed/features/payments/eval/summary.md), and [YAML](../.speed/features/payments/evaluation.yaml).
- [Validation metadata](../.speed/features/payments/logs/validation.json), command stdout JSON, and stderr logs are in `.speed/features/payments/logs/`.

These links require the generated local `.speed` directory. To regenerate it in another checkout, follow the setup and CLI commands above.
