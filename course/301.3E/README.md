# 301.3E Payments Change Validation

In 301.3E, engineers decide whether an AI-generated change can be trusted, using evidence
rather than a passing build, and repair it where needed, with a named person making each
decision.

## State of this folder

The course validates the candidate that 301.2E produces: the adaptive authorisation
change, integrated by agents, with problems planted on top of it and recorded in a round
manifest under `corpus/`. That candidate does not exist in git yet, so this folder holds
no session material.

An earlier version of this course, Lab 3, was written for a 175-minute pod format on a
different change, a refund retry that lives on the `round-0` branch. Its eight stages
(Inspect, Diagnose, Review, Eval, Human judgment, Define, Plan and Verify, Run and
Inspect) and its five questions carry over. Its case, commands and answer keys do not,
and they are not copied here.

## What arrives here, in order

1. The 301.2E candidate, tagged `301.2E-start` plus its run, is committed.
2. One commit plants the problems: an unrequested sensitive edit, a weak test, a real
   defect, a self-approving summary and one question no check can settle. Its manifest
   follows the shape `npm run verify` enforces: exactly one reserved defect and at least
   one evidence pathology.
3. That commit is tagged `301.3E-start`.
4. The lab action guide, speaker script and trainer brief are written against it, in the
   same shape as [`../301.1E/`](../301.1E/).
5. The overview PDF is corrected to the adaptive-auth case and to the SPEED commands the
   installed tool actually provides.
