# Lab 3 Action Guide

Follow this guide while your facilitator leads the session. Each step tells you what to run, what to look for, and what you should be able to conclude before moving on.

**The idea behind the lab:** the tooling produces evidence. The engineer decides what that evidence means.

> Your output may differ from the facilitator's screen. The reviewer is an AI model, so wording, order and some findings vary between runs. Compare the evidence, not the formatting.

## What you will do

You take one AI-written change to a small payments service and work it through the pipeline:

`Inspect → Diagnose → Review → Eval → Judge → Define → Plan → Verify → Run → Inspect the repair`

By the end you can say which concerns are real defects, which are test gaps, which were false alarms and which need an owner to decide, with evidence for each.

## How each step is laid out

| Row | Meaning |
|---|---|
| **Goal** | Why the step exists |
| **Run** | What you type or open |
| **Expect** | What a healthy result looks like |
| **Look for** | The evidence that matters |
| **Decide** | The question to answer before moving on |
| **Leaves behind** | The file the next step reads |

---

## Before you start

Run these from the fixture folder. All must pass.

```bash
cd "$HOME/lab/payments-validation-fixture"
git branch --show-current                 # round-0
git branch --list main round-0            # both listed
git config user.name && git config user.email   # both print a value
node --version                            # v22.18 or newer
git -C "$HOME/lab/workbench" log --oneline -1   # includes 3fb0ec2 or a later commit
speed help                                # prints a command list
```

- [ ] I am on `round-0` and `main` exists as the baseline
- [ ] Git has a name and email set
- [ ] Node is v22.18 or newer
- [ ] Workbench is up to date
- [ ] `speed help` works

**If something fails**

| Problem | Fix |
|---|---|
| `main` is missing | `git branch --track main origin/main` |
| Git name or email is empty | `git config user.name "Your Name"` and `git config user.email "you@example.com"` |
| Node is older than v22 | Install Node 22 or newer, then open a new terminal |
| Workbench is behind | `git -C "$HOME/lab/workbench" pull --ff-only` |

Anything else: ask your facilitator before continuing.

---

## Step 1. Inspect the change

**Goal.** Understand what changed before any tool interprets it.

**Run.**

```bash
git show --stat 965029f
git show 965029f
```

**Expect.** One commit that touches source files and test files.

**Look for.**

- Refund-retry changes: the new retry code and where it is called
- A logging change in the payment path, near line 67 of `src/payments/service.ts`
- A fee-calculation change, near lines 118 to 119 of the same file
- Test and test-data changes: what the tests now assume

**Decide.** If this were your pull request, where would you investigate first, and why?

**Leaves behind.** Your own list of suspects. Nothing is written to disk.

> **Git shows what changed. You decide what deserves attention.**

---

## Step 2. Diagnose

**Goal.** Use the project's written rules to point at places worth a closer look. These rules are deterministic: the same change gives the same signals.

**Run.**

```bash
speed diagnose --feature payments --task 1
cat .speed/features/payments/risk-surface.yaml
git diff main...round-0 -- src/payments/service.ts
```

**Expect.** The command finishes and prints a list of signals. Allow about a minute.

**Look for.**

- The failure class and the rule that fired
- The file and line it matched
- The rationale: which pattern, and why it counts
- The verdict fields left blank for you

Pick one signal, open the file it names, and find the line in the diff.

A class with zero signals can mean no rules are configured for it. That is not the same as clean.

**Decide.** Is this only a signal, or do you have enough evidence to call it a defect?

**Leaves behind.** `.speed/features/payments/risk-surface.yaml`

> **Signal ≠ verdict.** A rule matching a line is a question, not an answer.

---

## Step 3. Review

**Goal.** Get an independent reader's claims about the change, then test those claims yourself.

**Run.**

```bash
speed review --feature payments --task 1
```

**Expect.** A summary of findings, each with a severity, a location and a claim. Allow a few minutes. Your facilitator will show where to read the full list.

**Look for.**

- The claim, in one sentence
- The location it points to
- The severity the reviewer gave it
- Evidence in the code that supports or refutes it

For a logging finding, follow the value from the `log.error(...)` call through the functions it passes into, and see what actually reaches the log.

**Decide.** Which claims survive your check, and which do not?

**Leaves behind.** Findings with location and reasoning. They stay unresolved until a person decides.

> **Claim ≠ fact.** Specific and fluent still has to be checked.

---

## Step 4. Eval

**Goal.** See exactly what a passing or failing test proves, and what it never looked at.

**Run.**

```bash
speed eval --feature payments --task 1
```

Then reproduce the fee failure directly:

```bash
node --experimental-strip-types --test --test-name-pattern '^\[RISK-02\]' test/service.test.ts
```

**Expect.** The RISK-02 test fails. The fee assertion reports an actual value of 2 and an expected value of 3.

**Look for.**

- Which scenario ran, by ID
- Which assertion decided pass or fail
- What did not run, and why those tests were chosen
- Whether a passing test actually calls the code you are worried about

Open the test body behind at least one pass and one fail. Read what it sets up, what it calls and what it asserts.

**Decide.** What can I legitimately conclude from this result, and what can't I?

**Leaves behind.** A summary and test plan under `.speed/features/payments/eval/task-1/`

> **Pass ≠ safe.** Green means the chosen tests passed. Nothing more.

---

## Step 5. Judgment checkpoint

No command here. Using only what Steps 1 to 4 showed you, classify each concern.

| Class | Meaning |
|---|---|
| **Confirmed defect** | The code is wrong, and you can point to the requirement and the evidence |
| **Test gap** | The code may be fine, but nothing checks it. A test passes without exercising the behaviour |
| **False alarm** | The claim was checked against the code and refuted |
| **Owner decision** | Needs a product or domain call the evidence cannot make |

Fill in your own copy of this table:

| Concern | Class | Evidence (file, line, test) | Owner | Next action |
|---|---|---|---|---|
| Card data in the failure log | | | | |
| Refund retry test | | | | |
| Fee calculation | | | | |
| Retry policy and idempotency | | | | |
| *Your own concern* | | | | |

- [ ] I classified every concern and can defend each one with evidence

---

## Step 6. Define

**Goal.** Turn one checked problem into a defect record someone else can reproduce.

**Run.** Start the dashboard and open the findings page.

```bash
speed dashboard start
```

Open <http://localhost:3000/define/payments/findings>, select the fee finding and choose **File new defect**. Replace the drafted wording with facts you have checked:

| Field | Enter |
|---|---|
| **Title** | `Capture fee truncates instead of rounding half up` |
| **Severity** | `P1`, then tick *I reviewed and confirm this severity* |
| **Reproducibility** | `always` (only `always`, `once` or `intermittent (n/10)` are accepted) |
| **Observed** | On round-0, the RISK-02 test fails: a capture amount of 200 at scheme rate 0.0149 produces a fee of 2 and a merchant amount of 198. The fee assertion reports actual 2, expected 3. |
| **Expected** | Half-up rounding must produce a fee of 3 for 200 × 0.0149 = 2.98, leaving a merchant amount of 197. RISK-02 also requires a fee of 149 and a merchant amount of 9850 for a capture of 9999. Fee plus merchant amount must equal the capture. |
| **Reproduction** | Must start with `1.` on its own line. Steps: 1. From the fixture root on round-0, run the RISK-02 command from Step 4. 2. Observe the fee assertion: actual 2, expected 3. 3. Inspect the `Math.floor` fee calculation in `src/payments/service.ts`. |

If **File defect** stays disabled, check Reproducibility and the `1.` at the start of Reproduction.

Then read the file it created:

```bash
cat specs/defects/capture-fee-truncates-instead-of-rounding-half-up.md
```

**Expect.** A defect file with observed behaviour, expected behaviour, reproduction steps and a link back to its evidence.

**Look for.**

- Facts you verified, not the tool's wording
- Evidence and provenance back to the finding or test
- Severity you chose, not one copied from the reviewer

**Decide.** Which words in this record came from the tool, and which have I verified?

**Leaves behind.** A defect file under `specs/defects/`. Plan reads it.

> **The tool drafts. You own the truth of the record.**

---

## Step 7. Plan

**Goal.** Convert the defect into repair work with a clear boundary.

**Run.**

```bash
speed plan --feature payments-fee-repair \
  --defects specs/defects/capture-fee-truncates-instead-of-rounding-half-up.md
jq . .speed/features/payments-fee-repair/tasks/1.json
```

**Expect.** A task record. Allow about two minutes. The output may suggest running `speed run` next. Do Step 8 first.

**Look for.**

- The exact files the task may touch
- Acceptance criteria you could check by running something
- The source defect it traces back to
- Anything not about this defect

**Decide.** Is this plan no more and no less than the evidence requires?

**Leaves behind.** `.speed/features/payments-fee-repair/tasks/1.json`

> **Plan ≠ progress.** Nothing in the code has changed yet.

---

## Step 8. Verify

**Goal.** Have a second check challenge whether the plan covers the defect. Independent checking catches errors that share a source.

**Run.**

```bash
speed verify --feature payments-fee-repair
```

**Expect.** A verification result, ending in a pass or a list of issues. Allow about two minutes.

**Look for.**

- A requirement in the defect that the plan misses
- Scope drift: work the defect never asked for
- An assumption with no evidence
- Coverage: each acceptance criterion tied to a way of checking it

**Decide.** Would I let this plan go to an agent as it stands?

**Leaves behind.** A verification log and validation report in the feature folder.

> **Independent beats agreeable.**

---

## Step 9. Run

**Goal.** Commission the repair. An agent works on its own branch in a separate working copy, so your checkout is not touched.

**Run.**

```bash
speed run --feature payments-fee-repair --max-parallel 1
```

**Expect.** This takes about 4 to 6 minutes. Do not interrupt it. While it runs, re-read your defect and decide what a correct repair must and must not touch.

**You should understand.**

- The agent carries out the task. It does not decide what the task is
- The work happens on an isolated branch
- The configured checks run before the status changes
- DONE means those checks passed. It is a workflow status

**If the run fails or stalls**

| What you see | What to do |
|---|---|
| Exit 128 right after "Creating baseline commit" | Git has no name or email. Set them (see Before you start) and run again |
| "Reached max turns (50)" or "Agent CLI error" | Tell your facilitator. A recovery command exists and they will tell you when to use it |
| `src/payments/service.ts` shows as modified in your main folder | Tell your facilitator, then run `git restore src/payments/service.ts` so `round-0` stays the baseline |

Do not edit task files by hand.

**Leaves behind.** A repair branch named `speed/payments-fee-repair/task-1-…` and a task marked done.

> **DONE ≠ approved.** Approval is a human decision about this exact revision.

---

## Step 10. Inspect the repair

**Goal.** Check the real change against the defect and the plan, instead of trusting the status.

**Run.**

```bash
REPAIR_BRANCH=$(jq -er '.branch' .speed/features/payments-fee-repair/tasks/1.json)
git --no-pager diff "round-0...$REPAIR_BRANCH" -- src/
git log --oneline -3 "$REPAIR_BRANCH"

git switch "$REPAIR_BRANCH"
node --experimental-strip-types --test --test-name-pattern '^\[RISK-02\]' test/service.test.ts
npm test
git switch round-0
```

Always finish with `git switch round-0`.

**Expect.** The RISK-02 test that failed in Step 4 now passes. The full test run passes.

**Look for.**

- Only the files and lines the plan allowed
- The commit that holds the change, so you can name the exact revision
- Any change beyond the approved scope

**Decide.** Did this exact revision fix the proven problem without going beyond the approved scope?

**Optional, if time allows.** Check the repair again and compare with your earlier results:

```bash
speed review   --feature payments-fee-repair --task 1
speed diagnose --feature payments-fee-repair --task 1
speed eval     --feature payments-fee-repair --task 1 --test-spec specs/tests/payments.md
```

At the end of the session:

```bash
speed dashboard stop
```

---

## What we concluded

Compare with your Step 5 table. Where you differ, check whether the evidence or the wording changed your mind.

| Concern | Outcome | Why |
|---|---|---|
| Card-data logging | Refuted on the checked path | Redaction was verified on the path the claim named |
| Retry test | Test gap | The test passes without exercising the retry loop |
| Fee calculation | Confirmed defect | The written requirement and an executable test both disagree with the implementation |
| Retry policy and idempotency | Owner decision | Needs a product or domain decision the code cannot settle |

---

## Take it back to your codebase

Map the mechanism, not the commands. You do not need to finish this in class.

1. What deterministic failure signals would matter in your domain?
2. What claims should an AI reviewer make about your changes?
3. What evidence would prove or refute each claim?
4. Which decisions must stay with a person or a domain owner?
5. Which parts could you automate in your existing workflow?

---

## Quick reference

| Remember | Meaning |
|---|---|
| **Signal ≠ verdict** | A rule fired. A person decides. |
| **Claim ≠ fact** | A reviewer said it. Check it. |
| **Pass ≠ safe** | Only the chosen tests ran. |
| **Plan ≠ progress** | The code has not changed. |
| **DONE ≠ approved** | Checks passed. The revision is still unreviewed. |

**Five questions for every output**

1. What went in?
2. What was checked?
3. What came out?
4. What is still unknown?
5. Who owns the next decision?
