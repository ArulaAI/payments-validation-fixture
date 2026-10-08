# LAB 301.1

## Authorisation Risk Check

**Engineer Action Guide** · Define → Audit → Plan

Turn inputs from four teams into a technical spec you own, challenge it, and plan it.
Keep every decision you do not own visible, with its owner.

> **The takeaway**
> You do not own the inputs. You own the technical spec, and everything it decides.

## Quick Reference

| Part | Do the work | You produce or inspect |
| --- | --- | --- |
| **00 · Opening** | Map each input to its owner | Ownership map |
| **01 · Define** | Generate the tech spec and check what it decided | Tech spec · list of decisions you do not own |
| **02 · Audit** | Run the audit and find what it did not check | Audit report · corrected tech spec |
| **03 · Plan** | Inspect the task plan against the spec | Task records · verification report · guided demonstration |
| **Optional · Run** | Execute the plan with agents | Implementation branch |

### How to use this guide

- **Goal / You leave with** explain the purpose and outcome of each part.
- **Numbered steps** show what to run and inspect, in order. Paste commands into your terminal; open named files in your editor.
- **What to Expect** describes the evidence to look for. Agent wording, findings and task counts vary between runs.
- **✓ Success Checklist** closes each part. Tick items only after checking your actual run.
- **Prepared file** marks a step where you can load a known-good output from a checkpoint, so a slow or failed command never blocks you. See Checkpoints.

---

## The Feature

The payments gateway authorises every request it receives. Card testers use that: scripts,
increasingly written with GenAI, try stolen card numbers one after another at a merchant.
Meanwhile genuine customers making an unusual purchase abroad are declined with no way
through. F2 adds a risk check to `authorise()` that approves, challenges or declines each
attempt.

Four teams have already said what they need. None of them is engineering.

---

## Workspace Setup

Complete installation and Claude sign-in before starting. Open the fixture repository in
your editor and use the terminal for your platform:

| Platform | Terminal | Starting folder |
| --- | --- | --- |
| Windows | Git Bash | `~/lab/payments-validation-fixture` |
| macOS | Terminal using Bash or Zsh | `~/payments-validation-fixture` |

```bash
git switch -c my-lab 301.1-learner-start
npm test
export CLAUDE_BIN="$PWD/bin/claude-no-mcp"
```

`CLAUDE_BIN` makes SPEED's agents start without your personal MCP servers. One server with
an invalid tool schema is enough to make planning fail, so set it in every terminal you use
for this lab.

### ✓ Setup Checklist

- [ ] You are on your own branch, `my-lab`, created from `301.1-learner-start`.
- [ ] `npm test` reports 17 passing.
- [ ] `CLAUDE_BIN` is set in this terminal.
- [ ] `specs/tech/authorisation-risk.md` does not exist yet. You create it in Part 1.

### Checkpoints

Each checkpoint is a fixed starting point. Use one to recover from a failed step or to
catch up with the room.

| Checkpoint | Contains | Load it with |
| --- | --- | --- |
| `301.1-learner-start` | The code and the upstream specs | `git switch -f -C my-lab 301.1-learner-start` |
| `301.1-audit-start` | Adds a generated tech spec for Part 2 | `git checkout 301.1-audit-start -- specs/tech/authorisation-risk.md` |
| `301.1-plan-start` | Replaces it with a corrected tech spec for Part 3 | `git checkout 301.1-plan-start -- specs/tech/authorisation-risk.md` |

---

## Opening · Map the inputs

**Goal:** know who owns each input before anything is generated from it.
**You leave with:** an ownership map you will use in every later part.

### Step 0.1 · Read the inputs map

Open `specs/README.md` and read the F2 section. Then skim each input:

| File | Owner | Look for |
| --- | --- | --- |
| `specs/product/authorisation-risk.md` | Product | Stories ST8 to ST14, open questions OQ1, OQ3 and OQ4, decision owners |
| `specs/design/authorisation-risk.md` | Design | Reason categories, the challenge interaction and their open questions |
| `specs/architecture/authorisation-risk.md` | Architecture | Bounded contexts, domain rules, constraints |
| `specs/architecture/authorisation-risk-threat-model.md` | Architecture and risk | Threats T1 to T8 and their controls |
| `specs/compliance/authorisation-risk.md` | Risk and legal | Risk policy RP1 to RP3, what happens when the check fails, card data rules |

> **Checkpoint**
> Which of these files may engineering change? None. Questions about them go to the owner
> named in the product spec.

### ✓ Success Checklist · Opening

- [ ] You can name the owner of each input.
- [ ] You know where the decision owners table is.

---

## Part 1 · Define

**Goal:** produce a technical spec from the inputs and the code, and find every decision in it.
**You leave with:** `specs/tech/authorisation-risk.md` and a list of decisions it made that engineering does not own.

### Step 1.1 · Generate the tech spec

```bash
speed define
```

> **Prepared file**
> The exact `speed define` command is confirmed before the session. If it is unavailable or
> slow, load the generated tech spec:
> `git checkout 301.1-audit-start -- specs/tech/authorisation-risk.md`

### Step 1.2 · Trace the spec to its sources

Open `specs/tech/authorisation-risk.md`. Check:

| Section | What to check |
| --- | --- |
| Front matter and header | The architecture, threat model and compliance files are listed, and `> See` points at the product spec |
| Testing · Acceptance Criteria | Every criterion names a source. Pick three and find that source |
| Security & Controls | Every threat T1 to T8 has a control and a check |
| Unresolved Questions | Every open question from the inputs is carried, with its owner |

### Step 1.3 · List what the spec decided

Read Key Decisions. For each row, ask: is this an engineering choice, or did the spec
decide something an input says belongs to someone else? Use the decision owners table in
the product spec.

### Step 1.4 · Check the spec against the code

Open `src/vault.ts` and `authorise()` in `src/payments/service.ts`.

- What does `tokenise()` return for the same card number called twice?
- Where does the spec put the risk check relative to the idempotency lookup and tokenisation, and why does that matter?

### Step 1.5 · Check the spec against the open questions

The product and design specs list open questions with their owners. The compliance spec
states what happens when the risk check fails. For each one, check that the tech spec
either follows the written rule or carries the question with its owner. It must not answer
an open question on its own.

### What to Expect

A spec in the RFC template with traceability to ST, RP and T identifiers. Most of it will
be sound. Expect at least one place where it contradicts a written rule, and at least one
where it answers an open question that belongs to someone else.

> **Checkpoint**
> Do not fix anything yet. Write down each decision you do not own and who does own it.

### ✓ Success Checklist · Part 1

- [ ] The tech spec exists and lists every upstream input in its header.
- [ ] You traced three acceptance criteria to their sources.
- [ ] You listed the decisions that belong to someone else, with owners.
- [ ] You found where the spec contradicts a rule or answers an open question.

---

## Part 2 · Audit

**Goal:** see what the audit checks, and what it does not.
**You leave with:** an audit report and a tech spec that routes every non-engineering decision to its owner.

### Step 2.1 · Run the audit

```bash
speed audit specs/tech/authorisation-risk.md
```

This takes about three minutes.

### Step 2.2 · Read the report

The report prints in the terminal and is saved under `.speed/logs/`. For each finding,
note its level and whether it is about structure or about substance.

### Step 2.3 · Compare with your list

Take your list from Part 1. For each decision you do not own, did the audit flag it?

### Step 2.4 · Correct the spec

Edit `specs/tech/authorisation-risk.md`:

- Bring every decision in line with the rules the inputs already state.
- Carry every open question in Unresolved Questions, with its owner. Answer none of them.

Optionally re-run the audit.

### What to Expect

WARN, usually with a sizing estimate of about 13 tasks and sometimes with structural
findings such as table formats. The findings and their wording vary between runs. In dry runs
the audit did not flag the failure behaviour or the reason categories, because it checks
the spec against its template, the product spec and the code. It does not read the
compliance spec, the threat model or the design spec.

> **Checkpoint**
> A passing audit tells you the spec is well formed. It does not tell you the spec decided
> only what it was entitled to decide.

### ✓ Success Checklist · Part 2

- [ ] The audit completed and you read every finding.
- [ ] You know which of your Part 1 items the audit missed, and why.
- [ ] Every decision engineering does not own is in Unresolved Questions with its owner.

### Before Part 3

Part 3 plans from the corrected tech spec. Load it and compare it with your own corrections:

```bash
git diff 301.1-plan-start -- specs/tech/authorisation-risk.md
git checkout 301.1-plan-start -- specs/tech/authorisation-risk.md
```

---

## Part 3 · Plan

**Guided demonstration.** Planning runs for more than 20 minutes, so your facilitator runs it
on the corrected tech spec before the session and supplies the output. Follow along on the facilitator's screen and
inspect the files yourself.

**Goal:** judge whether the plan delivers the spec, and only the spec.
**You leave with:** a view on which tasks to trust, and which assumptions the plan made.

### Step 3.1 · See how the plan was generated

```bash
speed plan specs/tech/authorisation-risk.md --specs-dir specs
```

In the output, find the related-specs scoring. Check that the architecture, compliance and
threat model files were included, and why.

### Step 3.2 · Inspect the task records

Open `.speed/features/authorisation-risk/tasks/`. For each task, check its acceptance
criteria, declared files, dependencies and assumptions.

### Step 3.3 · Verify the plan

```bash
speed verify
```

### What to Expect

The planner loads the architecture, compliance and threat model specs through related-spec
scoring, splits the work into two phases and writes task records with dependencies, for
example the vault change and the policy module before the risk assessment engine. Planning
makes model calls throughout and can fail partway, which is why it is run before the
session. Every task should trace to the corrected tech spec, and none should implement an
open question.

> **Checkpoint**
> Look for any task that answers an open question or contradicts a written rule.

### ✓ Success Checklist · Part 3

- [ ] You saw which upstream specs reached the planner.
- [ ] Every task traces to the spec.
- [ ] You found any assumption the plan made that an owner should decide.

---

## Optional · Run

If you want to see the plan executed, run it after the session:

```bash
speed run
```

Every task's output is evidence for the next course, Verify and Judge. It is not approval
to ship.

---

## Overall Success Checklist

| Checkpoint | Evidence to keep | Done |
| --- | --- | --- |
| Inputs mapped to owners | Ownership map | ☐ |
| Tech spec traced to sources | Three traced criteria | ☐ |
| Decisions you do not own listed | List with owners | ☐ |
| Audit limits understood | Audit report and your comparison | ☐ |
| Tech spec corrected | Updated Unresolved Questions | ☐ |
| Plan inspected | Task records and verification report | ☐ |

**The lab ends at an inspected plan.** Nothing has been built.

**What transfers:** read every input as someone else's decision, trace your spec to its
sources, know what each check covers, and route what you do not own to the person who does.
