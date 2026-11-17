# 301.3E Payments Change Validation

Engineers decide whether the agent-built adaptive authorisation change can be trusted,
using evidence rather than a passing build, and accept, repair or escalate it, with a
named person making each decision. 120 minutes, live, hands-on.

| Starts from | Hands on |
| --- | --- |
| The 301.2E candidate, with gaps added on top and its task records | A checked verdict per question, a filed defect, a bounded repair, an escalation to its owner |

## Still to make

This folder has its shape and a draft gap design, but no course yet. In order, each
waiting on the one before:

1. The snapshot: the 301.2E candidate plus one commit that adds the gaps it lacks.
2. The answer key: [`instructor/gap-design.md`](instructor/gap-design.md) fixed against
   the real candidate.
3. The lab action guide in `learner/`.
4. The speaker script and trainer brief in `instructor/`.
5. `overview.html` and `overview.pdf`, in the same shape as [301.1E's](../301.1E/overview.html).

## Set up

The snapshot does not exist yet. It is made from the 301.2E run: the candidate plus one
commit that adds the gaps it lacks.

```sh
course/make-snapshot.sh 301.3E <repo-after-301.2E-with-gaps>
```

Once it exists, with the SPEED build all three courses use (see
[SPEED version](../README.md#speed-version)):

```sh
git clone course/301.3E/snapshot/fixture.bundle payments-validation-fixture
cd payments-validation-fixture
npm test
```

## What the starting state holds

To be filled in when the snapshot is made. The answer key, which gaps the candidate has
and what settles each, lives in `instructor/` and stays out of the snapshot.

## For learners

`learner/` is empty. The lab action guide is written once the snapshot exists, in the
shape of the earlier refund-retry guide on the `round-0` branch, with its eight steps:
Inspect, Diagnose, Review, Eval, Human judgment, Define, Plan and Verify, Run and Inspect.

## For instructors

[`instructor/gap-design.md`](instructor/gap-design.md) is the draft design of the five
gaps learners meet, where each comes from in the F2 documents, and the decisions still
open. The speaker script, trainer brief and final answer key are written against the
snapshot.
