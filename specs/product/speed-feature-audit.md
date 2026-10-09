# S2: Feature audit

Owner: SPEED product. Version 0.1 (draft, 9 October 2026).
Related: [overview](speed-overview.md#s2-feature-audit),
[tech spec](../tech/speed-feature-audit.md),
[spec bundle discovery](speed-spec-bundle-discovery.md), [planning](speed-feature-planning.md)

## Problem

`speed audit` takes one file. Its Level 3 check compares an RFC with the one PRD it links
and a design with its PRD. Nothing checks a tech spec against the architecture, a second
product file against the tech spec, or two RFCs against each other. Those are the
contradictions that cost most once planning starts.

Sizing is per file, and a split recommendation names `{feature}-{part}.md` files. In
301.1E the tech folder starts empty. Learners need the audit to size the whole feature from
product, design and architecture, and to name the numbered RFCs they should write.

## Users

- An engineer who needs one command to audit the feature and tell them how to split the
  RFC.
- A product manager, designer and architect who need contradictions with their documents
  surfaced before planning.

## User Stories

### S2.1 Feature audit command

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S2.1-ST1 | As an engineer, I want one command that audits the whole feature | Given `speed audit --feature adaptive-auth`, Then every member and both overviews are audited | Must |
| S2.1-ST2 | As an engineer, I want a crash never to look like a pass | Given an agent failure, Then the audit exits 1 and the report is marked incomplete | Must |
| S2.1-ST3 | As an engineer, I want single-file audit to keep working | Given `speed audit specs/tech/adaptive-auth/1.md`, Then it audits that file with the feature available for cross-reference | Must |

### S2.2 Per-document and aggregate reports

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S2.2-ST1 | As an engineer, I want a report per document and one for the feature, so that I can navigate findings | Given a feature audit, Then there is one report per document and one aggregate report, none overwriting another | Must |
| S2.2-ST2 | As a tool author, I want machine-readable output | Given `--json`, Then stdout is one aggregate JSON object and logs go to stderr | Should |

### S2.3 Cross-document consistency checks

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S2.3-ST1 | As an architect, I want a tech spec that crosses an architecture boundary caught | Given an RFC breaking a boundary in `architecture/adaptive-auth.md`, Then a finding names the RFC section and the architecture section | Must |
| S2.3-ST2 | As a product manager, I want an uncovered product flow caught | Given a flow in `2-card-testing.md` no RFC covers, Then a finding names it | Must |
| S2.3-ST3 | As a designer, I want a design/tech interface mismatch caught | Given an RFC contradicting `1-checkout-challenge.md`, Then a finding names both sections | Must |
| S2.3-ST4 | As an engineer, I want gate policy unchanged | Given only semantic findings, Then the audit exits 0 and prints them; Given a structural error, Then it exits 2 | Must |

### S2.4 Feature sizing

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S2.4-ST1 | As an engineer, I want the feature sized before any tech spec exists | Given an empty tech folder, Then the audit returns one developer-day estimate and reports tech coverage as pending | Must |
| S2.4-ST2 | As an engineer, I want the estimate counted once | Given product and tech describing the same work, Then the estimate is not the sum of both | Must |

### S2.5 RFC split recommendations

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S2.5-ST1 | As an engineer, I want the split named as numbered files | Given a large estimate, Then the audit recommends unused paths such as `1.md` and `2.md`, each with source sections, dependencies and testable output | Must |
| S2.5-ST2 | As an engineer, I want the audit never to write my RFCs | Given any recommendation, Then no file is created, changed or overwritten | Must |

## User Flows

**First audit.** The learner runs `speed audit --feature adaptive-auth` with an empty tech
folder. The audit reports on five feature documents and two overviews, prints
cross-document findings grouped by document with both locations, estimates the feature and
recommends `specs/tech/adaptive-auth/1.md` and `2.md`. No file is written.

**Audit after writing RFCs.** The learner writes both RFCs and reruns the audit. It now
checks tech against product, design and architecture, and suggests further splits only for
an oversized RFC or a missing boundary.

## Success Criteria

- [ ] One report per document and one aggregate, every finding with source and related
      paths (AC3)
- [ ] Architecture boundary, uncovered flow and interface mismatch each found (AC4)
- [ ] Empty tech folder gives sizing and numbered paths with no file changed (AC5)

## Scope

### In Scope

- `speed audit --feature` and single-file audit with bundle context
- Per-document and aggregate reports
- Cross-document Level 3 checks including architecture
- Feature-level developer-day sizing
- Numbered RFC split recommendations

### Out of Scope (and why)

- **Making semantic findings blocking.** Gate policy is unchanged.
- **Writing the split.** The engineer authoring it is the course moment.
- **Unifying the three task-size units.** The course teaches the mismatch.

## RFC Decomposition

One tech spec, [speed-feature-audit.md](../tech/speed-feature-audit.md), sections S2.1 to
S2.5. Depends on [S1](speed-spec-bundle-discovery.md).

## Dependencies

- [S1 spec bundle discovery](speed-spec-bundle-discovery.md).
- The read-only audit agent (`agents/audit.md`).

## Security & Controls

- The audit agent stays read-only.
- Incomplete reports never satisfy the plan gate.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Same-type reports overwrite each other | Medium | UUID run directories (S2.2) |
| Estimates vary between runs | Medium | Keep raw evidence and input hash |
| Empty tech folder blocks the first audit | Medium | Definition-stage audit is valid (S2.4) |

## Open Questions

None blocking. Resolved: both per-file and feature reports; sizing names files and never
writes them; the three sizing units are kept and labelled.
