# Lab 301.1E Action Guide

## Define, Audit, Plan

Follow this guide while your facilitator leads. Each step has the same parts:

| Label | Meaning |
|---|---|
| **Run** | Type this in the regular terminal, at the fixture root |
| **Claude Code** | Type this inside the Claude Code conversation, not the shell |
| **Check** | What to look at in the result |
| **Post** | A line to send in the Zoom chat |
| **Stuck?** | Post the step number and the error in the Zoom chat. A coach will help while we keep going |

> Wording, findings, task counts and timings differ between people. Read your own output. A command that succeeds does not mean every requirement is covered or every owner agrees.

**Today's case.** A card-payments gateway has two weaknesses. F2.1: a genuine traveler is declined for a large cross-border purchase. F2.2: a script tests forty stolen cards across twenty merchants and every payment is approved. Both fixes share one bank challenge. You review and develop two technical specifications, plan the work, and hand off. **Nobody builds anything today.**

| Step | About | You do | Post in chat |
|---|---|---|---|
| Setup | Before we start | Clone, update, check | "OK" |
| 1. Orient | Minutes 16–22 | Run the tests, read four files | none |
| 2. Validate | 22–34 | Check one finding against its sources | none |
| 3. Define and Draft | 34–67 | Answer questions, review the diff | Q1 line, pair line |
| 4. Audit | 67–80 | Compare two specs | Finding line |
| 5. Plan | 80–95 | Run, read the task graph | none |
| 6. Verify | 95–105 | Run, read coverage | none |
| 7. Handoff | 105–115 | Write 2–3 sentences | Handoff line |
| Close | 115–120 | Answer, give feedback | Owner question |

---

## Setup

Use **Terminal** on Mac and **Git Bash** on Windows. Python must be 3.12 or newer and Node 22.18 or newer.

**1. Pick your system and run its block.**

Mac:

```bash
export SPEED_DIR="$HOME/Lab/workbench"
export SPEED_PYTHON="$SPEED_DIR/.venv/bin/python3"
export PATH="$SPEED_DIR:$PATH"; hash -r
```

Windows (Git Bash):

```bash
export SPEED_DIR="$HOME/Lab/workbench"
export SPEED_PYTHON="$SPEED_DIR/.venv/Scripts/python.exe"
export PATH="$SPEED_DIR:$PATH"; hash -r
```

**2. Update Workbench.** Skip this if `~/Lab/workbench` does not exist yet and use the first-time block at the end of this section.

```bash
cd "$SPEED_DIR" && git fetch origin && git checkout feat/301-latest && git pull --ff-only && "$SPEED_PYTHON" -m pip install -q -r requirements.txt
```

**3. Clone the lab fixture.**

```bash
mkdir -p "$HOME/Lab/301.1E" && git clone -b feat/301-define-audit-plan-config https://github.com/ArulaAI/payments-validation-fixture.git "$HOME/Lab/301.1E/payments-validation-fixture" && cd "$HOME/Lab/301.1E/payments-validation-fixture"
```

**4. Check it worked.**

```bash
"$SPEED_PYTHON" --version; node --version; command -v speed; git branch --show-current; git rev-parse --short HEAD; claude auth status
```

**Check.** Python 3.12 or newer. Node 22.18 or newer. `speed` is inside the Workbench folder. Branch `feat/301-define-audit-plan-config`. `claude auth status` shows the **team** plan.

**Post.** "OK" when all of that looks right.

**New terminal?** The exports in step 1 apply only to that terminal. Repeat step 1, then `cd "$HOME/Lab/301.1E/payments-validation-fixture"`.

**First time only, if `~/Lab/workbench` does not exist.** Do this before steps 1 and 2.

Mac:

```bash
git clone -b feat/301-latest https://github.com/ArulaAI/workbench.git ~/Lab/workbench && cd ~/Lab/workbench && python3 -m venv .venv && .venv/bin/pip install -q -r requirements.txt
```

Windows (Git Bash):

```bash
git clone -b feat/301-latest https://github.com/ArulaAI/workbench.git ~/Lab/workbench && cd ~/Lab/workbench && py -3.12 -m venv .venv && .venv/Scripts/pip install -q -r requirements.txt
```

**Your workspace.** IDE on the left (you read the fixture's specs, source and tests). Claude Code on the right (you decide). A separate terminal for the `speed` commands.

---

## Step 1. Orient

*What does the system do today?* Do not edit anything in this step.

**Run**

```bash
node --version
npm test
baseline_exit=$?
printf 'Baseline test exit code: %s\n' "$baseline_exit"
```

**Check.** Expect 102 tests. If `[WB-10]` fails (101 of 102), note it and carry on. It is the fixture's own check, not part of today's lab.

**Open** these four, in this order:

| File | Look for |
|---|---|
| `test/gateway.test.ts`, GW-02 | The test expects the traveler to be **declined** |
| `test/gateway.test.ts`, GW-05 | The test expects the attack to be **approved in full** |
| `test/fixtures/traffic.ts`, `cardTestingBurst` | Forty cards, twenty merchants, each card used once |
| `src/risk/rules.ts`, `evaluate` | The two rules that make both decisions |

Amounts are in minor units: `249_900` is £2,499.

---

## Step 2. Validate

*Do the documents agree with each other?* Findings differ between people. The documents are the same.

**Run: three short blocks, in order.**

First, set up an evidence folder. **Each new terminal needs the first line again.**

```bash
course_evidence_dir=".speed/course-301-1e/session"
mkdir -p "$course_evidence_dir"
```

Then Validate (about 3 minutes). Exit code 1 is expected.

```bash
speed validate specs/
validate_exit=$?
printf 'Validate exit code: %s\n' "$validate_exit"
cp -R .speed/logs "$course_evidence_dir/after-validate-logs"
```

**Check.** Open `.speed/logs/validation.log`. Find the **72-hour hold-expiry** entry, including under warnings. If your report does not have it, use this claim instead:

> The draft describes expiry after 72 hours and a `holdExpired` webhook. Check whether it identifies what executes expiry and lists the implementation in File Impact.

**Run: start Claude Code** at the fixture root. Do not start the authoring skill yet.

```bash
claude
```

**Claude Code.** Paste the entry or the claim below the prompt.

```text
Check this finding against the source documents.
Confirm or refute it with citations. Keep it brief; make no edits.
[paste the finding here]
```

**Check.** Every claim has a cited line you can open. Your verdict is one of three:

- **Confirmed.** The documents do disagree. Next: who owns the fix?
- **Partly confirmed.** Keep what the citations support, drop the rest.
- **Refuted.** Set it aside and note why.

Write down what the draft promises and what it leaves unclear.

> A finding is a tool's claim. It becomes a gap only when the sources confirm it.

---

## Step 3. Define and Draft

*What is undecided, and whose call is it?* The assistant proposes. You decide engineering questions. Owners decide everything else.

**Run: start the authoring skill.** In Claude Code at the fixture root:

**Claude Code**

```text
/author-tech-spec adaptive-auth
```

If you type it in the shell and it fails, start `claude` first. To continue an earlier conversation, add `resume` at the end.

**Check the summary it gives you.** Does it match what you saw in Orient? Is the finding you checked in Validate in its list?

**Claude Code.** Everyone asks the same question before confirming:

```text
Before I confirm: what in this summary is inferred rather than stated in the sources, and which of those would change the design if they turned out to be wrong? Cite the lines.
```

Read the part about what would change the design. Then reply in your own words: add anything your questions turned up, correct anything that is off, and confirm the scope is **both specs and what they share**. A plain "confirmed" is fine if nothing turned up.

**Eight topics.** The assistant works through them in this order. Every pair gets the same questions. Not everyone will reach topic eight.

| # | Topic | A good answer |
|---|---|---|
| 1 | Trusting the bank's answer | Decide who may report each result: checkout may only cancel; a bank result comes only from our side. Leave how we get it open until the provider confirms, with a default and an owner |
| 2 | Calls to the bank, and speed | Do not redesign the flow. Where the architecture contradicts itself, send it to Architecture with your preferred option |
| 3 | Time limits | A number without a source stays provisional, with an owner. Do not add timeouts the documents do not call for |
| 4 | What the two specs share | Both specs say the same thing about every shared piece, and name which one owns it |
| 5 | Decisions that are not ours | Decide none. Name the owner, what it holds up, and an interim suggestion |
| 6 | How long to trial it quietly | Check both numbers mean the same thing. Align with the architecture or record an exception. Do not pick a number |
| 7 | Out-of-date references | Fix only references that point nowhere. Do not rename a configuration label |
| 8 | Who else a block affects | Do not set limits. Record the effect on genuine customers and send the limits to Risk |

**How to answer, every time.**

1. Decide the part that is ours and the sources support.
2. Leave open what depends on someone else, with a suggested default and a named owner.
3. Move anything that belongs to a later topic to that topic.
4. Ask to see the proposed change.

**Topic 1, together.** Your facilitator runs it on screen. Answer in your own words using the table.

**Post.** One line: `decided: … | open: … → owner`

**Review every change.** Compare what actually changed, not the assistant's description. Save any editor buffer first.

```bash
git diff --stat -- specs/tech/adaptive-auth/
git diff -- specs/tech/adaptive-auth/1-high-value-traveller.md specs/tech/adaptive-auth/2-card-testing.md
```

**Check.** Both specs. The two must say the same thing about anything they share. Accept a change only if it matches the decision you made.

**On your own, about 10 minutes.** Choose one or two topics closest to your own work. For the rest, accept the recommended option and let it record the answer as provisional.

**Post** when you are back: `decided: … | open: … → owner`

**When the facilitator calls time.** Ask the assistant to save the next action, accepted decisions and owner requests. Later, `/author-tech-spec adaptive-auth resume` picks up where you stopped.

**Before you leave.** Ask in your own words: is this ready for review, and is it ready to plan? They have different answers.

The assistant keeps its records here:

```text
.speed/authoring/adaptive-auth/session.md
.speed/authoring/adaptive-auth/questions.md
.speed/authoring/adaptive-auth/decisions.md
.speed/authoring/adaptive-auth/coverage.md
```

> A draft is not an approval. Do not change another team's document to make things agree. Send it to its owner.

---

## Step 4. Audit

*A second reader checks your drafts.* Audit reads documents, not code, so a clean audit is not a correct spec.

**Run: one spec at a time.**

```bash
speed audit specs/tech/adaptive-auth/1-high-value-traveller.md
audit_f21_exit=$?
printf 'F2.1 Audit exit code: %s\n' "$audit_f21_exit"
cp -R .speed/logs "$course_evidence_dir/after-audit-f21-logs"
```

```bash
speed audit specs/tech/adaptive-auth/2-card-testing.md
audit_f22_exit=$?
printf 'F2.2 Audit exit code: %s\n' "$audit_f22_exit"
cp -R .speed/logs "$course_evidence_dir/after-audit-f22-logs"
```

**Check.** `WARN` with exit 0 is common and does not mean the draft is gap-free. Read the status and the findings together.

**Open.** Compare **Produces** in the F2.1 spec with **Consumes** in the F2.2 spec. Does F2.1 provide the cancellation behavior F2.2 expects? Use the source even if Audit missed it. Aligned is a valid result if you cite it.

**Decide a disposition for the finding:** a correction, an owner, or no action.

**Post.** One line: `finding · evidence · owner · effect on Plan`

> If an owner decision blocks the scope, say so. The facilitator will walk through the Plan source and a blocked Handoff. Do not invent an approval and do not skip gates.

---

## Step 5. Plan

*What work does the spec turn into?* Plan covers **both specs**, because they share one bank challenge. Continue only when the facilitator says the scope is cleared.

**Run: snapshot first, then plan.** It takes about 10 minutes. Let it finish; do not restart it.

```bash
if [ -d .speed/features/adaptive-auth ]; then
  cp -R .speed/features/adaptive-auth "$course_evidence_dir/before-plan-feature"
fi
speed plan --feature adaptive-auth
plan_exit=$?
printf 'Plan exit code: %s\n' "$plan_exit"
cp -R .speed/features/adaptive-auth "$course_evidence_dir/after-plan-feature"
```

While it runs, look for the one dependency that matters most for the scope you chose.

**Check.**

- The Guardian may flag a concern. A flag is a note, not a stop. A rejection stops the plan: open the evidence and tell a coach.
- The number of tasks is capped by a setting (`max_tasks`). Note your number; it may differ from your neighbor's.

**Run: read the plan.**

```bash
speed status --feature adaptive-auth
jq -s 'map({id, title, depends_on, files_touched})' .speed/features/adaptive-auth/tasks/*.json
```

**Check.** Pick one dependency. Is the work in the order you would expect? Do two tasks change `gateway.ts` at the same time?

> The command may suggest `speed run`. **Do not run it.** Building is not part of today.

---

## Step 6. Verify

*Does the plan still say what the spec meant?* A pass means no critical failures. It does not mean complete.

**Run: snapshot, verify, compare.** It takes 2 to 4 minutes. If it repairs the plan, wait for it to finish.

```bash
cp -R .speed/features/adaptive-auth "$course_evidence_dir/before-verify-feature"
speed verify --feature adaptive-auth
verify_exit=$?
printf 'Verify exit code: %s\n' "$verify_exit"
cp -R .speed/features/adaptive-auth "$course_evidence_dir/after-verify-feature"
diff -ru "$course_evidence_dir/before-verify-feature/tasks" .speed/features/adaptive-auth/tasks
```

**Check.**

- Open `.speed/features/adaptive-auth/logs/plan-verification.log`. Pick **one requirement** and follow it: is its coverage full, partial or missing?
- If the diff shows changes, read them before you use the revised plan. Diff exit 1 only means files changed. It is not a failed Verify.

---

## Step 7. Handoff

*What may be built, and what must wait?* A blocked handoff is a valid outcome.

**Write, on your own, about 5 minutes.** Two or three sentences, using your saved evidence:

> **Can proceed:** … **Must wait:** … **Owner who unblocks it:** … **Evidence:** …

**Post** it in the chat when asked.

> Verified is a statement about scope. Decisions that belong to someone else stay decisions, not tasks.

**Stop here.** Do not run `speed run`.

---

## Close

**Post.** One question to take back to your own work: which decision in your project has no named owner?

Then three feedback questions: what should we cut, what should we keep exactly as it is, and where did you lose the thread?

---

## Stuck?

| What you see | What to do |
|---|---|
| `speed` runs the wrong Workbench in a new terminal | Repeat Setup step 1 and check `command -v speed` |
| `$course_evidence_dir` is empty in a new terminal | Run the first line of the evidence block in Step 2 again |
| "Unparseable output" or a sign-in error | Run `claude auth status`. It must show the team plan. Keep the output and tell a coach |
| A skill command fails in the shell | Start `claude` first, then type it inside the conversation |
| The assistant paused after loading inputs | Read its question and answer it. Do not restart the skill |
| Optional grammar warnings | Ignore them. Not a lab result |
| Guardian rejects the plan | Stop. Keep the report and tell a coach. Do not add skip flags |
| Plan failed but task files exist | They belong to an earlier run. Do not treat them as a new plan |
| Verify is repairing the plan | Wait. Then read the before/after diff |
| Python older than 3.12 | Ask a coach before continuing |

## Words we use

| Word | Means |
|---|---|
| **Finding** | A tool's claim about the documents |
| **Gap** | A finding the sources confirm |
| **Owner** | The person whose function decides the question |
| **Blocker** | A gap that is waiting on its owner |
| **Disposition** | What you decide to do with a finding |
| **Verified** | Checked for a stated scope, not complete |

## Four habits

1. Read the sources against each other.
2. Send each gap to its owner.
3. Write a change someone else can test.
4. Know what each tool checks, and what it cannot see.

For every output, ask: **What went in? What was checked? What came out? What is still unknown? Who owns the next decision?**
