# 301.1E Define, Audit, Plan

Engineers take adaptive authorisation (F2) from its upstream documents and code to reviewed
technical specs and a verified plan. Nothing is built. 120 minutes, live, hands-on.

| Starts from | Hands on to 301.2E |
| --- | --- |
| Seven upstream documents, the code and its 93 tests, two technical drafts | Reviewed changes to both technical specs, owner questions, a plan checked by `speed verify` |

## Set up

You need Node 22 or later, Claude Code, and the SPEED build all three courses use,
commit `a8bde62` (see [SPEED version](../README.md#speed-version)).

```sh
git clone course/301.1E/snapshot/fixture.bundle payments-validation-fixture
cd payments-validation-fixture
npm test                 # 93 pass
command -v speed         # the build above, not another install
```

`course/make-snapshot.sh 301.1E` rebuilds the bundle from this branch.

## What the starting state holds

- `specs/product/`, `specs/design/`, `specs/architecture/`: the seven upstream documents.
  They belong to their authors. A gap in them becomes an owner question, not an edit.
- `specs/tech/adaptive-auth/`: the two technical drafts engineers finish.
- `src/`, `test/`: the gateway as it runs today. GW-02 and GW-05 lock in the behaviour the
  feature changes.
- `.claude/skills/author-tech-spec/`: the authoring skill used in Define and Draft.
- No `.speed/` state. Every SPEED result in the session is produced live.

## For learners

Open [`learner/lab-action-guide.md`](learner/lab-action-guide.md). Each stage says what is
happening, what to run and what to look for.

## For instructors

Read [`instructor/trainer-brief.md`](instructor/trainer-brief.md) first, then
[`instructor/speaker-script.md`](instructor/speaker-script.md).
[`instructor/facilitator-gap-map.md`](instructor/facilitator-gap-map.md) lists the gaps in
the upstream documents and who owns each. [`overview.pdf`](overview.pdf) is the
one-page-per-section course overview.
