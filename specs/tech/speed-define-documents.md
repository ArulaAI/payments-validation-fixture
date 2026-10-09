# RFC S5: Define multi-document collaboration

> See [product spec](../product/speed-define-documents.md)
> See [product overview](../product/speed-overview.md#s5-define-multi-document-collaboration)

Owner: SPEED engineering. Version 0.1 (draft, 9 October 2026). Status: proposed.
Depends on: [S1](speed-spec-bundle-discovery.md).

## Overview

Document state lives under `.speed/shared/spec-documents/<storage_key>/` (multiplayer) or
`.speed/spec-documents/<storage_key>/` (single-player). `storage_key` is the SHA-256 of the
document ID. Each directory holds `document.json` (with the unhashed ID), `claim.json`,
`draft.json`, `validation.json`, `suggestions.json`, revision-specific commitment and
ratification records, and history. The feature's ceremony revision references document
IDs; editing and commitment belong to the document records.

| Entity | Transition | Trigger and effect |
|--------|------------|--------------------|
| Document | undiscovered → available | Resolver finds a valid file; Define imports without generating or rewriting |
| Claim | unclaimed or stale → claimed | Actor claims the exact document under the stale-window rule |
| Document | available → edited | Claimant saves against expected hash; atomic replace and projection refresh under the document lock |
| Validation | current → stale | Document, shared context or relevant template hash changes |
| Suggestion | unresolved → outdated | Referenced section changes or disappears |
| Suggestion | unresolved → accepted / dismissed | Current claimant resolves; dismissal has a nonblank reason |
| Commitment | draft → committed | Claimant commits after current validation passes; claim retires |
| Ratification | pending → ratified | Eligible actors approve the exact committed revision, or none exist |
| Document | available → archived | File disappears; history kept; affected manifests invalidated |

## Subfeatures

| Section | Product spec | Overview |
|---|---|---|
| S5.1 | [S5.1 stories](../product/speed-define-documents.md#s51-document-tabs-and-import) | [S5.1](../product/speed-overview.md#s51-document-tabs-and-import) |
| S5.2 | [S5.2 stories](../product/speed-define-documents.md#s52-per-document-claims-and-suggestions) | [S5.2](../product/speed-overview.md#s52-per-document-claims-and-suggestions) |
| S5.3 | [S5.3 stories](../product/speed-define-documents.md#s53-external-edit-protection) | [S5.3](../product/speed-overview.md#s53-external-edit-protection) |
| S5.4 | [S5.4 stories](../product/speed-define-documents.md#s54-revision-bound-commitment-and-ratification) | [S5.4](../product/speed-overview.md#s54-revision-bound-commitment-and-ratification) |
| S5.5 | [S5.5 stories](../product/speed-define-documents.md#s55-legacy-selector-compatibility) | [S5.5](../product/speed-overview.md#s55-legacy-selector-compatibility) |

### S5.1 Document tabs and import

| Field | Inputs | Result and errors |
|-------|--------|-------------------|
| `featureSpecDocuments` | `featureName` | Ordered metadata, content, claim, validation, revision status; `INVALID_FEATURE` |

| ID | Requirement |
|----|-------------|
| S5.1-TR1 | One tab per discovered document, showing kind and path suffix; full path available. Shared overviews are labelled shared |
| S5.1-TR2 | Add, delete and change events from the spec registry and watcher reconcile tabs and keep unsaved edits |
| S5.1-TR3 | Import creates projections only. It never rewrites text, grants ownership or generates missing tech drafts |
| S5.1-TR4 | Draft generation takes a validated destination path. Decomposition previews unused numbered RFC destinations before the explicit generation action writes them |
| S5.1-TR5 | The codebase dimension keeps checking backticked references against the semantic graph and git on imported and edited documents |
| S5.1-TR6 | UI handles many tabs, repeated basenames, long paths, loading, empty tech state, narrow screens and keyboard navigation through overflowing tabs, using existing tokens |

### S5.2 Per-document claims and suggestions

| Field | Inputs | Result and errors |
|-------|--------|-------------------|
| `claimSpecDocument` / `releaseSpecDocument` | feature, document ID | Current claim; existing ownership and stale-window rules |
| `createDocumentSuggestion` | feature, document ID, section ID, expected section hash, text | Suggestion; owner suggestion denied; `SECTION_CHANGED` |
| `resolveDocumentSuggestion` | suggestion ID, accept/dismiss, expected section hash, optional reason | Resolution and updated document |
| `validateSpecDocument` | feature, document ID | Six validation dimensions with full-bundle context |

| ID | Requirement |
|----|-------------|
| S5.2-TR1 | Suggestions target an exact document and section ID with a matching section hash on submission and application |
| S5.2-TR2 | Only the current claimant resolves. Dismissal requires a reason that is nonblank after trimming, in backend and UI |
| S5.2-TR3 | Acceptance uses existing edit application with a section-hash precondition. A moved or renamed section makes suggestions outdated; they never transfer by heading text |
| S5.2-TR4 | Shared overviews have one claim across features. Suggestions keep `origin_feature`; the owner sees all |
| S5.2-TR5 | Suggestion editing, deletion and replies keep existing author rules and use the stored document ID |

### S5.3 External edit protection

| Field | Inputs | Result and errors |
|-------|--------|-------------------|
| `updateSpecDocument` | feature, document ID, content, expected content hash | Saved document; `NOT_CLAIMANT`, `DOCUMENT_NOT_FOUND`, `DOCUMENT_CHANGED` |

| ID | Requirement |
|----|-------------|
| S5.3-TR1 | Files are authoritative. A draft is a projection with `base_content_hash` |
| S5.3-TR2 | Resolve the canonical document and capture the actor before writing. Validate expected hash under a per-document lock; replace atomically |
| S5.3-TR3 | If the projection write fails after the source save, invalidate the projection and rebuild it from the file before the next read |
| S5.3-TR4 | A conflicting external edit shows both versions and blocks saving until the claimant resolves it |
| S5.3-TR5 | Lock order: feature lock first, then document locks in canonical path order. Shared overview locks are global to the document |

### S5.4 Revision-bound commitment and ratification

| Field | Inputs | Result and errors |
|-------|--------|-------------------|
| `commitSpecDocument` | feature, document ID, expected content hash | Commitment; automatic ratification when no eligible ratifier |
| `ratifySpecDocument` | document ID, committed revision, verdict, optional comment | Ratification state; rejects self-ratification and stale revisions |

| ID | Requirement |
|----|-------------|
| S5.4-TR1 | Commit requires the claim and current passing validation; the claim retires on commit |
| S5.4-TR2 | Ratification binds document ID, content hash and revision. Earlier approvals never satisfy a new revision; a rejected revision cannot be ratified by another revision's verdicts |
| S5.4-TR3 | With no eligible ratifier, commitment records automatic ratification with `source: no-eligible-ratifier`. Multiplayer eligibility comes from the roster |
| S5.4-TR4 | Legacy events lacking identity or revision remain history and cannot approve a new bundle |

### S5.5 Legacy selector compatibility

| ID | Requirement |
|----|-------------|
| S5.5-TR1 | Existing type-oriented fields remain as adapters over the document APIs |
| S5.5-TR2 | `specType` resolves through the inventory: `prd` → product, `rfc` → tech, child RFC aliases via persisted paths |
| S5.5-TR3 | Zero matches return `DOCUMENT_NOT_FOUND`; several return `AMBIGUOUS_DOCUMENT` with candidate paths. Never pick the first |

## Acceptance Criteria

| ID | Observable behaviour | Section |
|----|---------------------|---------|
| AC7 | Every document has a Define tab, including architecture and overviews; suggestions stay on the right file | S5.1, S5.2 |
| AC12 | An old Define save or suggestion cannot overwrite an external edit; the UI names the conflicting document | S5.3 |
| AC15 | Commit with no eligible ratifier records automatic ratification | S5.4 |

Retained: contributor cannot resolve; claimant can accept or dismiss; blank reasons
rejected; codebase dimension checks still run.

## Testing

Integration across both state layouts: import, external edit between fetch and save,
claims, suggestions, validation, commit, shared-overview contention from two features,
ratification revision checks. Extend `dashboard/frontend/e2e/ceremony-ownership.spec.ts`
with the course layout. Visual tests for tabs, labels, stale suggestions and conflict
display.

## Key Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Shared overviews | One global claim | Copy per feature; omit | Comments allowed, ownership coherent |
| Storage key | SHA-256 of path | Type; UUID | Safe directory names, inspectable ID kept inside |
| Approval scope | Exact revision | Document | Edits need fresh approval |

## File Impact

| File | Change |
|---|---|
| `dashboard/backend/schema.py`, `dashboard/backend/resolvers/ceremony_*.py` | Document APIs and adapters |
| `dashboard/backend/ceremony_generator.py`, `ceremony_validator.py` | Exact-document generation and validation |
| `dashboard/backend/spec_registry.py`, `spec_watcher.py` | Reconciliation |
| New `lib/cmd/spec_documents.sh`; `lib/cmd/ceremony.sh`, `lib/events.sh` | CLI event identities |
| `dashboard/frontend/components/ceremony/CeremonyLayout.tsx`, suggestion/ownership/commit components, `dashboard/frontend/lib/graphql/queries/ceremony*.ts` | Tabs, labels, mutations, conflict display |

## Out of Scope

Generating tech drafts on import; history transfer across renames.
