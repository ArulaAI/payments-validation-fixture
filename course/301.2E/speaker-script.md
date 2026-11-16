# 301.2E speaker script

Teach Execute, Integrate, Learn from the actual 301.1E adaptive-auth handoff to a
candidate, reviewed learning and an independent-validation handoff in 120 minutes. The learner workbook contains the runnable classroom commands; this script
adds the explanation, source walkthrough, learner decisions and recovery checkpoints.

## Presenter setup

Read the [framework](execute-integrate.md),
[SPEED reference](speed-reference.md) and
[trainer brief](trainer-brief.md). Keep the facilitator answer key outside
the learner's repository and harness context.

Set up three views: specifications/task graph, terminal with live execution, and retained
evidence/Git history. The source walkthrough uses the installed SPEED checkout named
in the source manifest. Source anchors below are function names so a line-number change
does not silently redirect a lesson.

Use independent continuations of the same payments fixture. The original code, accepted
RFC revisions, plan/contract, Verify scope and owner decisions come from 301.1E. The current authoring checkout has no populated
adaptive-auth plan; inspect the actual cohort handoff before scheduling live delivery.

Use the seven framework slots: 15 / 20 / 15 / 20 / 20 / 20 / 10 minutes. Waiting and
transitions are included. At a slot deadline, switch to a labelled recorded checkpoint
from the same frozen source and admitted scope in a separate workspace. Leave active
work under its operator's control. Record live versus replay participation. Provisioning
happens before class; learners need no additional homework.

## 1 Admit the handoff and inspect the harness: 15 minutes

### Say

> We are taking responsibility for execution. Product, Design, Architecture and the
> engineer's reviewed specifications supply the intent. The task plan is a proposed
> route through that intent. Before agents write code, we decide what scope is ready,
> which branch may change and what remains with another owner.
>
> This is the adaptive-authorisation feature you specified in 301.1E. The traveller
> and card-testing scenarios share the gateway and bank-confirmation contracts. We
> execute only the reviewed scope; unresolved Risk, Legal, Product and release decisions
> remain with their owners.

### Do

Follow workbook stage 1. Show the independent root, approved target, frozen source
baseline, specification digests, handoff and actual saved task files. Trace one accepted
F2 requirement to a task, declared files, dependent consumer and intended check. Preserve
the original scope and any F2.2 gaps. A new installation's feature-planning capability
does not prove an older cohort's saved plan was feature-wide.

Show the retained baseline tests and inspect the actual test configuration. A baseline
pass describes the existing behavior. It does not establish the new adaptive behavior.
Do not update characterization tests without the accepted change and scope.

### Engineer decision

Accept the exact teaching scope after inspecting its plan, or state a specific blocker.
Confirm the actual F2 planning scope. Context containing both RFCs does not by itself establish that a saved plan covers both.

### Checkpoint

The learner names the input contract, independent target, retained baseline, actual task responsibilities and any owner questions. Correct an unexplained whole-feature claim
before proceeding.

### Inspect the execution harness within the same 15-minute stage

### Say

> The model writes a task implementation inside a larger control system. That system
> chooses eligible tasks, assembles context, gives tools access to a worktree, observes
> completion and runs checks. We need to understand that harness to supervise it.
>
> A worktree isolates a task's working files. The integration branch can still move.
> In this implementation, Run merges completed dependencies immediately before it
> creates a dependent task's worktree. Integration has already begun at that point.

### Do

Open these installed source functions and relate them to the visible task graph:

| Source | Show | Teaching question |
| --- | --- | --- |
| `lib/tasks.sh`: `task_deps_met`, `task_topo_sort` | Status/dependency logic | Which actual consumer must wait for its interface producer? |
| `lib/cmd/run.sh`: `_get_ready_tasks`, `cmd_run` | Eligibility, maximum parallelism and file-conflict deferral | Does the graph capture all real dependencies and shared-file ownership? |
| `lib/git.sh`: `git_main_branch`, `git_record_feature_base_branch`, `git_create_baseline` | Target selection, automatic baseline commit and worktree creation | Which repository and branch are allowed to change? |
| `lib/cmd/run.sh`: deferred dependency merge and Layer 2/3 assembly | Predecessor code, decisions, concerns and prompt fallback | What does the next developer actually receive? |
| `agents/developer.md` | Work protocol, declared scope, checks and blocked output | What should an agent do when the specification is insufficient? |

Have learners annotate the actual plan, selecting a producer and dependent consumer. Mark when the target can move and when the consumer receives its worktree.
Read `agent_model` on each task. A populated task model takes precedence over the Run
command's fallback model selection.

Open the actual AGENTS/CLAUDE Quality Gates configuration. Check whether it invokes
`npm test`; an npm script alone does not configure SPEED. Retain unconfigured entries. Do not describe those as green checks.
The legacy text criteria need manual interpretation even when artifact checks pass.

### Prompt to the supervising harness

```text
Read the approved contract and these task records. Explain readiness, dependencies,
declared files, actual models, target branch and configured checks. Show which shared
state can change during Run. Identify missing decisions before execution. Do not change
the plan or implement anything during this inspection.
```

### Checkpoint

Each learner explains why increasing concurrency cannot remove a dependency or resolve
shared ownership. Ask one learner to identify the fallback context path and the evidence
needed to judge whether it was adequate.

## 2 Supervise Run: 20 minutes

### Say

> We have admitted the plan. Run will now produce a state transition and code history
> that we can inspect. The agent's completion message is one input. The orchestrator's
> gates and the resulting commits are separate evidence.

### Do

Capture the pre-run state and use the workbook's recorded Run command. While it runs,
use the second terminal to inspect status, worktrees, task records and branch history.
Do not edit the active task records to steer a live run.

Follow one actual task from `pending` to `running` and then its observed result. If the
task finishes between inspections, reconstruct it from its timestamps, branch, gate
results and retained log. A removed worktree does not mean its branch never existed.

Open `lib/cmd/run.sh` at the completion branches. Explain the distinctions:

| Observation | Controller route | Engineer inspects |
| --- | --- | --- |
| Completion marker absent and process gone | Task failure for a vanished process | Process/marker evidence, output and retained work |
| Provider error marker | CLI failure | Raw authentication/model/provider response before implementation diagnosis |
| Timeout | Timeout handling and possible model escalation | Actual work, timeout history, configured budget and remaining scope |
| Parsed blocked response | Blocked task and support analysis | Missing decision, attempted work and accountable owner |
| Output and passing gates | Task done and worktree cleanup | Scope, checks, manual criteria, concerns and resulting commits |
| Grounding or quality failure | Failed or blocked route, depending on retry history | Specific failed check and its input rather than the summary label |

Follow the admitted producer branches into the target before the actual consumer starts.
Show its new worktree/context and the merged contracts it can see. Compare the consumer's
implementation and tests with the same accepted F2 specification. Preserve the original
pre-run baseline so a moving target does not erase the comparison.

### Explain the checks

Grounding checks inspect facts such as declared artifacts, changed files and evidence.
Their enforcement varies: a small number of undeclared files can be warning-only;
manual criteria can remain unverifiable; security scanning may warn. Quality gates
run the configured commands. A full-suite failure can have a task-scoped fallback warning.
The engineer must inspect the result names, status, command and limits.

The [SPEED reference](speed-reference.md) records these distinctions. Keep
them tied to a visible result, rather than lecturing through every implementation detail.

### Checkpoint

Each pair records one complete task transition and one actual omission or warning.
They compare the process exit, task states, check output and Git history. If the run
stops early, that failure becomes the next recovery exercise.

## 3 Diagnose and recover: 15 minutes

### Say

> We will preserve the failed attempt, identify what actually failed and change the
> relevant cause. Useful work and unresolved owner decisions stay visible. Retry is
> a reasoned intervention in state and context.

### Do

Use an observed failure. The authentication case in
[recovery flow](recovery-flow.md) provides a recorded example. If there is
no live failure, give the constructed F2 bank-confirmation mismatch and label it as case analysis.

Require a five-part diagnosis before a recovery command:

1. Original input and task criterion.
2. Actual command and raw provider/check response.
3. Recorded task state and resulting code/branch state.
4. Cause supported by those observations, with remaining hypotheses separated.
5. Exact next action, allowed scope and check that will examine it.

Show `cmd_retry` in `lib/cmd/retry.sh`. With context it appends feedback and normally
resets an eligible task to pending. It can audit the prior branch and return done.
It does not always start a developer. The next Run executes pending tasks.

Write the retry guidance together, then let learners revise it. It should cite the
actual failure and preserve requirements. A vague “try harder” or a suggested business
policy is insufficient.

Run Retry, inspect its resulting state, and record the next Run as a new attempt. Compare
the real changes and checks with the preserved failure. When recovery is blocked by an
owner or unavailable environment, record the owner and exact next action.

### Stale state demonstration

Discuss the interrupted-run assessment case before running Recover anywhere. Show
`cmd_recover`: it can kill tracked agents, break locks, reset running records and remove
worktrees. Learners must first establish that the original orchestrator is no longer
active and preserve useful work. A stale-looking display does not prove a dead process.

Do not deliberately crash an uncontrolled session. A marked case packet is sufficient
for this risk; any live interruption exercise uses only the prepared disposable lab.

### Checkpoint

Each learner defends a recovery that changes one cause and retains the failed record.
Ask what they would do if the task were already done, if the branch contained valuable
uncommitted work, or if the missing answer belonged to Product.

## 4 Admit integration and inspect the target: 20 minutes

### Say

> We have task results. We now decide whether their branches and shared contracts
> support integration of the declared scope. Some dependencies may already be on the
> target, so our original baseline matters.

### Do

Use the workbook's Review and Coherence commands. Read the actual reports and input
scope. Review can change task dispositions; `coherence --resolve` creates repair work,
so it is a separate decision from reading Coherence findings.

Show how branch-relative diffs change after a dependency merge. Use the saved pre-run
baseline to inspect producer work that a later target-relative report may omit. A report
based on no changed lines cannot establish that implementation's semantic correctness.

Have pairs complete the integration-admission template. Require evidence for every
included task branch, remaining warning and owner blocker. If Review requests changes,
handle the recorded task state and actual findings before proceeding. Do not modify a
verdict just to permit integration.

### Checkpoint

The learner names the exact scope allowed to integrate and supports it with code,
tests and records. Ask whether a missing branch should be counted as already merged.

### Integrate and inspect within the same 20-minute stage

### Say

> Integrate merges the remaining done branches in dependency order and runs configured
> post-integration checks. We will inspect each result and the actual target commit.
> The command's feature-completion record is one record in that evidence.

### Do

Capture before-integration state. Open `cmd_integrate` and `agents/integrator.md` before
the command so learners see the agent's authority and the merge target. The merge agent
has write-capable tools. It may resolve a conflict; the engineer must inspect that diff.

Run the workbook's recorded Integrate command. At the observation-extraction prompt,
choose `n` to defer extraction to the required Learn stage that immediately follows.
Record the choice and do not omit Learn. The prompt reads `/dev/tty`, so a pipe to stdin is not an equivalent control.

Walk the actual results in order:

| Stage | Mechanism | Evidence and limit |
| --- | --- | --- |
| Remaining branches | Topological selection and integration agent | Branch list, target, actual merge commits, conflict diff and agent report |
| Regression | Configured test/lint/type commands | Exact commands, actual outcomes, and unconfigured entries |
| Code context rebuild | Layer 1 rebuild | Whether fresh context exists or the command warned about stale context |
| Contract | Artifact existence verification | Declared files/symbols; this does not establish full behavior |
| Guardian | Model judgment using supplied diff and intent | Actual diff coverage, report and unresolved judgment |
| Traceability | Spec-to-task reference check | Coverage against the saved scope, not executed behavior |
| Learn prompt and completion state | Extraction deferred to required stage 5; state write | Record the choice and compare completion with individual results |

Inspect the target history and retained-baseline diff. Run the target regression and
admitted behavior-specific checks explicitly. A producer task's tests passing on its branch is distinct
from the assembled target running those checks.

### Failure recovery

If regression or another required check fails, preserve the candidate and report before
choosing a repair. This implementation can continue and mark the feature complete after
some failed checks. A learner who notices that mismatch should block the affected scope.

If a conflict message suggests `speed integrate --continue`, inspect the parser: that
option is unsupported here. Distinguish a real Git merge in progress from a completed
partial integration. Use the recovery guide's evidence-first decision; do not run a
destructive reset or guess a generic continuation command.

### Checkpoint

Each pair identifies the candidate SHA, actual included work, target checks and any
unexamined behavior. The learner can explain why a file/symbol contract pass and a
traceability ratio answer narrower questions than feature acceptance.

## 5 Learn from execution evidence: 20 minutes

### Say

> Integration produced a candidate. Learn reads available execution artifacts and can
> change memory used by future agents. We must decide what the evidence actually
> supports before treating a signal as a reusable lesson. The current requirements
> retain authority, including different unavailable outcomes in the two F2 paths.

### Do

Follow the [Learn exercise](learn.md): three minutes to predict/preserve,
five to extract/inspect, six to synthesize/trace and six to decide. The commands target
`adaptive-auth` in the same admitted continuation or its labelled recorded checkpoint.

Show `cmd_learn`, `learn_extract`, `synthesize` and the actual context bridge. Explain
observation IDs/source artifacts, auto-discovered conventions, structural quality rejects,
file/directory matching and the top-three fallback. A preview prints counts/warnings;
it is not a complete observation approval screen. Single-player writes can become active
without mandatory human curation. Preserve before/after memory and the actual context.

Ask each learner to trace one source-to-observation-to-entry chain. If no entry survives,
record that fact. Do not plant a desirable example. The trainer may use a labelled F2
teaching claim for the second decision: “Because F2.1 holds on provider unavailability,
all F2.2 block-match challenges should also hold.” Learners must consult both RFCs and
reject that unsupported cross-path policy generalization.

### Checkpoint

The learning review cites evidence IDs, source scope, active memory and an actual context
preview or its failure. The learner explains why an observation, a model opinion and
an owner-approved requirement have different authority. A review note is not a control
that automatically prevents memory injection. Unsafe active advice blocks subsequent
agents until an accountable correction is made and checked.

## 6 Assess unfamiliar work independently: 20 minutes

Give each learner one input packet from the assessment guide, without its facilitator
key. Use 12 minutes for diagnosis, five for the response and three for the written counterfactual. They may consult the commands and source reference but must
make their own diagnosis, recovery decision and handoff.

Use the rubric consistently. Release a written counterfactual with the packet: change one task
status, one branch fact or one owner decision and ask how the next action changes.
Do not tell the learner the defect before scoring their reasoning.

The live practical submission demonstrates command/evidence performance. A constructed
packet demonstrates unfamiliar diagnosis. Record the basis of each result accurately.

## 7 Hand off to 301.3E: 10 minutes

### Say

> Another engineer should be able to start independent validation from this packet:
> original intent, original baseline, candidate code, execution history, checks, learning provenance and
> unresolved decisions. Our handoff makes the candidate and its limits reproducible.

### Do

Have learners complete the handoff template and swap packets. The receiving learner
must locate the baseline, candidate commit, declared checks, active learning and one remaining question
without oral explanation. Correct gaps in reproducibility before final submission.

Discuss three valid endings: a candidate for independent validation, explicit partial
scope with affected behavior blocked, or a fully blocked handoff with owner and next
action. Separate these from Product acceptance, operational readiness and production
promotion.

### Final assessment of the taught habit

Ask: “What changed your confidence, what did the tooling leave unanswered, and what
would the next reviewer need to check independently?” Retain answers with the rubric
and use actual delivery time and support burden to revise the next course run.
