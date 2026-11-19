# SPEED requirements for 301.1E

For whoever is building the SPEED changes. 301.1E was written against these behaviors
before they existed. Some now exist. Each row names the course moment that breaks if the
behavior lands differently, so a change in plan here tells us exactly which part of the
course to revisit.

Checked against the pinned SPEED build, commit `a8bde62` (see
[SPEED version](../../README.md#speed-version)). "Today" describes that commit. **Met**
means the commit does what the row asks; **Open** means it does not yet.

## Spec layout the course uses

```
specs/
  product/overview.md                         product vision (Guardian input)
  product/adaptive-auth/1-high-value-traveller.md
  product/adaptive-auth/2-card-testing.md
  architecture/overview.md                    platform architecture
  architecture/adaptive-auth.md               feature architecture
  design/adaptive-auth/1-checkout-challenge.md
  design/adaptive-auth/2-risk-review-queue.md
  tech/adaptive-auth/1-high-value-traveller.md  draft learners finish
  tech/adaptive-auth/2-card-testing.md          draft learners finish
```

## Required behavior

| # | Behavior | Today | Course moment that needs it |
|---|---|---|---|
| 1 | `specs/architecture/` is a recognized spec type with its own template | **Met.** `speed audit` maps `specs/architecture/` to `templates/architecture.md` (`lib/cmd/audit.sh:57`) and checks it at Levels 1 and 2 (`agents/audit.md:180`). Define has no architecture tab yet (row 6) | Define: engineers read and comment on the architecture |
| 2 | Nested feature folders: `specs/<type>/<feature>/<n>.md`, several files per type | **Met** for `speed plan --feature`, which finds every file under `specs/<type>/<feature>/` (`lib/features.sh:52`). `audit` detects the type from the path prefix, so one nested file works. A single-file `plan` still finds siblings by replacing `/tech/` in the path (`lib/cmd/plan.sh:1236`), then falls back to the spec's `> See` links (`:1249`) | Every stage |
| 3 | `speed audit --feature <name>` audits every spec in the feature and cross-checks tech against product, design **and architecture** | **Open.** `audit` takes one file (`lib/cmd/audit.sh:22`). Level 3 compares an RFC or a design with the PRD it links; architecture files get Levels 1 and 2 only (`agents/audit.md:60`, `:180`). `speed plan --feature` audits every feature file, one report per file, before it plans (`lib/cmd/plan.sh:1515`) | Audit |
| 4 | Feature-level sizing: the audit recommends splitting the tech spec into numbered files under `specs/tech/<feature>/` | **Open.** Sizing is per spec. A multi-RFC recommendation suggests child filenames with no fixed pattern (`agents/audit.md:166`), and the audit writes no files | Audit: watching sizing shape the RFC split |
| 5 | `speed plan` loads the whole feature: every product, design, architecture and tech file | **Met.** `speed plan --feature <name>` with no file loads every product, architecture, design and tech file of the feature, plus `specs/architecture/overview.md` as shared constraints (`lib/cmd/plan.sh:1102`, `:1342`). Verify checks the plan against the same list (`lib/cmd/verify.sh:324`) | Plan |
| 6 | Define shows one tab per spec file, including architecture, and accepts section suggestions on each | **Open.** Tabs are `prd`, `design`, `rfc` and `rfc-<slug>` (`dashboard/backend/resolvers/ceremony_claims.py:55`) | Define: engineers send inputs to the PM, designer and architect |
| 7 | One person can switch roles in Define (engineer, then PM, designer, architect) without restarting the dashboard | **Open.** The actor comes from `SPEED_ACTOR`, then git `user.name`, and is cached for the life of the process (`dashboard/backend/resolvers/ceremony_types.py:960`) | Define: engineers act as the owner and accept or dismiss suggestions |

## Behavior the course relies on that exists today

These are not requests. They are listed so that a refactor does not remove them without
anyone noticing.

| Behavior | Where | Course moment |
|---|---|---|
| `speed plan` runs the audit on every registered spec and stops on a gate failure | `lib/cmd/plan.sh:1503` | Plan: audit as both a command and a gate |
| An audit estimate above 10 tasks makes the Architect plan in phases, unless a task budget is set | `lib/cmd/plan.sh:1568`, `:1587`, `ARCHITECT_PHASE_TASK_THRESHOLD` | Plan |
| The pre-plan Guardian reads `specs/product/overview.md` and can reject a plan | `lib/cmd/plan.sh:1418` | Plan: the risk narrative against the anti-goals |
| Guardian, audit, Architect and coverage results are cached by a hash of their inputs | `lib/cmd/plan.sh:126`, `:172`, `:1416` | Plan: re-running after an edit |
| Section suggestions are accepted or dismissed by the owner, and dismissal needs a reason | `SuggestionComposer.tsx`, `DismissReasonDialog.tsx` | Define |
| Commitment auto-ratifies when no eligible ratifier exists | `dashboard/backend/resolvers/ceremony_commitment.py:209` | Define: what a ratification record does and does not certify |
| The decomposition gate checks shared symbols and overlapping file ownership | `lib/cmd/plan.sh:604`, `:2283` | Plan: F2.1 and F2.2 both change `src/payments/gateway.ts` |
| The code index builds a project map, tree-sitter parse, semantic graph, file skeletons and spec alignment, and falls back to `spec_ground.py` with a warning if it fails | `lib/context/layer1.py`, `lib/cmd/plan.sh:1634` | Plan: what the Architect actually sees |
| Spec alignment marks every backticked spec claim confirmed, missing or divergent | `lib/context/spec_alignment.py` | Plan: checking the tech spec's claims about `gateway.ts` and `rules.ts` |
| Related-spec scoring chooses which other specs reach the Architect within a token budget, when `--specs-dir` is given | `lib/context/related_specs.py`, `lib/cmd/plan.sh:1653` | Plan: whether the architecture and designs reach the Architect at all |
| The coverage verifier reports requirements the Architect missed, and the Architect adds tasks for critical ones after a prompt | `lib/cmd/plan.sh:346`, `:712` | Plan: a plan more than one actor wrote |
| The decomposition gate auto-patches bridge-symbol failures, stops plan on other failures, and is skipped with a warning when unavailable | `lib/cmd/plan.sh:466`, `:2287`, `:459` | Plan |
| Verify runs deterministic spec traceability before the Plan Verifier, then up to three repair cycles that edit task records and the contract | `lib/cmd/verify.sh:384`, `:482` | Verify |
| The Guardian is given learnings from earlier runs | `lib/shared.sh:110` | Plan: why a second cohort's run can differ from the first |
| The Architect and coverage verifier run with tools disabled; the Auditor, Guardian and Plan Verifier are read-only; only the verify fix agent can write | `lib/cmd/plan.sh:289`, `:363`, `providers/claude-code.sh:470`, `lib/cmd/verify.sh:562` | Agents section: what each agent can see and change |
| Agent prompts are readable markdown in `agents/`, and the verify fix prompt is inline | `agents/*.md`, `lib/cmd/verify.sh:499` | Engineers read each prompt at the stage where it runs |
| The Define codebase dimension checks backticked references against the semantic graph and git | `dashboard/backend/ceremony_validator.py:486` | Define |

## Open questions for the SPEED work

1. Does `audit --feature` produce one report per file, one for the feature, or both? The
   course shows learners the cross-document findings, so it needs to tell them which file
   a finding belongs to. Plan's own audit loop writes one report per file today.
2. When the audit recommends a split, does it write the new tech files or only name them?
   The course assumes it names them and the engineer, with their agent, writes them.
3. Is the architecture template a SPEED template or a per-project one? Answered at
   `a8bde62`: SPEED ships `templates/architecture.md`, and
   `specs/architecture/adaptive-auth.md` uses its H2 headings.
4. Task size is measured in three different units. The audit estimates tasks as about
   one developer-day (`agents/audit.md:109`) and the ten-task phase threshold applies to
   that estimate (`lib/cmd/plan.sh:1568`). The Architect is told to write 15 to 30 minute
   tasks (`agents/architect-skeleton.md:56`, `agents/architect.md:82`), unless a task
   budget overrides it (`lib/cmd/plan.sh:198`). The decomposition gate measures lines in
   `files_touched` (`lib/decomposition_gate.py:121`). Is the mismatch intended? The course
   currently teaches it as something to notice.
5. The decomposition gate's size check sums file lengths, so it cannot fire on a small
   repository however much work a task holds. 301.1E teaches that as a limit. If SPEED
   changes how task size is measured, the Plan stage changes with it.
6. TypeScript import links come from a regex over `tsconfig` paths
   (`lib/context/layer1_domain_clustering.py:316`). The fixture is TypeScript. If the
   semantic graph misses the gateway's imports, the decomposition gate's cluster and
   bridge-symbol checks lose their best example in the course.
