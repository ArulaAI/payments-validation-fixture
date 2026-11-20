# Lab 301.2E: Execute, Integrate, Learn

You continue the 301.1E work on adaptive authorization. The plan has 10 tasks. Today agents
build it while you supervise, decide what may reach the candidate, and check what the run
teaches future agents. The session lasts 120 minutes.

## How to use this guide

Every step has the same three parts:

- **What's happening** explains the stage. Read it while your facilitator talks.
- **Run** lists what to type, in order, and what to do with the output.
- **Look for** is a checklist. Tick each item before you move on.

Your output will not match the recorded run word for word. Counts and timings vary.

## Before you start

Your trainer gives you three folders: a lab with the snapshot cloned in it, an empty
evidence folder outside the lab, and the course assets. Set them once per terminal:

```sh
course_assets="$HOME/Lab/301.2E/assets"            # course/301.2E/learner/assets
course_lab="$HOME/Lab/301.2E/payments-validation-fixture"
course_workspace="$HOME/Lab/301.2E/evidence"
course_handoff="$course_assets/handoff-301-1e.json"
course_baseline="$(jq -r '.baseline' "$course_handoff")"
export MAIN_BRANCH="$(jq -r '.target' "$course_handoff")"   # main
cd "$course_lab"
command -v speed                                            # the a8bde62 build
```

Keep credentials out of the evidence folder.

---

## 1. Admit the handoff and inspect the harness (15 min)

### What's happening

Check that what you were handed is what 301.1E reviewed. Change nothing in this step. The handoff file records the baseline, file digests, admitted scope and blockers.

### Run

```sh
git status --short
git rev-parse HEAD                     # must equal $course_baseline
speed status --feature adaptive-auth
jq -s 'map({id,title,status,depends_on,files_touched,agent_model})' .speed/features/adaptive-auth/tasks/*.json
python3 "$course_assets/inspect-handoff.py" "$course_lab" --handoff "$course_handoff"
```

The inspection runs 99 checks and reports two errors. Both are true:

- Task 10 declares no files. It is the rollout-gates task that Verify's repair added.
- Verify did not pass. Two critical issues remain, and both are owner questions.

Decide whether to run anyway. Open `.speed/features/adaptive-auth/logs/plan-verification.log`
and `.speed/authoring/adaptive-auth/questions.md`. Write down which tasks you admit, which
you would hold back, and who owns each blocker. Copy the
[execution ledger](assets/templates/execution-ledger.md) into your evidence folder and
start it.

Then read the gates. Run's task gates and Integrate's regression check read the commands in
the Quality Gates section of `AGENTS.md`. This fixture lists one: `test: npm test`. Lint
and typecheck are skipped because they are not listed. Record that.

### Look for

- [ ] `git rev-parse HEAD` equals `$course_baseline`.
- [ ] You can explain both inspection errors.
- [ ] You wrote down the tasks you admit, the ones you hold back, and each blocker's owner.
- [ ] You recorded that only `npm test` runs as a gate.

---

## 2. Supervise Run (20 min)

### What's happening

Agents build the admitted tasks while you watch the harness: which task is ready, what
context it gets, what it commits and what its gate says.

### Run

```sh
python3 "$course_assets/capture-evidence.py" "$course_lab" "$course_workspace/before-run"
python3 "$course_assets/run-and-record.py" "$course_workspace/run-01" -- \
  speed run --feature adaptive-auth --max-parallel 2 --verbose
```

In a second terminal, watch the same repository:

```sh
speed status --feature adaptive-auth
git worktree list
git log --all --graph --oneline -15
```

Follow one task and the task that depends on it. Read its spec reference, its commits and
its gate result. Two things surprise most people:

- Run merges each passing task into `main` as it goes, so a dependent task starts from
  merged work. `git diff "$course_baseline"..main` shows everything built so far.
- A task can stop as **blocked** with a question instead of failing. In the recorded run,
  tasks 9 and 10 blocked because they need production sign-offs that do not exist here.

Round 1 took 33 minutes in the recorded run, so it will not finish in this slot. At the
end of the slot, leave your run alone and move to the recorded checkpoint in a new folder:

```sh
git clone "$HOME/Lab/301.2E/after-run.bundle" "$HOME/Lab/301.2E/checkpoint"
cd "$HOME/Lab/301.2E/checkpoint"
for b in $(git branch -r | grep -v HEAD | sed 's#origin/##'); do git branch -q "$b" "origin/$b" 2>/dev/null; done
```

The last line gives SPEED the task branches it reads locally; a clone holds them only as
`origin/...`.

Write down which folder each later command runs in.

### Look for

- [ ] You followed one task and its dependent from start to result.
- [ ] You saw a task merged into `main` before Integrate.
- [ ] You know which folder each later command runs in.

---

## 3. Recover a stopped task (15 min)

### What's happening

A stopped task needs one cause, its evidence, and the right response: a retry with guidance,
or a hand-back to its owner.

Use 15 minutes on one stopped task. Keep the reviewed specs and the plan as they are.
Save the evidence before you change anything. This guide does not let you make product
decisions or reset someone's repository.

#### The recovery decision

| Step | Look at | Decide |
| --- | --- | --- |
| Save | The command, raw output, task JSON, branch, worktree and baseline | Copy the failed attempt and any useful commits or changes |
| Locate | Did it stop before the agent started, while it worked, at a gate or at a merge? | Separate what you saw from what you suspect |
| Attribute | Environment, code, a dependency, a shared contract, or an owner's open question | Pick one supported cause and who corrects it |
| Bound | The accepted spec, the files involved, dependencies and earlier good work | Say what may change and what must not |
| Act | The task's state and its branch | Retry with guidance, or hand the question to its owner |
| Compare | The next attempt, against the same requirement | Keep both attempts and what is still open |

#### Case 1 The agent wrote nothing

In an earlier attempt of the recorded run, tasks 1, 2 and 6 failed within two minutes:

```text
✗ Empty diff — agent produced no code changes
✗ Missing declared files: src/risk/reasons.ts,src/risk/scoring.ts,src/risk/policy.ts,…
```

The task log showed why. The agent's own global instructions told it to ask for approval
before changing code, so it asked and stopped. Nothing was wrong with the task or the code.
This is an environment cause. Fix the agent's setup through whoever owns it, then retry.
Do not change the task or the spec to get past it.

A later attempt stopped differently: the agent finished the code but could not commit,
because its sandbox blocked writes to the repository's `.git` folder. The work existed only
in the worktree. Again an environment cause: save the worktree before anything removes it.

#### Case 2 A spec question (task 4)

Task 4 builds the step-up challenge lifecycle. In round 2 it stopped as blocked:

> May a synchronous status poll process an already-due deadline? A poll arriving after ten
> minutes but before the timer callback sees pending. Returning the final result
> immediately means settling during the poll, which conflicts with the requirement that
> polling have no side effects.

The agent is right that the specs do not say. Retrying will not answer it. Find the two
requirements that pull against each other in the F2.1 tech spec, write the question with
both quotes, and send it to the F2.1 owner. Tasks 5 and 8 depend on task 4, so record
that they wait too.

#### Case 3 Work that needs a sign-off (tasks 9 and 10)

Task 9 removes the old cross-border rule only after every merchant has moved to the new
scoring. Task 10 checks the production rollout gates. Both stopped as blocked: there are
no dated sign-offs or production flag changes to check. That is the correct result. Leave
both blocked, and name Risk, PM and Legal as the owners in the handoff.

#### Case 4 Teaching case: two challenge paths that look alike

This one is constructed for discussion; it did not happen in the recorded run. A
block-match challenge uses the F2.1 fallback when the bank cannot answer. The payment is
held, and a test was changed to expect that.

Read the F2.1 and F2.2 tech specs. F2.1's "provider unavailable" path and F2.2's
block-match path have different outcomes. Sharing an adapter does not mean sharing a
policy. Keep the original test, ask for a repair that matches each contract, or send the
question to its owner. Do not weaken a test to fit the code.

#### Commands

```sh
speed retry --feature adaptive-auth --task-id ACTUAL_ID \
  --context "What failed, the evidence, what may change, what must stay the same."
speed status --feature adaptive-auth
# The next speed run picks up the task.
```

`speed retry` only accepts a task that failed or is blocked. A task that Review sent back
is already pending; the next Run reworks it using its `review_feedback`.

`speed recover --feature adaptive-auth` stops tracked agents, clears locks, resets running
state and removes worktrees. Use it only when the original run is dead and its work is
saved. Keep completed work. Do not reset the whole plan.

`speed retry --reset-branch` deletes the task's branch. Read the branch first.
`speed integrate --continue` does not exist.

If Integrate fails, keep the candidate blocked for the affected tasks and keep each report.
A feature that an earlier Integrate marked complete stays complete when a rerun fails, so
do not read that state as a pass.

### Run

Pick one stopped task. In the checkpoint there are three, and each needs a different
response:

| Task | Why it stopped | The right response |
| --- | --- | --- |
| 4 | A spec question: may a status check after the ten-minute deadline settle the challenge, when polling must have no side effects? | Hand it back to its owner. Retrying will not answer it |
| 9 | It may only remove the old rule after every merchant has moved over | Leave it blocked until Risk confirms cutover |
| 10 | It needs dated production sign-offs | Leave it blocked. It is outside what a class can build |

Read the task's JSON and its log under `.speed/features/adaptive-auth/logs/` before you
decide. Keep the branch and any partial work.

Use `speed retry` only for something you can correct; the commands are under "Commands"
above.

Write one cause, its evidence, the correction or owner, and the check that would tell the
next attempt apart. A policy question goes back to its owner.

### Look for

- [ ] One cause with its evidence.
- [ ] The correction, or the owner it goes back to.
- [ ] The check that would tell the next attempt apart.

---

## 4. Admit integration and inspect the target (20 min)

### What's happening

Review and Coherence decide which tasks may be integrated.

### Run

Work in the checkpoint:

```sh
python3 "$course_assets/run-and-record.py" "$course_workspace/review-01" -- \
  speed review --feature adaptive-auth
python3 "$course_assets/run-and-record.py" "$course_workspace/coherence-01" -- \
  speed coherence --feature adaptive-auth
```

In the recorded run, Review asked for changes on every task. A task sent back by Review
returns to **pending**, with the findings stored in its `review_feedback` field. The next
Run reworks it. Coherence and Integrate then report "No completed tasks", because only
approved tasks count. Open one task's findings:

```sh
jq -r '.review_feedback | fromjson | .issues[] | "\(.severity)  \(.file):\(.line)  \(.message)"' \
  .speed/features/adaptive-auth/tasks/1.json
```

Complete the [integration admission](assets/templates/integration-admission.md). Your
answer may be "blocked". A blocked admission with its evidence is a valid result.

If any task is approved, integrate it:

```sh
python3 "$course_assets/run-and-record.py" "$course_workspace/integrate-01" -- \
  speed integrate --feature adaptive-auth
```

Integrate stops if tracked files have uncommitted changes, and before completion if the
regression check, the contract check or the Guardian fails. At the end it asks whether to
extract observations. Answer `n`; you do that in Learn. The question reads the terminal
directly, so piping an answer in does not work. Do not add `--yes`.

Then look at the candidate itself:

```sh
git rev-parse main
git diff --stat "$course_baseline"..main -- src test specs
python3 "$course_assets/run-and-record.py" "$course_workspace/target-tests" -- npm test
python3 "$course_assets/capture-evidence.py" "$PWD" "$course_workspace/after-integrate"
```

`main` passes 186 tests in the recorded run. Passing tests do not answer Review's findings.

### Look for

- [ ] You read one task's review findings against the code.
- [ ] Your integration admission says what may be integrated, or why nothing may.
- [ ] You know the test count does not answer the review findings.

---

## 5. Learn (20 min)

### What's happening

Learn is a required 20-minute stage. It turns what happened in the run into notes that
future agents receive. Your job is to check that those notes are true, scoped and safe.
Work in the checkpoint folder, unless your own run finished.

#### What each layer does

| Layer | What SPEED does | What you check |
| --- | --- | --- |
| Evidence | Keeps task records, review findings, gate results and logs | What really went in and came out |
| Extraction | Turns that evidence into typed observations | Trace one observation to its source |
| Synthesis | Groups, ranks, removes duplicates, checks conflicts and enforces a size budget | Read what was kept and what was rejected |
| Future context | Adds selected learnings to the next agent's prompt | Read the exact text an agent would get |

No model reads the whole project here. Extraction reads named files, and synthesis makes no
model calls. A command can exit 0 and still print warnings. A missing source stays missing.

#### 1 Predict and preview: 3 minutes

Before running anything, write one fact from this run that should help the next engineer,
and one lesson that would be dangerous to generalize.

```sh
python3 "$course_assets/capture-evidence.py" "$PWD" "$course_workspace/before-learn"
python3 "$course_assets/run-and-record.py" "$course_workspace/learn-preview" -- \
  speed learn --feature adaptive-auth --dry-run
```

The dry run counts observations and writes nothing. In the recorded run it found 158 and
warned three times: no coherence data, no validation or security report, and no Architect
plan for decomposition quality. Each warning is a source Learn could not read.

#### 2 Extract and inspect: 5 minutes

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

#### 3 Synthesize and trace forward: 6 minutes

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

#### 4 Decide and transfer: 6 minutes

Complete the [learning review](assets/templates/learning-review.md). Keep one bounded
observation, reject one unsupported generalization, or name the owner decision it needs.

| Claim to test | Question |
| --- | --- |
| "Review asked for changes on every task, so the reviewer is too strict." | Which findings did you check against the code? |
| "All 186 tests pass, so the candidate is ready." | Which review findings do the tests not cover? |
| "When the bank cannot answer, every challenge should hold the payment." | Which accepted requirement or owner could allow that for block-match challenges? |

Add the learning IDs, the files written, the rejected claims and the scoping limit to the
301.3E handoff. Learning shapes future runs only within its evidence. It does not settle
an owner's policy or replace validating the candidate.

#### Outside the two-hour class

`speed learn --post-merge` compares task branches with the merged result. It can label an
unchanged merge `human_approved` by a rule of thumb, which does not prove a person read it.

Multi-player mode writes shared proposals. `--pending`, `--merge` and `--curate` belong to
that shared workflow. Do not start multi-player mode in this lab.

### Run

Work through the four steps above in order and submit the
[learning review](assets/templates/learning-review.md).

### Look for

- [ ] One observation traced to the file it came from.
- [ ] One kept learning and one reject explained.
- [ ] You know why task 1's context got three learnings.

---

## 6. Individual transfer (20 min)

### What's happening

You work alone on an unfamiliar case, to show you can apply the day's judgment.

### Run

The trainer releases one unfamiliar assessment packet. Spend 12 minutes inspecting it,
five writing your decision and three on its written counterfactual. Work alone. Cite the
evidence, the permitted scope, the recovery, the learning and the next owner.

### Look for

- [ ] Every claim in your answer cites evidence.
- [ ] Your written counterfactual says what would change your decision.

---

## 7. Handoff (10 min)

### What's happening

301.3E starts from what you hand over. Another engineer must be able to pick it up without
you.

### Run

Complete the [handoff to 301.3E](assets/templates/handoff-to-301-3e.md). Include the
baseline and candidate commits, what is in scope, every check result, the open review
findings, the blocked tasks and their owners, and the learning IDs. Another engineer must
find the candidate and one unresolved question without asking you. Say whether you hand
over a candidate, a bounded partial scope or a blocked result, and which folder (live run
or checkpoint) each result came from.

### Look for

- [ ] Baseline and candidate commits are named.
- [ ] Every open finding and blocked task has an owner.
- [ ] You said which results came from your live run and which from the checkpoint.

---

## Close (inside stage 7)

One question to take back to your own work: which agent output in your project do you accept
without reading what it was given?

## If you get stuck

| What you see | What to do |
| --- | --- |
| `Branch '…' not found` | Run the branch line from step 2 again in that folder |
| `speed retry` says a task is pending, not failed or blocked | Review sent it back; the next Run reworks it |
| Coherence or Integrate says "No completed tasks" | Nothing is approved yet. Record a blocked admission |
| Integrate asks a yes/no question | Answer `n` for extraction. Do not pipe an answer or add `--yes` |
| `speed` is missing, or runs the wrong Workbench | Run the setup exports again and check `command -v speed` |

## Words we use

| Word | Meaning |
| --- | --- |
| Candidate | The code on `main` after the run, before validation |
| Checkpoint | The recorded run's end state, used when a live run overruns its slot |
| Blocked | A task that stopped with a question instead of failing |
| Observation | A signal Learn extracts from the run's records |
| Learning | An observation synthesis kept for future agents |

## Four habits to take with you

1. Read what each agent was given before judging what it made.
2. Keep failed work until you know why it failed.
3. Send policy questions to their owners, not to a retry.
4. Check what memory future agents will read.
