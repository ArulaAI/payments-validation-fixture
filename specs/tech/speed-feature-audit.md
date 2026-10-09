# RFC S2: Feature audit

> See [product spec](../product/speed-feature-audit.md)
> See [product overview](../product/speed-overview.md#s2-feature-audit)

Owner: SPEED engineering. Version 0.1 (draft, 9 October 2026). Status: proposed.
Depends on: [S1 spec bundle discovery](speed-spec-bundle-discovery.md).

## Overview

`lib/feature_audit.py` consumes a `FeatureSpecBundle` and returns a `FeatureAuditReport`. It
orchestrates per-document audits, feature consistency and feature sizing. The audit agent
stays read-only.

```text
logs/audit/<run_id>/documents/<storage_key>.json
logs/audit/<run_id>/feature.json
```

`FeatureAuditReport`: `schema_version`, `feature`, `bundle_hash`, `status`, document report
references, `cross_document_findings`, `sizing`, `completion`.

## Subfeatures

| Section | Product spec | Overview |
|---|---|---|
| S2.1 | [S2.1 stories](../product/speed-feature-audit.md#s21-feature-audit-command) | [S2.1](../product/speed-overview.md#s21-feature-audit-command) |
| S2.2 | [S2.2 stories](../product/speed-feature-audit.md#s22-per-document-and-aggregate-reports) | [S2.2](../product/speed-overview.md#s22-per-document-and-aggregate-reports) |
| S2.3 | [S2.3 stories](../product/speed-feature-audit.md#s23-cross-document-consistency-checks) | [S2.3](../product/speed-overview.md#s23-cross-document-consistency-checks) |
| S2.4 | [S2.4 stories](../product/speed-feature-audit.md#s24-feature-sizing) | [S2.4](../product/speed-overview.md#s24-feature-sizing) |
| S2.5 | [S2.5 stories](../product/speed-feature-audit.md#s25-rfc-split-recommendations) | [S2.5](../product/speed-overview.md#s25-rfc-split-recommendations) |

### S2.1 Feature audit command

| ID | Requirement |
|----|-------------|
| S2.1-TR1 | `speed audit --feature NAME [--force] [--json]` audits every member and each available shared overview |
| S2.1-TR2 | `speed audit <file> [--force]` audits one file with its bundle available for cross-references and keeps single-file output and exit behaviour |
| S2.1-TR3 | Exit codes: 0 pass or warn; 2 structural failure; 3 invalid input; 1 agent or parse failure, with `completion: incomplete` when a partial report can be emitted. Operational failure is never a pass |
| S2.1-TR4 | Several `> See` links are supported and resolve through the inventory. In a feature audit a missing single primary PRD link does not block; a single-file audit needs explicit product links or a resolved product set. A link to a missing local file is a Level 1 failure |

### S2.2 Per-document and aggregate reports

| ID | Requirement |
|----|-------------|
| S2.2-TR1 | One report per document at `documents/<storage_key>.json` and one aggregate at `feature.json`. `run_id` is a UUID so same-type documents audited within one second never collide. Multiplayer uses local log locations |
| S2.2-TR2 | A finding has `id`, `level`, `severity`, `blocking`, `document_id`, `section_id`, optional line, `related_locations` (each a document and section) and `message` |
| S2.2-TR3 | The report distinguishes completed checks from unavailable or unparseable agent results |
| S2.2-TR4 | Human output groups findings by source document and shows both endpoints of cross-document findings. With `--json`, stdout is one aggregate object; logs go to stderr |
| S2.2-TR5 | Report validation: valid schema, explicit completion, valid paths, known status |

### S2.3 Cross-document consistency checks

| ID | Requirement |
|----|-------------|
| S2.3-TR1 | Levels 1 and 2 stay per document. Level 3 evaluates the union of product requirements, design flows, architecture constraints and tech implementation across all members |
| S2.3-TR2 | Checks: product to design coverage; product to tech coverage; architecture boundary and quality constraints; design to tech interface agreement; RFC dependency and interface consistency |
| S2.3-TR3 | A requirement may be covered across several RFCs; no single RFC must reproduce the feature |
| S2.3-TR4 | Gate policy unchanged: Level 1 blocks; Levels 2 to 4 warn. Cross-document findings print even on exit 0. The aggregate fails if any structural report fails |

### S2.4 Feature sizing

`sizing`: `estimated_tasks`, `estimate_unit: developer_day`, `recommendation`, `rationale`,
`suggested_files`.

| ID | Requirement |
|----|-------------|
| S2.4-TR1 | Estimate the feature once from the union of requirements and implementation scope; never add product and tech estimates for the same work |
| S2.4-TR2 | The unit is the audit's developer-day estimate, not a count of Architect tasks. The 15 to 30 minute execution guidance and touched-file line heuristic are unchanged and labelled separately |
| S2.4-TR3 | An empty tech folder is valid: estimate from product, design and architecture and report tech coverage as pending authoring |
| S2.4-TR4 | Validation: nonnegative estimate and explicit unit |

### S2.5 RFC split recommendations

Each `suggested_files` entry has `path`, `source_sections` keyed by document ID,
`depends_on` and `testable_output`.

| ID | Requirement |
|----|-------------|
| S2.5-TR1 | Above 15 units, or any tech file over 1,000 lines, recommend multiple numbered RFCs. With no tech files, above 10 recommends a split |
| S2.5-TR2 | Already split features get suggestions only for oversized members or missing boundaries |
| S2.5-TR3 | Recommendations use unused numeric filenames and never create, change or overwrite a file. They never trigger Define generation |
| S2.5-TR4 | Validation: valid source section indices, unused destinations, acyclic proposed dependencies |

## Acceptance Criteria

| ID | Observable behaviour | Section |
|----|---------------------|---------|
| AC3 | One report per document and one aggregate; every finding names source and related paths | S2.1, S2.2 |
| AC4 | An architecture boundary violation, an uncovered product flow and a design/tech interface mismatch each appear as cross-document findings | S2.3 |
| AC5 | With no tech files, the audit gives sizing and unused numbered RFC paths and changes no file | S2.4, S2.5 |

## Testing

Provider stubs return schema-valid results. Audit several same-type documents within one
second and assert unique paths and a complete aggregate. Run the exact initial course
fixture and assert prospective sizing. Seed one of each cross-document violation and assert
each finding's both locations. Force an agent failure and assert exit 1 with
`completion: incomplete`.

## Key Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Report shape | Per-document plus aggregate | One report | Navigable findings with both endpoints |
| Split | Recommend unused numbered paths | Auto-split | Engineer authors; agent stays read-only |
| Gate policy | Structural blocks, semantic warns | All block | No unrequested gate change |
| Sizing unit | Explicit developer-day | Merge units | Keeps phase behaviour; mismatch visible |

## File Impact

| File | Change |
|---|---|
| New `lib/feature_audit.py` | Orchestration, consistency, sizing |
| `lib/cmd/audit.sh`, `speed` | `--feature`, `--json`, exit codes, help |
| `agents/audit.md` | Feature-wide Level 3, sizing output |

## Out of Scope

Blocking semantic findings; writing RFC splits; changing task-size units.
