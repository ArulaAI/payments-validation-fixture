# 301.2E rehearsal record

Pinned SPEED source: `a8bde62` (see [SPEED version](../../README.md#speed-version)). The
source manifest at the end of this file holds file hashes at that commit, and the run
summary records the checks below. The course runs on the 301.1E payments fixture, includes
Learn and totals 120 minutes.

## How the snapshot was made

The 301.2E snapshot is one real run of 301.1E: its start state, the reviewed tech specs, and
the plan with its `.speed/` records, in three commits (`85bc3e0`). The recorded checkpoint
continues that snapshot through this course. How that run was made (read this before quoting the run as typical):

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
  Both are environment causes; lab-guide stage 3 uses the first as a case. The recorded
  run had the sandbox lifted.
- **Not done.** No run with Claude as provider, and no cohort rehearsal.

## What has been run

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

## Observed limits

All four `gate_failure` observations have summaries that end in passing test lines. As in
the earlier rehearsal, the log heuristic labels much log content as failure. Check the
actual command result before using a type label as a fact.

Planned tasks declare `files_touched`. The context bridge selects learnings by
`files_to_modify` and `files_to_create`, so nothing matches and the three highest-weight
entries are injected into every task's context.

Verify's repair added two tasks a class cannot finish, and took the plan above the 301.1E
cap of 8 tasks.

## Not yet run

The snapshot, handoff, checkpoint and material agree with this run. Before commercial
delivery, still needed: one rehearsal with Claude as provider, a real cohort to calibrate
timing and assessment, and assessor calibration. Report live and recorded participation
separately.

Ten utility safeguard checks pass with synthetic input (`learner/assets/verify-assets.py`).
They test the utilities, not F2 behavior.

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

## Run summary

The machine-readable record of the run, as it was kept alongside this file.

```json
{
  "current_source_commit": "a8bde62faad732eee456491387e2240c7c9621dd",
  "current_source_status": "Source re-inspected at this commit; one recorded course run done at it on 2026-11-18.",
  "previous_course_source_commit": "95a00d74bc002c8e84725fef4f6045ca2d511525",
  "earlier_course_source_commit": "c4583efafa610d03f47e5b1d63a65175c075b817",
  "course_fixture": "payments-validation-fixture, 301.2E snapshot 85bc3e0 (reviewed 301.1E adaptive-auth work, 10-task plan)",
  "course_duration_minutes": 120,
  "course_stages_minutes": [
    15,
    20,
    15,
    20,
    20,
    20,
    10
  ],
  "recorded_run": {
    "date": "2026-11-18",
    "snapshot": "85bc3e0",
    "checkpoint": "instructor/checkpoint/after-run.bundle",
    "provider": "codex-cli (gpt-6.2-astra) via a locally patched SPEED provider; class uses Claude Code",
    "task_agent_model": "rewritten from gpt-6.2-astra to opus in snapshot and checkpoint history",
    "handoff_inspection": {
      "checks_passed": 97,
      "errors": [
        "task 10 declares no files",
        "Verify did not pass"
      ]
    },
    "run_round_1": {
      "minutes": 33,
      "done_and_merged": [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8
      ],
      "blocked": [
        9,
        10
      ]
    },
    "review_round_1": {
      "changes_requested": [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8
      ]
    },
    "run_round_2": {
      "minutes": 14,
      "reworked": [
        1,
        2,
        3,
        6,
        7
      ],
      "blocked": [
        4
      ],
      "waiting_on_4": [
        5,
        8
      ]
    },
    "review_round_2": {
      "changes_requested": [
        1,
        2,
        3,
        6,
        7
      ]
    },
    "latest_review_findings": {
      "major": 28,
      "minor": 2
    },
    "coherence": "No completed tasks to check",
    "integrate": "No completed tasks to integrate",
    "candidate": {
      "branch": "main",
      "commits_over_snapshot": 37,
      "tests_passed": 186,
      "integrated": false
    },
    "learn": {
      "dry_run_observations": 158,
      "observations_written": 158,
      "by_type": {
        "reviewer_finding": 126,
        "agent_concern": 11,
        "verify_finding": 10,
        "retry": 7,
        "gate_failure": 4
      },
      "conventions": 14,
      "kept": {
        "architect": 7,
        "developer": 19,
        "reviewer": 16
      },
      "rejected": 214
    },
    "context_preview_task_1": "Learned Patterns present; three entries via top-three fallback"
  },
  "observed_limits": [
    "All four gate_failure observations summarise passing test output.",
    "Tasks declare files_touched; the context bridge matches files_to_modify/files_to_create, so learnings fall back to the top three by weight.",
    "Verify added tasks 9 and 10, above the 301.1E cap of 8; neither can finish in class."
  ],
  "utility_safeguard_checks": 10,
  "utility_scope": "Synthetic consistency, preservation and command-recording safeguards; no product acceptance.",
  "delivery_limits": [
    "No run with Claude Code as provider yet.",
    "120-minute design is a fixed teaching allocation; real-cohort delivery remains unvalidated.",
    "Live and recorded participation must be reported separately."
  ]
}
```

## SPEED source manifest

SPEED commit `a8bde62faad732eee456491387e2240c7c9621dd`. The course material cites these files; each hash is the file's SHA-256 at that commit.

| File | SHA-256 |
| --- | --- |
| `agents/developer.md` | `56926f2804cf72b61b3d7d747cabe9c484d169445da6a40954772fcf9e1f246e` |
| `agents/integrator.md` | `d8a69afad458ae624aa554b7f71bfe693793fe70267e856f9b926c42117c5a84` |
| `agents/product-guardian.md` | `340764bffd22ab007f7110d59b501bea27ee1cba8b7d4ca74454ce2a12eb0c3d` |
| `lib/cmd/coherence.sh` | `584b2ded0267fe065c0f43b0119c23198a6c0bf5f79c80187cc4625c0cfc2e9d` |
| `lib/cmd/guardian.sh` | `74e8525b308d42e715af5f93b369d7acc6fe6e97dc0fea92a0cfbcd8c1aeee95` |
| `lib/cmd/integrate.sh` | `7df9209408da0624d1d783f95fda5a9033b02ab878c4767c71b5de3841bc6afc` |
| `lib/cmd/learn.sh` | `13145b4f2eae3b21690bfd02a9a7327479c3e2ea712aac649596a0c9fb40966a` |
| `lib/cmd/learn_mp.sh` | `f54d5f71f8a5104e7c0eee1902e62866bb8fa0b6eeb70efa91e313fa88d85d9c` |
| `lib/cmd/plan.sh` | `4100b6bf629447f065bfeb689af4bc1ee30f8e71db9d25d143addc7de39d91dc` |
| `lib/cmd/retry.sh` | `717d079210e57bb4af0a0436123025cfaa1139309b16595f165ed6d88b1f8e97` |
| `lib/cmd/review.sh` | `962c3091a91b1117cb655e21b79b1b29859ca909cc901cee92cb4e250d11ec9e` |
| `lib/cmd/run.sh` | `088a5e3afee157cf6d3015b3f58b1a89f9d88d7cd77d1e895f1a852725dde5db` |
| `lib/cmd/verify.sh` | `4dfbdb3fe8a249a7d3cbd91acac0311f020e8a8e118f6f7632bf6c40a993dfa5` |
| `lib/config.sh` | `f2b54926463185ac3f02043e3a53511ff33721e78f8803d3f56b8ad89ac3f11b` |
| `lib/context/assembly.py` | `0becac40c4f49a284a5dc30ca1ca9f94d54ef3b5c4e178ab78bb2f1d76b99b46` |
| `lib/context/spec_context.py` | `aca5bc25532e661e01f4ef0ce7c2168594bd3e075db5c9e7157a6c9f4172080d` |
| `lib/context_bridge.sh` | `0c2cff3cfb1e69d5c43becd0c64c5ec8ff80e545150f228737f0b7a9699c75b1` |
| `lib/contract_verify.py` | `c7820022b6402aeee4c4d7695ae1ff104abacdfb4089d55b93d35569aaf943fd` |
| `lib/criteria_verify.py` | `33ec0a6dc72bb2adb810d4d109f1c337a7895fd516ed6507a1837dfdcb4ad7ea` |
| `lib/deps.sh` | `298b6528458cc20f0fa3a6da4148300e5363e31a95907897558a13fac0b8b164` |
| `lib/features.sh` | `d06759b74b0db0612b93a430c71751be6bd616a3479e75c1234db9d1302c0322` |
| `lib/gates.sh` | `68f8dea5f7a4a37ed68dbdd8a9ccf64e6b54629f3a707add2c3ab2d7e1c1b3ef` |
| `lib/git.sh` | `958fb8614f82a8c84b474b5fa0d5770d44eb8f61fb0dca0251db41ca4e801fc6` |
| `lib/grounding.sh` | `8da66bd97a4abd858ffb21e9dd25a53a1fe8fe7b20d125abb9788746d22e20ac` |
| `lib/learn/classify.py` | `5b8774c499df678ffa4af0ca2a8fd84c3a3f81b7d9f3045dd2a61263a3317c4c` |
| `lib/learn/conventions.py` | `060fc8982c3df3326e893d053f86ad496a7a3398008153116cc53379124f6b13` |
| `lib/learn/extract.py` | `11d05533690f0e716bc30f5f2efea38dda7ad08f068342b7be4812de1c6b6245` |
| `lib/learn/merge.py` | `69b9e75602df6a03d497d33157f9719d1b9f3138ce7d91b9acf9fb99e9a2d3cf` |
| `lib/learn/synthesize.py` | `9d9a2bfd522f442ca80211e53e930e84072dfc134ede7d52dec2d4a5789668eb` |
| `lib/learn_bridge.sh` | `8885efc3c4498a6689ca7d31bd4dd3962603db9b5f04c26cad8ad211f8a36bc5` |
| `lib/provider.sh` | `73c6a5ab8a5af6629a6aa5816f24542989984c4f259f27f705747824a2ae181c` |
| `lib/quality_gates.py` | `ecb977366acb4e0f6d5fc18b27fea29788298e2e1678ba8e126881abbb7fbf9a` |
| `lib/shared.sh` | `04a54e48dafebfae459bdb1dd3998bbbc8ea1a03c11622f52121ca5730f975b8` |
| `lib/spec_traceability.py` | `ca09812c691045adf7226fadf6837e59df46125b5f22f3c561b4cc5da5275965` |
| `lib/tasks.sh` | `0093a8a6d760bd9cad36054760cbdd96836051f4399a75781eb5d967980b542e` |
| `providers/claude-code.sh` | `127a8dcf4f385bbe0cd8f900b7503ccb716f687a35276276ef4e0502ff660c0e` |
| `providers/codex-cli.sh` | `9837012f7ea4edf519dcde548c57b1948ad3d7977e705ca8a09d0f87bb73df2e` |
| `speed` | `2271b0dc935c2a572a920816daab21ddd796ce07526832cc673740619378e97a` |

Other manifest fields:

```json
{
  "previous_course_commit": "95a00d74bc002c8e84725fef4f6045ca2d511525"
}
```
