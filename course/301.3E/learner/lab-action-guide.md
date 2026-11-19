# Lab 301.3E: Payments Change Validation

Today you validate the adaptive authorization change that agents built in 301.2E. It has been
reviewed, integrated and passes every test. Your job is to decide what is actually true about
it, repair what is yours to repair, and send the rest to the people who own it.

## How to use this guide

Every step has the same three parts:

- **What's happening** explains the stage. Read it while your facilitator talks.
- **Run** lists what to type, in order. Each item says whether it goes in the terminal or in
  Claude Code.
- **Look for** is a checklist. Tick each item before you move on.

Your output will not match the examples word for word. Counts and wording vary.

## Before you start

Setup is already done. Keep your IDE on the left, Claude Code on the right, and a separate
terminal for the `speed` commands. In every new terminal, run the export lines from the setup
message, then:

```bash
cd "$HOME/Lab/301.3E/payments-validation-fixture"
export MAIN_BRANCH=baseline
```

`baseline` is the commit 301.2E started from. Every task is already merged into `main`, so
SPEED compares each task with `baseline` to see what it changed.

If you get stuck, ask a coach and tell them the step number and the error.

---

## 1. Inspect (10 min)

### What's happening

Before trusting any report, look at what you were handed: the code, the task records and the
team's own claims. Change nothing in this step.

### Run

1. In the terminal:

   ```bash
   npm test
   speed status --feature adaptive-auth
   git log --oneline --first-parent main | head -15
   ```

2. In your IDE, open `.speed/features/adaptive-auth/logs/integration.log` and
   `.speed/features/adaptive-auth/logs/1.log`. Scroll to the end of `1.log`.

### Look for

- [ ] 239 tests pass. Tasks 1 to 8 are done; 9 and 10 are blocked.
- [ ] You found the agent's closing claim at the end of `1.log`. Write it down word for word.
- [ ] You can name the task that changed the capture code, and the one that changed the gateway.

---

## 2. Diagnose (15 min)

### What's happening

Diagnose counts failure-class signals in one task's change, F1 to F8. It reads the diff and
nothing else: no model, no tests. A signal is a place to look, not a finding. A zero means
nothing matched, not that nothing is wrong.

### Run

1. In the terminal, diagnose the task that changed the capture code:

   ```bash
   speed diagnose --feature adaptive-auth --task 2
   ```

   <details><summary>Example output</summary>

   ```text
   Change: baseline...speed/adaptive-auth/task-2-add-capture-blocks-and-append-only-audit
     F1  Hallucinated API, config key or dependency         1 signal(s)
     F2  Cardholder data leakage                            1 signal(s)
     F3  Weak test that passes and proves nothing           1 signal(s)
     F4  Broken invariant under generated sequences or retry 1 signal(s)
     F5  Sycophantic self-approval                          0 signal(s)
     F6  Wrong problem, scope creep, over-engineering       1 signal(s)
     F7  Silent regression in untouched behaviour           0 signal(s)
     F8  Specification gap                                  1 signal(s)
   Risk surface written to .speed/features/adaptive-auth/risk-surface.yaml
   Every verdict is undecided. Fill them in before running any check.
   ```

   </details>

2. Run it for tasks 1, 3 and 5 as well.
3. In your IDE, open `.speed/features/adaptive-auth/risk-surface.yaml`. Each signal has
   evidence: a file, a line and the text that matched.

### Look for

- [ ] For one signal, you opened the file and line it points to.
- [ ] You noticed F5 is zero everywhere. Diagnose has no rule for self-approval; it cannot see it.
- [ ] You picked three signals worth checking and wrote why.

---

## 3. Review (15 min)

### What's happening

A clean-context reviewer reads one task's diff against its spec. It was not part of the run.
It gives you a second opinion, and opinion is the strongest evidence it can give.

### Run

1. In the terminal, review the task with the most signals you chose to check:

   ```bash
   speed review --feature adaptive-auth --task 3
   ```

2. In your IDE, open the written review under `.speed/features/adaptive-auth/reviews/`.
3. Compare it with the approval already stored in the task record:

   ```bash
   jq -r '.review_feedback | fromjson | .verdict' .speed/features/adaptive-auth/tasks/3.json
   ```

### Look for

- [ ] You know what the reviewer was given: the diff and declared files, not the task's
      acceptance criteria.
- [ ] One finding you can confirm or refute from the code yourself.
- [ ] Where the new review disagrees with the stored approval, you noted both.

---

## 4. Eval (15 min)

### What's happening

Eval runs the feature's scenarios and records each test outcome as evidence. A passing test
proves only what it asserts. Here you test the closing claim from step 1 against the tests
it cites.

### Run

1. In the terminal:

   ```bash
   speed eval --feature adaptive-auth --task-id 1
   ```

2. In your IDE, open `test/policy.test.ts`. List every score it checks. Compare them with the
   boundaries the F2.1 tech spec's Test Plan asks for.
3. In Claude Code, ask:

   ```text
   In src/risk/policy.ts, which tests would fail if `>=` became `>` on
   the step-up threshold? Show the test lines. Make no edits.
   ```

### Look for

- [ ] Whether the claim in `1.log` holds for every boundary it names.
- [ ] A change to the code that every test would still pass. That is a weak test.
- [ ] Your verdict on the claim: confirmed, partly true, or refuted.

---

## 5. Human judgment (15 min)

### What's happening

You now have signals, opinions and test evidence. Sort them. Each item gets one disposition:
**confirm** (a real defect, yours to fix), **refute** (not a defect, say why), or
**escalate** (a decision that belongs to someone else). No tool makes this call for you.

Two things to check that no tool above settles:

- Where does the full pending request go once a payment is held? Follow it from
  `src/payments/gateway.ts` into `src/review/queue.ts`.
- What happens to a genuine customer whose card shares a BIN with an attack? Read
  `src/risk/blocks.ts` and the traveller's card in `test/fixtures/traffic.ts`.

### Run

1. In your IDE, write one line per item in a file outside the repo:

   ```text
   item · evidence (file:line or report) · disposition · owner
   ```

2. Check one capture path the tests do not: partially capture an ordinary payment and read its
   status. Ask Claude Code to show you, without editing:

   ```text
   Authorise 4,200 and capture 1,000 with PaymentsService. What is the
   payment's status, and what does the F1 spec say it should be?
   ```

### Look for

- [ ] At least three confirmed items, each with evidence you checked yourself.
- [ ] One refuted claim, with the reason.
- [ ] One item you escalate, with its owner and the phase it blocks. You do not choose a policy.

---

## 6. Define (15 min)

### What's happening

A confirmed defect becomes a defect report: what happens, what should happen, how to reproduce
it, and how to tell it is fixed. The report is the repair's specification, so write a check
someone else can run.

### Run

1. In the terminal, scaffold one report per confirmed defect:

   ```bash
   speed new defect held-request-stored
   ```

2. In your IDE, fill in `specs/defects/held-request-stored.md`. Name the file and line, the
   requirement it breaks, and the test that would prove the fix.
3. Write the escalated item as a short note to its owners, not as a defect.

### Look for

- [ ] Each report cites the requirement it breaks.
- [ ] Each report names a check that fails today and passes after the fix.
- [ ] The escalation names both PMs and Risk, the stories it touches and the phase it blocks.

---

## 7. Plan and Verify (15 min)

### What's happening

Plan turns your defect reports into repair tasks. Verify checks the plan against them with a
reader that never saw the planner's reasoning.

### Run

1. In the terminal:

   ```bash
   speed plan --defects specs/defects/held-request-stored.md specs/defects/<next>.md \
     --feature adaptive-auth-repair
   speed verify --feature adaptive-auth-repair
   ```

2. In your IDE, open the repair tasks under `.speed/features/adaptive-auth-repair/tasks/`.

### Look for

- [ ] Each repair task stays inside the scope of its defect.
- [ ] No task changes the escalated policy.
- [ ] Verify's verdict, and which defect each finding is about.

---

## 8. Run and Inspect (15 min)

### What's happening

Agents carry out the repair. Then you check the result the same way you checked the candidate:
is each defect actually fixed, and did anything else change?

### Run

1. In the terminal:

   ```bash
   speed run --feature adaptive-auth-repair --max-parallel 2
   npm test
   ```

2. Run the check named in each defect report.

### Look for

- [ ] Each confirmed defect's own check now passes.
- [ ] The full suite still passes, and no test was weakened to get there.
- [ ] Your escalation is still open. It is not something a repair can close.

---

## Close (5 min)

One question to take back to your own work: which green check in your project would pass even
if the code were wrong?

## If you get stuck

| What you see | What to do |
| --- | --- |
| `Branch '…' not found` from diagnose or review | Run the branch line from the setup message again: the clone needs local task branches |
| Diagnose shows `0 signal(s)` for every class | Check `MAIN_BRANCH` is `baseline` in this terminal |
| `speed` is missing, or runs the wrong Workbench | Run the export lines from the setup message again and check `command -v speed` |
| A command asks a yes/no question | Read it and answer. Do not add `--yes` |

## Words we use

| Word | Meaning |
| --- | --- |
| Signal | A place diagnose says to look. Not a finding |
| Finding | A claim from a tool or a reviewer |
| Confirm / refute / escalate | Your disposition for each finding |
| Defect report | The specification of a repair |
| Escalation | A decision that belongs to an owner, sent to them with its evidence |

## Four habits to take with you

1. Read the claim, then read what it cites.
2. A green check proves only what it asserts.
3. Fix what is yours; send the rest to its owner.
4. Know what each tool checks, and what it can't see.
