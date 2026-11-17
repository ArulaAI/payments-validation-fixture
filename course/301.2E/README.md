# 301.2E Execute, Integrate, Learn

Engineers delegate the reviewed 301.1E plan to agents, supervise the run, and prove which
work reached the candidate revision. 120 minutes, live, hands-on.

| Starts from | Hands on to 301.3E |
| --- | --- |
| The reviewed 301.1E work: spec changes, owner questions, task records, contract, verify log | A candidate revision with its diff, each check result, failed attempts kept, learning records |

## Set up

The snapshot does not exist yet. It is made by running 301.1E once in the fixture and
bundling the result, with SPEED state committed:

```sh
course/make-snapshot.sh 301.2E <repo-after-301.1E>
```

Once it exists, set up the same way as 301.1E, with the same SPEED build (see
[SPEED version](../README.md#speed-version)):

```sh
git clone course/301.2E/snapshot/fixture.bundle payments-validation-fixture
cd payments-validation-fixture
npm test
speed status             # shows the adaptive-auth tasks, all pending
```

## What the starting state holds

To be filled in when the snapshot is made: the reviewed spec commits, the owner questions
and which stay open, the task records and contract under `.speed/`, and the verify log.

## For learners

Open [`learner/learner-workbook.md`](learner/learner-workbook.md). The Learn and recovery
stages have their own guides in [`learner/`](learner/), and the record templates are in
[`learner/assets/templates/`](learner/assets/templates/).

## For instructors

Read [`instructor/trainer-brief.md`](instructor/trainer-brief.md) first, then
[`instructor/speaker-script.md`](instructor/speaker-script.md) and
[`instructor/facilitator-guide.md`](instructor/facilitator-guide.md). The transfer packets
are in [`instructor/assessment.md`](instructor/assessment.md); release one per engineer.
The sample output in this material comes from an earlier project and is replaced once the
snapshot exists. [`overview.pdf`](overview.pdf) is the one-page-per-section course
overview.
