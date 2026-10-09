# Product vision: SPEED spec-driven delivery

Owner: SPEED product. Version 0.1 (draft, 9 October 2026).
Related: [course requirements](../../docs/course-301-1e-speed-requirements.md).
Source: RFC "Feature Spec Bundles and Architecture Support" (`speed-feature-spec-bundles.md`).

## What we are

SPEED turns specification documents into a planned, verified and executed change. A team
writes product, architecture, design and tech specs. SPEED audits them, plans a dependency
graph of tasks, runs coding agents against it, reviews the result and integrates it. Define
is the dashboard ceremony where owners and contributors agree the documents before any of
that starts.

Until now SPEED assumed one document of each kind per feature, matched by filename. Real
features, and the 301.1E course, have several product and design documents, a feature
architecture, shared platform overviews, and a tech spec the audit should help split. The
features below make the feature, not the file, the unit SPEED works on.

## Who we serve

| Persona | What they need from us |
|---|---|
| Engineer | To see every document a feature depends on, comment on any of them, and write numbered RFCs the audit has sized |
| Product manager | To own the product documents and accept or dismiss suggestions on them with a stated reason |
| Designer | To own the design documents and see when the tech spec contradicts a flow |
| Architect | To own architecture documents written to a known template, and see when an RFC crosses a boundary |
| Course facilitator and learner | To run Define, Audit and Plan on the adaptive authorisation layout, and play every role from one browser |
| Project operator | Plans that state exactly which inputs they used, and refuse to run when those inputs change |

## Principles

1. **The files are the source of truth.** The dashboard edits files. It never holds a
   version that silently overrides one changed on disk.
2. **Every stage sees the same feature.** Audit, Plan, Define, Verify and Run resolve the
   same documents through one resolver.
3. **A document is its path.** Not its type, basename or heading. Two files called `1.md`
   are two documents.
4. **Recommend, do not rewrite.** The audit names the RFC files a feature should be split
   into. The engineer writes them.
5. **Nothing required is dropped silently.** If the mandatory inputs do not fit, planning
   stops and says which inputs are largest.
6. **A simulated role is labelled as one.** A decision made under a demonstration persona
   never passes for an independent human review.

## Anti-goals

- Grouping documents into a feature by a loose filename prefix.
- Planning on part of a feature without saying so.
- Reusing a cached audit, Guardian or Architect result after one of its inputs changed.
- Persona switching that leaks into another browser or job, or acts as authentication.
- Changing audit gate policy or sizing units as a side effect of this work.

## Features

Each feature has one product spec and one tech spec with the same filename. Each feature
section below lists its subfeatures. A subfeature's section number is the same here, in the
product spec and in the tech spec.

| ID | Feature | Product spec | Tech spec | Course requirement |
|---|---|---|---|---|
| S1 | Spec bundle discovery | [speed-spec-bundle-discovery.md](speed-spec-bundle-discovery.md) | [speed-spec-bundle-discovery.md](../tech/speed-spec-bundle-discovery.md) | 1, 2 |
| S2 | Feature audit | [speed-feature-audit.md](speed-feature-audit.md) | [speed-feature-audit.md](../tech/speed-feature-audit.md) | 3, 4 |
| S3 | Whole-feature planning | [speed-feature-planning.md](speed-feature-planning.md) | [speed-feature-planning.md](../tech/speed-feature-planning.md) | 5 |
| S4 | Versioned plans and traceability | [speed-plan-versioning.md](speed-plan-versioning.md) | [speed-plan-versioning.md](../tech/speed-plan-versioning.md) | Downstream correctness |
| S5 | Define multi-document collaboration | [speed-define-documents.md](speed-define-documents.md) | [speed-define-documents.md](../tech/speed-define-documents.md) | 6 |
| S6 | Define demonstration personas | [speed-define-personas.md](speed-define-personas.md) | [speed-define-personas.md](../tech/speed-define-personas.md) | 7 |
| S7 | Migration and compatibility | [speed-spec-migration.md](speed-spec-migration.md) | [speed-spec-migration.md](../tech/speed-spec-migration.md) | Compatibility |

## S1: Spec bundle discovery

One feature is a bundle: every product, architecture, design and tech file under
`specs/<kind>/<feature>/`, plus the shared overviews as context. One resolver builds it for
every stage.
Product spec: [speed-spec-bundle-discovery.md](speed-spec-bundle-discovery.md) ·
Tech spec: [speed-spec-bundle-discovery.md](../tech/speed-spec-bundle-discovery.md)

### S1.1 Architecture spec type

`specs/architecture/` is a recognised spec kind with its own template (Context,
Responsibilities, Boundaries, Components and Dependencies, Data and Trust Boundaries,
Failure Modes, Quality Constraints, Decisions, Verification). A project can supply its own.
Tech: [S1.1](../tech/speed-spec-bundle-discovery.md#s11-architecture-spec-type)

### S1.2 Nested feature membership

`specs/tech/adaptive-auth/1.md` belongs to `adaptive-auth`, never to a feature called `1`.
Several files of one kind are allowed. Flat files and declared child RFCs still work.
Tech: [S1.2](../tech/speed-spec-bundle-discovery.md#s12-nested-feature-membership)

### S1.3 Document identity and ordering

A document is its project-relative path. Documents are ordered by kind, then numerically,
so `2.md` comes before `10.md`. Contradictory or unsafe inputs are rejected.
Tech: [S1.3](../tech/speed-spec-bundle-discovery.md#s13-document-identity-and-ordering)

### S1.4 Shared overview context

The product vision and platform architecture overview join every feature as constraints,
not as extra requirements.
Tech: [S1.4](../tech/speed-spec-bundle-discovery.md#s14-shared-overview-context)

### S1.5 Nested document scaffolding

`speed new TYPE NAME --file 1.md` creates a document inside the feature folder, and
`speed new architecture NAME` scaffolds an architecture file. Nothing is overwritten.
Tech: [S1.5](../tech/speed-spec-bundle-discovery.md#s15-nested-document-scaffolding)

## S2: Feature audit

`speed audit --feature NAME` audits every document in the feature, checks them against each
other, sizes the feature and recommends how to split the tech spec.
Product spec: [speed-feature-audit.md](speed-feature-audit.md) ·
Tech spec: [speed-feature-audit.md](../tech/speed-feature-audit.md)

### S2.1 Feature audit command

One command audits every member and both overviews, with exit codes that never let a
crash pass for success.
Tech: [S2.1](../tech/speed-feature-audit.md#s21-feature-audit-command)

### S2.2 Per-document and aggregate reports

One report per document and one for the feature. Every finding names its document and
section.
Tech: [S2.2](../tech/speed-feature-audit.md#s22-per-document-and-aggregate-reports)

### S2.3 Cross-document consistency checks

Product against design and tech, tech against architecture boundaries, design against tech
interfaces, RFC against RFC. Each finding shows both locations.
Tech: [S2.3](../tech/speed-feature-audit.md#s23-cross-document-consistency-checks)

### S2.4 Feature sizing

One developer-day estimate for the whole feature, which works before any tech spec exists.
Tech: [S2.4](../tech/speed-feature-audit.md#s24-feature-sizing)

### S2.5 RFC split recommendations

Unused numbered RFC paths with source sections, dependencies and testable output. The audit
never writes them.
Tech: [S2.5](../tech/speed-feature-audit.md#s25-rfc-split-recommendations)

## S3: Whole-feature planning

`speed plan` plans the whole feature into one task graph and publishes it only when every
gate passes.
Product spec: [speed-feature-planning.md](speed-feature-planning.md) ·
Tech spec: [speed-feature-planning.md](../tech/speed-feature-planning.md)

### S3.1 Full-bundle planning inputs

The Guardian and Architect see every document, labelled by path. Required documents never
compete with optional related specs.
Tech: [S3.1](../tech/speed-feature-planning.md#s31-full-bundle-planning-inputs)

### S3.2 Mandatory input budget

If the required documents do not fit the configured budget, planning stops and names the
largest inputs.
Tech: [S3.2](../tech/speed-feature-planning.md#s32-mandatory-input-budget)

### S3.3 One feature DAG and phased planning

Numbered RFCs produce one graph. Large features plan in phases without losing a section.
Tech: [S3.3](../tech/speed-feature-planning.md#s33-one-feature-dag-and-phased-planning)

### S3.4 Planning gates and staged publication

Audit, coverage and decomposition gates run on every new plan. A failure leaves the
previous plan in place.
Tech: [S3.4](../tech/speed-feature-planning.md#s34-planning-gates-and-staged-publication)

### S3.5 Stage caching

Audit, Guardian and Architect results are reused only while their inputs are unchanged.
`--force` reruns everything.
Tech: [S3.5](../tech/speed-feature-planning.md#s35-stage-caching)

## S4: Versioned plans and traceability

A plan records exactly what it was built from. Downstream stages check those inputs and
trace each requirement to its exact document.
Product spec: [speed-plan-versioning.md](speed-plan-versioning.md) ·
Tech spec: [speed-plan-versioning.md](../tech/speed-plan-versioning.md)

### S4.1 Spec manifest and input snapshots

Each plan stores the paths and hashes of its inputs and a local copy of their bytes.
Tech: [S4.1](../tech/speed-plan-versioning.md#s41-spec-manifest-and-input-snapshots)

### S4.2 Exact task references

Tasks reference a document path, a section ID and optionally a requirement ID.
Tech: [S4.2](../tech/speed-plan-versioning.md#s42-exact-task-references)

### S4.3 Traceability in Verify

A matching heading in another file never counts as coverage.
Tech: [S4.3](../tech/speed-plan-versioning.md#s43-traceability-in-verify)

### S4.4 Downstream freshness checks

Run, Review, Coherence and Integrate refuse a plan whose specs changed, and say which
changed.
Tech: [S4.4](../tech/speed-plan-versioning.md#s44-downstream-freshness-checks)

### S4.5 Spec alignment and test catalog compatibility

Spec alignment covers every document and rebuilds when one changes. Eval finds the right
test catalog.
Tech: [S4.5](../tech/speed-plan-versioning.md#s45-spec-alignment-and-test-catalog-compatibility)

## S5: Define multi-document collaboration

Define works on every document in the feature, one tab each, and never loses an edit made
outside it.
Product spec: [speed-define-documents.md](speed-define-documents.md) ·
Tech spec: [speed-define-documents.md](../tech/speed-define-documents.md)

### S5.1 Document tabs and import

One tab per document, including architecture and the shared overviews. Import never
rewrites or generates text.
Tech: [S5.1](../tech/speed-define-documents.md#s51-document-tabs-and-import)

### S5.2 Per-document claims and suggestions

Claims and suggestions attach to an exact document and section. Shared overviews have one
owner.
Tech: [S5.2](../tech/speed-define-documents.md#s52-per-document-claims-and-suggestions)

### S5.3 External edit protection

A save or suggestion made against an old version is refused, and both versions are shown.
Tech: [S5.3](../tech/speed-define-documents.md#s53-external-edit-protection)

### S5.4 Revision-bound commitment and ratification

An approval applies only to the revision it approved.
Tech: [S5.4](../tech/speed-define-documents.md#s54-revision-bound-commitment-and-ratification)

### S5.5 Legacy selector compatibility

Existing `prd`, `design` and `rfc` clients keep working and are never matched to the wrong
document.
Tech: [S5.5](../tech/speed-define-documents.md#s55-legacy-selector-compatibility)

## S6: Define demonstration personas

In an opt-in local mode, one browser switches between engineer, PM, designer and architect
without restarting the dashboard.
Product spec: [speed-define-personas.md](speed-define-personas.md) ·
Tech spec: [speed-define-personas.md](../tech/speed-define-personas.md)

### S6.1 Persona configuration

Personas are configured, opt-in, and allowed only on loopback.
Tech: [S6.1](../tech/speed-define-personas.md#s61-persona-configuration)

### S6.2 Session-scoped persona switching

A switch changes only the selecting browser session. It does not change what that session
may do.
Tech: [S6.2](../tech/speed-define-personas.md#s62-session-scoped-persona-switching)

### S6.3 Captured actor propagation

Every mutation and background job keeps the actor it started with.
Tech: [S6.3](../tech/speed-define-personas.md#s63-captured-actor-propagation)

### S6.4 Demo decision provenance

Demo decisions record the persona and the real operator, and personas never become
ratifiers.
Tech: [S6.4](../tech/speed-define-personas.md#s64-demo-decision-provenance)

## S7: Migration and compatibility

Existing projects keep working, and Define records move to per-document storage without
losing history.
Product spec: [speed-spec-migration.md](speed-spec-migration.md) ·
Tech spec: [speed-spec-migration.md](../tech/speed-spec-migration.md)

### S7.1 Legacy plan compatibility

Saved plans are read as they were made. Flat specs, defect plans and test catalogs are
unchanged.
Tech: [S7.1](../tech/speed-spec-migration.md#s71-legacy-plan-compatibility)

### S7.2 Define record migration

An explicit command previews, then migrates claims, suggestions and ratifications with full
history.
Tech: [S7.2](../tech/speed-spec-migration.md#s72-define-record-migration)

### S7.3 Delivery order and rollback

The features ship in dependency order, and every step can be backed out.
Tech: [S7.3](../tech/speed-spec-migration.md#s73-delivery-order-and-rollback)

## Subfeature map

| Overview section | Product spec section | Tech spec section | Acceptance criteria |
|---|---|---|---|
| S1.1 to S1.5 | speed-spec-bundle-discovery S1.1 to S1.5 | speed-spec-bundle-discovery S1.1 to S1.5 | AC1, AC2, AC14 |
| S2.1 to S2.5 | speed-feature-audit S2.1 to S2.5 | speed-feature-audit S2.1 to S2.5 | AC3, AC4, AC5 |
| S3.1 to S3.5 | speed-feature-planning S3.1 to S3.5 | speed-feature-planning S3.1 to S3.5 | AC6, AC11 |
| S4.1 to S4.5 | speed-plan-versioning S4.1 to S4.5 | speed-plan-versioning S4.1 to S4.5 | AC10, AC13 |
| S5.1 to S5.5 | speed-define-documents S5.1 to S5.5 | speed-define-documents S5.1 to S5.5 | AC7, AC12, AC15 |
| S6.1 to S6.4 | speed-define-personas S6.1 to S6.4 | speed-define-personas S6.1 to S6.4 | AC8, AC9, AC15 |
| S7.1 to S7.3 | speed-spec-migration S7.1 to S7.3 | speed-spec-migration S7.1 to S7.3 | AC14 |
