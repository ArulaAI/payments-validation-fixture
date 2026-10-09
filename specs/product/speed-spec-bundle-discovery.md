# S1: Spec bundle discovery

Owner: SPEED product. Version 0.1 (draft, 9 October 2026).
Related: [overview](speed-overview.md#s1-spec-bundle-discovery),
[tech spec](../tech/speed-spec-bundle-discovery.md),
[feature audit](speed-feature-audit.md), [planning](speed-feature-planning.md)

## Problem

SPEED decides which documents belong to a feature by string substitution on one path.
`speed audit` exits with "Unrecognized spec path" on any file in `specs/architecture/`.
`speed plan` finds sibling specs by replacing `/tech/` in the tech path, so it assumes one
file per kind with matching names. On the 301.1E layout, where adaptive authorisation has
two product files, two design files and a feature architecture, SPEED either rejects the
documents or silently loses most of them.

Audit, Plan and Define each have their own idea of which documents make up a feature. A
document one stage checks may be one another stage never sees.

## Users

- An engineer who needs every document for a feature found, in a predictable order.
- An architect whose documents must be recognised and checked against a template.
- A project lead with an existing architecture format.

## User Stories

### S1.1 Architecture spec type

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S1.1-ST1 | As an architect, I want architecture files audited against a known template, so that boundaries and quality constraints are written where the audit can check them | Given `specs/architecture/adaptive-auth.md`, When it is audited, Then it is checked against the architecture template instead of being rejected | Must |
| S1.1-ST2 | As a project lead, I want to use my own architecture template, so that our existing format is audited as written | Given `[specs] architecture_template` names a Markdown file inside the project, When an architecture file is audited, Then that template is used; outside the project or a symlink is rejected | Should |

### S1.2 Nested feature membership

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S1.2-ST1 | As an engineer, I want every file under `specs/<kind>/adaptive-auth/` treated as one feature, so that the second product file is not lost | Given the course layout, When the feature is resolved, Then one feature `adaptive-auth` contains every product, architecture, design and tech file; no feature `1` or `2` exists | Must |
| S1.2-ST2 | As an existing user, I want flat files and declared child RFCs to keep working | Given `specs/tech/payments.md` or a child RFC with `> Parent RFC:`, When resolved, Then membership is as before | Must |

### S1.3 Document identity and ordering

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S1.3-ST1 | As an engineer, I want two files with the same name treated as different documents | Given `product/adaptive-auth/1.md` and `tech/adaptive-auth/1.md`, Then each has its own identity | Must |
| S1.3-ST2 | As an engineer, I want documents in a predictable order | Given `1.md`, `2.md` and `10.md`, Then they are ordered by kind then numerically | Should |
| S1.3-ST3 | As an engineer, I want broken or contradictory inputs rejected clearly | Given a feature conflict, a dependency cycle, a symlink or a path outside the project, Then resolution exits 3 and names the problem | Must |

### S1.4 Shared overview context

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S1.4-ST1 | As an engineer, I want the product vision and platform architecture available to every feature, so that every stage judges the feature against them | Given both overviews exist, When any feature is resolved, Then both are shared context and are not counted as feature requirements | Must |
| S1.4-ST2 | As an engineer, I want a missing optional overview to warn, not fail | Given no `specs/architecture/overview.md`, Then resolution warns and continues | Should |

### S1.5 Nested document scaffolding

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S1.5-ST1 | As an engineer, I want to create numbered RFCs inside the feature folder | Given `speed new rfc adaptive-auth --file 1.md`, Then `specs/tech/adaptive-auth/1.md` is created with a link to each product file | Must |
| S1.5-ST2 | As an architect, I want to scaffold an architecture document | Given `speed new architecture NAME`, Then `specs/architecture/NAME.md` is created from the template | Must |
| S1.5-ST3 | As any author, I want scaffolding never to overwrite a file | Given the target exists, Then nothing is written and the command fails | Must |

## User Flows

**Resolving the course feature.** The engineer runs `speed audit --feature adaptive-auth`.
The resolver finds the two product files, the feature architecture and the two design
files, adds both overviews as shared context, and reports an empty tech folder. Every
later stage receives the same list.

**Starting the tech spec.** The engineer runs `speed new rfc adaptive-auth --file 1.md`.
The file is created in `specs/tech/adaptive-auth/` with links to both product files.

## Success Criteria

- [ ] The course layout resolves to one feature with seven documents (AC2)
- [ ] Architecture files are audited against their template (AC1)
- [ ] Existing flat-spec projects resolve exactly as before (AC14)
- [ ] 200 Markdown files (2 MiB) resolve and hash in under one second

## Scope

### In Scope

- Architecture spec kind and template, with project override
- Nested, mixed and flat membership; child RFC parentage
- Path identity, ordering and input validation
- Shared overview context
- Nested and architecture scaffolding

### Out of Scope (and why)

- **Carrying history across a rename.** A rename is a new document. Transfer is later
  work.
- **Grouping by filename prefix.** It is the guess this feature removes.

## RFC Decomposition

One tech spec, [speed-spec-bundle-discovery.md](../tech/speed-spec-bundle-discovery.md),
sections S1.1 to S1.5. It ships first; every other feature depends on it.

## Dependencies

- Feature namespaces and existing configuration (`lib/config.sh`, `lib/features.sh`).
- The 301.1E architecture documents must adopt the template headings or a project template.

## Security & Controls

- Symlinks, paths outside the project and external templates are rejected.
- Spec text is never interpolated into shell or Python source.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Repeated basenames resolve to the wrong document | High | Path identity (S1.3) |
| Existing architecture files fail the new template | Medium | Project override (S1.1) |

## Open Questions

None blocking. The template ownership question is resolved: built-in default with a
project override.
