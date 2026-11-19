# 301.2E source delta and rehearsal record

Pinned SPEED source: `a8bde62` (see [SPEED version](../../README.md#speed-version)). The
[manifest](speed-source-manifest.json) holds file hashes at that commit, and the
[summary](rehearsal-summary.json) records the checks below. The course runs on the
301.1E payments fixture, includes Learn and totals 120 minutes.

## Verified source changes and their course consequences

| Area | Delta from the earlier source | Required lesson |
| --- | --- | --- |
| Run target | Run records its starting branch in the feature's base_branch; valid recorded base is reused; MAIN_BRANCH wins | Inspect environment, current branch and record together before mutation |
| Syntax gate | Compares against git_main_branch rather than hardcoded main | Use the actual run target when interpreting scoped changes |
| Tasks/dependencies | Invalid task JSON is named; unknown dependency IDs are distinct from explicit cycle paths | Diagnose the actual graph problem before retrying |
| CLI | Missing option values and invalid max-parallel receive explicit errors | Treat malformed invocation as configuration failure, preserving its output |
| Guardian | Human verdicts use stderr; stdout verdict JSON requires --json; ad-hoc report paths are concrete | Retain both streams and inspect the real verdict/report |
| Guardian severity | Verified conflicts and interpretive warnings/owner decisions are distinguished | Read quoted source, severity and accountable owner before accepting a blocker |
| Plan admission | Feature planning, full existing-task details, broader cache keys and coverage/repair handling were improved | Inspect what this actual cohort planned; return scope corrections through 301.1E |
| Verify repairs | Explicit verdict required; pass with critical failures fails; repair includes source/contract, restores invalid edits and allows Edit | Preserve real repair/verdict history and inspect scope before execution |
| Learn | No source change in this pull; the course previously omitted its existing pipeline | Required extraction, synthesis, review and future-context inspection now occupy 20 minutes |

The table compares `95a00d7` with `c4583ef`. Each row was re-checked at `a8bde62` and
still holds.

## Source changes from `95a00d7` to `a8bde62`

| Area | Change | Required lesson |
| --- | --- | --- |
| Integrate stops | A failed regression, a failed contract check or a Guardian rejection exits with a gate failure before the extraction prompt and completion | Read which check failed; an earlier completed state stays when a rerun fails |
| Integrate safety | Requires the target branch to exist; refuses uncommitted tracked changes; off the target with MAIN_BRANCH unset, asks `[y/N]` and without a terminal exits unless `--yes` | Set MAIN_BRANCH to the admitted target and start from a clean tree |
| Integrate merges | Checks in Git that every branch landed; warns about done tasks with no branch | Still compare included work with the admitted scope |
| Integrate prompt | Without a terminal, extraction is now skipped; `--yes` runs it without asking | Answer `n` at the prompt in class so extraction stays in Learn |
| Test gate | With no test entry in Quality Gates, Run's task gates fall back to `npm test` from `package.json`; Integrate's regression does not | Read the actual Quality Gates section and each gate result |
| Review | Diffs each task from the commit its Run started from; `--task ID` reviews one task without its description or criteria | Compare Review and Coherence inputs; they now differ |
| CLI | Global options such as `--feature` are read wherever they appear | Keep one command form in class |
| Environment | Bash 3.2 or newer; a bundled Python timeout runner on macOS and Linux; Python 3.11 or newer as before | Check the startup dependency check passes on each lab machine |

Learn sources are unchanged apart from Python selection and path handling.

## Recorded run at `a8bde62`, 18 November 2026

One run of the whole course from the 301.2E snapshot (`85bc3e0`). Its end state is
[`checkpoint/after-run.bundle`](checkpoint/after-run.bundle).

| Stage | Result |
| --- | --- |
| Admit | `inspect-handoff.py`: 97 checks pass, 2 true errors (task 10 declares no files; Verify did not pass) |
| Run, round 1 | 33 minutes. Tasks 1 to 8 done and merged into `main` as each passed. Tasks 9 and 10 blocked: no production sign-offs exist |
| Review, round 1 | Changes requested on all 8 tasks. Each went back to pending with its findings in `review_feedback` |
| Run, round 2 | 14 minutes. Tasks 1, 2, 3, 6 and 7 reworked. Task 4 blocked on a spec question (may a status check after the deadline settle the challenge, when polling must have no side effects?). Tasks 5 and 8 waited on task 4 |
| Review, round 2 | Changes requested on all five reworked tasks. Latest findings across tasks 1 to 8: 28 major, 2 minor |
| Coherence, Integrate | "No completed tasks". Nothing integrated. The integrate prompt was answered `n` |
| Candidate | `main` after round 2: 37 commits over the snapshot, 186 tests pass, never integrated |
| Learn | Dry run 158 observations. Extraction wrote 158 (126 review findings, 11 agent concerns, 10 verify findings, 7 retries, 4 gate failures) and found 14 conventions. Synthesis kept 42 (7 architect, 19 developer, 16 reviewer) and rejected 214 |
| Context | The task 1 preview has a Learned Patterns section with three entries, chosen by the top-three fallback |

The checkpoint stops before Learn, so learners extract into empty memory.

### How the run was made

Read this before quoting the run as typical.

- **Provider.** The run used Codex (`gpt-6.2-astra`) for every SPEED agent, through a
  locally patched copy of SPEED's Codex provider. Class uses Claude Code. The logs in the
  snapshots and checkpoint were then cleaned: local paths became lab paths
  (`~/Lab/...`), the model name became `opus`, and Codex-specific header and status lines
  were removed. Commit authors became `301.2E learner`.
- **Task models.** The 301.1E plan recorded `gpt-6.2-astra` as each task's `agent_model`.
  Those fields were rewritten to `opus`, the course setting, throughout the history of both
  the snapshot and the checkpoint, so `speed run` works with Claude.
- **Environment failures before the recorded run.** In the first attempt, the agents' own
  global instructions told them to ask before changing code, so they wrote nothing
  ("Empty diff"). In the second and third, the agent sandbox blocked commits to `.git`.
  Both are environment causes; the recovery guide uses the first as a case. The recorded
  run had the sandbox lifted.
- **Not done.** No run with Claude as provider, and no cohort rehearsal.

## Observed limits

All four `gate_failure` observations have summaries that end in passing test lines. As in
the earlier rehearsal, the log heuristic labels much log content as failure. Check the
actual command result before using a type label as a fact.

Planned tasks declare `files_touched`. The context bridge selects learnings by
`files_to_modify` and `files_to_create`, so nothing matches and the three highest-weight
entries are injected into every task's context.

Verify's repair added two tasks a class cannot finish, and took the plan above the 301.1E
cap of 8 tasks.

## Readiness

The snapshot, handoff, checkpoint and material agree with this run. Before commercial
delivery, still needed: one rehearsal with Claude as provider, a real cohort to calibrate
timing and assessment, and assessor calibration. Report live and recorded participation
separately.

Ten utility safeguard checks pass with synthetic input (`learner/assets/verify-assets.py`).
They test the utilities, not F2 behavior.
