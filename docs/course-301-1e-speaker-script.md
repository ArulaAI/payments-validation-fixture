# Course 301-1E speaker script

## Course map

Course 301-1E takes the adaptive authorisation feature from its existing behavior to
a reviewed technical specification and, when the gates and tooling support its scope,
a verified implementation plan. This script covers the full teaching sequence. Define
and Draft are its centre: the engineer uses the supplied PRDs, design and architecture
to investigate decisions and write the tech specs. The table lists the commands before
the walkthroughs explain when to use them.

| Step | Command or screen | Why we use it | What it produces |
|---|---|---|---|
| Orient | `npm test`; read `src/payments/gateway.ts` and `src/risk/rules.ts` | Establish how authorisation behaves before the feature changes it | A baseline test result and a shared picture of the existing behavior |
| Validate | `speed validate specs/` | Compare the provided specifications and investigate disagreements | A saved report of findings, plus the command's acceptance or rejection of its response |
| Dashboard setup (optional) | `speed dashboard status`; `speed dashboard start` if needed | Open an additional workspace for reviewing specification sections | A running dashboard; reuse an existing service when available |
| Define | IDE and harness TUI; `$author-tech-spec adaptive-auth` in Codex or `/author-tech-spec adaptive-auth` in Claude Code | Review the inputs, investigate consequential questions and record decisions with their owners | An evolving questionnaire, accepted decisions and unresolved owner requests |
| Draft | The same authoring session, editing `specs/tech/adaptive-auth/` | Turn accepted decisions into reviewed contracts, states and acceptance criteria under SPEED's RFC headings | Numbered tech specs and a saved coverage review |
| Audit | `speed audit specs/tech/adaptive-auth/1-high-value-traveller.md`, then the equivalent command for `2-card-testing.md` | Check each RFC's structure, substance, consistency and size | Two reports and a reviewed list of findings; feature-wide Audit remains planned |
| Plan | `speed plan specs/tech/adaptive-auth/1-high-value-traveller.md --feature adaptive-auth --specs-dir specs` | Build a plan from the primary RFC with related context, and inspect its gates | Task records, dependencies, a contract when generated, and planning reports; feature-wide Plan remains planned |
| Verify | `speed verify --feature adaptive-auth` | Check the generated plan against the specifications | Verifier findings, any task-record repairs, and decisions that still need an owner |
| Handoff | Review the specs, plan and remaining decisions | Give the Execute course a concrete starting point | The checked plan, tech files and open decisions with their owners |

The intended feature-wide commands require the behavior described in
[SPEED requirements for 301.1E](course-301-1e-speed-requirements.md):

```sh
# Planned commands. Do not run these against the checked installation.
speed audit --feature adaptive-auth
speed plan --feature adaptive-auth
```

The installed version requires a positional spec-file argument for Audit and Plan.
`--feature` selects the planning namespace; `--specs-dir` supplies candidates for
related-context selection. Neither makes both RFCs primary planning inputs. Verify
uses the saved primary spec and generated task plan. Keep that scope visible throughout
the current CLI walkthrough. The dashboard's tabs for every spec file and role switching
depend on those changes. The guided authoring route below uses the IDE and native
harness TUI and requires no dashboard or hooks. Verify needs an existing task plan
for the selected feature.

Supporting inspection commands such as `git`, `jq` and `command -v` appear beside
the evidence they help explain in each walkthrough.

## Presenter preparation and evidence

Use this script as the presenter guide. Learners work from `specs/`, the implementation
and the skill's input manifest. Facilitator notes and seeded-defect answer keys are not
authoring inputs.

Before teaching, check the following:

1. Open the fixture in the IDE and select one native harness, Codex or Claude Code.
   Arrange the IDE and TUI side by side. Use a separate repository-root shell for SPEED
   commands while the authoring conversation remains open.
2. Check `command -v speed`, follow its symlink and inspect that installation. The
   source walkthrough was checked against `/Users/sanjay/workbench`, revision `6a3637a`,
   on 11 October 2026. Recheck it after an installation change.
3. Read the repository instructions, `README.md`, `specs/README.md` and the authoring
   input manifest. Confirm the required inputs and installed RFC template are available.
4. Inspect existing authoring notes and feature task state. Preserve unfinished work.
   A new classroom session does not mean the saved session can be reset.
5. Preserve the original Validate report and provider events before running Validate.
   Before Plan or Verify, preserve any existing feature tasks, contract and reports.
   Plan replaces tasks in its namespace; Verify can repair task files.
6. Rehearse one complete authoring decision, its reviewed diff, pause and resume.
   Native skill discovery and the initial understanding response have been observed;
   the entire course workflow has not been established by those checks.

Create a session evidence folder outside the skill's input set, in the repository-root
shell used for the course commands:

```sh
mkdir -p .speed/course-301-1e
course_evidence_dir="$(mktemp -d .speed/course-301-1e/session-XXXXXX)"
printf 'Course evidence: %s\n' "$course_evidence_dir"
if [ -d .speed/logs ]; then
  cp -R .speed/logs "$course_evidence_dir/before-validate-logs"
fi
```

Keep that shell open. If it is reopened, restore `course_evidence_dir` to the printed
path before using the copy commands below. The saved logs retain the original Validate
example. Copy new reports there after each command because later runs can replace or
prune working logs. The snapshot names below describe the first pass; give each rerun
a fresh destination name so earlier evidence remains intact. Record the command,
working directory, input revisions, actual exit code, report paths,
provider events and any skipped or unavailable checks. A screenshot alone does not
identify the inputs that produced a result.

Use normal interactive shell commands with the exit capture immediately after them.
The command's printed report, the process exit and the engineer's judgment are separate
pieces of evidence. Avoid a pipeline when capturing the command's exit code.

Allow time for investigation and agent calls. The Validate timings below are relative
to that walkthrough. Budget the largest block for Define and Draft; its question count
depends on the inputs and answers. Rehearse before committing to a fixed course duration.

## Orient: establish the starting point

### Say

> We are engineers receiving product, design and architecture material for F2 adaptive
> authorisation. We need to produce an implementable tech spec, then inspect the plan
> that SPEED builds from it. F2 includes the genuine traveller and the cross-merchant
> card-testing attack. Both affect the same gateway and bank-confirmation contracts.
>
> First we'll establish what the service does today. Then Validate compares the
> documents, Define investigates decisions, Draft records the technical design, Audit
> checks the RFCs, Plan decomposes the work, and Verify checks that decomposition.

### Do

From a repository-root shell:

```sh
pwd
git status --short
node --version
command -v speed
npm test
baseline_exit=$?
printf 'Baseline test exit code: %s\n' "$baseline_exit"
```

Use the Node version required by `package.json`. This fixture runs TypeScript directly
and needs no dependency installation for its tests. Record the actual baseline outcome;
investigate a failure before interpreting later results.

Open `test/gateway.test.ts`, `test/fixtures/traffic.ts`, `src/payments/gateway.ts` and
`src/risk/rules.ts`. Follow these cases into the current implementation:

| Case | What to inspect | What it establishes |
|---|---|---|
| GW-02 | Traveller request and high-value cross-border rule | The launch behavior refuses the traveller |
| GW-03 | Decline response | The current response does not carry the intended safe explanation |
| GW-05 | Forty cards across twenty merchants | Per-card velocity misses this traffic pattern |
| GW-06 | A second gateway instance | Velocity state belongs to an instance today |

Read the assertions alongside the observed test run. These characterisation tests can
pass while preserving the behavior F2 intends to change. This baseline is separate
from the later implementation acceptance tests.

Show the folder convention in `specs/README.md`. Product and tech files share their
basenames. Design files describe the checkout and analyst surfaces. Both tech RFCs
already exist as drafts; the learner will review and develop them.

### Checkpoint and transition

The learner should be able to identify both scenarios, the shared gateway, the existing
test evidence and the supplied documents. Carry any failed prerequisite as an explicit
blocker. Then move to Validate's worked cross-document finding.

## Validate (0 to 25 min)

### Three teaching goals

- **Shared intuition:** understand why F2's traveller and card-testing scenarios need
  consistent product, architecture, design and technical specifications. Follow one
  checkout finding through Validate while keeping the whole feature in view.
- **Shared language:** distinguish a specification, the Validator's instructions, a
  finding, a confirmed gap and an unresolved decision. Separate the provider's result
  from the command's acceptance of that result.
- **Shared behavior:** run Validate with a known scope, preserve its output, check a
  finding against the documents and carry confirmed gaps and open questions for both
  F2 scenarios into Define with their owners.

### Timing

| Minutes | What happens |
|---|---|
| 0 to 4 | Introduce both F2 scenarios, their shared boundaries and the checkout example |
| 4 to 7 | Run Validate and establish which documents it receives |
| 7 to 12 | Follow file collection into the Validator's instructions and provider call |
| 12 to 16 | Follow the response into the saved report and JSON check |
| 16 to 22 | Check the recorded checkout finding against the documents |
| 22 to 25 | Carry the confirmed gap and both scenarios' open questions into Define |

Agent waiting time is additional. Keep the source walkthrough available while the call
runs. This is a presenter-led worked example; it introduces no learner quiz or new
group exercise.

### Say

> We're building adaptive authorisation for a card payments service. The product
> documents describe two problems. A genuine traveller in Tokyo is refused a 2,499
> pound television because their country differs from the card's issuer. Meanwhile,
> forty stolen cards are tested across twenty merchants in under three minutes, and
> every attempt is approved. The existing velocity rule counts attempts per card;
> each card in that attack was tried once.
>
> F2.1 gives unusual purchases a scored decision and a way to confirm through the
> bank. F2.2 detects card testing across merchants, challenges further attempts,
> notifies merchants and lets analysts release false alarms. Both change the same
> authorisation gateway and use the bank-confirmation flow and operations console.
>
> Product has written two PRDs. Architecture describes how the feature fits the
> platform. Design describes checkout and the analyst's workspace. Engineering has
> to bring those descriptions together into technical specifications we can plan.
>
> Validate helps us compare what those documents say. We'll inspect one finding in
> detail: what checkout shows when a payment is held. That gives us a concrete way
> to learn the command. The feature we'll take into Define includes both scenarios.

### Do

Keep the fixture and the installed SPEED source open in separate windows.

- Fixture: `/Users/sanjay/Documents/code/tmp/301-config`.
- SPEED implementation used here: `/Users/sanjay/workbench`, revision `6a3637a`.

All fixture references below are relative to the fixture root. All SPEED references
are relative to the installed SPEED root. Source line numbers were checked on
11 October 2026; recheck them when either checkout changes.

Show fixture `specs/product/adaptive-auth/1-high-value-traveller.md`, **lines 8 to 19**,
then **lines 33 to 37**. Point to ST1's bank confirmation and ST4's analyst review.
Show the held-payment flow at **lines 50 to 51**.

Show fixture `specs/product/adaptive-auth/2-card-testing.md`, **lines 10 to 19** and
**33 to 36**. Point to detection across merchants, bank confirmation, notification and
analyst release. Show **lines 40 to 51**: the attack flow and the false alarm.

Show fixture `specs/architecture/adaptive-auth.md`, **lines 10 to 18** and **24 to 29**.
Both PRDs change the gateway. Its dependencies include the scorer, decision policy,
step-up adapter, review queue and card-testing detector. Point to the six replicas and
40 ms risk-decision budget as constraints on both scenarios.

Before using the technical drafts, show their titles and status:

- `specs/tech/adaptive-auth/1-high-value-traveller.md`, **lines 1 to 12**: the existing
  F2.1 draft introduces scored decisions, step-up, the review queue and audit log.
- `specs/tech/adaptive-auth/2-card-testing.md`, **lines 1 to 13**: the existing F2.2
  draft depends on F2.1 and adds detection, notification and block release.

### Say

> This checkout already contains two technical drafts. Validate will read them along
> with the upstream documents. They show proposals about how to implement F2 and
> give us concrete interfaces to compare with the designs.
>
> Their draft status matters. We're going to check their assumptions against the
> product, architecture and design decisions. Later, in Draft, you'll write the
> technical specifications from the decisions established in Define. An existing
> draft doesn't settle an open product or design question.
>
> Let's use the F2.1 draft to see how one payment reaches a hold.

### Do

Show fixture `specs/tech/adaptive-auth/1-high-value-traveller.md`, **lines 130 to 138**.
Point to the two ways a payment reaches `held`: the score falls into the hold band, or
the bank provider is unavailable or times out during step-up.

### Say

> Product asks for a borderline payment to be held. The tech spec explains that the
> payment is authorised, capture is blocked, and a review item is created. It also
> sends a payment into that state when the bank can't answer a challenge.
>
> So an unavailable bank can leave a real payment waiting for review. What should
> checkout show the customer at that point? That's a question we can follow across
> the documents.
>
> SPEED Validate compares specifications and reports gaps or disagreements. That
> helps us find places where one team's description doesn't reach another team's
> document. We'll use its report to investigate this checkout question within the
> wider F2 feature. One confirmed finding won't establish that both scenarios are
> fully specified.

### Do

From the fixture root, check which executable the shell selects:

```sh
command -v speed
```

For the checked environment, this resolves to `/Users/sanjay/workbench/speed`.
The source references in this lesson follow that executable. A different SPEED checkout
can have different line numbers and behavior.

Before a new classroom run, preserve any existing `.speed/logs/validation.log` and its
matching provider events file in the session's evidence folder. This command replaces
`validation.log`. Keep the original recorded run available for the worked example below.

Run:

```sh
speed validate specs/
validate_exit=$?
printf 'Validate exit code: %s\n' "$validate_exit"
```

### Say

> The directory after Validate defines the documents we give it. Here we're passing
> the whole specs folder. The command searches its subfolders too.
>
> A specification is an agreement about what we intend to build. A validation report
> is the agent's assessment of those agreements. We'll check the assessment against
> the actual text before deciding what needs to change.
>
> Keep the exit code beside the report. We'll see that a command can fail because
> its response wasn't accepted, even when the agent produced readable findings.

### Do

Show SPEED `speed`, **lines 301 to 303**. The `validate` branch calls `cmd_validate`.

Open SPEED `lib/cmd/project.sh`, **lines 370 to 384**. The first command argument is
the specs directory; the command checks that it exists.

Then show **lines 388 to 399**. Follow the loop and its input:

- **Line 395:** recursively find every Markdown file in the directory and sort the paths.
- **Lines 391 to 394:** read each file, add a `--- FILE: ... ---` heading and its full
  contents to one string, and increment the file count.
- **Lines 397 to 399:** stop when there are no Markdown files.

For the current fixture, the directory contains 16 Markdown files. Show the selected
paths with this read-only command:

```sh
python3 - <<'PY'
from pathlib import Path
for path in sorted(Path('specs').rglob('*.md')):
    if path.is_file():
        print(path)
PY
```

Point to the nested adaptive-auth product, architecture, design and tech documents.
Also point to `specs/README.md`, `specs/defects/README.md`,
`specs/defects/TEMPLATE.md`, and the `paymentslatest.md` files.

Keep this map of F2's inputs beside the file list. Paths are relative to the fixture:

| File | What it contributes to F2 |
|---|---|
| `specs/product/overview.md` | Platform principles: ask before refusing, explain decisions, see fraud across merchants and protect card data |
| `specs/product/adaptive-auth/1-high-value-traveller.md` | Traveller, scored decisions, bank confirmation and held-payment requirements |
| `specs/product/adaptive-auth/2-card-testing.md` | Cross-merchant detection, challenges, notifications and analyst release requirements |
| `specs/architecture/overview.md` | Existing replicas, storage, latency and data-handling constraints |
| `specs/architecture/adaptive-auth.md` | Shared gateway, component responsibilities and interactions for both scenarios |
| `specs/design/adaptive-auth/1-checkout-challenge.md` | What the cardholder sees during confirmation and its result |
| `specs/design/adaptive-auth/2-risk-review-queue.md` | The analyst's held-payment queue, attack view and release actions |
| `specs/tech/adaptive-auth/1-high-value-traveller.md` | Existing engineering draft of scored decisions and step-up contracts |
| `specs/tech/adaptive-auth/2-card-testing.md` | Existing engineering draft of detection and attack operations, depending on F2.1 |

### Say

> This is how the documents reach the agent. The shell reads their contents and
> builds one message with a filename heading before each file.
>
> The selection rule is every Markdown file under the directory. It includes the
> adaptive-auth documents, the existing payments specs, READMEs and a defect template.
> A filename ending in latest doesn't cause the earlier file to be excluded.
>
> That matters when we read a finding. We need to know which document it came from
> and whether that document belongs to the behavior we're checking. Passing the
> whole folder gives the agent broad context, including material that needs care.
>
> Within that input, these documents describe F2 together. The traveller and the
> card-testing attack share the gateway, bank confirmation and analyst workspace.
> A change to a shared result or interface needs to make sense for both. We'll
> check a checkout result today, then carry the full document set into Define.
>
> Now we have the documents. The next part tells the agent what to check in them.

### Do

Show SPEED `lib/cmd/project.sh`, **lines 406 to 412**. Identify the arguments to
`provider_run`:

- `agents/validator.md`: instructions for the Validator role.
- The message at **line 409**: the request to cross-check the collected file contents.
- `MODEL_SUPPORT`: the selected model tier.
- `AGENT_TOOLS_READONLY`: the requested tool permissions.
- `Validator`: the label used for this call.

Show SPEED `lib/config.sh`, **lines 96 to 98** and **115 to 118**. Model selection can
come from the environment or project configuration; the support-tier fallback is
`sonnet`. The requested read-only tool set is `Read Glob Grep`.

Open SPEED `agents/validator.md`, **lines 16 to 25** and **33 to 36**. Focus on shared
definitions, product-to-tech traceability, and response fields needed by a UI.

Then show **lines 11 to 14**, **34**, and **75**. These instructions also prescribe
foreign keys or join tables for relationships and GraphQL operations for UI entities.

### Say

> Two pieces go into this call. One is the message containing our documents. The
> other is this role file, which tells the Validator how to read them.
>
> It asks the agent to compare shared definitions and check whether requirements
> have a technical implementation. It also asks whether a response supplies what
> a UI needs. That's relevant to our held-payment example.
>
> Some instructions assume particular technology choices. They demand database
> relationships and GraphQL operations. We need to check those demands against
> the feature's architecture. The platform architecture does describe Postgres,
> but that alone doesn't make every relationship a foreign key or every UI action
> a GraphQL mutation.
>
> A finding can come from a real disagreement between our documents. It can also
> come from a technology assumption in these instructions. Reading the role helps
> us explain both possibilities.

### Do

For the recorded Claude Code run, show SPEED `providers/claude-code.sh`,
**lines 347 to 369**, then **385 to 402**:

- Read the role file.
- Prepend the configured project agent file when one exists.
- Combine project instructions, role instructions and the document message.
- Pass the model and requested tool permissions to the agent CLI.

Show **lines 375 to 379** for the provider events file.

Return to `lib/cmd/project.sh`, **lines 417 to 432**: reject an empty response, print
the returned text, save it to `validation.log`, and check whether it is JSON.

### Say

> In this provider, the message and instructions become the text sent to the agent
> CLI. Project instructions are included too when a project agent file is configured.
> The caller requests read-only tools, and the Validator's role tells it to report
> findings without editing files.
>
> The provider keeps an events file. The command saves the returned report separately.
> Those are two useful records: what happened during the agent call, and the text
> the command then tried to accept.
>
> The next check is mechanical. Can the returned text be read as JSON? That question
> is separate from whether a reported specification gap is correct.

### Do

Use the preserved recorded run from the fixture:

- `.speed/logs/Validator-1791680731.jsonl`: the provider events.
- `.speed/logs/validation.log`: the returned report.

These files were inspected for this draft; Validate was not rerun while preparing it.
The provider result has subtype `success`, `is_error: false`, and one agent turn. Its
`result` matches the saved report text.

Show the report's opening and closing Markdown fences. Inside them, the report says
`"status": "fail"` and lists nine critical gaps. These are recorded agent claims.

Show SPEED `lib/provider.sh`, **lines 126 to 137**. `_require_json` passes the complete
response to `jq empty`. Then return to `lib/cmd/project.sh`, **lines 429 to 444**:
JSON acceptance happens before the command reads the report's `status`.

Verify the recorded formatting failure without editing the report:

```sh
jq empty .speed/logs/validation.log
json_exit=$?
printf 'JSON check exit code: %s\n' "$json_exit"
```

The preserved report fails this check. Keep its original text intact.

### Say

> The agent completed and returned a report. But it wrapped that report in Markdown
> fences. Those fences aren't JSON, and this check passes the entire response to jq.
> The recorded text fails that check.
>
> The word fail inside the report is the agent's assessment of the specs. The JSON
> rejection is the command's assessment of the response format. In this path, the
> command exits before it reaches the branch that reads the agent's status.
>
> We can still read a claim in the original report and investigate it. That doesn't
> mean Validate completed its checks successfully. We'll preserve the failure and
> inspect one finding as a worked example.

### Do

Show preserved fixture `.speed/logs/validation.log`, **lines 48 to 54**. The selected
finding compares the checkout's `outcome` with the gateway's `status` and says there
is no checkout outcome for `held`.

Show SPEED `agents/validator.md`, **lines 44 to 52**. Explain the finding fields beside
this example:

- `source_spec`: where the agent says the requirement or disagreement comes from.
- `source_text`: the text it uses to support the claim.
- `expected_in`: where it thinks the missing behavior belongs.
- `description`: its explanation of the problem.

Treat the report's `expected_in` as a suggestion to assess. In this finding it names
the tech spec, although the remaining checkout decision belongs to Design and CX.

### Say

> Here's the finding we'll follow. It says the design binds its outcome to the
> authorisation response's status, but the two sets of names don't agree. It also
> says there's no checkout outcome for a held payment.
>
> The report gives us source documents and an explanation. We can use those to
> check the claim. It also suggests where something is expected. That suggestion
> doesn't decide who owns the change.
>
> Let's open the documents and follow the same payment ourselves.

### Do

Show these fixture passages together:

1. `specs/product/adaptive-auth/1-high-value-traveller.md`, **lines 36 to 37** and
   **50 to 51**: the product requires analyst review of a held payment.
2. `specs/tech/adaptive-auth/1-high-value-traveller.md`, **lines 134 to 138** and
   **156 to 161**: the state machine can hold a payment, and `GatewayResult.status`
   includes `held`.
3. `specs/design/adaptive-auth/1-checkout-challenge.md`, **lines 58 to 62** and
   **113 to 119**: `StepUpResult.outcome` allows `confirmed`, `not_confirmed` or
   `declined`, and is bound to the response's `status`.

Then show design **lines 23 to 27** and **102 to 106**: the route list has no held
result, and the bank-not-confirmed error tells the customer they haven't been charged.

Finally show tech **lines 341 to 343**. The unresolved question explicitly records
the missing held and provider-unavailable outcomes and assigns the work to Design and CX.

### Say

> Product requires the hold. The tech response represents it with held. The design
> lists confirmed, not confirmed and declined, then says to take the value from the
> response status. That binding needs a mapping even for approved, and the design
> has no held result at all.
>
> The bank error screen doesn't resolve this. A bank outage can produce a hold in
> the tech spec, with an authorised payment and capture blocked. The design's error
> screen says the bank couldn't confirm and offers another way to pay. The documents
> haven't specified what the customer should see for the hold.
>
> The tech author has already recorded that question. So we can confirm a gap in
> the written design, and we can also see that it is acknowledged. Validate has
> resurfaced an open decision. It hasn't established a new production defect.
>
> Notice where the remaining work belongs. The report points to the tech spec, but
> Design and CX own the held-payment experience. Engineering can explain the state
> and suggest a mapping. The customer message still needs their decision.

### Do

Show this presenter example of the handoff. It is a draft decision request, not an
automatic output or an instruction to edit the fixture:

> The product requires held payments, and the tech response returns status `held`.
> The checkout design binds `outcome` to that status but allows only `confirmed`,
> `not_confirmed` and `declined`. Its routes also have no held result. The tech spec
> already assigns this question to Design and CX. Please define what the cardholder
> sees while review is pending, and how each gateway status maps to a checkout result.
> We can then check that the design and tech contract agree.

Then open the upstream questions that Define must consider across F2:

- `specs/product/adaptive-auth/1-high-value-traveller.md`, **lines 114 to 120**:
  acceptable fraud rate, how long a hold can last before communicating with the
  merchant, and 3-D Secure exemptions.
- `specs/product/adaptive-auth/2-card-testing.md`, **lines 103 to 107**:
  block lifetime and which merchants a block covers. Return to ST6 and ST7 at
  **lines 33 to 34** for the requirement's use of "one source" and "same source".

These are source-document questions to examine in Define. This walkthrough has not
confirmed additional Validator findings about them. Compare the existing drafts'
proposals with the upstream questions and establish which owners have made a decision.

### Say

> That's the outcome of this example. We have a specific gap, supporting passages,
> an existing open question and named owners. We can ask for the missing decision
> without inventing checkout copy to make the documents agree.
>
> Our shared intuition is how comparing documents exposed a missing result for one
> payment state. Our shared language separates the finding from the passages that
> support it and the decision that's still open.
>
> Our shared behavior is to run with a known document scope, keep the raw output,
> check the claim and carry the remaining decision to its owner. When the documents
> are updated, we'll compare a new report with this preserved run.
>
> Now we move into Define for adaptive authorisation. We carry both PRDs, the
> platform and feature architecture, the checkout and review-queue designs, and
> the drafts we've just inspected. The checkout gap is one item in that work.
>
> For the traveller, Product and Risk need to establish the acceptable fraud tradeoff
> and hold policy; Legal owns the exemptions question. For card testing, Product
> and Risk need to establish the attack-source definition, block lifetime and scope.
> Engineering checks how those decisions fit the shared gateway and platform
> constraints. We'll record what is decided and who owns what is still open.
>
> Those decisions give us the basis for writing F2.1's scored decisions and step-up
> specification, and F2.2's dependent detection and attack-operations specification.
> The existing drafts give us proposals to examine as we do that work.
>
> This run also leaves us a tooling issue: the response format was rejected. We
> keep that visible. A readable report and a completed provider call don't establish
> that the command accepted the result or that the feature is ready to plan.

### Notes

- **Audience and starting point:** engineers can read code; this opening establishes
  both F2 scenarios, their shared boundaries, document roles and the worked checkout
  example before using SPEED vocabulary.
- **Feature scope:** the lesson leads into Define for F2 adaptive authorisation.
  The held-payment checkout gap is one worked finding. The card-testing questions
  in the closing come from the product spec and are not presented as verified
  Validator findings.
- **Existing technical drafts:** both F2 drafts are present in this checkout and are
  included by `speed validate specs/`. Treat their contents as engineering proposals
  to check against owner decisions. The guided Define and Draft walkthrough below
  proposes tech-spec edits from those decisions. Preserve the existing files during
  Validate and apply reviewed changes during authoring.
- **Scope:** this lesson covers `speed validate specs/`. `workbench validate` runs
  the fixture's checks and writes an evidence bundle; it is a separate command.
- **Current behavior:** the directory route recursively collects Markdown files.
  It does not select a feature bundle or exclude README and template files. Do not
  promise that `--feature adaptive-auth` filters this directory collection.
- **Source evidence:** installed SPEED revision `6a3637a`; fixture HEAD `69af0a2`
  plus its current working tree. The facilitator gap map contains older descriptions
  of the architecture; use the current specs for the worked example.
- **Historical evidence:** the recorded provider result matches `validation.log`.
  Its nine critical gaps are claims from that run, not a guaranteed result of a fresh
  invocation. Only the checkout outcome gap is checked in this lesson.
- **Formatting failure:** the recorded report fails `jq empty`. The current command
  would reject that text before reading its status. The historical shell exit code
  was not independently recorded for this draft. Do not claim it was observed.
- **Pass behavior:** `lib/cmd/project.sh`, **lines 435 to 449**, trusts the returned
  status after a syntax check. `_require_json` does not validate the finding schema.
  An unknown status only warns in this implementation. An exit code alone cannot
  establish that every required check completed or every gap was found.
- **Permissions:** the caller passes `Read Glob Grep` and the role says read-only.
  This lesson does not test enforcement of those permissions.
- **Teaching boundary:** keep facilitator notes and corpus manifests outside the
  learner-facing validation input. Preserve intentional fixture gaps. No code, spec
  or prompt repair is included in this lesson.
- **Before teaching:** rehearse a complete Validate invocation in the intended
  environment, archive its input scope, report and provider events, and recheck output
  locations. This draft was checked against source and preserved evidence; no fresh
  agent invocation or spoken rehearsal was performed while preparing it.

## Optional dashboard setup

### Say

> The IDE and native harness are sufficient for this authoring workflow. The dashboard
> is an optional additional view. Use it when it helps inspect the available records.
> The planned multi-file Define experience needs its own implementation and rehearsal.

### Do

```sh
speed dashboard status
```

Reuse a running service. If no service is running and the presenter wants this view:

```sh
speed dashboard start
dashboard_exit=$?
printf 'Dashboard start exit code: %s\n' "$dashboard_exit"
```

Open the address printed by the command. If startup reports missing dependencies,
record the limitation and continue with the IDE and TUI. Do not restart someone else's
service. A dashboard commitment or automatic ratification is a separate record from
the engineer's RFC review and from independent approval by Product, Design, Risk or Legal.

## Define and Draft: guided RFC authoring

### Three teaching goals

- **Shared intuition:** an implementable tech spec connects product intent, design,
  architectural constraints and the code that exists today. Cover both the traveller
  and cross-merchant card-testing scenarios and their shared contracts.
- **Shared language:** distinguish a source-derived fact, a proposed option, an
  accepted engineering decision, an owner request and a reviewed RFC edit.
- **Shared behavior:** inspect the inputs, answer consequential questions, review
  proposed edits and preserve decisions and coverage before moving to Audit.

### 1. Arrange the IDE and TUI

#### Say

> Product, Design and Architecture have supplied the inputs. Our job as engineers
> is to produce the technical specifications. We'll work with an authoring skill
> that reads those inputs, helps us investigate decisions and proposes RFC edits.
>
> Keep the IDE on the left half of the screen and the harness TUI on the right.
> We'll use the IDE to inspect sources and changes, and the TUI to discuss the
> decisions behind those changes.

#### Do

Split the screen approximately 50/50. Open the fixture repository in the IDE. Keep
these files available as tabs, showing the relevant one as the conversation develops:

- `specs/tech/adaptive-auth/1-high-value-traveller.md`.
- `specs/tech/adaptive-auth/2-card-testing.md`.
- `.agents/skills/author-tech-spec/references/input-manifest.md`.

Use a terminal in the right pane. Establish the working directory in the shell:

```sh
cd /Users/sanjay/Documents/code/tmp/301-config
pwd
```

The existing RFCs are drafts. Preserve their contents while inspecting them, then
review proposed changes before applying them. Save an IDE buffer before the harness
edits the same file.

### 2. Start one harness and invoke the skill

#### Say

> Choose the harness you're using for the course. Both entry points load the same
> authoring workflow and references. The skill is explicitly invoked, and the RFC
> format comes from the installed SPEED template that Audit uses.

#### Do: Codex

Enter this command in the **shell**:

```sh
codex
```

Once the Codex TUI is ready, enter this **inside Codex**:

```text
$author-tech-spec adaptive-auth
```

#### Do: Claude Code

For the Claude route, enter this command in the **shell**:

```sh
claude
```

Once the Claude Code TUI is ready, enter this **inside Claude Code**:

```text
/author-tech-spec adaptive-auth
```

Run one route. The skill invocation belongs in the harness conversation. The `$`
in the Codex invocation is part of its skill syntax; entering it in zsh would invoke
shell variable expansion.

### 3. Review the loaded inputs and understanding

#### Say

> Before we discuss design choices, check what the harness has actually read. Both
> PRDs must be present, along with checkout and analyst designs, platform and feature
> architecture, and the relevant implementation and tests.
>
> The existing tech drafts give us proposals to examine. Where documents disagree,
> we need to understand the disagreement and who can resolve it.

#### Do

Check the manifest against the harness's reported inputs. Inspect missing resources
and the resolved SPEED template path. The optional saved Validate report is historical
evidence; check its findings against the current input revisions.

Review the harness's summary of current behaviour, intended F2.1 and F2.2 behaviour,
shared responsibilities and constraints. Follow its source references in the IDE.
Correct any mistaken statement before confirming the understanding. Confirm only
after checking it; the confirmation starts the interview and does not approve every
statement in the existing drafts.

#### The first understanding check in this session

The observed response loaded both scenarios, saved authoring notes and paused for
confirmation. It also described challenge persistence as needing resolution. Treat
that diagnosis as a claim to inspect against architecture and implementation.

After checking the cited passages, enter this inside the active harness:

```text
The scope is correct: cover both F2.1 and F2.2, including their shared contracts.
Show the source evidence for the challenge-persistence gap before treating it as confirmed.
Then ask the first unresolved engineering question, with source references, options
and tradeoffs. Keep Product, Risk, Design and Legal decisions assigned to their owners.
```

If its scope summary is wrong, correct the summary first. The skill's understanding
check is the deliberate start of the interview. This response confirms scope and asks
for evidence; it does not accept a persistence design or approve draft wording.

After the skill creates the authoring records, open:

```text
.speed/authoring/adaptive-auth/session.md
.speed/authoring/adaptive-auth/questions.md
.speed/authoring/adaptive-auth/decisions.md
.speed/authoring/adaptive-auth/coverage.md
```

Show the input paths and revisions in `session.md`. These files are local authoring
notes, separate from SPEED's task and commitment records. They are created on first
use; the installed skill package contains their templates rather than a completed
session.

### 4. Work through consequential questions

#### Say

> The questionnaire grows from the documents and our answers. We don't need to
> repeat facts that the supplied material answers consistently. We need to examine
> choices, disagreements and missing detail that affect implementation.
>
> For each question, look at its evidence, the constraints, the options and their
> tradeoffs. An engineering decision is ours to make within those constraints.
> Product, Risk, Design and Legal decisions keep their appropriate owners.

#### Do

Inspect the initial roadmap in `questions.md`. Check that it considers both scenarios
and includes the confirmed Validate finding where it is still unresolved. The next
question should identify affected requirements and RFC sections, with supporting
file references.

Use the next genuine question from the live session. The generated order and wording
are not predetermined by this script. If useful, enter this presenter prompt:

```text
Show me how the proposed cross-replica block view meets the architecture's latency
budget. Separate what the supplied documents already decide from what still needs
an engineering decision, and show the tradeoffs for any unresolved choice.
```

Follow the cited passages in the architecture, code and drafts. Check any proposed
choice against the supplied constraints. Give an answer and rationale when the
choice belongs to engineering. If it needs investigation, request that investigation
before accepting a design.

For an unresolved policy or design question, record the owner, what it blocks and
how to obtain the decision. The checked held-payment checkout gap is one such owner
request when it remains open. Continue independent work on both RFCs while waiting;
keep the unresolved dependency visible.

Show how the accepted answer updates the question and decision records. Check that
a proposed option is not labelled as an accepted decision merely because the harness
recommended it.

#### Guide the interview through the feature

Use these rounds to check coverage while following the live questionnaire. Existing
session question IDs are useful references; new sessions may produce different IDs
and ordering. These prompts guide investigation and supply no predetermined answers.

| Round | Decisions to investigate | Evidence to keep open | Expected RFC destinations |
|---|---|---|---|
| Shared lifecycle | Authorisation ownership; challenge origin, persistence, retry, completion, cancellation and expiry; holds and capture races | Platform and feature architecture, gateway, payments service, both draft state machines | Interface Contract, Data Model, State Machine, API Surface, Validation Rules, Testing |
| Integration and user experience | Merchant facts, payment ownership, typed checkout result mapping, held and unavailable states, analyst actions | Both designs, payment contracts, both RFC API surfaces | Basic Example, Interface Contract, API Surface, Security & Controls, Dependencies, Testing |
| Card-testing reliability | Detection inputs, attack identity, publication across six replicas, store outages, release and expiry, history and notifications | F2.2 PRD, feature architecture, risk queue design, F2.2 RFC | Data Model, State Machine, Search / Query Strategy, Validation Rules, Migration Strategy, Testing |
| Policy and data boundaries | Threshold and block-policy owners, retained data, permitted narrative inputs, external processing authority and safe reasons | Product overview, both PRDs, architecture security boundaries, designs | Security & Controls, Key Decisions, Dependencies, Unresolved Questions |
| Acceptance and rollout | Observable stories, workload and latency measurement, false-decline denominators, shadow mode, cutover and rollback | Both PRDs' success criteria, architecture budgets, both RFC testing and migration sections | Testing and its subsections, Migration Strategy, File Impact, Unresolved Questions |

For the shared lifecycle, say:

> A challenge may complete on a different replica. Show where the durable identity,
> trusted completion and payment continuation belong. Separate provider-call deadlines
> from the cardholder's time to answer. Walk through retries and competing terminal
> events before we accept the contract.

Enter, when this is the next unresolved area:

```text
Walk one traveller request and one card-testing block match through the shared
challenge contract. Show the inputs, states, durable identifiers, callback trust
checks, duplicate handling and payment completion boundary. Cite the current sources
and ask one unresolved engineering question first.
```

For integration and user experience, say:

> Every backend outcome needs a defined consumer. Compare the API result union with
> checkout's view states, then compare analyst actions with the payment lifecycle.
> Engineering can propose a mapping. Design and Product own missing user-facing
> behavior and policy.

```text
Compare backend outcomes with checkout and analyst states. Identify missing mappings
and authoritative merchant facts. Propose engineering contracts separately from
owner requests, and show which integration each unresolved request blocks.
```

For detector reliability, say:

> An attack can span merchants and replicas. Read the supplied component boundaries
> before asking whether they meet the timing and failure requirements. Follow detection,
> publication, notification, analyst release and expiry through the whole lifecycle.

```text
Trace card-testing detection and block release across all six replicas. Show the
latency and convergence assumptions, recorder loss behavior, store-outage behavior,
notification delivery and history retention. Distinguish requirements already supplied
by architecture from proposed implementation choices.
```

For policy and privacy, say:

> A redaction list is only part of the data contract. We need an exact allowed payload,
> a purpose and an owner decision where the sources disagree about external processing.
> We also need to know who can approve detection and decline policy.

```text
Compare the proposed narrative input with the vault boundary and product anti-goals.
List the exact allowed fields and any conflicting source statements. Keep unresolved
privacy, threshold and block-policy approvals with their named owners and resolution paths.
```

For acceptance and rollout, say:

> An acceptance criterion must describe an observable outcome and how to check it.
> A stub score can test routing, but it cannot demonstrate fewer false declines or
> reliable attack detection. The spec needs both implementation checks and a measurement
> plan for the product outcomes.

```text
Review every story and success criterion from both PRDs. Map each to an RFC acceptance
criterion and a verification method. Distinguish component checks, full user flows,
load and failure tests, and measured product outcomes. Identify the evidence and
owner needed for cutover and rollback.
```

After each round, review accepted decisions, newly opened questions, owner dependencies
and affected sections. Continue independent drafting where possible. If a missing owner
answer blocks safe integration or cutover, keep that block in the RFC and handoff.

### 5. Review the resulting RFC edits

#### Say

> A decision can affect several sections and both RFCs. Shared step-up behaviour,
> for example, needs consistent contracts, transitions, failure outcomes and tests.
> Review the proposed text in each affected place before applying it.
>
> The authoring workflow guides the conversation. SPEED's RFC template determines
> the output structure. We keep the questionnaire and decision history in our
> authoring notes, and put the technical design under the template's headings.

#### Do

Inspect the proposed diff in the IDE. Check its source references, exact contracts,
error behaviour and observable acceptance criteria. Accept or request a correction
to the proposed wording. Once accepted, check the on-disk edit and its application
record in `decisions.md`.

Use this prompt after accepting the design decision:

```text
Propose focused RFC diffs for the accepted decision. Show every affected section in
both RFCs, preserve their existing content and exact SPEED template headings, and
identify any owner dependency that remains unresolved. Wait for my review of the wording.
```

Save any overlapping IDE buffer before an accepted edit. Approve the actual reviewed
diff, then inspect the saved result from the repository-root shell:

```sh
git diff -- specs/tech/adaptive-auth/1-high-value-traveller.md specs/tech/adaptive-auth/2-card-testing.md
```

Review the harness's proposed diff even when Git also shows edits from earlier work.
Check the file contents directly if a file is untracked. Accepting one diff does not
approve unrelated changes to upstream specs, implementation or tests.

Follow one decision through every affected section. Compare the two RFCs where one
produces a contract that the other consumes. Show the coverage record mapping both
PRDs' stories and constraints to RFC sections and acceptance criteria.

An unanswered owner decision remains in the existing `Unresolved Questions` section
with its owner and blocking dependency. Draft coverage describes specification
content; it does not establish that an implementation or test has passed.

### 6. Save progress and resume

#### Say

> We can continue this work in another conversation because the questions and
> decisions are saved in the repository workspace. At a pause, preserve the next
> question, pending owners and any proposed edits that haven't been accepted.

#### Do

At a natural pause, ask the harness to save progress and identify the next action.
Inspect the saved records. To resume inside the chosen harness, use:

```text
Save the session, question queue, decisions and coverage. Summarise accepted decisions,
unaccepted proposals, owner blockers and the next question. Preserve the current RFCs
and earlier decision history.
```

**Codex:**

```text
$author-tech-spec adaptive-auth resume
```

**Claude Code:**

```text
/author-tech-spec adaptive-auth resume
```

Check that the resumed session retains accepted answers and returns to the recorded
next action. If inputs changed, inspect which decisions need reconsideration. Keep
the earlier decision history when recording a replacement.

### 7. Review readiness and hand off to Audit

#### Say

> Before Audit, review coverage of both use cases and the shared architecture and
> design constraints. Identify the unresolved blockers and their owners. A document
> can have every required heading while its design still needs work.
>
> Audit gives us another check of structure, substance, consistency and size. Its
> findings return us to a question or a proposed edit. Outstanding owner decisions
> remain visible before we commission a plan.

#### Do

Review `coverage.md`, the two RFCs and the current template together. Check heading
structure, source links, shared contracts, placeholders and unresolved questions.
Recheck changed input and template revisions before interpreting an Audit result.

Ask for the readiness review inside the active harness:

```text
Review both RFCs against all loaded inputs and the installed RFC template. Show story,
design-state and architecture-constraint coverage, shared-contract disagreements,
placeholders and unresolved owner decisions. Distinguish readiness for an Audit review
from readiness to plan implementation. Save the result in the authoring coverage record.
```

Carry the reviewed drafts and open questions into the next walkthrough. Audit can
inspect an incomplete draft; that does not make the draft ready for Plan.

### Presenter notes

- **Skill locations:** Codex loads `.agents/skills/author-tech-spec/SKILL.md`;
  Claude Code loads `.claude/skills/author-tech-spec/SKILL.md`. Claude's references
  link to the shared references under `.agents/`. Both entry points require explicit
  invocation. No hooks are configured for this authoring flow.
- **Template compatibility:** derive the headings from the installed SPEED RFC
  template. The inspected template permits optional omissions while Audit requires
  every H2 and H3. The skill retains those headings with substantive explanations
  where they do not apply. It does not modify the template or auditor.
- **Scope and ownership:** authoring the two tech specs does not authorize changes
  to code, tests or upstream specifications, or imply that the learner can approve
  another function's policy. Keep owner decisions and approved RFC edits distinct.
- **Evidence:** native discovery of this skill was checked in Codex and Claude Code.
  Package checks confirmed the input paths, shared references and questionnaire
  destinations against the installed RFC headings. The live session also reached the
  initial understanding check and saved its question queue. The complete interview,
  accepted edits and resume behaviour have not yet been trialled.
- **Before teaching:** rehearse both harness routes through input review, one real
  decision, a reviewed RFC edit, a saved pause and a resumed conversation. Preserve
  the resulting evidence and check that existing IDE edits survive. This script
  describes that rehearsal; it does not establish that it has passed.

## Audit: check the RFCs and investigate findings

### Three teaching goals

- **Shared intuition:** a populated template is the start of an implementable spec.
  Its contracts, states, tests and dependencies must agree.
- **Shared language:** distinguish structure, substance, cross-spec consistency and
  sizing; distinguish a model finding from a confirmed defect.
- **Shared behavior:** run Audit on both drafts, inspect its actual inputs and reports,
  and return confirmed findings to the authoring session.

### 1. Inspect the contract before running Audit

#### Say

> Authoring helped us write the design. Audit reviews the resulting document against
> the installed template and its audit instructions. We will read those instructions
> and check the scope before trusting a result.

#### Do

Open the installed `templates/rfc.md`, `agents/audit.md` and `lib/cmd/audit.sh`.
Show the four levels in the role prompt:

| Level | What it asks | What the engineer checks |
|---|---|---|
| 1: structure | Required H2/H3 headings, substantive sections, placeholders and links | Exact template structure and resolved references |
| 2: substance | Implementable definitions, examples, decisions and tests | Whether another engineer could implement the stated behavior |
| 3: consistency | PRD coverage and RFC-family contracts | Source-backed agreement across both scenarios and their consumers |
| 4: sizing | Estimated scope, phasing and possible child RFCs | Whether the proposed boundaries preserve ownership and testable outputs |

In `cmd_audit`, follow the primary file, template, product overview and linked-PRD
loading. The checked implementation resolves the first matching `> See [...]` link
as the linked PRD. It also supplies a spec-path list. For a child RFC it loads the
parent's contents; for a parent it provides the child paths. These are different
amounts of context. Other design and architecture contents are not automatically
embedded as the complete input manifest.

Keep the skill's coverage review for the whole input set alongside the Audit reports.
An auditor may read referenced files with its requested read-only tools; that possibility
does not establish that it read every source in a particular run.

### 2. Run each RFC audit and preserve its evidence

#### Do

From the repository-root shell, run the first command and inspect its outcome:

```sh
speed audit specs/tech/adaptive-auth/1-high-value-traveller.md
audit_f21_exit=$?
printf 'F2.1 Audit exit code: %s\n' "$audit_f21_exit"
```

Copy the report named by the command and its provider events into the evidence folder.
To preserve the current standalone log set immediately after the first audit:

```sh
cp -R .speed/logs "$course_evidence_dir/after-audit-f21-logs"
```

Then run the second:

```sh
speed audit specs/tech/adaptive-auth/2-card-testing.md
audit_f22_exit=$?
printf 'F2.2 Audit exit code: %s\n' "$audit_f22_exit"
cp -R .speed/logs "$course_evidence_dir/after-audit-f22-logs"
```

Preserve this report separately. Standalone reports use timestamped `audit-*.json`
files under SPEED's selected log directory, normally `.speed/logs/` in this fixture.
Use the printed path rather than assuming the most recent file belongs to this command.

#### Say

> Read the report's status and issues alongside the process exit. In this installation,
> pass and warn return success; fail is a gate failure. An unknown status can warn and
> still return success. The exit code alone cannot establish that Audit passed.

### 3. Follow one actual finding into the sources

#### Do

Open the saved raw report. Inspect `status`, `spec_file`, `linked_specs`, each issue's
`level`, `severity`, `section` and `message`, and the `sizing` rationale.

Audit uses `parse_agent_json` to extract JSON from an answer that may contain Markdown
fences. The historical Audit report is fenced, unlike a plain JSON file. Keep the raw
answer intact; use the command's parsed display or a separately identified extracted
copy for inspection. A failed direct `jq` parse of fenced text does not by itself show
that this command rejected the response.

If using the preserved rehearsal report, open
`.speed/logs/audit-1791684994.json`. It reports `warn`, flags the distinction between
the provider timeout and cardholder expiry, and estimates 14 tasks with a phasing
recommendation. Those are historical findings, not a promised result for today's drafts.
Compare the current state machine, `StepUpChallenge.expiresAt` and acceptance criteria
before deciding whether the timeout finding still applies.

For the live run, choose an actual finding and show its cited RFC section, related
requirement and intended user flow. Classify it as confirmed, refuted with evidence,
or unresolved pending investigation or an owner. The terminal labels levels above
Level 1 as warnings; inspect the issue's own severity and overall status as well.

### 4. Return findings to Define and Draft

#### Say

> Audit has identified something to investigate. We return to the decision that
> produced the text, check the evidence, and review a focused correction. If the issue
> belongs to Product or Design, it keeps that owner.

#### Do

In the authoring TUI:

```text
Read these saved Audit reports: [paste the actual report paths]. Check each finding
against the current sources and both RFCs. Record confirmed findings, evidence-based
refutations and unresolved owner requests separately. Ask the next consequential
question and propose focused diffs after a decision is accepted.
```

Replace the bracketed instruction with the actual paths before sending. Review edits
as in Draft. Rerun the affected audits after edits; rerun both when a shared contract
changes. Archive the new reports with the new input revisions and retain the old ones.

### 5. Review sizing and readiness

#### Say

> Sizing is a recommendation about organising work. The Auditor does not create new
> RFC files. Our two drafts already separate the shared traveller contracts from the
> card-testing extension. Any further split must preserve those dependencies.

#### Do

Inspect the current recommendation and rationale. The audit prompt estimates tasks
as roughly developer-days, recommends phasing above ten tasks, and can recommend
multiple RFCs above fifteen tasks or a thousand lines. Plan uses the estimate to
choose phases, while the Architect prompt asks for 15 to 30 minute tasks. These
estimates are different units; do not turn them into a precise delivery forecast.

If a further split is accepted, review the proposed boundaries, parent/dependency
links and testable outputs before approving any new files. Recheck template and story
coverage across the resulting RFCs.

### Checkpoint and transition

Retain the two Audit results, reviewed findings, shared-contract check and owner list.
Proceed to Plan only for a scope whose blocking decisions are resolved. Warnings need
an explicit disposition. If a blocker remains, demonstrate the Plan source walkthrough
and blocked handoff below; do not manufacture an approval to complete the exercise.

## Plan: inspect how specifications become tasks

### Three teaching goals

- **Shared intuition:** planning is a sequence of checks and transformations. Its
  output depends on the specifications and code context that actually reach each step.
- **Shared language:** distinguish Guardian alignment, Audit quality, code grounding,
  related context, task decomposition, coverage and verification.
- **Shared behavior:** preserve existing work, run the scoped command when ready,
  inspect each stage's evidence and review the generated task graph.

### 1. Declare the planning scope and preserve existing work

#### Say

> The whole course feature includes both RFCs. The installed CLI starts a plan from
> one primary RFC. We'll inspect that path using F2.1 and related specifications.
> A successful run of this command does not certify a complete plan for F2.2.

#### Do

Inspect `.speed/features/adaptive-auth/`, including any `spec_path`, `tasks/`, contract,
cache and logs. Preserve the current directory in the session evidence folder before
a new Plan run. If someone is executing these tasks, use a separate teaching workspace
and carry the actual namespace through every subsequent command.

```sh
if [ -d .speed/features/adaptive-auth ]; then
  cp -R .speed/features/adaptive-auth "$course_evidence_dir/before-plan-feature"
fi
```

The normal spec-planning path clears existing task JSON files when writing its new
plan. A later run with F2.2 in the same namespace would replace the primary spec and
task set; it would not merge the two plans. Do not teach sequential runs in the same
namespace as feature-wide planning.

Check that current RFC blockers are resolved for the proposed planning scope. If they
are not, use the source and preserved-report walkthrough rather than requesting a new
implementation plan.

### 2. Run the installed command when the scope is ready

#### Do

```sh
speed plan specs/tech/adaptive-auth/1-high-value-traveller.md --feature adaptive-auth --specs-dir specs
plan_exit=$?
printf 'Plan exit code: %s\n' "$plan_exit"
if [ -d .speed/features/adaptive-auth ]; then
  cp -R .speed/features/adaptive-auth "$course_evidence_dir/after-plan-feature"
fi
```

Record the stage reached, printed scope and report paths. Archive the terminal output
and relevant reports before another run. Even an early failure can save the primary
spec path or feature metadata. Files in `tasks/` after a failure can belong to an older
run or to a new plan that failed a later gate; inspect their provenance.

### 3. Follow the gates in execution order

Open installed `lib/cmd/plan.sh`, `lib/shared.sh` and the role prompts as each stage
appears. Use the source walkthrough while an agent call is running.

| Stage | Say | Show or inspect |
|---|---|---|
| Primary input loading | The positional RFC is the primary input. Matching product and design paths are derived from its filename. | `cmd_plan` input registration and the actual paths printed |
| Guardian | Does this design fit the product vision and anti-goals? | `agents/product-guardian.md`, `specs/product/overview.md`, the raw Guardian report |
| Audit loop | Plan audits the registered primary specs. Standalone Audit is also a gate here. | Per-spec `plan-audit-*.json` reports and each outcome |
| Code context | The Architect gets a generated view of the current code and its alignment with spec claims. | Layer 1 project map, semantic graph, skeletons and spec-alignment output, or the recorded fallback warning |
| Related specs | Candidate sources are scored and compressed within a budget. A file being under `specs/` does not guarantee inclusion. | Related-context diagnostics and the selected architecture, designs and second RFC |
| Architect | The task planner produces tasks, contract data and its own validation observations. Large estimated scope can invoke two phases. | `agents/architect.md`, phase output, merged dependencies and cache use |
| Coverage review | An independent coverage agent can identify missed requirements and an additional Architect call can add tasks. | Whether this stage ran, `agents/coverage-verifier.md`, any gap report and added tasks |
| Architect validation | Critical validation issues stop task creation. | `validation-report.json` when produced |
| Task creation and decomposition | Tasks are saved, then checked for size, coordination, bridge dependencies and shared file ownership. | Task JSON, decomposition diagnostics and any automatic dependency patches |

F2.1's matching PRD is found by filename. Its checkout design has a different basename,
so it is not automatically registered as that primary design. `--specs-dir specs` makes
it and other documents candidates for related-context selection. Inspect which ones
were selected; a context-selection failure is a reason to investigate scope and budget.

The independent coverage step normally runs for phased planning, or when explicitly
forced by configuration. It is not present in every ordinary single-phase run. In an
interactive run it may offer to add missing tasks. Read and review the proposed repair.
The implementation can continue with coverage warnings or unresolved gaps, and can
skip unavailable context/decomposition checks with warnings. These conditions belong
in the evidence and handoff even when the command exits successfully.

### 4. Handle a Guardian rejection using evidence and ownership

#### Say

> A rejection gives us a claim about a conflict with the product. Compare the cited
> anti-goal with the RFC and its upstream requirements. Decide whether the diagnosis
> is correct and who can resolve the conflict before changing the design.

#### Do

Inspect the actual Guardian report. For the preserved rehearsal example, open
`.speed/features/adaptive-auth/logs/guardian-pre-plan-1791685082.json`. It reports a
rejection over direct score-based declines and the hold-then-decline path, alongside
privacy and timing concerns. Show the product overview, PRD and RFC passages together.
This historical model assessment is a worked example, not an automatic verdict on
the current revised inputs.

In the authoring TUI:

```text
Inspect the Guardian report at [paste actual path]. Compare each finding with the
product overview, both PRDs, architecture and current RFCs. Identify confirmed conflicts
and owner decisions. Preserve supplied requirements; propose RFC corrections only
after the relevant decision is resolved and the wording is reviewed.
```

Keep the blocking stage visible. A command that stops at Guardian has not reached
Architect, coverage or decomposition. The script's continuation below is conditional
on resolving the block, not a direction to bypass it.

### 5. Understand reruns and caches

#### Do

Show the spec hash and cache lookup in `cmd_plan`. The checked hash includes the primary
tech spec and loaded product, design and test specs, plus defect contents in defect mode.
It does not include every related document, the product overview or the role prompts.

If those other inputs changed, preserve the prior evidence and request a fresh gated
plan with the supported `--force` option:

```sh
speed plan specs/tech/adaptive-auth/1-high-value-traveller.md --feature adaptive-auth --specs-dir specs --force
replan_exit=$?
printf 'Replan exit code: %s\n' "$replan_exit"
```

Use this only when a rerun is warranted and after preserving the existing task set.
It reruns planning and replaces tasks; it does not resume task execution. Check the
actual cache messages, including phase caches. Do not delete state or bypass gates to
make a rerun look fresh. Record any injected Guardian learnings because they can affect
a later result even when the main RFC looks unchanged.

### 6. Review the generated plan

#### Say

> The plan may include tasks written or modified by more than one stage. Read the
> resulting records and their dependencies. A task should identify the spec requirement,
> implementation boundary, acceptance check and assumptions an executor needs.

#### Do

For the fixture's single-player layout:

```sh
cat .speed/features/adaptive-auth/spec_path
speed status --feature adaptive-auth
jq -s 'map({id, title, depends_on, files_touched, spec_references, acceptance_criteria, assumptions, agent_model})' .speed/features/adaptive-auth/tasks/*.json
```

Run the task inspection only when task files exist. For another namespace or multiplayer
layout, use the paths printed by that run. Open `contract.json` and
`cross_cutting_concerns.json` when generated. A missing contract limits verification;
an absent report is not evidence that its check passed.

Follow a real dependency chain from a shared interface to its consumers and tests.
Check that scoring and policy, bank step-up, held-payment operations and capture guard,
checkout mapping, and privacy boundaries have clear owners and observable criteria
where they are in scope. Compare F2.2 requirements with the plan and record omissions
as scope limits or gaps; related context alone does not make F2.2 fully planned.

Look closely at tasks touching `src/payments/gateway.ts`. Concurrent writers need
ordered dependencies or an explicit ownership boundary. Review any bridge-symbol
dependency patches and recheck the graph. The decomposition size heuristic sums source
file lengths; it cannot establish how long a large behavioral change will take.

Model names come from the installation's configuration and provider mapping. Inspect
`agent_model` and the current role configuration instead of promising that every learner
uses the default model names in the prompt.

### Checkpoint and transition

Proceed to Verify with an identified primary spec revision, task set and reports. Record
all skipped checks, warnings, unresolved assumptions and uncovered feature scope.
If Plan failed, retain its evidence and owner request; do not Verify an old task set as
though it were the output of the failed run.

## Verify: check meaning and review task repairs

### Three teaching goals

- **Shared intuition:** a plausible task graph can still omit or change a requirement.
  Verification compares the actual plan with its actual source scope.
- **Shared language:** distinguish traceability, coverage, semantic drift, mechanical
  task repair and a human decision.
- **Shared behavior:** preserve the task records, inspect verifier findings and repairs,
  and report exactly which scope was checked.

### 1. Establish the input and save a before snapshot

#### Say

> Verify reads the saved primary spec and task plan, along with available contract and
> cross-cutting data. We'll check those paths first. The verifier's role is read-only,
> but a failed result can trigger a separate agent that edits task records.

#### Do

Check `.speed/features/adaptive-auth/spec_path` and the source revision used to plan.
Copy `tasks/`, the available contract, cross-cutting data and prior verification report
to a new `before-verify-feature` folder in the evidence bundle:

```sh
cp -R .speed/features/adaptive-auth "$course_evidence_dir/before-verify-feature"
```

This command requires the successful planning scope checked above. Preserve terminal
and provider output for each verification run. Resolve stale inputs before requesting
verification.

Open installed `lib/cmd/verify.sh` and `agents/plan-verifier.md`. Show the deterministic
spec-traceability call followed by the Plan Verifier call. If traceability returns no
output or a context builder falls back, record that condition; do not infer coverage.

### 2. Run Verify and inspect the report

#### Do

```sh
speed verify --feature adaptive-auth
verify_exit=$?
printf 'Verify exit code: %s\n' "$verify_exit"
cp -R .speed/features/adaptive-auth "$course_evidence_dir/after-verify-feature"
```

The checked single-player report path is
`.speed/features/adaptive-auth/logs/plan-verification.log`. Use the printed path if the
layout differs. The command parses model output with `parse_agent_json`; the saved
raw log may include prose or Markdown fences.

Inspect these fields in the parsed display or an identified extracted copy:

| Field | What to review |
|---|---|
| `status` and `core_question_answerable` | Does this report explicitly pass, and can the executor answer the core requirement? |
| `spec_requirements` | Which requirements are covered, partial or missing? |
| `semantic_drift` | Has a task changed a state, condition, contract or policy from the spec? |
| `critical_failures` | What concrete plan gap blocks the spec requirement? |
| `recommendations` and `needs_human` | What repair or owner decision is requested? |

A missing or unknown status can warn and return success in the checked implementation.
Confirm an explicit parsed `pass` and its scope before reporting verification success.

### 3. Inspect the repair loop when verification fails

#### Say

> The command can repair mechanical task-record mistakes and then verify again.
> Changing product behavior requires a decision and a reviewed spec change. Read both
> the reported repair and the saved file diff before accepting the result.

#### Do

Show the inline Fix Agent prompt in `cmd_verify`. It requests task-file edits for
mechanical corrections and escalates matters requiring judgment. The checked limit
is three fix-and-reverify cycles. If all identified issues need human judgment, the
command can stop without attempting a mechanical fix.

Review the printed before/after repairs and human escalation options. Compare the
saved snapshot with current task files using the actual snapshot path. For example,
after creating the snapshot above:

```sh
diff -ru "$course_evidence_dir/before-verify-feature/tasks" .speed/features/adaptive-auth/tasks
```

A diff exit of 1 means differences were found; it is not a verifier result. Review
acceptance criteria, dependencies, references and assumptions in every changed task,
and confirm that source RFCs were preserved.

The working verification log is overwritten after each re-verification. Preserve the
terminal repair history and provider event files to retain intermediate failures.
Do not show only the final pass when earlier failures or repairs materially explain it.

### 4. Route unresolved findings and choose the correct loop

#### Do

| Finding | Next action |
|---|---|
| Mechanical task-record error | Review the repair, inspect its diff and the subsequent Verify result |
| Missing or contradictory engineering design | Resume authoring, investigate, review an RFC change, rerun affected Audit and Plan, then Verify the new plan |
| Product, Design, Risk or Legal decision | Record the owner, evidence, blocked phase and resolution path; continue independent work |
| Source scope missing from the verifier input | Fix the planning/verification setup or mark that scope unverified; a different verifier answer does not supply missing inputs |
| Provider failure or unparseable response | Preserve raw output and events, diagnose the response failure, then rerun when the cause is addressed |

If the task plan changes manually after verification, rerun Verify and archive the
new result. If an RFC or relevant upstream input changes, review its impact and replan
when necessary; a previous Verify report belongs to the previous plan and input set.

### Checkpoint and transition

Retain the final parsed result, actual exit code, input scope, before/after task records,
repair history and unresolved owners. A pass here checks a plan; no feature code has
been implemented or accepted through this course workflow.

## Handoff: make the next course's starting point explicit

### Say

> The next engineer needs to know what the specs decide, what the plan covers and
> what still blocks work. We'll hand over the actual evidence and name the unchecked
> scope. A verified primary-RFC plan is a useful result, but the whole F2 feature also
> includes card testing and its shared-contract dependencies.

### 1. Review the packet

#### Do

Review these artifacts together:

- Both adaptive-auth RFCs, linked PRDs, designs and architecture at identified revisions.
- The authoring session, accepted decisions, question queue and coverage map.
- Both Audit reports and the disposition of their findings and sizing recommendations.
- The saved primary spec path, task graph, contract when generated, planning reports,
  context-selection evidence and any skipped checks.
- Verify's actual result and scope, task repair history and remaining human decisions.
- Acceptance and measurement plans, rollout/rollback criteria and unresolved dependencies
  with owners and blocking phases.

Use the authoring harness for a final summary:

```text
Summarise the handoff using only current saved artifacts. Identify both RFC revisions,
accepted decisions, unresolved owners and blocking phases, the actual Plan and Verify
input scope, reports and skipped checks. State which parts of F2.1 and F2.2 remain
unplanned or unverified. Do not mark the feature complete from a primary-RFC pass.
```

Check that summary against the files. Save the reviewed packet index in the session
evidence folder. Use this outline and fill it with observed values:

```markdown
# 301-1E adaptive authorisation handoff

- Session, fixture revision, SPEED revision and harness:
- RFCs and upstream input revisions:
- Accepted engineering decisions and their records:
- Audit reports, statuses and finding dispositions:
- Plan command, primary scope, task and contract paths:
- Planning gates that ran, warned, failed or were skipped:
- Verify report, explicit status, input scope and task repairs:
- F2.1 story and constraint coverage:
- F2.2 story and constraint coverage:
- Owner decisions, resolution paths and blocked phases:
- Acceptance evidence still required during Execute:
- Readiness: ready for the stated scope / blocked, with reason:
- Next action and responsible owner:
```

### 2. State the ending that the evidence supports

#### If the stated scope is ready, say

> We have reviewed technical specifications and a plan verified against the scope
> listed in the handoff. Execute can begin on that approved scope with the acceptance
> methods and dependencies recorded here. Implementation outcomes remain to be tested.

#### If the current CLI produced only a primary-RFC plan, say

> We authored and reviewed both RFCs. The installed CLI has planned and checked the
> primary RFC identified here. We still need a feature-wide plan and verification
> scope for F2.2 and the dependencies between the RFCs before claiming F2 is ready.

#### If a decision or gate blocks progress, say

> We have preserved the drafts, findings and decisions reached so far. This owner
> request or failed gate blocks the next phase. The handoff names the evidence, the
> person who can resolve it and the action needed to resume.

Course 301-1E stops at this handoff. `speed run` belongs to Execute and is not run as
part of the speaker walkthrough.

## Feature-wide course readiness and recovery

### Before using the planned whole-feature commands

The script's complete teaching sequence is available above. The intended whole-feature
Plan/Verify outcome still depends on the SPEED changes tracked in
[course requirements](course-301-1e-speed-requirements.md). After those changes land,
rehearse and update the executable command map using evidence that establishes:

1. Feature selection resolves both RFCs, both PRDs, both designs, architecture and
   product vision with recorded revisions and dependencies.
2. Audit findings identify their source files and cover cross-document disagreements.
3. Plan produces one ordered feature task set without silently replacing one child's
   work with another child's work.
4. Shared gateway and step-up contracts have explicit ownership and dependency edges.
5. Verify checks the same complete scope and reports uncovered requirements and owner
   decisions, including the traveller, attack, release, notification and failure flows.
6. Reports distinguish a pass from skipped, unavailable or unparseable checks, and the
   evidence survives reruns and task repairs.

Until then, use the installed commands in this script and label their scope. This is
a tooling limit recorded in the handoff, not a reason to remove F2.2 from authoring.

### Recovery prompts and routes

| Observation | Action |
|---|---|
| zsh rejects a skill invocation | Start `codex` or `claude`, then invoke the skill inside that TUI |
| Harness pauses at the understanding check | Inspect the sources, correct or confirm scope, request evidence for disputed findings, then begin the next question |
| Required input is missing | Record the missing path; continue work that does not depend on it and block dependent decisions |
| Installed template cannot be located | Investigate the executable and bootstrap path; postpone the Audit-compatibility claim |
| A policy answer belongs to another function | Record its owner, evidence and blocked phase; retain the unresolved question |
| IDE and proposed harness edit overlap | Save the buffer, reread the current file and review a fresh diff |
| Inputs changed on resume | Compare recorded digests, revisit affected decisions and preserve earlier history |
| Audit and template disagree on optional headings | Use the inspected compatibility convention and record the discrepancy; retain headings with substantive explanations |
| Guardian rejects or Audit fails | Investigate the report, resolve the decision and review edits before rerunning gates |
| A related spec is absent from planning context | Inspect selection diagnostics; review context scope/budget and request a fresh gated plan when changed |
| Plan reports tasks but a late gate fails | Preserve that task set as failed-stage output; it is not an accepted plan |
| Verify changes task records | Review snapshot differences, repair evidence and the new verifier result |
| A command exits zero without an explicit pass | Inspect parsed status, scope and warnings; record the unresolved result |

## Source references for rehearsal

Fixture references are relative to this repository. SPEED references are relative to
the resolved installation; check its revision before relying on implementation details.

| Teaching step | Fixture evidence | SPEED implementation or role instructions |
|---|---|---|
| Orient | `specs/README.md`, `src/payments/gateway.ts`, `src/risk/rules.ts`, `test/gateway.test.ts`, `test/fixtures/traffic.ts` | Installed executable and bootstrap |
| Validate | Both PRDs, designs and architectures; preserved `.speed/logs/validation.log` and matching provider events | `lib/cmd/project.sh`, `cmd_validate`, `agents/validator.md`, provider output and JSON acceptance helpers |
| Define and Draft | `.agents/skills/author-tech-spec/references/`, both RFCs, `.speed/authoring/adaptive-auth/` | Installed `templates/rfc.md` and `agents/audit.md` |
| Audit | Current drafts and linked sources; preserved `audit-1791684994.json` | `lib/cmd/audit.sh`, `cmd_audit`, `agents/audit.md` |
| Plan | Product overview, primary and related specs; preserved Guardian rejection | `lib/cmd/plan.sh`, `cmd_plan`, `lib/shared.sh`, `lib/features.sh`, `lib/context/`, `lib/decomposition_gate.py`, `agents/product-guardian.md`, `agents/architect.md`, `agents/coverage-verifier.md` |
| Verify | Saved primary `spec_path`, task JSON, contract and cross-cutting data | `lib/cmd/verify.sh`, `cmd_verify`, `agents/plan-verifier.md`, inline Fix Agent prompt |
| Handoff | Reviewed evidence index, RFC coverage and owner decisions | [Course SPEED requirements](course-301-1e-speed-requirements.md) |
