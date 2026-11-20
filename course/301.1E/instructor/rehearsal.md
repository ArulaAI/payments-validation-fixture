# 301.1E rehearsal record

Pinned SPEED source: `a8bde62` (see [SPEED version](../../README.md#speed-version)).

## How the snapshot was made

`course/make-snapshot.sh 301.1E` squashes this branch's fixture into one commit, without
`course/` and without the README's course-only section. It holds the seven upstream
documents, the code and its 93 tests, the two draft tech specs, the authoring skill, and the
`speed diagnose` configuration used later in 301.3E.

## What has been run

One run of the whole course from the snapshot, on 18 November 2026. Its output became the
301.2E snapshot.

| Stage | Result |
| --- | --- |
| Orient | 93 tests pass |
| Validate | 7 critical findings and 16 warnings. The decline-reason finding was among them |
| Define and Draft | Topic 1 decided by the engineer; topics 2 to 8 took the recommended option. Both tech specs edited (about 130 lines); session records written |
| Audit, traveler spec | WARN, 14 warnings. Sizing suggested four child specs (about 18 tasks) |
| Audit, card-testing spec | FAIL on one L1 error: the placeholder `<card-testing reason>` in the Basic Example. Since fixed in the fixture |
| Plan | First stopped by its own audit gate on that placeholder. Two attempts then crashed in SPEED's provider layer (`plan.sh: line 210: arithmetic syntax error`, `jq: invalid JSON text`) after the provider exited 1; see Observed limits. Then the coverage check found 5 critical gaps, all UI or production-store work in other repositories, and asked whether to add tasks; the answer was no. 8 tasks |
| Verify | 8 of 14 requirements covered on the first pass. After three repair passes, 2 critical issues remained, both owner questions. The repair added tasks 9 and 10, taking the plan to 10 |

## Observed limits

- Plan's coverage prompt (`[y/N]`) needs a terminal. The lab guide now says to answer `n`
  for gaps that belong to other repositories.
- Verify's repair can add tasks a class cannot build and take the plan above `max_tasks`.
  The lab guide now asks learners to check added tasks.
- On Codex as provider, SPEED's JSON calls failed until its Codex adapter was fixed locally
  (schema strictness, event-stream output, stdin). Those crashes are provider plumbing, not
  course behavior; a Claude Code run does not use that adapter.
- On a non-Claude provider, Audit treated real TypeScript in braces as unfilled
  placeholders. On Claude, the guide's example run only warned.

## Not yet run

- A run with Claude Code as SPEED's provider. The recorded run used Codex.
- `speed audit` on the card-testing spec since the placeholder fix.
- Any cohort, and the line numbers quoted in the speaker script.
