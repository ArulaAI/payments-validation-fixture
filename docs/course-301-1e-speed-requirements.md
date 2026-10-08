# SPEED requirements for 301.1E

For whoever is building the SPEED changes. 301.1E is being written against these behaviours
before they exist. Each row names the course moment that breaks if the behaviour lands
differently, so a change in plan here tells us exactly which part of the course to
revisit.

Verified against SPEED at `~/Documents/code/301` on 8 October 2026. "Today" describes that
checkout.

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
  tech/adaptive-auth/                         empty; learners write 1.md, 2.md, ...
```

## Required behaviour

| # | Behaviour | Today | Course moment that needs it |
|---|---|---|---|
| 1 | `specs/architecture/` is a recognised spec type with its own template | `speed audit` exits with "Unrecognized spec path" (`lib/cmd/audit.sh:60`) | Define: engineers read and comment on the architecture |
| 2 | Nested feature folders: `specs/<type>/<feature>/<n>.md`, several files per type | `audit` detects the type from the path prefix, so one nested file works. `plan` finds siblings by replacing `/tech/` in the path (`lib/cmd/plan.sh:566`), which assumes one file per type with matching names | Every stage |
| 3 | `speed audit --feature <name>` audits every spec in the feature and cross-checks tech against product, design **and architecture** | `audit` takes one file. Level 3 compares an RFC with the PRD it links and a design with its PRD; there is no architecture check (`agents/audit.md`, Level 3) | Audit |
| 4 | Feature-level sizing: the audit recommends splitting the tech spec into numbered files under `specs/tech/<feature>/` | Sizing is per spec, and the split recommendation names `{feature}-{part}.md` files | Audit: watching sizing shape the RFC split |
| 5 | `speed plan` loads the whole feature: every product, design, architecture and tech file | One tech file, plus at most one derived product and one derived design file | Plan |
| 6 | Define shows one tab per spec file, including architecture, and accepts section suggestions on each | Tabs are `prd`, `design`, `rfc` and `rfc-<slug>` (`dashboard/backend/resolvers/ceremony_claims.py:52`) | Define: engineers send inputs to the PM, designer and architect |
| 7 | One person can switch roles in Define (engineer, then PM, designer, architect) without restarting the dashboard | The actor comes from `SPEED_ACTOR`, then git `user.name`, and is cached for the life of the process (`ceremony_types.py:960`) | Define: engineers act as the owner and accept or dismiss suggestions |

## Behaviour the course relies on that exists today

These are not requests. They are listed so that a refactor does not remove them without
anyone noticing.

| Behaviour | Where | Course moment |
|---|---|---|
| `speed plan` runs the audit on every registered spec and stops on a gate failure | `lib/cmd/plan.sh:724` | Plan: audit as both a command and a gate |
| An audit estimate above 10 tasks makes the Architect plan in phases | `lib/cmd/plan.sh:768`, `ARCHITECT_PHASE_TASK_THRESHOLD` | Plan |
| The pre-plan Guardian reads `specs/product/overview.md` and can reject a plan | `lib/cmd/plan.sh:670` | Plan: the risk narrative against the anti-goals |
| Guardian and audit results are cached by spec hash | `lib/cmd/plan.sh:668` | Plan: re-running after an edit |
| Section suggestions are accepted or dismissed by the owner, and dismissal needs a reason | `SuggestionComposer.tsx`, `DismissReasonDialog.tsx` | Define |
| Commitment auto-ratifies when no eligible ratifier exists | `ceremony_commitment.py:209` | Define: what a ratification record does and does not certify |
| The decomposition gate checks shared symbols and overlapping file ownership | `lib/cmd/plan.sh:1391` | Plan: F2.1 and F2.2 both change `src/payments/gateway.ts` |
| The code index builds a project map, tree-sitter parse, semantic graph, file skeletons and spec alignment, and falls back to `spec_ground.py` with a warning if it fails | `lib/context/layer1.py`, `lib/cmd/plan.sh:816` | Plan: what the Architect actually sees |
| Spec alignment marks every backticked spec claim confirmed, missing or divergent | `lib/context/spec_alignment.py` | Plan: checking the tech spec's claims about `gateway.ts` and `rules.ts` |
| Related-spec scoring chooses which other specs reach the Architect within a token budget | `lib/context/related_specs.py` | Plan: whether the architecture and designs reach the Architect at all |
| The coverage verifier adds tasks for requirements the Architect missed | `lib/cmd/plan.sh:167` | Plan: a plan more than one actor wrote |
| The decomposition gate auto-patches bridge-symbol failures, stops plan on other failures, and is skipped with a warning when unavailable | `lib/cmd/plan.sh:1399`, `:1477`, `:1490` | Plan |
| Verify runs deterministic spec traceability before the Plan Verifier, then up to three repair cycles that edit task records | `lib/cmd/verify.sh:307`, `:415` | Verify |
| The Guardian is given learnings from earlier runs | `lib/shared.sh:62` | Plan: why a second cohort's run can differ from the first |
| The Define codebase dimension checks backticked references against the semantic graph and git | `dashboard/backend/ceremony_validator.py:486` | Define |

## Open questions for the SPEED work

1. Does `audit --feature` produce one report per file, one for the feature, or both? The
   course shows learners the cross-document findings, so it needs to tell them which file
   a finding belongs to.
2. When the audit recommends a split, does it write the new tech files or only name them?
   The course assumes it names them and the engineer, with their agent, writes them.
3. Is the architecture template a SPEED template or a per-project one? The fixture's
   architecture docs follow no template today.
4. Task size is measured in three different units. The audit estimates tasks as about
   one developer-day (`agents/audit.md:109`) and the ten-task phase threshold applies to
   that estimate (`lib/cmd/plan.sh:768`). The Architect is told to write 15 to 30 minute
   tasks (`agents/architect.md:82`). The decomposition gate measures lines in
   `files_touched` (`lib/decomposition_gate.py:121`). Is the mismatch intended? The course
   currently teaches it as something to notice.
5. The decomposition gate's size check sums file lengths, so it cannot fire on a small
   repository however much work a task holds. 301.1E teaches that as a limit. If SPEED
   changes how task size is measured, the Plan stage changes with it.
6. TypeScript import links come from a regex over `tsconfig` paths
   (`lib/context/layer1_domain_clustering.py:316`). The fixture is TypeScript. If the
   semantic graph misses the gateway's imports, the decomposition gate's cluster and
   bridge-symbol checks lose their best example in the course.
