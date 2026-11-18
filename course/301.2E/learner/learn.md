# 301.2E Learn: close the loop

Learn is a required 20-minute stage. It turns what happened in the run into notes that
future agents receive. Your job is to check that those notes are true, scoped and safe.
Work in the checkpoint folder, unless your own run finished.

## What each layer does

| Layer | What SPEED does | What you check |
| --- | --- | --- |
| Evidence | Keeps task records, review findings, gate results and logs | What really went in and came out |
| Extraction | Turns that evidence into typed observations | Trace one observation to its source |
| Synthesis | Groups, ranks, removes duplicates, checks conflicts and enforces a size budget | Read what was kept and what was rejected |
| Future context | Adds selected learnings to the next agent's prompt | Read the exact text an agent would get |

No model reads the whole project here. Extraction reads named files, and synthesis makes no
model calls. A command can exit 0 and still print warnings. A missing source stays missing.

## 1 Predict and preview: 3 minutes

Before running anything, write one fact from this run that should help the next engineer,
and one lesson that would be dangerous to generalise.

```sh
python3 "$course_assets/capture-evidence.py" "$PWD" "$course_workspace/before-learn"
python3 "$course_assets/run-and-record.py" "$course_workspace/learn-preview" -- \
  speed learn --feature adaptive-auth --dry-run
```

The dry run counts observations and writes nothing. In the recorded run it found 158 and
warned three times: no coherence data, no validation or security report, and no Architect
plan for decomposition quality. Each warning is a source Learn could not read.

## 2 Extract and inspect: 5 minutes

```sh
python3 "$course_assets/run-and-record.py" "$course_workspace/learn-extract" -- \
  speed learn --feature adaptive-auth
python3 "$course_assets/run-and-record.py" "$course_workspace/learn-summary" -- \
  speed learn --summary
```

Extraction appends observations to `.speed/memory/observations/adaptive-auth.jsonl`, then
starts convention discovery on its own. In the recorded run it wrote 158 observations:
126 review findings, 11 agent concerns, 10 verify findings, 7 retries and 4 gate
failures. Convention discovery found 14 conventions. Running extraction again adds nothing,
because observations are deduplicated.

Open the JSONL and pick two entries. For each, record its ID, task, type and detail, and
find the file it came from. The timestamp is when extraction ran, not when the event
happened.

## 3 Synthesise and trace forward: 6 minutes

Synthesis writes the files future agents read, so keep a copy of the folder first.

```sh
python3 "$course_assets/run-and-record.py" "$course_workspace/learn-synthesize" -- \
  speed learn --synthesize
python3 "$course_assets/capture-evidence.py" "$PWD" "$course_workspace/after-synthesis"
```

In the recorded run, synthesis kept 42 entries (7 for the architect, 19 for developers,
16 for reviewers) and rejected 214. Open `.speed/memory/learnings/` and read
`synthesis-rejects.json` and `synthesis-conflicts.json` as well as the kept entries. Follow
one kept entry back to its observation. Explain one reject.

There is no approval screen. Once written, these files can go into the next agent's
prompt. Your learning review records a human decision; it does not gate anything. If a
kept entry is unsafe, stop further runs and ask the SPEED maintainer to correct it.

Now see what a developer agent would receive for task 1, without starting an agent:

```sh
python3 "$course_assets/run-and-record.py" "$course_workspace/learning-context-preview" -- \
  bash "$course_assets/preview-learning-context.sh" "$(dirname "$(command -v speed)")" \
  "$PWD" adaptive-auth 1
```

Find the "Learned Patterns" section. In the recorded run it held three entries, and here
is why. The context bridge chooses learnings by matching the task's `files_to_modify` and
`files_to_create` (`lib/context_bridge.sh:348`). The plan's tasks list `files_touched`
instead, so nothing matched. When nothing matches, the filter falls back to the three
highest-weight learnings (`lib/learn/synthesize.py:796`). So the agent's notes are not
scoped to its task, whatever the plan says.

## 4 Decide and transfer: 6 minutes

Complete the [learning review](assets/templates/learning-review.md). Keep one bounded
observation, reject one unsupported generalisation, or name the owner decision it needs.

| Claim to test | Question |
| --- | --- |
| "Review asked for changes on every task, so the reviewer is too strict." | Which findings did you check against the code? |
| "All 186 tests pass, so the candidate is ready." | Which review findings do the tests not cover? |
| "When the bank cannot answer, every challenge should hold the payment." | Which accepted requirement or owner could allow that for block-match challenges? |

Add the learning IDs, the files written, the rejected claims and the scoping limit to the
301.3E handoff. Learning shapes future runs only within its evidence. It does not settle
an owner's policy or replace validating the candidate.

## Outside the two-hour class

`speed learn --post-merge` compares task branches with the merged result. It can label an
unchanged merge `human_approved` by a rule of thumb, which does not prove a person read it.

Multi-player mode writes shared proposals. `--pending`, `--merge` and `--curate` belong to
that shared workflow. Do not start multi-player mode in this lab.
