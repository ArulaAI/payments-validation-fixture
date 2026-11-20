# 301.1E trainer brief

Handoff date: 12 October 2026. Repository: `ArulaAI/payments-validation-fixture`, branch
`course/301e`.

Teach **Define, Audit, Plan** in 120 minutes. Engineers take F2 adaptive authorization from
its upstream documents and code to reviewed technical specs and a verified plan. Nothing is
built.

The feature is **all of F2 adaptive authorization**: F2.1 genuine travelers and F2.2
cross-merchant card testing, including their shared gateway and bank-confirmation contracts.
Define is the main teaching block: engineers turn supplied PRDs, design and architecture into
reviewed technical specifications.

## Pickup order

| Resource | Use |
| --- | --- |
| [Framework](framework.md) | The loop, the stages, the agents and what SPEED grounds itself on |
| [Speaker script](speaker-script.md) | Presenter wording, commands, prompts and checkpoints |
| [Lab guide](../learner/lab-action-guide.md) | The learners' commands and checklists |
| [Facilitator gap map](facilitator-gap-map.md) | The answer key: every gap in the upstream documents and its owner |
| [Facilitator guide](facilitator-guide.md) | Stage keys, interventions, grading and the recovery walkthrough for one held payment |
| [Assessment](assessment.md) | Individual packets and rubric |
| [Rehearsal](rehearsal.md) | What the recorded run did and what is still unchecked |
| [SPEED reference](../learner/speed-reference.md) | The commands, and which course requirements the pinned SPEED build meets |
| [Input manifest](../../../.agents/skills/author-tech-spec/references/input-manifest.md) | Required learner inputs, existing RFC drafts and template discovery |
| [Authoring workflow](../../../.agents/skills/author-tech-spec/references/authoring-workflow.md) | Interview, decisions, reviewed edits, coverage and resume behavior |
| [Specification index](../../../specs/README.md) | Product, design, architecture, implementation boundaries and both tech drafts |
| [Overview PDF](../overview.pdf) | One page per section |

The framework and facilitator gap map are background material. Verify their claims
against current sources; the RFC folder already contains drafts. Keep facilitator answer
keys out of the authoring inputs.

## What learners start from

The snapshot, [`../snapshot/fixture.bundle`](../snapshot/fixture.bundle), holds the seven
upstream documents, the code and its 93 tests, the two draft tech specs and the authoring
skill. See the [course README](../README.md). The held-payment checkout finding is one
Validate example.

## Before class

1. Open the repository root with the IDE on the left and the native harness TUI on the
   right, approximately 50/50. Follow the script's preparation and evidence steps.
2. Start `codex` or `claude` in a repository-root shell. Inside that harness, invoke
   `$author-tech-spec adaptive-auth` or `/author-tech-spec adaptive-auth`, respectively.
   Both load shared references; no hooks are required.
3. Existing local sessions save `session.md`, `questions.md`, `decisions.md` and
   `coverage.md` under `.speed/authoring/adaptive-auth/`. Add `resume` to the invocation to
   continue. These ignored records and historical reports do **not** come with a fresh
   clone; a fresh invocation creates its own authoring records.
4. The observed local session paused at the initial understanding check, before an accepted
   RFC edit. Inspect its evidence, correct or confirm scope, then ask the first unresolved
   engineering question. The script provides the response prompt. Upstream specs changed
   during branch reconciliation; recheck recorded digests and reconsider affected questions
   before accepting the saved diagnosis.
5. Check that the trainer's `speed` is the pinned build. It plans the whole feature with
   `speed plan --feature adaptive-auth`, and Verify checks the plan against the same
   documents. Audit still takes one spec file per run.

## Timing

The slots are Orient 6, Validate 12, Define and Draft 33, Audit 13, Plan 15, Verify 10,
Handoff 10 and Close 5 minutes, with introductions and transitions inside the 120. Plan
takes about 11 minutes by the lab guide's estimate; its longest run in the recorded run took
about 8. Let it finish.

The script, skills and static document checks are complete. The recorded run is in
[rehearsal.md](rehearsal.md); it used Codex as SPEED's provider. The complete interview,
accepted RFC edits, resume and the end-to-end flow still need a rehearsal with Claude Code.
Rehearse one sourced decision through a reviewed RFC diff, saved pause and resume, then Audit,
Plan and Verify. Preserve outputs and owner blockers.

The assessment packet is handed out at the close and completed after class.

## Boundaries

Stop at the reviewed plan or an explicit blocked handoff; task execution belongs to the next
course. Product, Design, Risk and Legal decisions remain with their owners. Keep any F2.2
requirement Verify reports as partial or missing in the handoff.
