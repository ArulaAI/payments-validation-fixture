# 301.3E Payments Change Validation

Engineers validate the adaptive authorisation change that agents built in 301.2E. It is
reviewed, integrated and green. They decide what is true about it, repair what is theirs to
repair, and escalate what belongs to its owners. 120 minutes, live, hands-on.

| Starts from | Ends with |
| --- | --- |
| The integrated 301.2E candidate: tasks 1 to 8 built, reviewed and merged, 239 tests passing | A disposition for every finding: confirmed defects repaired, claims refuted, one escalation with its owners |

## Set up

You need Node 22 or later, Python 3.11 or later, jq, Claude Code, and the SPEED build all
three courses use, commit `a8bde62` (see [SPEED version](../README.md#speed-version)).

```sh
git clone course/301.3E/snapshot/fixture.bundle payments-validation-fixture
cd payments-validation-fixture
for b in $(git branch -r | grep -v HEAD | sed 's#origin/##'); do git branch -q "$b" "origin/$b" 2>/dev/null; done
export MAIN_BRANCH=baseline
npm test                                   # 239 pass
speed status --feature adaptive-auth       # 8 done, 2 blocked
```

SPEED reads task branches locally, and a clone holds them only as `origin/...`, hence the
branch line. `baseline` is the commit 301.2E started from; every task is already merged into
`main`, so diagnose compares each task with `baseline`.

`course/make-snapshot.sh 301.3E <repo>` rebuilds the bundle.

## What the starting state holds

- The 301.2E start state, the run's history on `main` and on each task branch, and a
  `baseline` branch at the 301.2E start commit.
- `.speed/features/adaptive-auth/`: 10 tasks (1 to 8 done and approved, 9 and 10 blocked on
  production sign-offs), review records, the coherence report, the integration report, the
  post-integration Guardian report, spec traceability, and every task's log.
- `speed.toml` points diagnose at the F2.1 tech spec, and `.speed/classes.yaml` holds the F1
  to F8 rules.
- Gaps learners are meant to find. They read as the agents' own work. The answer key is
  [`instructor/gap-design.md`](instructor/gap-design.md) and never goes in a snapshot.

## For learners

Open [`learner/lab-action-guide.md`](learner/lab-action-guide.md). Each step says what is
happening, what to run and what to look for.

## For instructors

Read [`instructor/trainer-brief.md`](instructor/trainer-brief.md) first, then
[`instructor/speaker-script.md`](instructor/speaker-script.md) and
[`instructor/facilitator-guide.md`](instructor/facilitator-guide.md).
[`instructor/gap-design.md`](instructor/gap-design.md) is the answer key.
[`overview.pdf`](overview.pdf) is the one-page-per-section course overview.
