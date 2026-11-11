# 301.1 Define and Execute Course Framework

Draft framework for engineers learning to turn supplied product intent into a grounded technical specification, a bounded implementation plan, and a reviewable implementation using SPEED.

The course follows the first four stages of the AI SDLC Loop: Specify, Design, Plan, and Build. In our vocabulary, Specify and Design sit within **Define**. Planning prepares the work for **Execute**, which corresponds to Build.

**Define (Specify + Design) → Plan → Execute (Build) → handoff to 301.2**

This document records the agreed course boundaries, proposes the teaching structure, and distinguishes verified SPEED behavior from proposed course policy. It is a framework rather than a lesson script.

## Course purpose and boundaries

The central engineering question is: **Have we defined the work clearly enough to commission it, and can we control its execution?**

Learners should understand both the workflow and its internals: how specifications become task records, how those records shape agent context and scheduling, what the gates actually check, and when a person must intervene.

Product intent and approval to undertake the work are supplied inputs. The course concentrates on technical specification and execution. Business questions discovered during specification return to the appropriate decision owner.

The endpoint is a reviewable implementation with traceable specifications, task records, check results, warnings, and unresolved concerns. Approval to ship belongs in **301.2 Verify and Judge**. Tests, grounding gates, and plan verification remain in 301.1 because they control the production of that implementation.

Both courses are intended as sibling 301-level courses. Each can start with prepared artifacts; neither requires completion of the other.

## Lifecycle mapping

| AI SDLC Loop stage | Our course stage | Main engineering responsibility | Artifact carried forward |
| --- | --- | --- | --- |
| Specify | Define | Establish behavior, scope, constraints, and unresolved decisions against repository reality. | Bounded brief and named behavior scenarios. |
| Design | Define | Choose and explain an implementable technical approach. | Technical RFC and scenario catalog. |
| Plan | Plan | Decompose the RFC into bounded, coordinated work with explicit checks. | Task records, dependency graph, contract where produced, and plan verification report. |
| Build | Execute | Implement with scoped context and controlled scheduling; respond to failures. | Implementation branches and execution records ready for independent review. |

The Loop's architectural `design.md` maps primarily to SPEED's technical RFC. SPEED's `specs/design/` directory is for UI/UX specifications. These uses of “design” must be distinguished. The Define validator likewise expects UI concepts such as layout and component inventory for that spec type. See [spec conventions, lines 75–79](/Users/sanjay/Documents/code/301/docs/writing-specs.md:75) and [Define spec headings, lines 48–54](/Users/sanjay/Documents/code/301/dashboard/backend/ceremony_validator.py:48).

## Define through Specify

Begin with the supplied intent and investigate the existing implementation before committing to a solution. Establish domain language, authoritative sources, existing interfaces, affected behavior, constraints, and explicit exclusions. Keep unanswered decisions visible.

Named scenarios describe observable behavior. They exist before task IDs and must remain useful when implementation boundaries change. Technical detail belongs alongside them in the RFC rather than replacing the behavior they describe.

SPEED's new-spec authoring route is `/define/new`. Its Define validation pipeline has six dimensions: template, structure, cross-spec consistency, codebase alignment, sizing, and vision. These checks have different methods and limits; passing them does not establish that the requirements are correct. See [new-spec entry, lines 14–17](/Users/sanjay/Documents/code/301/dashboard/frontend/app/define/new/page.tsx:14) and [validation pipeline, lines 1–4](/Users/sanjay/Documents/code/301/dashboard/backend/ceremony_validator.py:1).

The proposed exit condition is a bounded understanding of the work: observable behavior and exclusions are explicit, and decisions that affect business rules or risk have an identified owner.

## Define through Design

Develop a technical RFC that explains how the behavior will be implemented. Cover interfaces, data and state, validation and errors, dependencies, security, alternatives, migration where relevant, and observable acceptance criteria. Explain why the chosen boundaries and trade-offs are appropriate.

The RFC must connect to code that exists. Distinguish what can be reused, what must change, and what must be created. A precise document can still be wrong about repository reality.

SPEED's [RFC template](/Users/sanjay/Documents/code/301/templates/rfc.md:60) establishes Data Model at line 60, State Machine at line 66, API Surface at line 72, Validation Rules at line 79, and Testing at line 86. The template is an authoring aid; individual sections and comments should not be treated as guarantees of runtime enforcement.

Keep the scenario catalog as an input to planning. In spec mode, SPEED can load `specs/tests/<tech-spec filename>` or a recorded test-spec path. See [scenario loading, lines 644–655](/Users/sanjay/Documents/code/301/lib/cmd/plan.sh:644).

The proposed exit condition is an RFC whose technical decisions are explicit and whose acceptance criteria can be connected to meaningful checks. Unresolved business or architectural decisions must not disappear into agent assumptions.

Teach the Define ceremony's commitment and ratification records as a separate control from draft validation. Commitment requires an authorized claimant and rejects failing dimensions when validation state exists. If no eligible ratifier exists, SPEED can ratify automatically. A ratification record therefore does not universally establish independent human approval. See [commitment gate, lines 198–233](/Users/sanjay/Documents/code/301/dashboard/backend/resolvers/ceremony_commitment.py:198) and [automatic ratification, lines 308–321](/Users/sanjay/Documents/code/301/dashboard/backend/resolvers/ceremony_commitment.py:308).

## Plan the work

Establish a **task record** before introducing task-specific commands. It describes a bounded piece of implementation work: its acceptance criteria, declared files, dependencies, specification references, rationale, and assumptions. A dependency graph orders tasks according to the outputs they need.

Teach the connected planning path:

1. Check alignment with the supplied product vision through the pre-plan Guardian. Rejection normally blocks planning; flagged or unparseable results can continue with warnings. The check can be overridden and is skipped when the product overview is absent.
2. Audit the specifications for readiness and size. In normal spec planning, an audit gate failure stops planning. Audit estimates above ten tasks trigger phased Architect planning; this is a planning threshold, not a universal maximum feature size.
3. Ground the Architect's context in a repository index, code symbols, and specification alignment. Explain the fallback when indexing fails.
4. Generate task records and inspect their boundaries, assumptions, ownership, and dependencies.
5. Check decomposition for size, coordination across code clusters, shared symbols, and overlapping file ownership.
6. Run `speed verify` to independently check whether the plan delivers the specification. Its repair loop may edit task records; questions requiring human judgment are separated from mechanical fixes.

Guardian sources: [pre-plan handling, lines 670–701](/Users/sanjay/Documents/code/301/lib/cmd/plan.sh:670) and [missing overview, lines 50–53](/Users/sanjay/Documents/code/301/lib/shared.sh:50).

Verified sources: [audit and phase selection, lines 724–775](/Users/sanjay/Documents/code/301/lib/cmd/plan.sh:724), [repository indexing and fallback, lines 788–819](/Users/sanjay/Documents/code/301/lib/cmd/plan.sh:788), [task fields, lines 23–45](/Users/sanjay/Documents/code/301/agents/architect.md:23), [decomposition gate, lines 1382–1397](/Users/sanjay/Documents/code/301/lib/cmd/plan.sh:1382), and [verification and repair, lines 354–380](/Users/sanjay/Documents/code/301/lib/cmd/verify.sh:354).

### Milestones and tasks

The Loop treats a milestone as a reviewable PR. SPEED instructs its Architect to target 15–30 minutes of focused implementation per task and requires dependencies where declared files overlap. A completed task is not necessarily an independently shippable increment. See [Architect constraints, lines 80–87](/Users/sanjay/Documents/code/301/agents/architect.md:80).

The proposed course hierarchy is **feature → reviewable milestone → SPEED tasks**. Milestones describe the increments people review; tasks describe the units SPEED schedules. The course should explain how a set of tasks contributes to a milestone without suggesting SPEED automatically creates one PR per milestone.

Distinguish estimated effort from enforced size heuristics. The decomposition gate sums the lengths of declared files in the project map; it does not measure changed lines or elapsed work. Defaults warn above 3,000 lines and fail at 6,000 or more. Unindexed files contribute zero, so this check cannot establish the size of new implementation work. See [thresholds, lines 32–33](/Users/sanjay/Documents/code/301/lib/decomposition_gate.py:32) and [size calculation, lines 121–159](/Users/sanjay/Documents/code/301/lib/decomposition_gate.py:121).

## Execute the plan

Explain how ready tasks become agent work: dependency scheduling, file-conflict controls, worktree creation, context assembly, completion checks, and recovery. Context contains selected code, task relationships, relevant specification material, and a token budget. See [task context artifacts, lines 83–110](/Users/sanjay/Documents/code/301/lib/context/layer2.py:83).

Distinguish **planning grounding**, which connects the specification to the repository, from **completion grounding**, which checks the agent's result against its recorded assignment.

SPEED's completion grounding runs nine checks:

| Check | What learners should understand |
| --- | --- |
| Non-empty diff | Work must produce changes, with an exception for changes already absorbed into the integration branch. |
| Declared files | Expected files must exist under the check's rules. |
| Scope and ownership | Changes are compared with declarations and other tasks' ownership; some undeclared changes produce warnings. |
| Python imports | Unresolved imports produce warnings. |
| Blocked status | An agent reporting blocked must not count as completed. |
| Test-file coverage | Test-file presence is checked; this is not semantic test coverage. Sibling-task coverage can produce a warning. |
| Gate invocation evidence | Agent-output evidence is informational and cannot reliably establish that checks ran. |
| Acceptance criteria | Criteria are checked according to their verification method; manual or unverifiable results can produce warnings. |
| Secrets | Detected secrets block completion under the scanner's patterns and exclusions. |

See [grounding checks, lines 11–205](/Users/sanjay/Documents/code/301/lib/grounding.sh:11). Grounding precedes quality gates; a grounding failure stops that completion path. Configuration can skip both through `SKIP_GATES`. See [gate sequencing, lines 20–43](/Users/sanjay/Documents/code/301/lib/gates.sh:20).

Teach recovery as part of execution: inspect the failure, distinguish a context or decomposition problem from an implementation problem, and choose a justified next step. SPEED includes timeout escalation, retry limits, failure classification, debugger assistance, and Supervisor intervention. Its retry controls are not identical to the Loop's “three attempts without a new hypothesis” policy. See [timeout handling, lines 509–521](/Users/sanjay/Documents/code/301/lib/cmd/run.sh:509) and [completion and recovery, lines 554–616](/Users/sanjay/Documents/code/301/lib/cmd/run.sh:554).

## Policy and enforcement

The AI SDLC Loop states conditions for advancing work and identifies human decision owners. This is stricter policy in several places; the document alone does not demonstrate stronger software enforcement. Distinguish an instruction to an agent, an automated blocking check, a warning, and a recorded human decision.

| Loop requirement | Verified SPEED behavior | Proposed course policy |
| --- | --- | --- |
| Green baseline before Build | Run creates a committed baseline; this step does not establish passing tests. | Run and record baseline checks before execution. Resolve failures or explicitly agree how they will be handled. |
| Runnable checks mapped to scenarios | Test criteria can pass on file existence when no runner is supplied. | Define executable checks and inspect their actual results; file presence alone does not satisfy a behavior claim. |
| Green tests at the required scope | Execution can accept a task-scoped fallback after full-suite failure. | Preserve the full-suite failure and the narrower result as separate evidence. |
| Security verification | Execution's SAST/SCA gates are warning-only; detected secrets separately block grounding. | Identify which findings require intervention and who owns that decision. |
| Human resolution of unconfirmed decisions | The Architect is instructed to resolve ambiguity and record assumptions. | Inspect assumptions before execution and return business or risk choices to their owners. |

Verified sources: [baseline creation, lines 324–330](/Users/sanjay/Documents/code/301/lib/cmd/run.sh:324), [test-file existence fallback, lines 369–373](/Users/sanjay/Documents/code/301/lib/criteria_verify.py:369), [quality gates, lines 64–108](/Users/sanjay/Documents/code/301/lib/gates.sh:64), and [Architect ambiguity handling, line 3](/Users/sanjay/Documents/code/301/agents/architect.md:3).

The Loop also requires test-first development and knowledge updates alongside code. These are useful proposed course practices. The grounding checks listed above do not establish that a test failed before the fix or that durable knowledge was updated.

For every control, explain what is required, what SPEED checks, what evidence that produces, and who decides whether work advances. A proposed course rule becomes enforced only when a person or a concrete workflow mechanism checks it.

## Mapping the document requirements

The tables below trace the operational requirements in Specify, Design, Plan, and Build, plus the testing strategy that supports those stages, from the [AI SDLC Loop document](</Users/sanjay/Downloads/AI SDLC Loop.docx>). They do not assess the document's research claims. Review and Deliver remain outside 301.1, apart from explaining the handoff.

The course coverage column records proposed coverage. “Human rule” means a person or an additional workflow must enforce the requirement. “Not established” means the inspected SPEED paths do not demonstrate that requirement; it is not a claim about every SPEED capability. Evidence keys refer to exact source locations below.

### Specify requirements within Define

| Document requirement | SPEED support | Enforcement limits | 301.1 coverage |
| --- | --- | --- | --- |
| Start with approved intent, a Definition of Done, authoritative sources, and solution boundaries. | Planning accepts supplied specifications; Define checks their structure and consistency. E1, E4. | Semantic adequacy and permission to undertake the work remain human rules. | Establish the input brief and its authoritative sources before technical authoring. |
| Investigate existing code before clarifying the requirement; explain findings and cite affected paths. | Planning builds repository context and alignment; Define has a codebase validation dimension. E1, E4. | A repository index does not establish that investigation was complete or that a person confirmed it. | Explain repository grounding and record the existing interfaces, behavior, and constraints. |
| Use specialist investigation summaries and retain findings as knowledge files. | Layer 2 separates code, task, and spec context; execution preserves reported decisions and concerns. E8, E9. | These mechanisms do not establish the document's API/domain/persistence investigation delegation or durable knowledge-file workflow. | Explain the need for concise, durable investigation findings; the investigation method remains to be agreed. |
| Preserve the original feature description beside the agent's interpretation. | Spec artifacts can carry both; task records carry rationale and assumptions. E5. | Automated comparison of original intent with the interpretation is not established by these paths. | Preserve both and make interpretation changes explicit. |
| State scope and exclusions; let people commit scope decisions. | Define has structural checks; developer instructions and grounding constrain execution scope. E1, E11, E12. | File scope is different from approved product scope. | Distinguish behavior scope from file ownership and record the scope decision. |
| Give each acceptance criterion one named behavior scenario, using Given/When/Then semantics; keep the Definition of Done separate. | Define checks structural conventions; planning loads a scenario catalog and instructs the Architect to keep scenario IDs stable. E1, E4. | Structure checks do not establish exact one-to-one mapping or correctness of the behavior. | Maintain the criterion-to-scenario mapping and distinguish scenario behavior from completion requirements. |
| Mark unconfirmed items as draft and resolve business, scheme, or compliance questions with the right owner. | RFCs have unresolved questions; Architect tasks record assumptions; developers are instructed to report uncertainty. E2, E5, E12. | The Architect may decide an ambiguity. The inspected paths do not establish automatic routing based on an `@draft` tag. | Keep unresolved questions visible and prevent an assumption from silently becoming an approved requirement. |
| Clarify actors, errors, exclusions, and modernisation equivalence through questions and corrections. | Define provides authoring and validation; it does not establish the prescribed interview sequence. E1. | Interview quality and confirmation are human rules. | Cover what must be clarified; classroom interaction design remains undecided. |

### Design requirements within Define

| Document requirement | SPEED support | Enforcement limits | 301.1 coverage |
| --- | --- | --- | --- |
| Describe the change from existing architecture, naming affected services, interfaces, and data stores. | The RFC provides data, API, file-impact, and dependency sections; planning supplies repository alignment. E2, E4. | A populated section does not prove all affected systems were identified. | Describe the technical delta and trace the path from entry to persistence. |
| Describe contracts, domain changes, state, validation, and error behavior. | The RFC supplies technical sections; task criteria and generated contracts carry selected obligations forward. E2, E5. | Planning can continue with a warning when no contract is produced; contract presence does not establish semantic correctness. E4. | Specify exact interfaces and behavior, and inspect what survives decomposition. |
| Cover latency, storage, failover, observability, and other non-functional requirements. | RFC acceptance criteria can express measurable behavior; task criteria can carry those requirements. E2, E5. | An executable check or environment for each NFR is not automatically established. | Identify relevant NFRs and how each will be checked. |
| Assess compliance boundaries, certification, residency, and coupling; obtain required architect approval. | The RFC includes security, decisions, drawbacks, and unresolved questions. Define has commitment and ratification records. E2, E3. | These checks do not establish specialist sign-off. Automatic ratification is possible when no eligible ratifier exists. | Record affected constraints and approval owners; use supplied decisions rather than teaching compliance certification. |
| Compare approaches, explain trade-offs, and identify questions requiring a spike. | RFC sections cover alternatives, rationale, drawbacks, and unresolved questions. E2. | Section presence does not prove useful alternatives were explored or feasibility was demonstrated. | Explain the chosen approach and identify what must be investigated before commitment. |
| Commit and approve the design before planning; carry relevant decisions forward without loading the whole design during Build. | Define records commitment; task records carry rationale and references; spec context selects relevant sections. E3, E5, E9. | Relevant RFC sections can still enter Build context. This differs from the document's exclusion of its design artifact. | Explain the RFC's dual role as technical design and implementation context; distinguish recorded commitment from human approval. |

### Plan requirements

| Document requirement | SPEED support | Enforcement limits | 301.1 coverage |
| --- | --- | --- | --- |
| Begin from a clean, committed, green baseline. | Run creates a baseline commit before task worktrees are created. E8. | This captures repository state; it does not establish a green test baseline. | Record branch, revision, working-tree state, and baseline check results before execution. |
| Include every required repository and coordinate worktree branches across them. | Run creates a task worktree in the configured project. E8. | That path does not demonstrate coordinated worktrees with matching branches across multiple repositories. | Identify external repositories and authoritative contracts; implementation of a multi-repo fixture remains undecided. |
| Open a draft PR during planning so the work has a review home. | The inspected planning path produces task artifacts. E4. | Early draft-PR creation is not established by that path. | Treat draft-PR creation and ownership as an explicit team workflow requirement. |
| Produce small milestones, one PR each, with a shippable state at every commit. | The Architect targets bounded tasks; audit sizing and decomposition check plan size and coordination. E4, E5, E6. | Task size does not establish PR size or a shippable intermediate state. | Explain feature, milestone, task, and PR boundaries; check transition and migration sequencing. |
| Name each milestone's scenarios and specific completion checks. | Scenario IDs are supplied before planning; task records carry criteria and spec references; `speed verify` checks plan coverage. E4, E5, E7. | A plausible task mapping is not evidence that the implementation satisfies the scenario. | Trace scenarios through tasks to planned checks. |
| Commit a runnable verification mechanism covering build, mapped tests, analysis, security, and relevant coverage. | Quality gates run configured commands; acceptance criteria have verification methods. E5, E10. | Unconfigured checks can be absent; test criteria can pass on file existence; SAST/SCA are warning-only. E10, E11. | Name the required commands and their scope, and distinguish a configured runner from a promised check. |
| Identify independent work and genuine dependencies; avoid conflicting parallel changes. | Declared ownership and dependency checks constrain parallel work; runtime conflicts defer or block tasks. E5, E6, E8. | Safety depends on accurate declarations and the repository context available to the checks. | Explain why each dependency exists and what makes tasks safe to run concurrently. |
| Have a person approve the plan and set milestone context budgets. | `speed verify` independently checks the plan and can repair task JSON; context budgeting is configurable by stage. E7, E9. | Plan verification is separate from human approval. Stage budgets do not establish the document's 40–60k target per milestone. | Inspect the verifier report and task assumptions; record approval and justify context budgets without treating the target as universal. |

### Build requirements within Execute

| Document requirement | SPEED support | Enforcement limits | 301.1 coverage |
| --- | --- | --- | --- |
| Start each milestone with fresh context and only relevant scenarios, plan material, checks, and knowledge. | Run assembles context and spawns a developer per task; referenced spec sections are selected. E8, E9. | The execution unit is a task, not the document's milestone. Selection has heuristic and inline fallbacks. | Inspect what a task receives and explain how dependencies and decisions cross context boundaries. |
| Watch a meaningful test fail, implement the smallest fix, then refactor. | The general developer prompt requests incremental implementation and tests; completion gates check results. E10, E11, E12. | The new-feature path does not establish evidence of red-before-green. Defect reproduction instructions are a separate mode. | Preserve the failing test result and the passing result for the selected behavior. |
| Keep changes in scope and omit unrelated cleanup. | Developer instructions restrict scope; grounding checks declarations and other tasks' ownership. E11, E12. | Some undeclared files are warnings, and declared files can still contain unrelated behavior. | Explain mechanical scope checks and the additional semantic scope judgment. |
| Run targeted tests and commit code, tests, and knowledge together in small increments. | Developer instructions require commits and tests; Run preserves reported decisions and concerns. E8, E12. | Those records do not establish knowledge files were updated in the same commit. | Keep reusable constraints and decisions alongside the code; identify the actual check results and commit. |
| Explain why a correction is needed so the next attempt uses a better hypothesis. | Failure handling classifies problems and invokes debugging or supervision; developer output records decisions and concerns. E8, E12. | Automated recovery does not establish that a useful human explanation was captured or understood. | Record the cause, correction rationale, and next hypothesis. |
| Stop after three attempts on the same failure without a new hypothesis. | Run has retry limits, timeout escalation, and blocked-state handling. E8. | Retry counters are not a semantic check for repeated hypotheses or the same root cause. | Distinguish the circuit breaker from the document's human stop rule. |
| When the spec is wrong, distinguish changed behavior from a changed approach; update the plan and retain discovered constraints. | Developers can report blocked uncertainty; task records preserve decisions and concerns; plan verification can identify human issues. E7, E8, E12. | Automatic product re-approval and coordinated updates to the spec, plan, and knowledge are not established by these paths. | Return changed behavior to its decision owner; keep an approved behavior stable when changing the approach. |
| Split or narrow work when context approaches the stated 80k ceiling. | Context budgeting reports usage and applies prioritized cuts. E9. | The inspected budgeter does not establish that exceeding 80k automatically splits a milestone. | Use budget reports and missing context to reconsider task boundaries; explain that token limits depend on the configured workflow. |
| Keep an independent reviewer separate from the authoring context. | SPEED separately invokes a read-only reviewer. See [review.sh, lines 145–150](/Users/sanjay/Documents/code/301/lib/cmd/review.sh:145). | Reviewer independence and implementation judgment are taught in 301.2; Build gates remain execution controls. | Explain the handoff and why task completion still requires independent review. |

### Testing requirements supporting Plan and Execute

| Document requirement | SPEED support | Enforcement limits | 301.1 coverage |
| --- | --- | --- | --- |
| Unit tests for milestone business logic, with external dependencies mocked appropriately. | RFC testing sections and developer instructions request behavioral tests. E2, E12. | Test presence does not establish meaningful assertions or acceptable mocking. | Specify the behavior to prove and the dependencies to isolate. |
| Contract tests for interface changes against authoritative schemas. | RFC interfaces and task criteria can name schema and contract obligations. E2, E5. | SPEED's generated implementation contract is not itself an API contract-test suite. | Distinguish an artifact declaration from a runnable contract test. |
| Integration tests with real dependencies for storage and cross-service work. | The RFC explicitly supports integration test planning; configured gates can run the tests. E2, E10. | Test environments and realistic dependencies must be supplied. | Plan the integration checks the selected capability requires. |
| Negative and boundary tests for external input. | RFC validation and edge-case sections, plus developer instructions, prompt this work. E2, E12. | Prompts do not establish complete boundary coverage. | Identify invalid and extreme inputs before implementation and map them to checks. |
| Concurrency tests for shared state, idempotency, and ordering. | RFC edge cases include concurrent access; test commands can execute chosen scenarios. E2, E10. | Safe parallel agent execution does not establish runtime concurrency correctness. | Specify race and ordering behavior when applicable to the fixture. |

### Evidence for the mapping

These keys identify implementation evidence. Agent instructions and template comments describe requested behavior; they are not automatically blocking gates.

- **E1 Define validation:** [ceremony_validator.py, lines 1–4](/Users/sanjay/Documents/code/301/dashboard/backend/ceremony_validator.py:1) defines the dimensions; [lines 233–309](/Users/sanjay/Documents/code/301/dashboard/backend/ceremony_validator.py:233) checks structural conventions and scope headings.
- **E2 Technical RFC:** [rfc.md, lines 60–88](/Users/sanjay/Documents/code/301/templates/rfc.md:60) covers data, state, APIs, validation, and acceptance criteria; [lines 99–149](/Users/sanjay/Documents/code/301/templates/rfc.md:99) covers risks and testing; [lines 151–199](/Users/sanjay/Documents/code/301/templates/rfc.md:151) covers security, decisions, drawbacks, migration, file impact, dependencies, and unresolved questions.
- **E3 Commitment:** [ceremony_commitment.py, lines 198–233](/Users/sanjay/Documents/code/301/dashboard/backend/resolvers/ceremony_commitment.py:198) authorizes commitment and checks stored validation failures; [lines 308–321](/Users/sanjay/Documents/code/301/dashboard/backend/resolvers/ceremony_commitment.py:308) permits automatic ratification.
- **E4 Planning:** [plan.sh, lines 104–107](/Users/sanjay/Documents/code/301/lib/cmd/plan.sh:104) injects the scenario catalog; [lines 634–655](/Users/sanjay/Documents/code/301/lib/cmd/plan.sh:634) loads spec inputs; [lines 670–819](/Users/sanjay/Documents/code/301/lib/cmd/plan.sh:670) connects Guardian, audit, sizing, and repository context; [lines 1267–1272](/Users/sanjay/Documents/code/301/lib/cmd/plan.sh:1267) warns when a contract is absent.
- **E5 Task declarations:** [architect.md, lines 23–45](/Users/sanjay/Documents/code/301/agents/architect.md:23) defines criteria, references, rationale, and assumptions; [lines 80–87](/Users/sanjay/Documents/code/301/agents/architect.md:80) states size, ownership, ordering, and testability constraints.
- **E6 Decomposition:** [decomposition_gate.py, lines 121–159](/Users/sanjay/Documents/code/301/lib/decomposition_gate.py:121) calculates size; [lines 308–335](/Users/sanjay/Documents/code/301/lib/decomposition_gate.py:308) detects overlapping ownership without dependencies.
- **E7 Plan verification:** [verify.sh, lines 303–329](/Users/sanjay/Documents/code/301/lib/cmd/verify.sh:303) supplies traceability to an independent verifier; [lines 369–380](/Users/sanjay/Documents/code/301/lib/cmd/verify.sh:369) starts repair or escalates human issues; [lines 421–430](/Users/sanjay/Documents/code/301/lib/cmd/verify.sh:421) restricts mechanical fixes.
- **E8 Execution:** [run.sh, lines 324–330](/Users/sanjay/Documents/code/301/lib/cmd/run.sh:324) creates the baseline; [lines 509–616](/Users/sanjay/Documents/code/301/lib/cmd/run.sh:509) handles timeouts, blocked output, completion, decisions, concerns, and recovery; [lines 705–720](/Users/sanjay/Documents/code/301/lib/cmd/run.sh:705) handles file conflicts; [lines 920–973](/Users/sanjay/Documents/code/301/lib/cmd/run.sh:920) creates worktrees and context; [lines 1018–1027](/Users/sanjay/Documents/code/301/lib/cmd/run.sh:1018) spawns developer agents.
- **E9 Context selection:** [layer2.py, lines 83–110](/Users/sanjay/Documents/code/301/lib/context/layer2.py:83) creates code, task, spec, and budget artifacts; [spec_context.py, lines 40–56](/Users/sanjay/Documents/code/301/lib/context/spec_context.py:40) selects declared references or heuristic matches; [budget.py, lines 75–150](/Users/sanjay/Documents/code/301/lib/context/budget.py:75) applies configurable context budgets and reports cuts and usage.
- **E10 Quality checks:** [gates.sh, lines 64–108](/Users/sanjay/Documents/code/301/lib/gates.sh:64) runs configured checks and warning-only security scans; [lines 478–508](/Users/sanjay/Documents/code/301/lib/gates.sh:478) implements scoped-test fallback.
- **E11 Grounding:** [grounding.sh, lines 11–205](/Users/sanjay/Documents/code/301/lib/grounding.sh:11) checks recorded assignment against output; [criteria_verify.py, lines 369–373](/Users/sanjay/Documents/code/301/lib/criteria_verify.py:369) accepts test-file existence when no runner is supplied.
- **E12 Developer instructions:** [developer.md, lines 19–40](/Users/sanjay/Documents/code/301/agents/developer.md:19) requests incremental implementation, tests, commits, and scoped changes; [lines 43–64](/Users/sanjay/Documents/code/301/agents/developer.md:43) requests blocked output on uncertainty; [lines 69–86](/Users/sanjay/Documents/code/301/agents/developer.md:69) requests completion evidence, decisions, and concerns; [lines 118–139](/Users/sanjay/Documents/code/301/agents/developer.md:118) separately defines defect reproduction with a failing test.

## Handoff to 301.2

The handoff identifies the exact implementation revision or branches, approved source artifacts, task and scenario mappings, commands and check results, failures and warnings, assumptions, and unresolved concerns.

SPEED's task `done` status records acceptance by the execution gates under the active configuration. It does not establish independent review or approval to ship. Normal completion marks the task done after gates and preserves reported decisions and concerns. See [completion handling, lines 554–579](/Users/sanjay/Documents/code/301/lib/cmd/run.sh:554).

301.2 starts with that package and asks: **What does the evidence establish about this implementation, and what should happen next?** Findings may return work to Define, Plan, or Execute.

## Authoring basis and remaining decisions

The lifecycle mapping is based on the user-supplied `AI SDLC Loop.docx` in Downloads. SPEED implementation references were checked against `/Users/sanjay/Documents/code/301` at revision `1de583a` on 2026-10-01. The references describe inspected behavior; this framework does not claim an end-to-end new-spec execution was completed.

The proposed fixture uses the payments system for continuity with 301.2, with one new technical capability carried through the course. The exact capability, milestone boundaries, duration, source-code reading depth, and classroom interactions remain to be agreed. The existing Lab 3 opening and speaker script are outside this document's editing scope.
