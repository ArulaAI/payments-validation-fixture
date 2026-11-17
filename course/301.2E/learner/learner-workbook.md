# 301.2E learner workbook

Continue the actual payments fixture and reviewed adaptive-auth handoff from 301.1E.
The session lasts 120 minutes. Your trainer provides a prepared independent checkout,
external evidence directory and source-matched recorded checkpoints. Provisioning is trainer work before class.

The trainer supplies these shell values. Paths below are examples of roles, not a
request to create another product. Use the actual provided values.

```sh
course_assets="/path/to/course/301.2E/learner/assets"
course_lab="/path/to/independent-301-1e-continuation"
course_workspace="/path/to/external-session-evidence"
course_feature=adaptive-auth
course_speed_root="/path/to/pinned-SPEED-checkout"   # workbench at a8bde62
course_handoff="$course_workspace/handoff-301-1e.json"
course_target="$(jq -r '.target' "$course_handoff")"
course_baseline="$(jq -r '.baseline' "$course_handoff")"
cd "$course_lab"
export MAIN_BRANCH="$course_target"
```

`course_speed_root` is the pinned SPEED checkout named in
[SPEED version](../../README.md#speed-version).

The trainer checks Bash 3.2 or newer, a compatible Node runtime, Python 3.11 or newer,
Git, jq, SPEED's agent timeout runner, the installed SPEED revision (`a8bde62`), model
availability and provider authentication before class.
Keep credentials out of evidence. The current course authoring checkout has no populated
adaptive-auth task set; a folder of draft RFCs alone is not the required handoff.

## 1 Admit the same handoff and inspect the harness: 15 minutes

Open the 301.1E handoff. Match the exact repository/code baseline, both RFC digests,
accepted decision records, plan/contract and Verify scope. Identify any F2.2 work not
actually planned or verified. Record the accepted scope and owner blockers.

```sh
git status --short
git branch --show-current
git rev-parse HEAD
cat .speed/features/adaptive-auth/spec_path
speed status --feature adaptive-auth
jq -s 'map({id,title,status,depends_on,files_touched,agent_model,branch,spec_references,acceptance_criteria})'   .speed/features/adaptive-auth/tasks/*.json
python3 "$course_assets/inspect-handoff.py" "$course_lab" --handoff "$course_workspace/handoff-301-1e.json"
```

Inspect rather than modify existing task states. Copy the
[execution ledger](assets/templates/execution-ledger.md) into the evidence
folder. Record the actual baseline and target. Explain which producer supplies a contract
to which consumer, which tasks are eligible, and what each model actually receives.

Run can commit dirty files and merge dependencies before dependent work starts.
`MAIN_BRANCH` wins; without it, the current implementation records a starting branch
and later reuses that feature base. A recorded base and an environment override can
conflict with a learner's assumption. Inspect all three.

Review the actual gate configuration. Run's task gates read lint, typecheck and test
commands from the AGENTS/CLAUDE Quality Gates section. With no test entry, they fall back
to the fixture's `npm test` script; lint and typecheck have no fallback. Integrate's
regression runs only the listed commands. This fixture's AGENTS.md lists `lint`,
`typecheck`, `test` and `e2e`; Run and Integrate run only the first three. Record what
the actual section lists and what each command reports. Preserve failed or unavailable
checks. Do not add or change repository configuration during this inspection.

## 2 Supervise Run: 20 minutes

```sh
python3 "$course_assets/capture-evidence.py" "$course_lab" "$course_workspace/before-run" --feature adaptive-auth
python3 "$course_assets/run-and-record.py" "$course_workspace/run-01" --   speed run --feature adaptive-auth --max-parallel 2 --verbose
```

In the second terminal, inspect the same independent repository:

```sh
speed status --feature adaptive-auth
git worktree list
git log --all --graph --oneline -15
jq -s 'map({id,status,branch,error,decisions,concerns,gate_results})'   .speed/features/adaptive-auth/tasks/*.json
```

Track one admitted task and its dependent consumer. Inspect original spec, actual
context, provider output, commits and individual checks. Read failed, pending and blocked
counts together. Run executes all eligible pending work in the feature; do not silently
change statuses to manufacture a smaller class plan.

At minute 35 of the session, move to the trainer's labelled recorded Run checkpoint if
necessary. Leave a live process under its operator's control. Record which workspace
and candidate each later command uses; never integrate against a still-running lab.

## 3 Diagnose and recover: 15 minutes

Choose the observed failure or the trainer's marked F2 case from the
[recovery guide](recovery-flow.md). Retain raw output, task JSON, source
requirement, branches/worktrees and original baseline before choosing a cause.

For a failed or blocked task with useful prior work, adapt the actual ID and guidance:

```sh
speed retry --feature adaptive-auth --task-id ACTUAL_ID   --context "Observed source and failure; permitted correction; scope that must remain unchanged."
speed status --feature adaptive-auth
```

Retry normally updates guidance/state; the next Run executes pending work. Branch audit
can instead classify prior work as already integrated. Inspect actual code and commits.
`--reset-branch` deletes a branch, while Recover can kill tracked agents and remove
worktrees. Neither is a default recovery step. Preserve partial work and confirm the
original process is dead before any applicable Recover decision.

Write one cause, its evidence, permitted correction or owner action, and the check that
would distinguish the next attempt. A policy question returns to its accountable owner.

## 4 Admit integration and inspect the target: 20 minutes

Use a completed, admitted checkpoint with the same source/spec provenance. Check every
included task branch, its actual implementation, Review/Coherence inputs and blockers.

```sh
python3 "$course_assets/run-and-record.py" "$course_workspace/review-01" --   speed review --feature adaptive-auth
python3 "$course_assets/run-and-record.py" "$course_workspace/coherence-01" --   speed coherence --feature adaptive-auth
```

Inspect the emitted reports or the matching recorded reports within the stage budget.
Dependency merges can reduce later diffs; reconstruct the candidate from the original
pre-run baseline. Complete [integration admission](assets/templates/integration-admission.md).
A useful partial result does not establish all F2.1/F2.2 requirements.

```sh
python3 "$course_assets/run-and-record.py" "$course_workspace/integrate-01" --   speed integrate --feature adaptive-auth
```

`MAIN_BRANCH` is set, so Integrate does not ask about the branch. Before merging, it stops
if tracked files have uncommitted changes. A failed regression, a failed contract check
or a Guardian rejection stops it before it marks the feature complete. If no blocking
check fails, it asks whether to run observation extraction. Choose `n` to place
extraction in the next required Learn stage. This is sequencing; Learn is not optional
in the course. The prompt reads `/dev/tty`, so piping an answer into stdin is
insufficient. Do not add `--yes`; it runs extraction without asking.

Record candidate SHA and compare with the retained 301.1E baseline. Run `npm test` on
the actual target and retain the configured acceptance commands from the admitted plan.
Use their real names; the fixture has no supplied `npm run acceptance` script.

```sh
git rev-parse HEAD
git log --graph --oneline -15
git diff "$course_baseline"..HEAD -- src test specs
python3 "$course_assets/run-and-record.py" "$course_workspace/target-tests" -- npm test
python3 "$course_assets/capture-evidence.py" "$course_lab" "$course_workspace/after-integrate" --feature adaptive-auth
```

The trainer supplies `course_baseline` from the frozen handoff, not a moved target.
Inspect regression, contract, Guardian and traceability separately. Check warnings,
missing source, absent checks and owner questions even when feature state is completed;
a state completed by an earlier Integrate stays when a rerun fails.
`integrate --continue` is unsupported in this parser. Preserve a failed candidate and
choose supported recovery based on the actual Git state.

## 5 Learn: 20 minutes

Follow the [Learn exercise](learn.md): predict, preserve, preview, extract,
inspect, synthesize and trace forward. It uses `course_feature=adaptive-auth` in the same
workspace or a clearly labelled, source-matched recorded continuation.

Submit the [learning review](assets/templates/learning-review.md). Trace
an observation ID to its original artifact and a retained entry into the actual next
context, or record why that chain is absent. Review rejects, conflicts, convention
changes and automatic injection. Reject at least one unsupported proposed generalization
using evidence; that decision does not itself change active memory.

## 6 Individual transfer: 20 minutes

The trainer releases one unfamiliar assessment packet.
Use 12 minutes to inspect it, five to write the disposition and three for its written
counterfactual. Work independently. Cite source evidence, permitted scope, recovery,
learning and next owner action. Recorded analysis is labelled separately from live
command performance. Instructor grading can happen after the session.

## 7 Handoff and close: 10 minutes

Complete [handoff to 301.3E](assets/templates/handoff-to-301-3e.md). Include
original source/spec revisions, candidate and baseline, actual included scope, execution
and integration checks, learning IDs and active memory, remaining risks and owners.
Another learner must locate the candidate and one unresolved question without an oral
explanation. State candidate, bounded partial scope or blocked disposition. Keep the
participation record accurate: live commands / recorded checkpoint / case analysis.
