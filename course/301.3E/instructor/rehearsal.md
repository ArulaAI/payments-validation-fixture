# 301.3E rehearsal record

Pinned SPEED source: `a8bde62` (see [SPEED version](../../README.md#speed-version)).

## How the candidate was made

The 301.3E snapshot continues the recorded 301.2E run (see the
[301.2E rehearsal](../../301.2E/instructor/rehearsal.md)) from its checkpoint.

1. The remaining review findings on tasks 1 to 8 were fixed, task by task, on each task's
   branch. Task 4's deadline question was settled with the F2.1 owner's answer: a status check
   after the deadline returns pending, and only the timer settles the challenge.
2. The task branches were merged into `main`. Three gateway timing tests were corrected to drive
   `performance.now()` from the mocked clock.
3. The review approvals, coherence report, integration report, post-integration Guardian report,
   spec traceability and completed feature state were written in SPEED's own formats. SPEED's
   Review, Coherence and Integrate did not produce them.
4. Gaps G1 to G4 were added as agent-style commits on their task branches and merged. G5 came
   from the run. See [gap-design.md](gap-design.md).
5. A course-setup commit configures `speed diagnose`, and a `baseline` branch marks the 301.2E
   start commit.
6. Logs use lab paths and a neutral learner identity, as in 301.2E.

## What has been run against the snapshot

| Check | Result |
| --- | --- |
| `npm test` on a fresh clone | 239 pass |
| `speed status --feature adaptive-auth` | 8 done, 2 blocked |
| `speed diagnose` on tasks 1, 2, 3 and 5 with `MAIN_BRANCH=baseline` | Signals on F1 to F4, F6 to F8; F5 always 0 |
| G2 mutant (`>=` to `>` at `src/risk/policy.ts:53`) | Survives all 239 tests |
| G3 partial capture | Status stays `authorised`; all 239 tests pass |

## Not yet run

- `speed review`, `speed eval`, `speed plan --defects`, `speed verify` and `speed run` on this
  snapshot. They call models. Their output, timing and behavior in this lab are unconfirmed.
- Any run with Claude Code as provider, and any cohort.

## Known issue

One timing-sensitive test ("a replica retries the winning expire audit…") fails now and then.
It passed in every run after the gap work, but has failed twice across many runs.
