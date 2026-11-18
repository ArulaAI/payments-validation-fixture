# 301.2E learner workbook

You continue the 301.1E work on adaptive authorisation. The plan has 10 tasks. Today agents
build it while you supervise, decide what may reach the candidate, and check what the run
teaches future agents. The session lasts 120 minutes.

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

## 1 Admit the handoff and inspect the harness: 15 minutes

Check that what you were handed is what 301.1E reviewed. Change nothing in this step.

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

## 2 Supervise Run: 20 minutes

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
```

Write down which folder each later command runs in.

## 3 Recover a stopped task: 15 minutes

Pick one stopped task. In the checkpoint there are three, and each needs a different
response:

| Task | Why it stopped | The right response |
| --- | --- | --- |
| 4 | A spec question: may a status check after the ten-minute deadline settle the challenge, when polling must have no side effects? | Hand it back to its owner. Retrying will not answer it |
| 9 | It may only remove the old rule after every merchant has moved over | Leave it blocked until Risk confirms cutover |
| 10 | It needs dated production sign-offs | Leave it blocked. It is outside what a class can build |

Read the task's JSON and its log under `.speed/features/adaptive-auth/logs/` before you
decide. Keep the branch and any partial work.

`speed retry` is for a task that failed or blocked because of something you can correct. It
adds your guidance, and the next Run picks the task up:

```sh
speed retry --feature adaptive-auth --task-id ACTUAL_ID \
  --context "What failed, the evidence, what may change, what must stay the same."
speed status --feature adaptive-auth
```

`speed recover` is different. It cleans up after a crash: it stops tracked agents, clears
locks and removes worktrees. Use it only once you know the original run is dead and its
work is saved.

Write one cause, its evidence, the correction or owner, and the check that would tell the
next attempt apart. A policy question goes back to its owner.

## 4 Admit integration and inspect the target: 20 minutes

Work in the checkpoint. Review and Coherence decide which tasks may be integrated:

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

## 5 Learn: 20 minutes

Follow the [Learn exercise](learn.md): predict, extract, synthesise, trace one learning
into the context a future agent receives, and decide what to keep. Submit the
[learning review](assets/templates/learning-review.md).

## 6 Individual transfer: 20 minutes

The trainer releases one unfamiliar assessment packet. Spend 12 minutes inspecting it,
five writing your decision and three on its written counterfactual. Work alone. Cite the
evidence, the permitted scope, the recovery, the learning and the next owner.

## 7 Handoff and close: 10 minutes

Complete the [handoff to 301.3E](assets/templates/handoff-to-301-3e.md). Include the
baseline and candidate commits, what is in scope, every check result, the open review
findings, the blocked tasks and their owners, and the learning IDs. Another engineer must
find the candidate and one unresolved question without asking you. Say whether you hand
over a candidate, a bounded partial scope or a blocked result, and which folder (live run
or checkpoint) each result came from.
