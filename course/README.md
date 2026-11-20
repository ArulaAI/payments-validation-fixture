# Engineering 301

Three 120-minute courses that follow one change, adaptive authorization, from definition
to delivery on this payments fixture. Each course hands the next something a person can
check. Each course folder carries a snapshot of the fixture as that course starts, so any
course can run on its own.

| Course | Starts from | Hands on | Folder |
| --- | --- | --- | --- |
| 301.1E Define, Audit, Plan | The baseline: upstream documents, code and tests | A reviewed spec and an agent-ready plan | [`301.1E/`](301.1E/) |
| 301.2E Execute, Integrate, Learn | The reviewed 301.1E output | Candidate code and evidence | [`301.2E/`](301.2E/) |
| 301.3E Diagnose, Judge, Repair | The 301.2E candidate, with gaps added | Accept, repair or escalate | [`301.3E/`](301.3E/) |

The feature is all of F2 adaptive authorization: a genuine traveler declined abroad
(F2.1) and a card-testing attack approved across merchants (F2.2), sharing one bank
step-up challenge. Its upstream documents are in [`../specs/`](../specs/).

## SPEED version

All three courses run one SPEED build: the `ArulaAI/workbench` repository, branch `301`,
commit `a8bde62`. It plans a whole feature within the task cap in `speed.toml`, and has
`eval`, `ci` and `plan --defects`, which the later courses need. Put that checkout first
on `PATH` and check it before a session:

```sh
git -C <workbench-checkout> rev-parse --short HEAD   # a8bde62
command -v speed                                     # <workbench-checkout>/speed
```

A different build can plan differently, word its output differently or reject flags the
material uses. Every SPEED command, output and source line the material cites was checked
against this commit.

## What each folder holds

Every course folder has the same shape, so whoever picks up a course finds the same things
in the same places, with the same names.

| Path | What it is |
| --- | --- |
| `README.md` | How to set up and run the course. Start here |
| `snapshot/fixture.bundle` | The fixture as the course starts, with its git history. Clone it to begin |
| `learner/` | `lab-action-guide.md` and `speed-reference.md`, plus support files (figures, assets) |
| `instructor/` | `trainer-brief.md`, `framework.md`, `speaker-script.md`, `facilitator-guide.md`, `facilitator-gap-map.md` (answer key), `assessment.md`, `rehearsal.md` |
| `overview.html`, `overview.pdf` | The course overview, for anyone deciding whether to run it |

Snapshots are made with [`make-snapshot.sh`](make-snapshot.sh). 301.1E's comes from the
fixture on this branch. 301.2E's and 301.3E's come from running the course before them
once, so they hold real output rather than invented examples.

[`assets/arula/`](assets/arula/) holds the shared fonts and design tokens the overview
pages use.

## Status

| Course | Snapshot | Material | Overview |
| --- | --- | --- | --- |
| 301.1E | Made from this branch | Complete. Run once from the snapshot on 18 Nov; the plan blocker and guide gaps it found are fixed | Done |
| 301.2E | Made from that 301.1E run. Recorded checkpoint in `instructor/checkpoint/` | Complete, matched to the recorded run. No Claude-provider or cohort rehearsal yet | Done |
| 301.3E | Made from continuing the 301.2E run, with five gaps | Complete. Diagnose run on the snapshot; review, eval, plan, verify and run not rehearsed | Done |
