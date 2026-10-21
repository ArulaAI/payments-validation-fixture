# RFC S3: Whole-feature planning

> See [product spec](../product/speed-feature-planning.md)
> See [product overview](../product/speed-overview.md#s3-whole-feature-planning)

Owner: SPEED engineering. Version 0.1 (draft, 9 October 2026). Status: proposed.
Depends on: [S1](speed-spec-bundle-discovery.md), [S2](speed-feature-audit.md).

## Overview

`speed plan --feature NAME` and `speed plan <file> [--feature NAME]` resolve the whole
bundle and produce one DAG. Selecting `1.md` names the feature and entry document; it does
not limit the plan.

```text
Bundle -> Audit gate -> Guardian -> Architect (phased?) -> Coverage -> Decomposition -> Publish
```

## Subfeatures

| Section | Product spec | Overview |
|---|---|---|
| S3.1 | [S3.1 stories](../product/speed-feature-planning.md#s31-full-bundle-planning-inputs) | [S3.1](../product/speed-overview.md#s31-full-bundle-planning-inputs) |
| S3.2 | [S3.2 stories](../product/speed-feature-planning.md#s32-mandatory-input-budget) | [S3.2](../product/speed-overview.md#s32-mandatory-input-budget) |
| S3.3 | [S3.3 stories](../product/speed-feature-planning.md#s33-one-feature-dag-and-phased-planning) | [S3.3](../product/speed-overview.md#s33-one-feature-dag-and-phased-planning) |
| S3.4 | [S3.4 stories](../product/speed-feature-planning.md#s34-planning-gates-and-staged-publication) | [S3.4](../product/speed-overview.md#s34-planning-gates-and-staged-publication) |
| S3.5 | [S3.5 stories](../product/speed-feature-planning.md#s35-stage-caching) | [S3.5](../product/speed-overview.md#s35-stage-caching) |

### S3.1 Full-bundle planning inputs

| ID | Requirement |
|----|-------------|
| S3.1-TR1 | Both plan forms resolve the whole bundle. At least one tech member is required; otherwise exit 3 with the feature name and expected directory |
| S3.1-TR2 | Guardian and Architect receive the full bundle in separate labelled blocks with exact paths. Shared context is marked as constraints, not feature scope |
| S3.1-TR3 | The Guardian still receives the product vision and current injected learnings and can reject the plan |
| S3.1-TR4 | Related-spec scoring (`--specs-dir`) applies only to documents outside the bundle. Members and overviews never compete for that budget. External specs keep inclusion and exclusion evidence |

### S3.2 Mandatory input budget

| ID | Requirement |
|----|-------------|
| S3.2-TR1 | `[context] mandatory_spec_budget`, default 60,000 estimated tokens, measured with the existing estimator including document labels. Nonpositive values are rejected |
| S3.2-TR2 | Over budget, stop before any Architect call and name the largest inputs. Never drop or summarise a mandatory input |
| S3.2-TR3 | Logs report mandatory document count, mandatory token estimate and optional selected count |
| S3.2-TR4 | The budget does not claim to discover a provider's context limit; operators set a value compatible with provider, code context, prompts and output |

### S3.3 One feature DAG and phased planning

| ID | Requirement |
|----|-------------|
| S3.3-TR1 | Sizing above `ARCHITECT_PHASE_TASK_THRESHOLD` (10 developer-day units) phases unless `--single-pass`. Estimate 10 stays single-pass |
| S3.3-TR2 | Phase sections are `(document_id, H2 index)`. Split validation keeps every required section and puts shared sections in both phases |
| S3.3-TR3 | Phase outputs merge into one DAG, contract and cross-cutting concern set with unique task IDs |
| S3.3-TR4 | Replanning replaces the feature's plan under the feature lock. Planning a single numbered RFC cannot create a separate task namespace |

### S3.4 Planning gates and staged publication

| ID | Requirement |
|----|-------------|
| S3.4-TR1 | Plan runs the audit gate on every registered document. A structural failure, or an audit that cannot complete, stops Plan. `--skip-audit` remains an explicit bypass logged in skipped-gate logs |
| S3.4-TR2 | The coverage verifier runs on every new plan, single-pass or phased, with all documents, shared constraints and any test catalog. Interactive repair needs confirmation; noninteractive critical gaps stop; bypasses are logged |
| S3.4-TR3 | The decomposition gate keeps its algorithm and thresholds. Bridge-only failures are auto-patched and rechecked; other failures stop. Unavailable code context or gate warns and falls back; mandatory document loading does not depend on that fallback |
| S3.4-TR4 | Tasks, contract, snapshots and manifest are staged until every mandatory gate passes, then published together with a recoverable plan-install receipt. A failed gate leaves the previous plan available. A feature with running agents cannot publish a replacement. Stage caches left after failure never pass for a published plan |

### S3.5 Stage caching

| ID | Requirement |
|----|-------------|
| S3.5-TR1 | Add audit caching. Per-document key: content hash, template hash, bundle hash, audit-agent hash, report schema version. Consistency and sizing key: bundle hash plus agent, template, policy and threshold versions |
| S3.5-TR2 | Guardian key adds product vision, injected learning content, Guardian prompt, model/provider identity |
| S3.5-TR3 | Architect key: complete mandatory bundle, selected related paths and hashes, related-spec settings, code context digest, test catalog hash, prompt/schema hashes, model/provider identity, phase configuration |
| S3.5-TR4 | Only complete, successfully parsed entries are reused; failures are never cached as approval |
| S3.5-TR5 | `--force` bypasses every stage cache, including saved phase-one results. Cache artifacts are local in multiplayer |
| S3.5-TR6 | A cache hit prints its input hash. Plan still invokes the audit gate for every document; a hit supplies a validated report, it does not skip the gate |

## Acceptance Criteria

| ID | Observable behaviour | Section |
|----|---------------------|---------|
| AC6 | Plan gives every member and both overviews to the Architect and produces one DAG; scoring cannot exclude them | S3.1, S3.3 |
| AC11 | Changing a member, overview, related input or template invalidates the right stage; `--force` bypasses all | S3.5 |

Retained behaviour: audit gates Plan; estimate 10 single-pass, 11 phased; Guardian vision
and learnings with rejection; coverage repair with consent; decomposition overlap, bridge
patch, stop and warn paths; Architect and coverage verifier tool-disabled.

## Testing

Provider stubs capture assembled messages. Both entry forms on the course fixture: every
path present, Guardian gets overview and learnings, phase split keeps sections, coverage
and decomposition repairs keep exact references. Oversized bundle: size error and zero
Architect calls. Mutate one input at a time and count audit, Guardian, Architect and phase
invocations. Fail each gate and assert the previous plan is intact. Fixture graph
assertions for gateway imports, clusters and bridges precede decomposition assertions.

## Key Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Planning inputs | Full mandatory bundle; score external only | Score everything | Required inputs cannot be scored out |
| Coverage | Every new plan | Phased only | Single-pass plans miss requirements too |
| Publication | Staged with receipt | Write in place | Failure keeps the working plan |

## File Impact

| File | Change |
|---|---|
| `lib/cmd/plan.sh`, `lib/context_bridge.sh`, `lib/context/assembly.py` | Bundle inputs, budget, phases, gates, staging, cache keys |
| `agents/architect.md`, `agents/architect-skeleton.md`, `agents/architect-enrich.md` | Labelled multi-document input, document phase indices |
| `agents/coverage-verifier.md`, `templates/coverage-output.json` | Full-bundle coverage with exact references |

No algorithm change to `lib/decomposition_gate.py` or
`lib/context/layer1_domain_clustering.py`.

## Out of Scope

Decomposition thresholds and algorithm; TypeScript import resolution; provider context
discovery.
