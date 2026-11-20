# 301.1E independent assessment

Each learner is scored on their own work in the lab, plus one short unfamiliar packet.

## Administration

Release one packet per learner at the close. Learners complete it after class (about 8
minutes), and grading happens after class too. Keep the keys in this file and out of learner
repositories and agent context. The packets are constructed teaching cases, not records from
a run.

## Practical submission

From the lab, each learner submits:

1. Their Validate verdict on one finding, with file and line citations.
2. One line per Define topic they worked: `decided: … | open: … → owner`.
3. One Audit finding with its disposition: `finding · evidence · owner · effect on Plan`.
4. Their reading of Verify: what was verified, for which scope, and one partial requirement.

## Packet A A confident finding

Validate reports: "The product spec says refunds are instant, but the tech spec batches
them hourly." The product spec says refunds "appear on the cardholder's statement within one
business day".

Write your verdict and the evidence.

**Key:** Refute in part. The documents do not disagree: hourly batching meets "within one
business day". The finding misquotes its source.

## Packet B A decision that is not yours

A draft tech spec sets the card-testing block length to 30 minutes "for safety". The product
spec leaves block length open for PM and Risk.

Write what you would put in the tech spec.

**Key:** Leave it open with an interim default, marked provisional, and name PM with Risk as
the owner. The engineer does not choose the number.

## Packet C A clean audit

Audit reports `PASS` on a tech spec whose acceptance criteria never mention the 40 ms
latency budget the architecture sets.

Write your disposition.

**Key:** A clean audit checks structure, completeness and consistency against the documents
it was given. Add the latency criterion as a correction, and note that Audit did not see it.

## Scoring rubric

| Dimension | Maximum |
| --- | ---: |
| Evidence cited from the sources, not taken from a tool | 25 |
| Decisions kept to engineering's scope | 25 |
| Owner questions routed with a default and a named owner | 20 |
| Correct reading of Audit and Verify scope | 15 |
| Packet answer | 15 |
| Total | 100 |

## Critical errors

Deciding an owner's policy in the tech spec, or editing another team's document, caps the
score at 50 until the learner corrects it.
