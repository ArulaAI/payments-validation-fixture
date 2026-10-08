# 301.1E Define, Audit, Plan

Course framework for engineers who receive a PRD, an architecture and a design from other
functions and are responsible for the tech spec and the plan built from it. Covers purpose,
the six stages, who does the work in each (the engineer or SPEED), what SPEED grounds
itself on, and what is still undecided. It is a framework rather than a lesson script.

301.1E replaces the Define and Plan half of the
[301.1 framework draft](course-301-1-define-execute-framework.md). It ends with a verified
task plan, which is where the Execute course picks up.

## The question the course answers

**Is this feature defined well enough to plan, and does the plan still say what the specs
meant?**

A traveller in Tokyo is refused a 2,499 pound television by a rule written at launch.
Meanwhile forty stolen card numbers are approved across twenty merchants in three
minutes, because the same platform counts attempts per card and each card was tried once.
Product, architecture and design have each written their part of the fix. Engineering
owns the tech spec, and the course is about doing that job well:

- reading three functions' documents against each other and against the code
- sending what is missing to the person who owns it, instead of deciding it
- writing a tech spec that is honest about what is still open
- knowing what `speed audit` and `speed plan` actually check, and what they cannot see

## Audience and ground rules

Experienced engineers who want to run SPEED and read how it works. Sessions are hands-on.
Each stage is part of one Define, Audit, Plan loop on one feature, not a standalone lesson.

Engineers play every role. When a gap belongs to the PM, the designer or the architect,
the engineer writes a suggestion on that section in Define, then switches role and
decides it as the owner would. Nobody edits a document they do not own. The aim is that
an engineer leaves knowing what a PM or a designer has to commit to, not only what they
wrote.

## Fixture

`301-config`, branch `feat/301-define-audit-plan`. The existing card payments service,
with a gateway and launch-era risk rules in front of it. See
[`course-301-1e-facilitator-gap-map.md`](course-301-1e-facilitator-gap-map.md) for where the upstream documents fall
short and what SPEED's gates will and will not show on this fixture. That file is for
facilitators only.

| Provided to engineering | Author | File |
|---|---|---|
| Product vision | Head of payments product | `specs/product/overview.md` |
| F2.1 high-value purchases | PM, checkout | `specs/product/adaptive-auth/1-high-value-traveller.md` |
| F2.2 card testing | PM, risk platform | `specs/product/adaptive-auth/2-card-testing.md` |
| Platform architecture | Principal architect | `specs/architecture/overview.md` |
| Adaptive authorisation architecture | Principal architect | `specs/architecture/adaptive-auth.md` |
| Checkout step-up design | Designer, checkout | `specs/design/adaptive-auth/1-checkout-challenge.md` |
| Risk review queue design | Designer, operations console | `specs/design/adaptive-auth/2-risk-review-queue.md` |
| Existing code and tests | | `src/payments/gateway.ts`, `src/risk/`, `test/gateway.test.ts` |

Engineers write `specs/tech/adaptive-auth/`.

The five lenses the feature touches, and where each one lives in the provided documents:

| Lens | Lives in |
|---|---|
| Real-time fraud detection and authorisation scoring | Architecture, both PRDs |
| GenAI risk | F2.2 problem (attackers), architecture risk narrative (ours) |
| Customer experience | F2.1, checkout design |
| Legal and risk | Security sections, open questions, overview principles |
| Business value | Success criteria, F2.1 problem |

## The loop

```
 Orient ──► Define ──► Draft tech spec ──► Audit ──► Plan ──► Verify ──► Handoff
  0-10       10-40        40-70            70-85    85-105   105-115   115-120
               ▲                              │
               └──── a gap the audit finds ───┘
```

## Who does the work

Every stage has four layers, and the course keeps them apart:

| Layer | Meaning |
|---|---|
| **Engineer decides** | Judgment nobody else can make for them |
| **Engineer runs** | The command or screen they touch |
| **SPEED surfaces** | What SPEED puts in front of the engineer to help them decide |
| **SPEED runs** | What happens without the engineer, including things that change their artifacts |

The balance shifts across the session. Define is almost all human judgment with SPEED
assisting. In Plan the engineer types one command, SPEED runs nine steps, and the
engineer's job becomes judging what came back.

```
             Orient   Define   Draft   Audit   Plan   Verify
engineer      ███      ████     ███     ██      █       ██
SPEED                   █        █      ██     ████    ███
```

Every SPEED step below is marked **LLM** (a model's judgment) or **det** (deterministic
code). The marker tells an engineer how far to trust a result. A deterministic check is
exactly as good as what it measures. An LLM check can notice things no rule encodes, and
can also miss what is plainly there.

## Stages

### 01 Orient (0 to 10 min)

| Engineer decides | Engineer runs | SPEED surfaces | SPEED runs |
|---|---|---|---|
| What the system does today, before any document says what it should do | `npm test`; reads `gateway.ts` and `rules.ts` | Nothing yet | Nothing yet |

The characterisation tests show the traveller declined (GW-02), the decline that says
nothing (GW-03), the card-testing burst approved in full (GW-05), and velocity counted
per replica (GW-06).

**Produces:** a baseline test run. The behaviour the specs must change, pinned as tests
that will have to change with it.

The room leaves with: a shared picture of the system as it is.

### 02 Define (10 to 40 min)

| Engineer decides | Engineer runs | SPEED surfaces | SPEED runs |
|---|---|---|---|
| What is a gap, whose it is; then, as the owner, accept or dismiss with a reason | `/define/adaptive-auth`: section suggestions, role switch, commit | Template and structure checks, live (**det**). Cross-spec, codebase, sizing and vision checks on request (**LLM** and **det**). Assist ambiguity detector (**LLM**). Codebase cluster and blast radius (**det**) | Commitment gate (**det**). Auto-ratification when no eligible ratifier exists (**det**) |

The codebase dimension checks every backticked reference in a document against the
semantic graph and git as the engineer types (`ceremony_validator.py:486`).

Auto-ratification matters here. With one person playing every role, nobody is an
eligible ratifier, and SPEED writes a ratification record with source
`no-eligible-ratifier` (`ceremony_commitment.py:209`). The record exists; independent
approval does not.

**Produces:** suggestions on upstream sections, each accepted or dismissed by its owner
with a reason. Decisions the tech spec can rely on, and open questions with a named owner.

The room leaves with: shared language for "this is not mine to decide", and the PM's side
of a vague success criterion.

### 03 Draft the tech spec (40 to 70 min)

| Engineer decides | Engineer runs | SPEED surfaces | SPEED runs |
|---|---|---|---|
| What the agent assumed that nobody decided; what stays in Unresolved Questions | An agent drafting `specs/tech/adaptive-auth/` from the upstream documents, decisions and code | Assist fix suggestions (**LLM**). Codebase dimension on the draft (**det**) | Nothing until audit |

The engineer grounds the draft in `gateway.ts` and `rules.ts`, keeps every undecided
threshold and policy in Unresolved Questions with its owner, and removes what the agent
invented to fill a gap.

**Produces:** a draft tech spec that names what is still open.

The room leaves with: a habit of reading an agent-drafted spec for what it silently
decided.

### 04 Audit (70 to 85 min)

| Engineer decides | Engineer runs | SPEED surfaces | SPEED runs |
|---|---|---|---|
| Whether each finding is real, whose it is, whether to split | `speed audit --feature adaptive-auth` | Findings by level, sizing estimate, split recommendation | Spec type from the path, template and linked specs loaded (**det**). Audit agent, read-only, four levels (**LLM**) |

The four levels in `agents/audit.md`: structure, completeness, cross-spec consistency,
sizing. Sizing is always a warning, never a failure.

**Produces:** an audit report and a split of the tech spec into numbered files. Upstream
gaps go back to Define.

The room leaves with: shared intuition for what the audit can and cannot see. It finds
the TODO in a design and the success criterion with no number. It does not find that the
architecture's scoring service is stateless while card testing needs memory across
merchants, because it is a model reading documents, not a check against the code.
Passing the audit does not mean the requirements are right.

### 05 Plan (85 to 105 min)

| Engineer decides | Engineer runs | SPEED surfaces | SPEED runs |
|---|---|---|---|
| Whether to override a gate; whether the task graph makes sense | `speed plan --feature adaptive-auth` | Guardian report, audit report, spec alignment, coverage report, decomposition result | Nine steps, below |

What one command runs, in order:

| # | Step | Kind | Can stop the plan? |
|---|---|---|---|
| 1 | Guardian checks the specs against the product vision and its anti-goals | LLM | Yes, on reject. `SKIP_GUARDIAN=true` overrides |
| 2 | Audit, again, on every registered spec | LLM | Yes, on gate failure. `--skip-audit` skips |
| 3 | Code index (Layer 1): project map, tree-sitter parse, semantic graph, file skeletons, spec alignment | det | No. On failure plan falls back to older grounding and warns |
| 4 | Related-spec scoring picks which other specs reach the Architect, within a token budget | det | No |
| 5 | Architect produces tasks and a data model contract; in two phases if the audit estimated more than ten tasks | LLM | No |
| 6 | Coverage verifier checks tasks against the full specs and **adds tasks** for gaps | LLM | No |
| 7 | Decomposition gate: task size, cross-cluster coordination, bridge symbols, file ownership | det | Yes, on fail. **Auto-patches** bridge-symbol failures first |
| 8 | Task records and dependency graph written | det | |
| 9 | Results cached by spec hash for the next run | det | |

Steps 6 and 7 change the plan after the Architect has finished. The engineer reads a
plan that more than one actor wrote.

**Produces:** task records, the dependency graph and the decomposition result.

The room leaves with: the ability to read a task graph back to the spec that shaped it,
and to tell a planning problem from a spec problem.

### 06 Verify (105 to 115 min)

| Engineer decides | Engineer runs | SPEED surfaces | SPEED runs |
|---|---|---|---|
| Which verifier questions need an owner and which are mechanical | `speed verify` | Verifier findings, with human questions separated from mechanical fixes | Spec traceability (**det**). Plan Verifier (**LLM**). Repair loop that **edits task records**, up to three fix and re-verify cycles (**LLM**) |

Spec traceability (`spec_traceability.py`, called at `verify.sh:307`) matches every spec
requirement against the tasks' `spec_references` before the model runs. Uncovered
requirements go into the verifier's prompt. "Blind" means blind to the Architect's
reasoning, not blind to structure.

**Produces:** a verify report and a plan that has been checked against the specs by
something other than its author.

### 07 Handoff (115 to 120 min)

What goes to Execute: the verified plan, the tech files, and the open decisions with
their owners. What does not: any threshold, policy or reason text nobody has decided.

## Under the hood: what SPEED grounds itself on

Called out in the room, because each one changes what an engineer should believe about
the output:

| Sub-process | Where | What it gives the Architect or verifier |
|---|---|---|
| Codebase semantic graph | `lib/context/csg.py` | Symbols, references, domain clusters and blast radius. Should show `gateway.ts` as the point where F2.1 and F2.2 meet |
| File skeletons | `lib/context/skeletons.py` | Signatures without bodies, about 10:1. What the Architect actually sees of the existing code |
| Spec-codebase alignment | `lib/context/spec_alignment.py` | Every backticked claim in a spec marked confirmed, missing or divergent. Output in `spec-alignment.json` |
| Coverage verifier | `lib/cmd/plan.sh:167` | New tasks for spec requirements the Architect missed |
| Spec traceability | `lib/spec_traceability.py` | Requirement-to-task coverage before verify's model runs |

For a sidebar rather than the main thread: the project map, related-spec scoring, the
fallback to `spec_ground.py` when the index fails, and Guardian learnings carried over
from earlier runs (`lib/shared.sh:62`).

The fixture is TypeScript. SPEED parses TypeScript with tree-sitter, but builds TS import
links with a regex over `tsconfig` paths rather than a compiler
(`layer1_domain_clustering.py:316`). The semantic graph on this fixture needs checking
before the course relies on it.

## Task size: three checks, three units

| Where | Unit | Kind | Effect |
|---|---|---|---|
| Audit sizing (`agents/audit.md:109`) | Tasks, where a task is about one developer-day | LLM estimate | Warning only. Over ten tasks, plan phases the Architect (`plan.sh:768`) |
| Architect instructions (`agents/architect.md:82`) | 15 to 30 minutes of focused work | LLM following a prompt | Not enforced |
| Decomposition gate check 1 (`decomposition_gate.py:121`) | Lines in `files_touched`: warn above 3,000, fail at 6,000 | det | A fail stops `speed plan` (`plan.sh:1477`) |

Two things the room should see:

- The units disagree. The phase threshold applies to the audit's developer-day estimate,
  while the Architect writes tasks a fraction that size.
- The line-count check cannot fire on this fixture. The largest file is 210 lines and
  `src/` is about 670. The course teaches this as a limit rather than tuning it away: the
  gate passes every task, and the room works out why a task that touches only
  `gateway.ts` can still be too big. A green deterministic check is only as good as what
  it measures.

## Where SPEED acts without asking

| Moment | What it does | Where |
|---|---|---|
| Define commit | Ratifies on the author's behalf when nobody else is eligible | `ceremony_commitment.py:209` |
| Plan, coverage | Adds tasks the Architect did not write | `plan.sh:167` |
| Plan, decomposition | Patches dependencies for bridge-symbol failures and re-runs the gate | `plan.sh:1399` |
| Plan, any rerun | Reuses Guardian, audit and Architect results while specs are unchanged | `plan.sh:668` |
| Verify | Edits task records in up to three repair cycles | `verify.sh:415` |
| Plan, index failure | Falls back to cruder grounding with a warning, not a stop | `plan.sh:816` |
| Plan, gate unavailable | Skips the decomposition gate with a warning | `plan.sh:1490` |

## SPEED behaviour this course depends on

Several stages use SPEED behaviour that is being built alongside the course: an
architecture spec type, multi-file features, `audit --feature`, feature-level `plan`,
per-file Define tabs and role switching. See
[`course-301-1e-speed-requirements.md`](course-301-1e-speed-requirements.md) for each behaviour, what SPEED does
today, and the course moment that depends on it.

## Not yet decided

- **The activity in each stage.** This framework names what runs and what the room leaves
  with. How each stage is facilitated still needs to be designed.
- **Who drafts the tech spec.** Define's own spec builder keeps everything inside SPEED;
  Claude Code is closer to how engineers work day to day.
- **Plan as one command or step by step.** Running it once and reading the logs back is
  faster. Running it with `--skip-audit` and `--single-pass` shows what each step adds.
- **Learnings between cohorts.** Whether every cohort starts from a clean `.speed/`, or
  "the second run knows more than the first" is itself taught.
- **Time pressure on the draft.** Thirty minutes assumes the agent drafts and the engineer
  corrects.
- **What the role switch looks like.** Depends on how SPEED implements it (dependency 7).
- **Assessment.** Whether 301.1E ends with an individual transfer exercise like 301 does,
  and on what feature.
