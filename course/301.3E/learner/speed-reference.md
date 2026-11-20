# 301.3E SPEED command reference

This reference describes the pinned SPEED build, commit `a8bde62` (see
[SPEED version](../../README.md#speed-version)). Every command and behavior below was checked
against that commit's source.

## Command map

| Command | Inputs and effects | What to inspect |
| --- | --- | --- |
| `speed status --feature adaptive-auth` | Reports task and feature state | Done, blocked and pending counts together |
| `speed diagnose --feature adaptive-auth --task N` | Diffs the task's branch against `MAIN_BRANCH` and counts F1 to F8 signals from `.speed/classes.yaml`. No tests, no model. Writes `risk-surface.yaml` and evidence | Each signal's file, line and matched text |
| `speed review --feature adaptive-auth --task N` | A clean-context reviewer reads the task's diff and declared files. Writes `.speed/features/adaptive-auth/reviews/task-N.review` and leaves the task's status unchanged | What the reviewer was given, and which findings you can check in the code |
| `speed eval --feature adaptive-auth --task-id N` | Runs the feature's scenarios and records each test outcome with its evidence | Which assertions passed, and what they do and do not cover |
| `speed new defect <name>` | Scaffolds `specs/defects/<name>.md` from SPEED's defect template | The requirement, reproduction and fix check you write into it |
| `speed plan --defects <file> [<file> …] --feature <name>` | Plans repair tasks from explicit defect files (no directory globs) | Each repair task's scope against its report |
| `speed verify --feature <name>` | A blind reader checks the repair plan against the reports | The verdict and which report each finding is about |
| `speed run --feature <name>` | Agents carry out the repair tasks | Each defect's own check, the suite, and the repair's diff |

## Behavior the course relies on

| Behavior | Lesson and operator response |
| --- | --- |
| Diagnose diffs `MAIN_BRANCH...task-branch`. Every task is already merged into `main`, so against `main` the diff is empty and every class shows 0 | Set `MAIN_BRANCH=baseline` in every terminal |
| SPEED reads task branches locally; a clone holds them only as `origin/...` | Run the branch line from the README after cloning |
| Diagnose has no F5 rule, so self-approval always shows 0 | A zero means nothing matched, not that nothing is wrong |
| F8 compares new names with the F2.1 tech spec named in `speed.toml` (`[diagnose] spec_file`) | An F8 signal is a name the spec never uses; read it before calling it a gap |
| A diagnose signal is a routing hint. Every verdict in `risk-surface.yaml` starts undecided | Fill in verdicts after checking, not before |
| Review's prompt holds the diff and declared files, not the task's description or acceptance criteria | Check a finding against the spec yourself |
| `speed plan --defects` takes explicit file paths only | List each defect file |
| A repair that removes or loosens an assertion still turns the suite green | Read the repair's diff for changed tests |

## Source anchors

| Source | Relevant implementation |
| --- | --- |
| `lib/cmd/diagnose.sh`, `lib/diagnose_engine.py` | Diff base, class rules and evidence |
| `lib/cmd/review.sh` | Review prompt inputs and the written review |
| `lib/cmd/eval.sh` | Scenario runs and recorded outcomes |
| `lib/cmd/project.sh` | `speed new defect` scaffolding |
| `lib/cmd/plan.sh` | `--defects` argument handling |
