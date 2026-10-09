# RFC S1: Spec bundle discovery

> See [product spec](../product/speed-spec-bundle-discovery.md)
> See [product overview](../product/speed-overview.md#s1-spec-bundle-discovery)

Owner: SPEED engineering. Version 0.1 (draft, 9 October 2026). Status: proposed.

## Overview

One shared Python resolver decides feature membership, document identity, templates and
hashes for every stage. Shell commands call it through a CLI; dashboard resolvers import it.

```python
def resolve_feature_bundle(project_root: Path, feature: str | None = None,
                           entry_spec: Path | None = None) -> FeatureSpecBundle: ...
def feature_from_spec(project_root: Path, spec_path: Path) -> str: ...
def resolve_document_selector(bundle: FeatureSpecBundle, document_id: str | None,
                              legacy_spec_type: str | None) -> SpecDocument: ...
```

`SpecDocument`:

| Field | Type | Meaning |
|-------|------|---------|
| `document_id` | string | Exact project-relative POSIX path; also the canonical spec-reference value |
| `kind` | enum | `product`, `architecture`, `design`, `tech` |
| `scope` | enum | `feature` or `shared_context` |
| `feature` | string or null | Owning feature; null for shared overviews |
| `content` | UTF-8 string | Current content |
| `content_hash` | string | SHA-256 of exact file bytes |
| `template_path` | string | Resolved built-in or project template |
| `template_hash` | string | SHA-256 of exact template bytes |
| `dependencies` | string array | Canonical local paths from explicit dependency headers |

`FeatureSpecBundle`: `schema_version: 1`, `feature`, optional `entry_document_id`,
`members`, `shared_context`, `bundle_hash`.

## Subfeatures

| Section | Product spec | Overview |
|---|---|---|
| S1.1 | [S1.1 stories](../product/speed-spec-bundle-discovery.md#s11-architecture-spec-type) | [S1.1](../product/speed-overview.md#s11-architecture-spec-type) |
| S1.2 | [S1.2 stories](../product/speed-spec-bundle-discovery.md#s12-nested-feature-membership) | [S1.2](../product/speed-overview.md#s12-nested-feature-membership) |
| S1.3 | [S1.3 stories](../product/speed-spec-bundle-discovery.md#s13-document-identity-and-ordering) | [S1.3](../product/speed-overview.md#s13-document-identity-and-ordering) |
| S1.4 | [S1.4 stories](../product/speed-spec-bundle-discovery.md#s14-shared-overview-context) | [S1.4](../product/speed-overview.md#s14-shared-overview-context) |
| S1.5 | [S1.5 stories](../product/speed-spec-bundle-discovery.md#s15-nested-document-scaffolding) | [S1.5](../product/speed-overview.md#s15-nested-document-scaffolding) |

### S1.1 Architecture spec type

| ID | Requirement |
|----|-------------|
| S1.1-TR1 | Add `templates/architecture.md`. Required sections: Context, Responsibilities, Boundaries, Components and Dependencies, Data and Trust Boundaries, Failure Modes, Quality Constraints, Decisions, Verification. Platform and feature architecture use the same contract |
| S1.1-TR2 | Optional `[specs] architecture_template` selects a UTF-8 Markdown template inside the project. External destinations and symlinks are rejected. Absent an override, use the built-in template |
| S1.1-TR3 | Product overview uses `templates/overview.md`; feature product files use `templates/prd.md`; design and tech keep current templates. Every consumer uses the resolver's `template_path` |
| S1.1-TR4 | Import never rewrites an architecture file to conform. A nonconforming file adopts the headings or configures a project template before structural audit passes |
| S1.1-TR5 | A single-file audit of a shared overview uses the overview or architecture template and never infers a feature named `overview` |

### S1.2 Nested feature membership

| ID | Requirement |
|----|-------------|
| S1.2-TR1 | Members are all Markdown files recursively under `specs/<kind>/<feature>/`, plus an existing flat `specs/<kind>/<feature>.md`. Mixed layouts are valid |
| S1.2-TR2 | Other flat child RFCs join only by an explicit `> Parent RFC:` link to an included tech document, expanded transitively. Cycles are rejected. Never group by a `<feature>-*` prefix |
| S1.2-TR3 | Folder membership decides nested identity. Flat files without parentage keep their stem. An explicit feature conflicting with nesting is an error; the override survives only for standalone flat entry files, which must then be in the bundle |
| S1.2-TR4 | `speed` sources `lib/spec_documents_bridge.sh` before any discovery; `feature_name_from_spec` delegates to the resolver |
| S1.2-TR5 | Empty feature membership exits 3, even when shared overviews exist |

### S1.3 Document identity and ordering

| ID | Requirement |
|----|-------------|
| S1.3-TR1 | Identity is the path, not type, basename, heading or label. A rename is a new identity; the old identity's history is archived |
| S1.3-TR2 | Order by kind (product, architecture, design, tech), then natural numeric path. Dependencies, not order, decide execution |
| S1.3-TR3 | `bundle_hash` covers each record's ID, kind, scope, content hash, template hash and dependencies as canonical JSON with sorted keys; timestamps and discovery order excluded |
| S1.3-TR4 | `resolve_document_selector` returns exactly one document or raises `DOCUMENT_NOT_FOUND` / `AMBIGUOUS_DOCUMENT` with candidates; it never picks the first match |
| S1.3-TR5 | Feature names follow the lowercase convention; separators, traversal, `overview` and empty input are rejected. Paths must be UTF-8 `.md` under a spec directory, not symlinks, inside the project. Dependency targets must exist and be acyclic. Violations exit 3 |
| S1.3-TR6 | Discovery scans only the four spec directories and the vision path, needs no SQLite or server, and resolves 200 files (2 MiB) in under one second |

### S1.4 Shared overview context

| ID | Requirement |
|----|-------------|
| S1.4-TR1 | The configured product vision and `specs/architecture/overview.md`, when present, enter `shared_context` with `feature: null` |
| S1.4-TR2 | Shared context is available to audit, planning and Define and is never counted as feature requirements |
| S1.4-TR3 | Missing optional context warns. A missing explicitly linked local file is a structural error |

### S1.5 Nested document scaffolding

| ID | Requirement |
|----|-------------|
| S1.5-TR1 | `speed new TYPE NAME --file RELATIVE.md` (types `prd`, `design`, `architecture`, `rfc`) creates a document under the type's feature folder, including deeper subfolders |
| S1.5-TR2 | `--file` requires `.md` and rejects absolute paths, traversal and symlinks. Creation never overwrites |
| S1.5-TR3 | Nested RFCs get one `> See [product spec]` link per product member; with none, print the missing-context diagnostic |
| S1.5-TR4 | `speed new architecture NAME` creates `specs/architecture/NAME.md` from the selected template |
| S1.5-TR5 | Existing `speed new TYPE NAME` keeps flat output paths and defect and test-spec behaviour |

## Acceptance Criteria

| ID | Observable behaviour | Section |
|----|---------------------|---------|
| AC1 | Architecture files audit with the selected template; `speed new architecture NAME` creates it without overwriting | S1.1, S1.5 |
| AC2 | The course layout resolves as one `adaptive-auth` feature; `1.md` and `2.md` never create features `1` or `2` | S1.2 |
| AC14 | Flat specs, legacy overrides and child RFC families still resolve | S1.2 |

## Testing

Unit tests for nested, flat, mixed, parent-linked, shared, numeric order, cycle and invalid
path cases. Hashing is checked independently of modification times. Edge cases: zero
members with two overviews; duplicate numeric stems across kinds; leading zeros; deeper
subfolders; invalid UTF-8; symlinks.

## Key Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Discovery | One Python resolver | Shell substitution; dashboard scanning | Every stage must agree |
| Identity | Project-relative path | Type, basename, UUID | Inspectable; repeated names unambiguous |
| Architecture template | Built-in with project override | Built-in only; free prose | Consistent audits, existing formats supported |

## File Impact

| File | Change |
|---|---|
| New `lib/spec_documents.py`, `lib/spec_documents_cli.py`, `lib/spec_documents_bridge.sh` | Resolver, CLI, shell bridge |
| `lib/features.sh`, `lib/shared.sh`, `dashboard/backend/paths.py` | Delegate to the resolver |
| New `templates/architecture.md`; `templates/prd.md`, `templates/rfc.md`, `templates/design.md`, `templates/speed-toml.toml`, `lib/toml.py`, `lib/cmd/project.sh` | Template, override, nested scaffolding |

## Out of Scope

History transfer across renames; grouping by filename prefix.
