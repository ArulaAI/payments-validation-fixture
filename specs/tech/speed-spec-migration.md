# RFC S7: Migration and compatibility

> See [product spec](../product/speed-spec-migration.md)
> See [product overview](../product/speed-overview.md#s7-migration-and-compatibility)

Owner: SPEED engineering. Version 0.1 (draft, 9 October 2026). Status: proposed.
Depends on: [S4](speed-plan-versioning.md), [S5](speed-define-documents.md).

## Overview

New `lib/spec_documents_migrate.py` backs `speed migrate-spec-documents [--feature NAME]
[--apply]`. Plan readers accept both legacy and manifest plans. Nothing migrates on read.

## Subfeatures

| Section | Product spec | Overview |
|---|---|---|
| S7.1 | [S7.1 stories](../product/speed-spec-migration.md#s71-legacy-plan-compatibility) | [S7.1](../product/speed-overview.md#s71-legacy-plan-compatibility) |
| S7.2 | [S7.2 stories](../product/speed-spec-migration.md#s72-define-record-migration) | [S7.2](../product/speed-overview.md#s72-define-record-migration) |
| S7.3 | [S7.3 stories](../product/speed-spec-migration.md#s73-delivery-order-and-rollback) | [S7.3](../product/speed-overview.md#s73-delivery-order-and-rollback) |

### S7.1 Legacy plan compatibility

| ID | Requirement |
|----|-------------|
| S7.1-TR1 | Readers accept legacy `spec_path` and `spec_manifest.json`. With only `spec_path`, keep single-file semantics and warn that replanning enables full coverage |
| S7.1-TR2 | Never add newly discovered files to a completed or in-progress plan |
| S7.1-TR3 | Every new plan also writes `spec_path`: the explicit entry RFC, or the first naturally ordered RFC. New consumers prefer the manifest. Keep the file until all legacy readers migrate |
| S7.1-TR4 | Defect plans keep their inputs and escalation rules and need no product/tech bundle. Legacy test catalog pointers stay valid |
| S7.1-TR5 | Flat specs, explicit legacy feature overrides and child RFC families resolve as before (see [S1.2](speed-spec-bundle-discovery.md#s12-nested-feature-membership)) |

### S7.2 Define record migration

| ID | Requirement |
|----|-------------|
| S7.2-TR1 | Default mode previews old record paths, proposed document IDs, conflicts and archive locations, and writes nothing |
| S7.2-TR2 | `--apply` runs under the feature lock, then document locks in canonical order; never through an ordinary query |
| S7.2-TR3 | Map legacy `prd`, `design`, `rfc` and child RFC records by the draft's stored `file_path`. Missing or ambiguous paths stop that feature without publishing |
| S7.2-TR4 | Preserve author identities, suggestion IDs, resolution reasons, commitments, ratification sources and timestamps |
| S7.2-TR5 | Duplicate records for one shared path merge only with compatible history and ownership; competing live claims block |
| S7.2-TR6 | Stage and validate, then publish atomically with a receipt of source hashes and target IDs. Archive originals; never delete |
| S7.2-TR7 | Reapplying a completed migration is a no-op. Editing a legacy source after migration is a conflict, not a reimport |
| S7.2-TR8 | Compatibility adapters read the receipt and canonical records and never dual-write |

### S7.3 Delivery order and rollback

| ID | Requirement |
|----|-------------|
| S7.3-TR1 | Deliver in order: discovery and manifest readers ([S1](speed-spec-bundle-discovery.md)); audit and scaffolding ([S2](speed-feature-audit.md)); planning consumers ([S3](speed-feature-planning.md), [S4](speed-plan-versioning.md)); Define APIs and migration ([S5](speed-define-documents.md), S7.2); personas ([S6](speed-define-personas.md)) |
| S7.3-TR2 | Deploy dashboard APIs before the frontend. Existing APIs remain adapters throughout |
| S7.3-TR3 | Back up affected feature and document records before apply. An interrupted migration resumes from its receipt and staging state or restores the legacy records |
| S7.3-TR4 | Disabling demo config removes the selector and restores operator identity |
| S7.3-TR5 | After new documents or persona decisions exist, rolling back the binary needs a compatible reader or the pre-migration backups. Never reinterpret new records as legacy approvals |

## Acceptance Criteria

| ID | Observable behaviour | Section |
|----|---------------------|---------|
| AC14 | Flat specs, legacy overrides, child RFC families, defect planning, test catalogs and both state layouts work | S7.1 |

## Testing

Replay legacy fixtures twice and compare histories. Ambiguous mapping: no partial writes.
Interrupt an apply and assert resume or restore. Legacy plans stay readable while new plans
reject changed inputs. Eval catalog selection and defect planning unaffected. Both state
layouts.

## Key Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Migration trigger | Explicit command with preview | Migrate on read | Queries never write; operator sees conflicts first |
| Old stores | Archive and adapt | Dual-write | Divergence is impossible |

## File Impact

| File | Change |
|---|---|
| New `lib/spec_documents_migrate.py`, `lib/cmd/spec_documents.sh`; `speed` | Migration command |
| Plan readers in `lib/cmd/*.sh` | Legacy and manifest support |
| `docs/writing-specs.md`, `docs/process.md`, `docs/multiplayer.md` | Updated commands and provenance |

## Out of Scope

Migration on read; dual-writing stores; history transfer across renames.
