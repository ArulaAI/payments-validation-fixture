# S4: Versioned plans and traceability

Owner: SPEED product. Version 0.1 (draft, 9 October 2026).
Related: [overview](speed-overview.md#s4-versioned-plans-and-traceability),
[tech spec](../tech/speed-plan-versioning.md),
[planning](speed-feature-planning.md), [migration](speed-spec-migration.md)

## Problem

A saved plan records one spec path. Downstream stages reload whatever is on disk, so a spec
edited after planning silently changes what Run, Review and Coherence judge against. Verify
matches coverage by section heading, so once a feature has two product files, a task that
references "User Flows" in the first file appears to cover "User Flows" in the second.
Eval looks for a test catalog named after the primary RFC, which becomes `1.md`.

## Users

- An engineer who needs Verify to find every uncovered requirement.
- An operator who needs agents never to run against requirements that changed after
  planning.

## User Stories

### S4.1 Spec manifest and input snapshots

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S4.1-ST1 | As an operator, I want to know exactly what a plan was built from | Given a published plan, Then its manifest lists every input path and hash | Must |
| S4.1-ST2 | As a reviewer, I want the exact bytes kept | Given a published plan, Then a local snapshot holds the input bytes | Should |

### S4.2 Exact task references

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S4.2-ST1 | As an engineer, I want each task to point at an exact document and section | Given a new task, Then its reference holds the document path and a section ID, and optionally a requirement ID | Must |

### S4.3 Traceability in Verify

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S4.3-ST1 | As an engineer, I want a heading in one file never to hide a gap in another | Given a task referencing a heading in `1-high-value-traveller.md`, Then an uncovered requirement under the same heading in `2-card-testing.md` is still reported | Must |
| S4.3-ST2 | As an engineer, I want shared constraints reported separately | Given the overviews, Then they appear apart from feature requirement coverage | Should |

### S4.4 Downstream freshness checks

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S4.4-ST1 | As an operator, I want downstream stages to refuse a plan whose specs changed | Given a spec edited after planning, When Run, Review, Coherence or Integrate starts, Then it exits 3 with the changed paths and replan instructions | Must |
| S4.4-ST2 | As an engineer, I want my tasks and evidence kept | Given a stale-input stop, Then existing tasks and evidence are unchanged | Must |

### S4.5 Spec alignment and test catalog compatibility

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S4.5-ST1 | As an engineer, I want spec alignment rebuilt when a spec changes | Given a spec edit with unchanged Git HEAD, Then alignment is rebuilt for every document | Must |
| S4.5-ST2 | As an engineer, I want Eval to find the right test catalog | Given a nested primary RFC, Then Eval uses `test_spec_path` or `specs/tests/<feature>.md`, never a catalog named `1.md` | Must |

## User Flows

**Edit after planning.** The learner edits `design/adaptive-auth/1-checkout-challenge.md`
and runs `speed run`. Run exits 3, names the file and tells them to replan. Their tasks are
untouched.

**Verify the feature.** `speed verify --feature adaptive-auth` reports an uncovered
requirement in the card-testing file even though a task cites the same heading in the
traveller file.

## Success Criteria

- [ ] Verify finds a gap hidden behind a same-named heading (AC10)
- [ ] Every spec-aware downstream stage stops on stale inputs before an agent starts (AC13)

## Scope

### In Scope

- Versioned `spec_manifest.json` and local input snapshots
- Document, section and requirement IDs on task references
- Exact-identity traceability in Verify
- Freshness checks in Run, Review, Coherence, Guardian and Integrate
- Full-bundle spec alignment and test catalog selection

### Out of Scope (and why)

- **Semantic coverage from loading a document.** Loading a term is not covering it.
- **Changing clean-context review or Diagnose inputs.** Their boundaries are deliberate.

## RFC Decomposition

One tech spec, [speed-plan-versioning.md](../tech/speed-plan-versioning.md), sections S4.1
to S4.5. Depends on [S1](speed-spec-bundle-discovery.md) and
[S3](speed-feature-planning.md).

## Dependencies

- [S3 whole-feature planning](speed-feature-planning.md) writes the manifest.
- Spec traceability, Layer 1 alignment and Eval catalogs.

## Security & Controls

- Manifests hold no absolute paths, document bodies or secrets.
- Only the verify fix agent writes, and only task records, at most three times.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Same-named headings give false coverage | High | Exact IDs (S4.2, S4.3) |
| Agents run on changed specs | High | Freshness checks (S4.4) |

## Open Questions

None.
