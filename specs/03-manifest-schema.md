# 03. Manifest and bundle schemas

Status: draft for review. Satisfies CR-2, CR-8, FR-20 and FR-21 from
[02-requirements.md](02-requirements.md).

Two documents carry the whole contract between the corpus, the runner and the scorer.
The manifest is ground truth. The bundle is what a learner produced. The scorer reads
both.

## Round manifest

One per round, at `corpus/round-<n>/manifest.json`. Validated by
`corpus/manifest.schema.json`.

```json
{
  "round": 0,
  "title": "Read it by hand, and miss things",
  "base": "main",
  "diffLines": 212,
  "defects": [
    {
      "id": "R0-D1",
      "class": "F2",
      "file": "src/obs/logger.ts",
      "line": 41,
      "summary": "Full PAN written to the application log on auth failure.",
      "caughtBy": "pan-scan",
      "evidence": "proof",
      "action": "confirm",
      "reserved": false,
      "notes": "Visually loud. Most rooms find this one by eye."
    }
  ],
  "pathologies": [
    {
      "id": "R0-P1",
      "kind": "false-positive",
      "check": "pan-scan",
      "file": "test/fixtures/cards.ts",
      "summary": "Allowlisted scheme test BIN reported as a finding.",
      "action": "refute",
      "reason": "4111 1111 1111 1111 is a scheme test BIN and is on the allowlist."
    }
  ],
  "cleanControl": false
}
```

### Field meanings

| Field | Meaning |
| --- | --- |
| `class` | One of F1 to F8. The failure class this defect belongs to |
| `caughtBy` | The check id expected to surface it, or `null` when reserved |
| `evidence` | The evidence type a genuine catch would produce |
| `action` | What the learner should do: `confirm`, `refute`, `escalate` or `ignore` |
| `reserved` | True when no check reaches it. Exactly one per round, per CR-3 |
| `pathologies[].kind` | One of `false-positive`, `fluent-wrong-review`, `equivalent-mutant`, `green-because-unexamined` |

`action` is what makes the round scoreable. A learner who confirms a pathology has
accepted bad evidence. A learner who escalates a confirmable finding has wasted a
human decision.

## Evidence bundle

Emitted by the runner to `bundles/<timestamp>.json`. This is the artifact Chapter 4
teaches learners to read and Chapter 8 scores.

```json
{
  "chain": "workbench/battery.yaml",
  "round": 0,
  "startedAt": "2026-09-14T12:00:00.000Z",
  "durationMs": 41230,
  "budget": { "limitMs": 90000, "spentMs": 41230, "withinBudget": true },
  "checks": [
    {
      "id": "pan-scan",
      "kind": "hook",
      "ran": true,
      "durationMs": 380,
      "evidence": "proof",
      "covers": ["F2"],
      "findings": [
        { "file": "src/obs/logger.ts", "line": 41, "summary": "Luhn-valid PAN in log argument", "severity": "high" }
      ]
    },
    {
      "id": "zero-context-review",
      "kind": "skill",
      "ran": false,
      "reason": "No coding agent configured.",
      "evidence": "silence",
      "covers": ["F5"],
      "findings": []
    }
  ],
  "notExamined": [
    { "class": "F8", "reason": "No check in this chain covers F8. It is human-reserved by design." }
  ]
}
```

### Rules the runner enforces

1. Every declared check appears in `checks`, whether it ran or not. A skipped check is
   `ran: false` with evidence `silence`, per FR-24. Absence is never how a skip is
   represented.
2. `notExamined` is computed by subtracting the union of every ran check's `covers` from
   the eight classes. It is never supplied as input, per FR-21.
3. The runner exits non-zero if `notExamined` is missing, per FR-22.
4. `budget.withinBudget` is false when the chain exceeds its declared limit. That is a
   finding about the chain, not about the code.

## Score report

Produced by `npm run score <bundle> <manifest>`, satisfying FR-25 and FR-26.

```json
{
  "recall": { "found": 3, "findable": 4, "ratio": 0.75 },
  "waste": { "checksRun": 11, "checksThatCouldNotHaveFound": 3 },
  "misjudgment": { "falsePositivesAccepted": 1, "truePositivesDismissed": 0, "overclaims": 0 },
  "boundary": { "reservedEscalated": true, "inventedDefects": 0 }
}
```

`findable` excludes the reserved defect, because no chain can find it. Recall is measured
against what the tooling could reach. Boundary calibration is measured separately, and it
is the axis that fails a learner who shipped over a live F8.
