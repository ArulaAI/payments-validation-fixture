# 301-1E trainer pickup brief

Handoff date: 12 October 2026. Repository: `ArulaAI/payments-validation-fixture`.
Branch: `feat/301-define-audit-plan-config`.

Start with the [speaker script](course-301-1e-speaker-script.md). It contains the
command map and the full walkthrough: Orient, Validate, Define and Draft, Audit,
Plan, Verify and Handoff. Define is the main teaching block: engineers turn supplied
PRDs, design and architecture into reviewed technical specifications.

The feature is **all of F2 adaptive authorisation**: F2.1 genuine travellers and
F2.2 cross-merchant card testing, including their shared gateway and bank-confirmation
contracts. The held-payment checkout finding is one Validate example.

## Where to look

| Resource | Use |
|---|---|
| [Speaker script](course-301-1e-speaker-script.md) | Presenter wording, commands, prompts, checkpoints and recovery |
| [Input manifest](../.agents/skills/author-tech-spec/references/input-manifest.md) | Required learner inputs, existing RFC drafts and template discovery |
| [Authoring workflow](../.agents/skills/author-tech-spec/references/authoring-workflow.md) | Interview, decisions, reviewed edits, coverage and resume behavior |
| [Specification index](../specs/README.md) | Product, design, architecture, implementation boundaries and both tech drafts |
| [SPEED requirements](course-301-1e-speed-requirements.md) | Planned tooling changes; compare its older snapshot with the script's checked commands |

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

Rehearse one sourced decision through a reviewed RFC diff, saved pause and resume,
then Audit, Plan and Verify. Preserve outputs and owner blockers. Product, Design,
Risk and Legal decisions remain with their owners.

The script's checked SPEED installation starts Plan from one primary RFC; related
context does not establish whole-feature coverage. Verify checks that saved primary
scope. Planned feature-wide commands are labelled in the script. Check the trainer's
installed version and keep any unplanned or unverified F2.2 scope in the handoff.
Stop at the reviewed plan or an explicit blocked handoff; task execution belongs to
the next course.
