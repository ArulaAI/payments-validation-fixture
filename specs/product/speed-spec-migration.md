# S7: Migration and compatibility

Owner: SPEED product. Version 0.1 (draft, 9 October 2026).
Related: [overview](speed-overview.md#s7-migration-and-compatibility),
[tech spec](../tech/speed-spec-migration.md),
[plan versioning](speed-plan-versioning.md), [Define documents](speed-define-documents.md)

## Problem

Projects already have flat specs, saved plans that record one `spec_path`, defect plans,
test catalogs and Define records keyed by type (`prd`, `design`, `rfc`). The new
per-document model must not reinterpret completed work, lose a claim, suggestion or
ratification, or break a project that never uses nested features.

## Users

- An existing SPEED user who upgrades and expects their project to work unchanged.
- An operator who moves Define history to the new storage and needs to undo it if
  something goes wrong.

## User Stories

### S7.1 Legacy plan compatibility

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S7.1-ST1 | As an existing user, I want saved plans read as they were made | Given a plan with only `spec_path`, Then single-file semantics apply and a warning suggests replanning | Must |
| S7.1-ST2 | As an existing user, I want flat specs, defect plans and test catalogs unchanged | Given any of these, Then existing commands behave as before | Must |

### S7.2 Define record migration

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S7.2-ST1 | As an operator, I want to preview the migration | Given `speed migrate-spec-documents`, Then it lists proposed changes and writes nothing | Must |
| S7.2-ST2 | As an operator, I want history preserved | Given `--apply`, Then authors, suggestion IDs, reasons, commitments, ratifications and timestamps are kept | Must |
| S7.2-ST3 | As an operator, I want an ambiguous mapping to stop, not guess | Given a record that maps to zero or several documents, Then that feature is not migrated and nothing partial is published | Must |
| S7.2-ST4 | As an operator, I want reapplying to be safe | Given a completed migration, When applied again, Then nothing changes | Must |

### S7.3 Delivery order and rollback

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S7.3-ST1 | As an operator, I want each step shippable on its own | Given the delivery order, Then each step works with the previous step's readers | Should |
| S7.3-ST2 | As an operator, I want to recover from a failed migration | Given an interrupted apply, Then it resumes or restores the untouched legacy records | Must |

## User Flows

**Upgrade an existing project.** The operator upgrades SPEED. Existing plans run as before
with a replan warning. They run `speed migrate-spec-documents --feature payments`, review
the preview, then apply it. Define shows the same claims and suggestions on the same files.

## Success Criteria

- [ ] Flat specs, legacy overrides, child RFC families, defect planning, test catalogs and
      both state layouts work (AC14)
- [ ] Replaying a legacy fixture migration twice gives identical history

## Scope

### In Scope

- Legacy and manifest plan readers
- Compatibility `spec_path` for new plans
- Explicit, previewable, idempotent Define record migration
- Delivery order, backups and rollback

### Out of Scope (and why)

- **Automatic migration on read.** A query must never write state.
- **Dual-writing old and new stores.** It lets them diverge.

## RFC Decomposition

One tech spec, [speed-spec-migration.md](../tech/speed-spec-migration.md), sections S7.1
to S7.3.

## Dependencies

- [S4 versioned plans](speed-plan-versioning.md) and [S5 Define documents](speed-define-documents.md).

## Security & Controls

- Migration runs under the feature lock and document locks.
- Originals are archived, never deleted.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Migration loses Define history | High | Preview, staging, receipt, idempotent apply (S7.2) |
| Rolled-back binary misreads new records | High | Compatible reader or restore backups (S7.3) |

## Open Questions

None.
