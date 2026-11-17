# 301.2E SPEED command and harness reference

This reference describes the pinned SPEED build, commit `a8bde62` (see
[SPEED version](../../README.md#speed-version)). It was checked against that commit. The
trainer holds its source manifest and checks the installed executable and changed
functions before teaching. Comments and suggested commands are checked against the parser
and actual control flow.

## Command map

Place the command first and its options afterward. Always state the feature explicitly
during classroom execution.

| Command | Inputs and effects | What to inspect |
| --- | --- | --- |
| `speed run --feature NAME --max-parallel 2` | Executes eligible pending tasks; can commit the current baseline, create task branches/worktrees and merge completed dependencies | Task graph, actual model per task, provider output, gate results, target history and final task counts |
| `speed status --feature NAME` | Reports feature/task state | Compare labels with actual branch and check evidence |
| `speed retry --feature NAME --task-id ID --context "..."` | Appends human feedback; inspects prior work; normally resets eligible failed/blocked work to pending | Resulting task state, accumulated feedback, branch audit and retained work before another Run |
| `speed recover --feature NAME` | Can terminate tracked agents, break locks, reset running tasks and remove worktrees | Confirm original run is inactive and retain patches/commits/logs first |
| `speed review --feature NAME` | Reviews done tasks and can change their dispositions; includes Guardian checks | Actual input diff, cited spec, model findings, resulting task verdict and limits |
| `speed review --feature NAME --task ID` | Its prompt holds the task's diff, declared files and author model, not its description or criteria; writes `reviews/task-ID.review` and leaves task status unchanged | The diff range it prints and the written review |
| `speed coherence --feature NAME` | Compares task implementations for composition problems | Shared interfaces, schemas, names, connections and actual available diffs |
| `speed coherence --feature NAME --resolve` | Creates follow-up task work from findings | A separate plan decision and the new task's scope |
| `speed integrate --feature NAME` | Selects remaining done branches, invokes merge agent and performs post-integration checks; stops before completion when a merge or blocking check fails | Target selection, merges, target commands, warnings, missing checks and resulting candidate commit |
| `speed learn --feature NAME --dry-run` | Previews extraction counts and warnings without writing observations | Source artifacts and warnings; this is not a full proposed-entry approval screen |
| `speed learn --feature NAME` | Extracts observations; can retrain a classifier and trigger convention discovery | Actual JSONL, provenance, memory changes and heuristic errors |
| `speed learn --synthesize` | Writes agent-specific learning files plus rejects/conflicts/meta | Actual retained advice and its future context scope |
| `speed learn --summary` | Reports aggregate observation counts | Counts do not establish truth or acceptance |
| `speed gates --feature NAME --task ID --worktree PATH --full` | Runs task checks against a specified worktree | Actual gate names, commands, results and unconfigured checks |

The feature course uses task execution, not `--defect` mode. A later confirmed defect
can enter the established defect workflow under its own approved scope.

## Run in source order

| Step | Mechanism | Source anchor | Teaching consequence |
| --- | --- | --- | --- |
| Select namespace and lock | Deterministic | `cmd_run`, `feature_activate` | Feature paths and target must belong to the intended repository |
| Check task files and graph | Deterministic | `_require_readable_tasks`, `task_topo_sort` | Invalid task JSON, unknown dependency IDs and cycles stop execution; semantic dependency completeness still needs judgment |
| Commit baseline if dirty | Deterministic Git mutation | `git_create_baseline` | Uncommitted and untracked project files may be committed by Run |
| Record feature base | Deterministic Git state | `git_record_feature_base_branch` | Without MAIN_BRANCH, Run records its starting branch and reuses an existing valid feature base |
| Reconcile stale running state | Process/state mutation | Stale-state branch in `cmd_run` | Recovery can stop agents, reset task records and remove worktrees |
| Find ready work | Deterministic scheduling | `_get_ready_tasks`, `task_deps_met` | Status, dependencies, file ownership and concurrency affect readiness |
| Merge completed dependencies | Deterministic Git merge with lock | Deferred merge in `cmd_run` | The integration target can move before Integrate |
| Audit or refresh prior branch | Git/check-based branch audit | `branch_audit`, worktree preparation | A retry can reuse, refresh or classify existing work; inspect the result |
| Build context | Context assembly, with fallback | Layer 2/3 calls in `cmd_run` | Inspect original specs, task context, decisions/concerns and any fallback |
| Start developer | Model using tools in task worktree | `provider_spawn_bg`, `agents/developer.md` | Its code, tests, commits, completion statement and concerns need inspection |
| Process completion | Deterministic controller over provider evidence | Marker/error/timeout/blocked branches in `cmd_run` | Transport failure, timeout, blocked output and failed code checks are distinct causes |
| Run task gates | Deterministic checks, configured commands and advisory results | `gates_run`, `grounding_run` | A task can finish with warnings and manual criteria |
| Summarize and reconcile | Counts and state changes | Run summary and JSON output in `cmd_run` | Read failed, blocked and pending counts alongside the process exit |

## Context and durable records

For the course's single-player namespace:

| Path | Role |
| --- | --- |
| `.speed/features/NAME/tasks/ID.json` | Task intent, ownership, dependency, status, actual model and gate results |
| `.speed/features/NAME/logs/ID.log` | Provider output and completion material |
| `.speed/features/NAME/logs/` | Review, Coherence, Guardian, integration and support reports as emitted |
| `.speed/features/NAME/state.json` | Feature controller state; it is separate from task state and behavioral acceptance |
| `.speed/features/NAME/contract.json` | Declared implementation artifacts |
| `.speed/worktrees/NAME/task-ID` | Live task working files; the controller may remove this directory |
| `.speed/context/tasks/ID/context/` | Code, task, spec and budget context packages when emitted by the inspected path |
| `.speed/features/NAME/base_branch` | Starting branch retained by Run unless MAIN_BRANCH overrides selection; fresh Plan clears the old record |
| `.speed/memory/observations/NAME.jsonl` | Extracted single-player observations, including heuristic results that require source review |
| `.speed/memory/learnings/` | Agent-specific advice, synthesis metadata, rejects and conflicts used by later context assembly |
| `.speed/memory/conventions*.json` | Convention discovery outputs; extraction can update these automatically |
| Git target and task refs | Durable code/merge history; retain the pre-run baseline before either command |

Feature namespaces isolate runtime paths. Git target selection and some context paths
still require inspection across simultaneous features. The course uses one feature in
each independent repository.

## What gates establish

| Result family | Actual boundary |
| --- | --- |
| Diff/artifact checks | Establish a change and declared files/symbols, within their implementation |
| Ownership and scope | Ownership violations can fail; a small number of undeclared files can warn |
| Test coverage check | Checks expected test-file coverage; it does not prove that assertions are strong |
| Criteria check | Legacy text/manual criteria can remain unverifiable and require human judgment |
| Quality commands | Only the syntax check and the lint/type/test commands that actually ran establish their results |
| Scoped test fallback | A warning can record task-scoped tests passing despite a full-suite failure |
| Security checks | SAST/SCA in the inspected gate path are advisory; availability and results must remain visible |
| Secret checks | Inspect their specific ruleset and reported result; they do not establish every data-flow policy |

`SKIP_GATES=true`, `SKIP_GUARDIAN=true` and `integrate --skip-tests` change evidence.
They are not completion shortcuts in the assessed workflow. Run's task gates read lint,
typecheck and test commands from the AGENTS/CLAUDE Quality Gates section. With no test
entry, they fall back to `npm test` when `package.json` has a test script. Lint and
typecheck have no fallback. Integrate's regression runs only the listed commands. Run and
Integrate do not run other entries in that section, such as `e2e`. Read the actual
section and keep unavailable lint/type entries visible.

## Integration in source order

`cmd_integrate` locks the feature, checks the dependency graph and selects done task
branches in topological order. It stops if the target branch does not exist. It skips
branches it finds already merged into `git_main_branch`. Off the target with MAIN_BRANCH
unset, it asks `[y/N]` before going on; with no terminal it exits unless given `--yes`.
Before merging it refuses uncommitted changes to tracked files. The integration agent
receives a target branch and write-capable tools, merges with `--no-ff`, resolves
conflicts when justified and reports results. Integrate then checks in Git that every
branch landed. The engineer checks actual Git history and any conflict-resolution diff.

Post-integration steps are configured regression commands, a code-context rebuild,
artifact contract checks, Guardian and specification traceability. A failed regression,
a failed contract check or a Guardian rejection then stops Integrate with a gate failure.
It does not reach the observation-extraction prompt or mark the feature complete. A
flagged or unparseable Guardian result, unconfigured regression, a failed context rebuild
and the traceability ratio do not stop it. Read every result before assigning a
candidate disposition.

## Behavior the course handles explicitly

| Observed source behavior | Lesson and operator response |
| --- | --- |
| Global options such as `--feature` and `--json` are read wherever they appear | Teach one form, `speed run --feature NAME`, matching the workbook |
| MAIN_BRANCH wins; otherwise Run records the starting branch, reuses a valid recorded base, then falls back to default-branch detection | Inspect environment, current branch and feature base together. Syntax gates now use this base instead of hardcoded main |
| Run can baseline-commit all dirty project files | Use a clean independent classroom repository and inspect what will enter history |
| Run merges dependencies before spawning dependent work | Save the baseline before the first Run and inspect history throughout execution |
| Populated `agent_model` takes precedence over Run's model fallback | Read actual per-task models instead of inferring them from a command flag |
| An ancestor task branch may be treated as already integrated during branch audit | Verify real implementation commits and behavior, particularly after provider startup failures |
| Run's exit/JSON completion can omit blocked/pending scope from the failure test | Inspect all task counts and the admitted requirement scope |
| Integrate considers done tasks; it warns about a done task with no branch and no merge commit, then continues | Require an admission check for expected tasks, existing refs and actual included work |
| Review diffs a task from the commit its Run started from, recorded on the task, so a dependent task's diff can include merged producer work. Coherence and post-integration Guardian diffs compare with the moving target and can omit merged work | Reconstruct the candidate from the original baseline and inspect actual model inputs |
| Integrate's regression does not fail on unconfigured test, lint or typecheck commands; with none configured it warns that it checked nothing | Read the regression summary and require the intended target checks |
| Contract checks verify declared artifact existence | Run behavior-specific tests and hand remaining independent validation to 301.3E |
| Specification traceability extracts requirements heuristically and can miss a requirements table | Read the extracted requirements and reconcile the full requirement-to-task/test matrix manually |
| Guardian now sends human verdict text to stderr and emits verdict JSON on stdout only with --json | Retain both streams and the actual report path; missing/unparseable verdicts are not alignment |
| Guardian distinguishes a verified conflict from an interpretive concern with an owner | Preserve the cited text, severity and required owner decision |
| Integrate stops before completion on a failed regression, a failed contract check or a Guardian rejection. Other gaps do not stop it, and a feature completed by an earlier Integrate stays completed when a rerun fails | A required failed/unavailable check blocks the affected candidate, regardless of feature state |
| Integrate refuses a missing target branch, uncommitted tracked changes or a target checked out in another worktree | Set MAIN_BRANCH to the admitted target, start from a clean tree and read why it stopped |
| `integrate --yes` runs observation extraction without asking | Leave it out in class so extraction stays in the Learn stage |
| Run's persistent dependency-merge conflict message mentions `integrate --continue`, but its parser accepts no such option | Diagnose the actual Git state and use supported recovery actions |
| Recover can kill tracked processes and remove worktrees | Confirm a dead original run and preserve useful work first |

These are boundaries to teach in the installed version. The course does not patch
SPEED. Any desired product correction needs its own issue, scope and authorized change.

## Learn in source order

`cmd_learn` chooses extraction, summary, synthesis or an extension. Single-player extraction
reads task/log artifacts, parses available Verify/Coherence output, emits observations,
appends deduplicated JSONL and can retrain the classifier and run convention discovery.
A dry run avoids observation writes but does not print or approve every observation.

`lib/learn/synthesize.py` routes and reframes observations by agent, handles staleness,
deduplication/conflicts, structural quality and token budgets, then writes learning files.
It makes no LLM call. Those checks do not prove a reusable claim is true. The earlier
technical rehearsal observed successful test logs classified as gate failures; inspect
source results before using a type label as a fact.

`lib/context_bridge.sh` loads these learning files into actual agent prompts. File or
directory matching can fall back to the highest-weight three entries. Inspect the exact
task fields passed and actual output. Single-player synthesis has no mandatory human
approval gate. `--pending`, `--merge` and `--curate` are separate multi-player operations.
`--post-merge` is an optional correction-signal extension, with heuristic approval labels.

See the required [Learn exercise](learn.md) and preserve actual memory
changes in the 301.3E handoff.

## Source anchors

SPEED checkout used for this reference: commit `a8bde62`, with file digests in the manifest.
The preparation and capture utilities are course assets and do not alter that checkout.

| Source | Relevant implementation |
| --- | --- |
| `speed` | Command/global-option parsing and dispatch |
| `lib/config.sh`, `lib/features.sh` | Defaults, actual paths and namespaces |
| `lib/cmd/run.sh` | Scheduling, context, provider lifecycle, dependency merges and summary |
| `lib/git.sh` | Target selection, baseline, worktrees and merges |
| `lib/tasks.sh` | Task transitions and dependency resolution |
| `lib/gates.sh`, `lib/grounding.sh`, `lib/quality_gates.py` | Configured quality checks, test fallback, warnings, contract and regression |
| `lib/cmd/retry.sh` | Retry, branch audit, explicit branch reset and Recover |
| `lib/cmd/review.sh`, `lib/cmd/coherence.sh` | Supporting review evidence and follow-up state |
| `lib/cmd/integrate.sh`, `agents/integrator.md` | Merge instructions, post-checks and completion state |
| `lib/provider.sh`, installed provider adapter | Timeout, provider errors, tools and completion markers |
| `agents/developer.md` | Task agent scope, work protocol and blocked/completed output |
| `lib/cmd/learn.sh`, `lib/learn_bridge.sh`, `lib/learn/` | Extraction, synthesis, local classification, convention discovery and learning provenance |
| `lib/context_bridge.sh`, `lib/context/assembly.py` | Actual learning filters and prompt injection |
| `lib/cmd/plan.sh`, `lib/cmd/verify.sh`, `lib/cmd/guardian.sh`, `lib/shared.sh` | Updated admission behavior, explicit verdicts, scoped repair and Guardian reporting |
