# 301-1E trainer pickup brief

Handoff date: 12 October 2026. Repository: `ArulaAI/payments-validation-fixture`.
Branch: `course/301e`. Learners start from
[`../snapshot/fixture.bundle`](../snapshot/fixture.bundle); see the [course README](../README.md).

Start with the [speaker script](speaker-script.md). It contains the
command map and the full walkthrough: Orient, Validate, Define and Draft, Audit,
Plan, Verify and Handoff. Define is the main teaching block: engineers turn supplied
PRDs, design and architecture into reviewed technical specifications.

The feature is **all of F2 adaptive authorisation**: F2.1 genuine travellers and
F2.2 cross-merchant card testing, including their shared gateway and bank-confirmation
contracts. The held-payment checkout finding is one Validate example.

## Where to look

| Resource | Use |
|---|---|
| [Speaker script](speaker-script.md) | Presenter wording, commands, prompts, checkpoints and recovery |
| [Recovery example](recovery-flow.md) | Follow one held payment through engineer checks, owner decisions, reviewed RFC changes and replanning |
| [Input manifest](../../../.agents/skills/author-tech-spec/references/input-manifest.md) | Required learner inputs, existing RFC drafts and template discovery |
| [Authoring workflow](../../../.agents/skills/author-tech-spec/references/authoring-workflow.md) | Interview, decisions, reviewed edits, coverage and resume behavior |
| [Specification index](../../../specs/README.md) | Product, design, architecture, implementation boundaries and both tech drafts |
| [SPEED requirements](speed-requirements.md) | Which course requirements the pinned SPEED build meets and which remain open |

The framework and facilitator gap map are background material. Verify their claims
against current sources; the RFC folder already contains drafts. Keep facilitator
answer keys out of the authoring inputs.

## Pick up the session

1. Open the repository root with the IDE on the left and the native harness TUI on
   the right, approximately 50/50. Follow the script's preparation and evidence steps.
2. Start `codex` or `claude` in a repository-root shell. Inside that harness, invoke
   `$author-tech-spec adaptive-auth` or `/author-tech-spec adaptive-auth`, respectively.
   Both load shared references; no hooks are required.
3. Existing local sessions save `session.md`, `questions.md`, `decisions.md` and
   `coverage.md` under `.speed/authoring/adaptive-auth/`. Add `resume` to the invocation
   to continue. These ignored records and historical reports do **not** come with a
   fresh clone; a fresh invocation creates its own authoring records.
4. The observed local session paused at the initial understanding check, before an
   accepted RFC edit. Inspect its evidence, correct or confirm scope, then ask the
   first unresolved engineering question. The script provides the response prompt.
   Upstream specs changed during branch reconciliation; recheck recorded digests and
   reconsider affected questions before accepting the saved diagnosis.

## What remains before delivery

The script, skills and static document checks are complete. Native skill discovery
and the initial understanding response were checked. The complete interview, accepted
RFC edits, resume and end-to-end course flow still need rehearsal in both harnesses.
Nothing has been rehearsed end to end against the pinned SPEED build, commit `a8bde62`;
the script's SPEED source lines were checked against it, not run.

Rehearse one sourced decision through a reviewed RFC diff, saved pause and resume,
then Audit, Plan and Verify. Preserve outputs and owner blockers. Product, Design,
Risk and Legal decisions remain with their owners.

The pinned build plans the whole feature with `speed plan --feature adaptive-auth`, and
Verify checks the plan against the same documents. Audit still takes one spec file per
run. Check that the trainer's `speed` is that build, and keep any F2.2 requirement Verify
reports as partial or missing in the handoff.
Stop at the reviewed plan or an explicit blocked handoff; task execution belongs to
the next course.
