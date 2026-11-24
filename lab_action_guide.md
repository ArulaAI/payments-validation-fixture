# Lab 301.1E Action Guide

## Define Audit Plan

Follow this guide while your facilitator leads the session. Each step tells you what to run, what to inspect, and what to decide before moving on.

**The idea behind the lab:** use the supplied product, architecture and design documents to develop technical specifications, then inspect whether the generated plan preserves their intent.

> Agent wording, questions, findings, task counts and timings can vary. Read the actual output. A successful command does not mean every requirement is covered or every owner has approved the design.

## The scenario

You are an engineer working on a card-payments authorisation service. The existing risk rules have two weaknesses:

- **F2.1 — genuine traveller:** a UK cardholder visiting Tokyo buys a £2,499 television from a UK retailer for delivery home. The system declines the payment because its launch rule rejects payments of £1,000 or more when the shopper's IP country differs from the card issuer's country.
- **F2.2 — card-testing attack:** a script tests forty stolen card numbers across twenty merchants in under three minutes. Each card is used once, so the current per-card attempt limit misses the pattern.

The proposed adaptive-authorisation feature introduces risk assessment, bank confirmation, analyst review and cross-merchant attack detection. Both scenarios share the payment gateway and bank-challenge contracts.

Product, Architecture and Design have supplied inputs. Two technical specification drafts already exist. Your job is to review and develop those drafts, record decisions and unresolved dependencies, and inspect the plan generated from the agreed scope.

**This lab ends at Handoff. It does not execute implementation tasks.**

## What you will do

`Orient → Validate → Dashboard (optional) → Define and Draft → Audit → Plan → Verify → Handoff`

The authoring work covers **both F2.1 and F2.2**. The Plan command in this guide uses **F2.1 as its primary specification**, with other documents considered as related context. It does not establish complete planning or verification of F2.2.

## How to use this guide

| Label | Meaning |
|---|---|
| **Goal** | Why the step exists |
| **Tool / human** | What the tool does and what you decide |
| **Run** | Commands for the regular terminal |
| **Inside Claude Code** | A prompt entered in the Claude conversation, not the shell |
| **Open** | A file to inspect in your editor |
| **Expect / look for** | Evidence to examine in the actual result |
| **Decide** | The checkpoint before continuing |
| **Leaves behind** | Records used by later stages |

Keep two terminals available: one for regular shell commands and one for the native authoring conversation. Run shell commands from the **fixture repository root**, unless a step explicitly says otherwise. Do not run stages concurrently: later stages read and can replace records created earlier.

For plain-language explanations of the command groups, see [commands_exp.md](commands_exp.md).

For files, use your editor's **Go to File** action and search for the path shown. Section headings and symbols are more reliable than line numbers after edits.

---

## Before you start

Use the lab environment and Workbench build confirmed by your facilitator. The fixture branch is `feat/301-define-audit-plan-config`; the compatible Workbench build is supplied on `feat/301-latest`. They are separate repositories and do not need matching branch names.

These commands assume the following macOS folder layout. If yours differs, substitute the approved locations before running them. Windows participants should use the facilitator-provided shell and executable paths.

```text
$HOME/Lab/
├── workbench/
└── 301.1E/
    └── payments-validation-fixture/
```

**Run — regular terminal.** Select the prepared Workbench installation and open the fixture:

```bash
export FIXTURE_DIR="$HOME/Lab/301.1E/payments-validation-fixture"
export SPEED_DIR="$HOME/Lab/workbench"
export SPEED_PYTHON="$SPEED_DIR/.venv/bin/python3"
export PATH="$SPEED_DIR:$PATH"
hash -r
cd "$FIXTURE_DIR"
```

Confirm the environment:

```bash
pwd
git branch --show-current
git status --short
node --version
command -v speed
printf 'Workbench source: %s\n' "$SPEED_DIR"
"$SPEED_PYTHON" --version
git rev-parse HEAD
git -C "$SPEED_DIR" rev-parse HEAD
speed help
```

**Expect / look for.**

- You are in the fixture on `feat/301-define-audit-plan-config`.
- Node supports the fixture's native TypeScript execution; use the facilitator-approved version, at least Node 22.18.
- Workbench's prepared Python environment is available, with Python 3.12 or newer.
- `command -v speed` resolves inside the Workbench folder you selected.
- `speed help` prints the command list without a blocking dependency error.
- Existing changes are understood and preserved. Do not reset a workspace to make the status clean.

The path settings affect this terminal. In a new terminal, repeat the selection block or use the environment configuration supplied by your facilitator. An already-running Claude process can retain earlier environment settings.

- [ ] The fixture branch and both repository revisions are confirmed.
- [ ] The selected executable belongs to the approved Workbench installation.
- [ ] The authoring harness is signed in and available.
- [ ] Existing work is preserved.

If a prerequisite fails, ask your facilitator before continuing. Do not install or switch to a different build during the session without confirming it.

---

## Step 1. Orient

**Goal.** Establish how the existing system behaves before the proposed feature changes it.

**Tool / human.** The test runner checks current assertions; you explain what those assertions demonstrate.

**Run — regular terminal.**

```bash
npm test
baseline_exit=$?
printf 'Baseline test exit code: %s\n' "$baseline_exit"
```

**Expect.** The baseline suite completes. Record the actual pass/fail result and exit code. If it fails, investigate with the facilitator before interpreting later results.

**Open and inspect.**

| File | Find | What to look for |
|---|---|---|
| `test/gateway.test.ts` | GW-02 and GW-03 | The traveller is declined and the response gives no useful reason |
| `test/gateway.test.ts` | GW-05 and GW-06 | All attack attempts are approved; attempt counts belong to individual gateway instances |
| `test/fixtures/traffic.ts` | `travellerTelevision` and `cardTestingBurst` | The requests behind the two scenarios |
| `src/payments/gateway.ts` | `GatewayResult` and `authorise` | Today's response types and the call into the risk rules |
| `src/risk/rules.ts` | `evaluate` | High-value cross-border rejection and the per-card velocity limit |
| `specs/README.md` | Specification index | The supplied documents and the existing technical drafts |

Amounts are in minor units: `249_900` pence is £2,499; `100` pence is £1.

**Decide.** Can you explain why the current rules decline the traveller but approve the attack?

**Leaves behind.** An observed baseline and a shared understanding of the two scenarios. No specification or source edit is required.

> A passing characterisation test can reproduce behavior the business wants to change.

---

## Step 2. Validate the specifications

**Goal.** Compare the supplied documents and investigate a finding against its sources.

**Tool / human.** Validate proposes inconsistencies and missing relationships; you confirm, refute or route each reviewed claim.

**Run — regular terminal, in three short blocks.**

**1. Session setup — create a unique evidence folder and display its path. Run once; keep this terminal open.**

```bash
mkdir -p .speed/course-301-1e
course_evidence_dir="$(mktemp -d .speed/course-301-1e/session-XXXXXX)"
echo "$course_evidence_dir"
```

Note the printed evidence path. If you reopen the terminal, restore `course_evidence_dir` to that exact path before using later copy commands. Each rerun needs a fresh snapshot destination; preserve earlier evidence. This three-block route assumes a fresh run. For a rerun with prior validation logs, preserve those first using the rerun instruction in [commands_exp.md](commands_exp.md#step-2-validate--three-short-blocks).

**2. Validate — compare the specifications for gaps and inconsistencies, then display the exit code.**

```bash
speed validate specs/
echo "Validate exit code: $?"
```

**3. Preserve evidence — save this run's logs before later commands overwrite them.**

```bash
cp -R .speed/logs "$course_evidence_dir/after-validate-logs"
```

**Expect / look for.**

- The printed number of specifications and the report path.
- A parsed result, or an explicit provider/response-format error.
- For a finding: its source document, cited passage, claimed gap and proposed destination.
- Whether the cited requirement belongs to this feature and still matches the current files.

The directory command reads Markdown files recursively under `specs/`, including READMEs and templates. A name ending in `latest` does not automatically exclude an older file.

**Open.** Use the report's printed path, normally `.speed/logs/validation.log`. Follow one actual finding into the relevant product, design, architecture and technical documents with your facilitator.

For a held-payment finding, compare:

- `specs/design/adaptive-auth/1-checkout-challenge.md`: **Held State** and **Data Binding**.
- `specs/tech/adaptive-auth/1-high-value-traveller.md`: the review state machine, merchant webhook contract and **Unresolved Questions**.
- `specs/product/adaptive-auth/1-high-value-traveller.md`: ST4 and the held-payment flow.

Read the current text. An earlier finding may already have been addressed, or may describe a known owner decision.

### Rehearsal example: understand the gaps

The fresh-baseline rehearsal on 3 November 2026 reported the following nine potential critical gaps. This is an example report, not a required output or an answer key. Check claims against the current sources before accepting them.

| # | Reported gap in plain language |
|---|---|
| 1 | Two product specifications disagree on whether authorisation moves money |
| 2 | F2.2 depends on bank-challenge interfaces that F2.1 has not fully defined |
| 3 | Blocks reference an Attack record, but its database storage is not specified |
| 4 | Attack history must remain, but the data used to reconstruct it gets deleted |
| 5 | The narrative writer receives fields its data-sharing rules prohibit |
| 6 | Held payments must expire after 72 hours, but the trigger for expiry is not specified |
| 7 | Product promises reasons for every decline; some technical paths provide none |
| 8 | One section promises one merchant notification; another specifies repeated notifications |
| 9 | The external AI call appears inconsistent with the platform's third-party data rule |

**Worked example — gap 6: the 72-hour expiry.** Ask: "The specification says an unattended held payment expires, but what actually runs that action?" In `specs/tech/adaptive-auth/1-high-value-traveller.md`, inspect the Review item state machine, API Surface (including the merchant expiry webhook), File Impact and Testing sections. Compare them with the architecture's 72-hour failure behavior and the product's held-payment requirement. Look for a named trigger, owning component, expiry operation and observable acceptance criterion. An omitted scheduler is a finding to investigate; do not invent one or accept a proposed owner automatically.

**Inside Claude Code — for this worked example:**

```text
Review the current validation report's 72-hour held-payment
expiry finding. Check the state machine, API, File Impact,
tests and architecture. Confirm or refute it with citations,
identify the owner or proposed owner, and record what it blocks.
Do not edit files or investigate all other findings yet.
```

If the current report does not contain this finding, select another actual finding and use the same evidence-review method. The purpose is to investigate one claim, not to force the example to appear or fix every reported gap immediately.

**Will these findings be identical every time?** No. AI reviews may identify, group, prioritize or classify gaps differently, and specification edits change the inputs. Record the actual report, status and count. The authoring questionnaire and Validator report serve different purposes. Neither is an answer key, and findings need to be checked against the sources.

**Decide.** Is the reviewed finding confirmed, refuted with evidence, or unresolved? Who owns the next decision, and what does it block?

**Leaves behind.** The preserved report and provider evidence, a finding disposition, and any owner request carried into authoring.

If Validate reports specification gaps, do not mark validation passed. You may investigate them in Define and Draft with the facilitator; planning readiness is a separate checkpoint. If the provider or parser fails, preserve that failure separately from the report's claims.

---

## Step 3. Open the dashboard (optional)

**Goal.** Inspect available project records in an additional view.

**Tool / human.** The dashboard displays records; you confirm that it is connected to the intended project.

**Run — regular terminal.**

```bash
speed dashboard status
```

Reuse an appropriate running service. If none is running and the facilitator is using this view:

```bash
speed dashboard start
dashboard_exit=$?
printf 'Dashboard start exit code: %s\n' "$dashboard_exit"
```

Open the **Dashboard** address printed by the command, commonly `http://localhost:3000`. The GraphQL address is the API, not the main participant page.

**Expect / look for.** Confirm the project and branch in the page header. It should identify this fixture and `feat/301-define-audit-plan-config`, not `round-0` from the previous lab. Check for later startup errors even if the launcher initially reports success.

**Decide.** Is the page connected to the correct project? If dependencies or ports prevent startup, record the limitation and continue with the IDE and authoring terminal as directed by the facilitator. Do not stop another person's service.

**Leaves behind.** An optional view of records. Opening the dashboard is not a specification approval, and dashboard commitment records do not replace decisions by Product, Design, Risk or Legal.

---

## Step 4. Define and Draft

**Goal.** Investigate consequential questions and turn accepted engineering decisions into reviewed technical specifications.

**Tool / human.** The authoring skill reads inputs, proposes questions and drafts edits. You check evidence, accept or revise engineering choices, and retain decisions that need another owner.

### Start the authoring workflow

Keep the IDE and native harness side by side. Open these files:

```text
.agents/skills/author-tech-spec/references/input-manifest.md
specs/tech/adaptive-auth/1-high-value-traveller.md
specs/tech/adaptive-auth/2-card-testing.md
```

**Run — a second regular terminal, fixture root.** Repeat the environment selection block from **Before you start** in this terminal so the harness inherits the approved Workbench paths. Then start the authoring conversation:

```bash
cd "$HOME/Lab/301.1E/payments-validation-fixture"
claude
```

Adjust the project path if your approved location differs.

**Inside Claude Code — not the shell:**

```text
/author-tech-spec adaptive-auth
```

Opening Claude alone does not start the authoring skill. If your facilitator uses Codex instead, start `codex` in the shell, then enter `$author-tech-spec adaptive-auth` inside Codex. Use one route.

### Review the understanding checkpoint

**Expect.** The skill loads inputs, identifies the installed RFC template, creates local records and asks you to confirm or correct its understanding.

**Look for.** Both PRDs, both designs, both architecture documents, the implementation baseline, tests and existing RFC drafts. Check missing inputs and the resolved Workbench template path. Treat a saved Validate report as evidence to recheck, not as automatic truth.

Follow the cited passages before confirming. If the scope is correct, a short response inside the harness is:

```text
Cover both F2.1 and F2.2 and their shared contracts.
Keep proposals and owner decisions distinct. Show evidence for
any disputed gap, then ask the first engineering question.
```

If the summary is wrong, correct it instead. Confirming scope does not approve every statement in the existing drafts. Before answering, review the displayed roadmap and confirm that the template path is under the selected `SPEED_DIR`.

### Work through decisions and review edits

Open the records created by the skill:

```text
.speed/authoring/adaptive-auth/session.md
.speed/authoring/adaptive-auth/questions.md
.speed/authoring/adaptive-auth/decisions.md
.speed/authoring/adaptive-auth/coverage.md
```

The skill reads the supplied documents, presents an initial question roadmap, and asks one consequential question at a time. Review each question's source evidence, options and tradeoffs before answering. Questions and follow-ups depend on the current inputs and decisions; do not expect an exact count or repeat choices from a previous rehearsal automatically.

The session's `questions.md` records progress. Keep accepted engineering decisions separate from proposals and owner requests. Ask for a coverage/readiness review when the consequential questions have been addressed or assigned to owners. Completing a questionnaire does not establish that every requirement is resolved. Keep the following areas in view:

| Area | Check |
|---|---|
| Shared lifecycle | Challenge trust, start, completion, retry, cancellation, expiry, holds and capture races |
| Integration | Checkout outcome mapping, analyst actions and authoritative merchant information |
| Card-testing reliability | Detection across merchants and replicas, release, expiry, outages and notifications |
| Policy and data | Threshold owners, external payloads, retained data and safe reason wording |
| Acceptance and rollout | Observable tests, measurement definitions, shadow mode, cutover and rollback |

For an accepted engineering choice, enter inside the harness:

```text
Show focused diffs for this decision in both RFCs.
Keep the existing template headings and unresolved owner
requests. Wait for my review before applying edits.
```

Review exact signatures, states, error behavior, acceptance criteria and cross-RFC dependencies. Save any overlapping editor buffer before accepting an edit. After an approved edit, inspect it in the regular terminal:

```bash
git diff -- specs/tech/adaptive-auth/1-high-value-traveller.md specs/tech/adaptive-auth/2-card-testing.md
```

Check the producer's **Produces** contract against the consumer's **Consumes** contract. Record owner, blocked phase and resolution path for unanswered questions. Do not change upstream product or design requirements to make them agree without the relevant decision.

### Check readiness for Audit

**Inside the authoring harness:**

```text
Review both RFCs against the loaded inputs and installed RFC
template. Show story coverage, design-state and architecture
coverage, shared-contract gaps and unresolved owner decisions.
Distinguish readiness for Audit from readiness for Plan.
Save the review in the coverage record.
```

**Decide.** Can you trace accepted decisions to reviewed RFC edits and identify what remains open?

**Leaves behind.** Both reviewed drafts and the local authoring records. Draft coverage is not implementation or test evidence.

**If you pause.** Ask the harness to save the next action, accepted decisions, pending proposals and owner requests. In a later Claude conversation, use `/author-tech-spec adaptive-auth resume`. Do not restart the interview when the existing conversation is simply awaiting your answer.

---

## Step 5. Audit both RFCs

**Goal.** Check the drafts' structure, substance, cross-spec consistency and size.

**Tool / human.** Audit proposes findings and sizing advice; you investigate their evidence and decide the disposition.

**Run — regular terminal, one RFC at a time.**

```bash
speed audit specs/tech/adaptive-auth/1-high-value-traveller.md
audit_f21_exit=$?
printf 'F2.1 Audit exit code: %s\n' "$audit_f21_exit"
cp -R .speed/logs "$course_evidence_dir/after-audit-f21-logs"
```

Inspect the result before continuing:

```bash
speed audit specs/tech/adaptive-auth/2-card-testing.md
audit_f22_exit=$?
printf 'F2.2 Audit exit code: %s\n' "$audit_f22_exit"
cp -R .speed/logs "$course_evidence_dir/after-audit-f22-logs"
```

**Expect / look for.**

- The printed `Template:` path belongs to the selected Workbench installation.
- Each report identifies its input file, issues and sizing rationale.
- Read the overall status, issue severity and exit code together. `WARN` can return exit `0`; it does not mean the draft has no gaps. An icon alone does not determine the verdict.
- Reports normally use timestamped `audit-*.json` paths. Record the exact printed paths, not an assumed latest file.

**Inside the authoring harness.** Replace both bracketed paths with the actual report paths:

```text
Review [F2.1 report path] and [F2.2 report path] against the
current RFCs and sources. Separate confirmed findings,
evidence-based refutations and owner requests. Record each
warning's disposition and the remaining planning blockers.
Do not edit yet.
```

If a finding requires a correction, accept the decision, review a focused diff, and rerun the affected Audit. Rerun both when a shared contract changes. Preserve the earlier reports and give new evidence snapshots fresh names.

Sizing is advice about organising the work. A split needs reviewed boundaries, dependencies and testable outputs; do not create new RFCs automatically because an auditor recommends them.

**Decide.** Does each warning have a disposition? Is the intended planning scope ready, or does an unresolved decision block it?

**Leaves behind.** Two preserved Audit reports, reviewed finding dispositions, sizing decisions and the owner list.

> If the scope is blocked, follow the facilitator's Plan source walkthrough and blocked Handoff. Do not invent an approval or bypass gates to complete the exercise.

---

## Step 6. Plan the agreed scope

**Goal.** Inspect how specifications become implementation tasks, dependencies and shared contracts.

**Tool / human.** Plan runs alignment and quality checks, gathers code context and generates tasks. You confirm the scope, review dependencies and retain unresolved assumptions.

**Readiness checkpoint.** Continue only when the facilitator confirms that blocking decisions for the proposed scope are resolved. If not, use the source walkthrough and proceed to a blocked Handoff. Do not Verify an older task set as though a new Plan succeeded.

This command plans **F2.1 as the primary RFC**. `--specs-dir specs` supplies related-document candidates. Inclusion as related context does not establish that F2.2 is fully planned.

**Run — regular terminal.** First inspect existing state:

```bash
if [ -d .speed/features/adaptive-auth ]; then
  ls .speed/features/adaptive-auth
fi
```

Preserve it before a new Plan. If someone is executing these tasks, ask your facilitator for an isolated teaching workspace instead of replacing them.

```bash
if [ -d .speed/features/adaptive-auth ]; then
  cp -R .speed/features/adaptive-auth "$course_evidence_dir/before-plan-feature"
fi
```

Only after the snapshot succeeds, run:

```bash
speed plan specs/tech/adaptive-auth/1-high-value-traveller.md --feature adaptive-auth --specs-dir specs
plan_exit=$?
printf 'Plan exit code: %s\n' "$plan_exit"
if [ -d .speed/features/adaptive-auth ]; then
  cp -R .speed/features/adaptive-auth "$course_evidence_dir/after-plan-feature"
fi
```

**Expect / look for.** Several agent calls may take a few minutes each. Watch the actual stage reached:

| Stage | What to inspect |
|---|---|
| Guardian | Alignment with product vision; flags, rejection or an unavailable result |
| Audit | Fresh checks of the registered planning inputs; this is expected even after standalone Audit |
| Code context | Indexing results and any fallback or unavailable context |
| Related specifications | Which documents were included or excluded |
| Architect | Generated tasks, shared contracts, assumptions and any skeleton/enrichment stages |
| Coverage and decomposition | Missing requirements, repairs, dependency checks and any skipped checks |

Task count and phasing depend on configuration. The fixture may have `[plan] max_tasks = 8`; inspect the printed budget and warnings rather than assuming a fixed task count or phase split. Do not change the cap without the facilitator's direction.

**Review the plan — regular terminal, after a successful Plan:**

```bash
cat .speed/features/adaptive-auth/spec_path
speed status --feature adaptive-auth
```

When task JSON files exist:

```bash
jq -s 'map({id, title, depends_on, files_touched, spec_references, acceptance_criteria, assumptions, agent_model})' .speed/features/adaptive-auth/tasks/*.json
```

**Open.** Inspect `contract.json`, `cross_cutting_concerns.json`, and the printed coverage and validation reports under `.speed/features/adaptive-auth/` when generated.

**Look for.**

- A requirement and observable check behind each task.
- A real dependency chain from shared interfaces to consumers and tests.
- Ordered ownership of tasks touching `src/payments/gateway.ts`.
- Stubs, external repositories, unverified provider capabilities and other scope limits.
- Coverage gaps or assumptions that remain despite a successful exit.

Do not run a second child-RFC plan in the same `adaptive-auth` namespace to combine plans: a later run can replace the primary scope and task set. Do not follow a CLI suggestion to execute tasks; continue to Verify.

**Decide.** Is this the task set from the successful run, and can you explain its intended scope and limits?

**Leaves behind.** The primary spec path, task graph, contract when generated, coverage and validation reports, and before/after evidence.

---

## Step 7. Verify and review repairs

**Goal.** Check whether the generated plan preserves the specification's meaning.

**Tool / human.** Verify checks requirements and semantic drift. A separate Fix Agent can repair task records and recheck them. You inspect those changes and decide what still needs a human owner.

**Run — regular terminal.** Confirm the saved primary spec and preserve the task set:

```bash
cat .speed/features/adaptive-auth/spec_path
cp -R .speed/features/adaptive-auth "$course_evidence_dir/before-verify-feature"
```

Stop if the path is not the intended primary RFC, the records are stale, or the snapshot fails. Otherwise:

```bash
speed verify --feature adaptive-auth
verify_exit=$?
printf 'Verify exit code: %s\n' "$verify_exit"
cp -R .speed/features/adaptive-auth "$course_evidence_dir/after-verify-feature"
```

**Expect / look for.**

- Deterministic traceability followed by the independent Plan Verifier.
- Covered, partial, missing or drifted requirements.
- Critical failures, recommendations and human decisions.
- Up to three automatic repair/re-verification cycles when supported by the installed version.

Let the active command finish. Do not launch another Plan or Verify against the same records while it runs. The Fix Agent edits the **plan's task records and contract**, not an implemented payment feature.

Use the printed report path, normally:

```text
.speed/features/adaptive-auth/logs/plan-verification.log
```

Inspect the explicit status, `core_question_answerable`, `spec_requirements`, `semantic_drift`, `critical_failures`, `recommendations` and `needs_human` where present. A traceability pass is not proof of semantic coverage. An overall pass may still retain warnings and partial requirements.

**Review repairs — regular terminal:**

```bash
diff -ru "$course_evidence_dir/before-verify-feature/tasks" .speed/features/adaptive-auth/tasks
```

A diff exit of `1` means differences were found; it is not a failed Verify verdict. Compare the contract too if it changed. Review acceptance criteria, dependencies, references and assumptions, and confirm whether source RFCs were preserved.

The working verification log is overwritten on re-verification. Preserve terminal repair history and provider events as directed by the facilitator, not just the final pass.

**Decide.** Does the final report explicitly pass for the intended scope? Which repairs can you accept, and which gaps or design changes still need an owner?

**Leaves behind.** Before/after plan snapshots, the final verification report, repair history and remaining human decisions. If the plan or source inputs change afterward, the previous result does not automatically apply.

---

## Step 8. Handoff and stop

**Goal.** Give the next engineer an accurate starting point, with evidence and unresolved decisions.

**Tool / human.** The harness can draft a summary; you check it against the saved artifacts and determine readiness for the stated scope.

**Inside the authoring harness:**

```text
Summarise the handoff using only current saved artifacts.
Identify both RFC revisions, accepted decisions, unresolved
owners and blocked phases, the actual Plan and Verify scope,
reports, repairs and skipped checks. State which parts of
F2.1 and F2.2 remain unplanned or unverified. Do not mark the
whole feature complete from a primary-RFC pass.
```

Review the summary and save the checked packet index in your evidence folder, using your editor. Include:

```markdown
# 301.1E adaptive authorisation handoff

- Fixture and Workbench revisions, harness and session evidence path:
- RFCs and upstream input revisions:
- Accepted engineering decisions and their records:
- Validate and Audit results, reviewed findings and dispositions:
- Plan command, primary scope, tasks and contract paths:
- Planning checks that ran, warned, failed or were skipped:
- Verify report, explicit status, input scope and task repairs:
- F2.1 coverage and remaining gaps:
- F2.2 coverage and remaining gaps:
- Owner decisions, resolution paths and blocked phases:
- Acceptance and measurement evidence still needed during Execute:
- Readiness for the stated scope, with reasons:
- Next action and responsible owner:
```

**Decide.** Is the stated scope ready, or is the handoff blocked? A blocked handoff is a valid outcome when evidence or an owner decision is missing.

**Leaves behind.** A reviewed packet index connecting the specifications, decisions, reports, tasks, repairs and remaining work.

- [ ] I can explain both payment scenarios and their shared contracts.
- [ ] I reviewed findings against sources rather than copying agent conclusions.
- [ ] I know what Plan and Verify actually checked.
- [ ] I retained unresolved owner decisions and scope limits.
- [ ] I reviewed task repairs and preserved their evidence.
- [ ] I have not executed implementation tasks.

**Stop here.** Task execution belongs to the next course, even if the CLI suggests it as the next command.

---

## If something interrupts the lab

| What you see | What to do |
|---|---|
| A new terminal selects the previous Workbench | Repeat the approved environment selection and confirm `command -v speed` and the printed template path |
| Missing Python or a blocking dependency error | Ask the facilitator; do not switch builds or delete language rules |
| Optional grammar warnings for languages this fixture does not use | Record the warning and confirm with the facilitator; it is not automatically a TypeScript failure |
| Custom-language errors while in the Workbench source folder | Return to the fixture root and retry the check; ask for help if it persists |
| Claude sign-in has expired | Renew sign-in in the native harness, preserve the failed output and retry only the affected stage |
| A skill invocation fails in zsh or Bash | Start the native harness, then enter the skill command inside its conversation |
| The harness pauses after loading inputs | Read its understanding question and confirm or correct it; do not restart the skill unnecessarily |
| An auto-mode setup prompt appears | This is separate permissions setup, not a lab result; follow the approved session configuration |
| The dashboard shows the wrong branch or an address is already in use | Confirm the project and service with the facilitator; do not create missing specs or stop another person's service |
| An agent reports gaps or a gate rejects the scope | Preserve the report, review sources and route the decision; do not add skip flags to force progress |
| Plan fails but task files exist | Check provenance; they may belong to an earlier run. Do not treat them as a newly accepted plan |
| Verify is repairing task records | Wait for the command to finish, then inspect the before/after records and final verdict |
| The evidence-folder variable is empty in a new shell | Restore it to the recorded session directory before any snapshot command |

## Quick reference

| Remember | Meaning |
|---|---|
| **Finding is not fact** | Check the claim against the cited sources |
| **Draft is not approval** | Proposed wording does not settle another owner's decision |
| **WARN is not gap-free** | Record a disposition and assess readiness |
| **Plan is not implementation** | Tasks describe work; they do not prove it has been built |
| **Traceability is not full coverage** | Referencing a requirement does not guarantee its behavior is preserved |
| **Verified scope is not the whole feature** | A primary-RFC result does not certify all of F2.2 |

For each output, ask: **What went in? What was checked? What came out? What remains unknown? Who owns the next decision?**
