# 301.2E Learn: close the execution loop

Learn is a required 20-minute stage after integration inspection. Its output is an
evidence-linked learning review and an account of what future agent context can receive.
The commands below use the trainer-prepared single-player adaptive-auth continuation. Their waiting
time is inside the 120-minute session. Use a clearly labelled retained native attempt
if a live command exceeds the stage budget; record which operations the learner performed.

## The distinction to teach

| Layer | What SPEED does | Engineer responsibility |
| --- | --- | --- |
| Original execution evidence | Retains task records and emitted Review, Guardian, Coherence and other artifacts | Establish the actual input, result and missing evidence |
| Observation extraction | Converts available artifacts into typed observations with content-derived IDs | Trace a signal back to its source; preserve warnings and missing stages |
| Synthesis | Routes, reframes, deduplicates, checks conflicts and applies structural quality/token limits | Inspect retained entries and rejects; a structural filter does not establish truth |
| Future context | Loads agent-specific learnings and applicable conventions/knowledge | Inspect the actual assembled text and its scope; requirements retain authority |

Extraction is not an autonomous model reflecting on the whole project. The inspected
pipeline reads named artifacts. Classification can use installed local models and
optional embedding support; synthesis itself makes no LLM calls. Some logged errors
or warnings can coexist with a successful command exit. A missing source cannot be
replaced by an invented observation.

## 1 Predict and preserve: 3 minutes

Ask: **Which fact from this run should help the next engineer, and which apparent lesson
would be dangerous to generalize?** Name an original source before running Learn.
Inspect the selected Python (`SPEED_PYTHON`, SPEED's `.venv`, then PATH fallback), memory
location and feature. Do not install packages or change a shared environment during class.

```sh
python3 "$course_assets/capture-evidence.py" "$course_lab" "$course_workspace/before-learn"
python3 "$course_assets/run-and-record.py" "$course_workspace/learn-preview" -- \
  speed learn --feature adaptive-auth --dry-run
```

The extraction dry run previews counts and warnings without writing observations. It
does not print a complete proposed-observation review or approve its contents. Inspect
the original task/report evidence as well. It may create temporary parsing files.

## 2 Extract and inspect: 5 minutes

```sh
python3 "$course_assets/run-and-record.py" "$course_workspace/learn-extract" -- \
  speed learn --feature adaptive-auth
python3 "$course_assets/run-and-record.py" "$course_workspace/learn-summary" -- \
  speed learn --summary
python3 "$course_assets/capture-evidence.py" "$course_lab" "$course_workspace/after-extraction"
```

In single-player mode, extraction appends deduplicated observations to
`.speed/memory/observations/adaptive-auth.jsonl`. It can retrain the local review
classifier and automatically trigger convention discovery. Inspect all actual memory
changes, not just the observation count. Zero new rows on a repeated extraction can
mean deduplication; compare IDs and retained files before assigning a cause.

Open the JSONL and select two actual entries. For each, record ID, feature, task/stage,
type, detail and the original artifact. If fewer than two exist, state that limit and
use a marked teaching case for the second decision. Extraction timestamps identify
extraction time; they do not establish when the underlying event happened.

## 3 Synthesize and trace forward: 6 minutes

First preserve the extracted observations and any existing learnings. This exercise
uses a disposable repository because synthesis writes files used by future agents.

```sh
python3 "$course_assets/run-and-record.py" "$course_workspace/learn-synthesize" -- \
  speed learn --synthesize
python3 "$course_assets/capture-evidence.py" "$course_lab" "$course_workspace/after-synthesis"
```

Inspect `.speed/memory/learnings/*-learnings.json`, `synthesis-meta.json`,
`synthesis-rejects.json` and `synthesis-conflicts.json`. Follow one retained entry's
evidence ID back to its original observation. Explain one reject or the absence of
rejects. Zero retained entries is a valid recorded result; do not insert observations merely
to make the demonstration look successful.

The single-player path has no mandatory human approval screen before these files become
eligible for injection. The learning-review template records a human decision; it is not
an implemented approval gate. Stop subsequent agents if active advice is unsafe, retain
the files and route a specific memory correction to its accountable maintainer.

Trace `context_assemble_developer` in `lib/context_bridge.sh` to
`filter_learnings_for_task` and `assemble_developer`. The filter matches file or directory
scope, but falls back to the three highest-weight entries when nothing matches. Inspect
the task fields actually passed: this bridge reads `files_to_modify` and `files_to_create`,
while generated task plans commonly declare `files_touched`; inspect this cohort's actual fields. Do not claim exact scoping from the
plan alone. Select an actual completed task ID and retain the bridge output without
starting another agent:

```sh
course_task_id="ACTUAL_COMPLETED_TASK_ID"
python3 "$course_assets/run-and-record.py" "$course_workspace/learning-context-preview" -- \
  bash "$course_assets/preview-learning-context.sh" "$course_speed_root" \
  "$course_lab" adaptive-auth "$course_task_id"
```

The trainer provides `course_speed_root`, the pinned SPEED checkout at `a8bde62`. If the
preview fails or contains no Learned Patterns section, record that outcome.
This preview creates no agent or worktree. Branch/worktree instructions in its generated
text come from retained task metadata; they do not describe a new live execution.

## 4 Decide and transfer: 6 minutes

Complete the [learning review](assets/templates/learning-review.md).
Retain a bounded observation, reject an unsupported generalization, or identify the
owner decision needed. Compare that human judgment with the files SPEED actually wrote.

| Constructed statement | Question for the learner |
| --- | --- |
| “This branch's reviewer reconstructed an empty supplied diff; approval was static.” | Which report and candidate range support the scope? |
| “A green Run means target regression can be skipped.” | Which configured target evidence would this remove? |
| “All bank-provider unavailable outcomes should hold, including block-match challenges.” | Which accepted requirement or owner could authorize that change? |

Add learning IDs, active files, rejected claims and injection limits to the 301.3E
handoff. Learning improves future execution only within its evidence and scope. It does
not settle owner policy or substitute for independent validation of the candidate.

## Extensions outside the two-hour class

`speed learn --post-merge` extracts branch-to-target correction signals. An unchanged
merge can be labelled `human_approved` by a heuristic; it does not prove a person read
or approved the behavior. Preserve the actual Git comparison before interpreting it.

Multi-player extraction writes proposals into shared paths. `--pending`, `--merge` and
`--curate` belong to that separate shared-knowledge workflow; curation resolves convention
conflicts and is not a generic approval command for every single-player learning entry.
Do not initialize multi-player mode or publish shared proposals as part of this core lab.
