# RFC S4: Versioned plans and traceability

> See [product spec](../product/speed-plan-versioning.md)
> See [product overview](../product/speed-overview.md#s4-versioned-plans-and-traceability)

Owner: SPEED engineering. Version 0.1 (draft, 9 October 2026). Status: proposed.
Depends on: [S1](speed-spec-bundle-discovery.md), [S3](speed-feature-planning.md).

## Overview

```python
def validate_plan_inputs(planned: PlanSpecManifest,
                         current: FeatureSpecBundle) -> list[InputChange]:
    """Return added, removed, changed, or template-changed inputs."""
```

Every consumer of a versioned plan calls `validate_plan_inputs` before it reads specs.

## Subfeatures

| Section | Product spec | Overview |
|---|---|---|
| S4.1 | [S4.1 stories](../product/speed-plan-versioning.md#s41-spec-manifest-and-input-snapshots) | [S4.1](../product/speed-overview.md#s41-spec-manifest-and-input-snapshots) |
| S4.2 | [S4.2 stories](../product/speed-plan-versioning.md#s42-exact-task-references) | [S4.2](../product/speed-overview.md#s42-exact-task-references) |
| S4.3 | [S4.3 stories](../product/speed-plan-versioning.md#s43-traceability-in-verify) | [S4.3](../product/speed-overview.md#s43-traceability-in-verify) |
| S4.4 | [S4.4 stories](../product/speed-plan-versioning.md#s44-downstream-freshness-checks) | [S4.4](../product/speed-overview.md#s44-downstream-freshness-checks) |
| S4.5 | [S4.5 stories](../product/speed-plan-versioning.md#s45-spec-alignment-and-test-catalog-compatibility) | [S4.5](../product/speed-overview.md#s45-spec-alignment-and-test-catalog-compatibility) |

### S4.1 Spec manifest and input snapshots

| ID | Requirement |
|----|-------------|
| S4.1-TR1 | Every new plan writes `spec_manifest.json` beside the contract and tasks: `.speed/shared/features/<feature>/` (multiplayer) or `.speed/features/<feature>/` (single-player) |
| S4.1-TR2 | The manifest holds bundle metadata and document hashes, `plan_revision`, `bundle_hash`, `entry_document_id`, `planning_input_hash`, selected related documents and test catalog by path and hash, code-context digest, stage configuration and prompt/schema digests |
| S4.1-TR3 | No absolute checkout paths and no document bodies in the manifest |
| S4.1-TR4 | Exact source bytes go to local `plan-inputs/<planning_input_hash>/`, following the local artifact ignore policy |
| S4.1-TR5 | The snapshot builder rechecks membership and hashes before publishing and returns an input-change error if they changed mid-read |

### S4.2 Exact task references

| ID | Requirement |
|----|-------------|
| S4.2-TR1 | Tasks keep `spec_references`; `spec` holds the exact document path |
| S4.2-TR2 | Add `section_id`, derived from heading hierarchy and occurrence within the document, and optional `requirement_id`. Keep `section` and `requirement` strings |
| S4.2-TR3 | Validation: the document ID and section must resolve; a requirement ID must exist in that section |

### S4.3 Traceability in Verify

| ID | Requirement |
|----|-------------|
| S4.3-TR1 | Verify reads the manifest, checks freshness, and labels product, architecture, design and tech inputs |
| S4.3-TR2 | Traceability evaluates requirements by document ID, section ID and requirement ID. A matching heading in another document is never direct coverage |
| S4.3-TR3 | Keyword overlap is labelled heuristic evidence. Missing files, ambiguous aliases and missing sections are gaps |
| S4.3-TR4 | Shared constraints appear separately in verifier input and report and do not inflate coverage |
| S4.3-TR5 | The deterministic pre-check precedes the Plan Verifier; at most three task-record repair cycles |

### S4.4 Downstream freshness checks

| ID | Requirement |
|----|-------------|
| S4.4-TR1 | Run and legacy spec-aware Review use the planned bundle for per-task section injection |
| S4.4-TR2 | Coherence, ad-hoc Guardian without a file and Integrate use the same manifest and snapshots |
| S4.4-TR3 | Each compares live membership and hashes first. A mismatch exits 3 with changed paths and replan instructions, before task mutation or agent execution. Tasks and evidence are kept |
| S4.4-TR4 | Clean-context `review --task ID` keeps its bounded inputs. Diagnose keeps its failure-class evidence contract |

### S4.5 Spec alignment and test catalog compatibility

| ID | Requirement |
|----|-------------|
| S4.5-TR1 | Layer 1 alignment receives every member and applicable shared document |
| S4.5-TR2 | Alignment invalidation is separate from code-index invalidation: unchanged HEAD reuses the code index, changed document hashes rebuild alignment |
| S4.5-TR3 | Backtick claims keep confirmed, missing and divergent statuses and filtering. The warning and `spec_ground.py` fallback remain when Layer 1 fails |
| S4.5-TR4 | Eval: an existing `test_spec_path` wins; new bundles use `specs/tests/<feature>.md`; legacy plans keep the current fallback. A nested primary RFC never causes a search for `1.md` |

## Acceptance Criteria

| ID | Observable behaviour | Section |
|----|---------------------|---------|
| AC10 | Verify reports an uncovered requirement in the second product file despite a same-heading reference to the first | S4.2, S4.3 |
| AC13 | A spec edit after planning stops Run and other spec-aware stages with a stale-input error; evidence is kept | S4.1, S4.4 |

## Testing

Two product files and two RFCs with identical headings: assert exact resolution and the
uncovered requirement. Edit each input kind after planning and assert exit 3 from Run,
Review, Coherence and Integrate with no agent call. Uncommitted spec edit with unchanged
HEAD: assert alignment rebuild and code index reuse. Eval catalog selection for nested,
flat and legacy plans. Force Layer 1 failure: assert the legacy warning.

## Key Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Versioning | Pinned hashes plus local snapshots | One primary path; live reads | Later checks use the same inputs |
| Coverage identity | Document, section, requirement IDs | Heading text | Same headings across files are common |

## File Impact

| File | Change |
|---|---|
| `lib/cmd/verify.sh`, `lib/spec_traceability.py`, `agents/plan-verifier.md` | Manifest input, exact-identity traceability |
| `lib/cmd/run.sh`, `review.sh`, `coherence.sh`, `integrate.sh`, `guardian.sh` | Freshness checks, snapshot inputs |
| `lib/cmd/eval.sh` | Catalog selection |
| `lib/context/spec_context.py`, `lib/context/layer1.py`, `lib/context/layer2.py` | Section injection, alignment invalidation |
| `templates/task.json` | `section_id`, `requirement_id` |

## Out of Scope

Semantic coverage from loaded terms; changes to clean-context review and Diagnose inputs.
