# S5: Define multi-document collaboration

Owner: SPEED product. Version 0.1 (draft, 9 October 2026).
Related: [overview](speed-overview.md#s5-define-multi-document-collaboration),
[tech spec](../tech/speed-define-documents.md),
[personas](speed-define-personas.md), [migration](speed-spec-migration.md)

## Problem

Define has fixed tabs: `prd`, `design`, `rfc` and `rfc-<slug>`. There is no tab for an
architecture document, a second product file or a shared overview. Claims and suggestions
are keyed by type, so two documents of one type cannot be told apart. A Define save can
overwrite a file changed on disk, and an approval is not tied to the revision it approved.

In 301.1E, engineers send suggestions to the PM, designer and architect on seven documents.
Define must show every one of them and keep each suggestion on the right file.

## Users

- An engineer who comments on any document.
- A PM, designer or architect who claims a document and resolves suggestions on it.
- A ratifier who approves a specific revision.

## User Stories

### S5.1 Document tabs and import

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S5.1-ST1 | As an engineer, I want a Define tab for every document | Given the course layout, Then every document has a tab with kind and path, and overviews are labelled shared | Must |
| S5.1-ST2 | As an engineer, I want the tabs to follow the files | Given a file added, removed or changed, Then the tabs reconcile and unsaved edits are kept | Should |
| S5.1-ST3 | As an owner, I want import never to change my file or grant ownership | Given a file is imported, Then no text is generated or rewritten and nobody is given a claim | Must |

### S5.2 Per-document claims and suggestions

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S5.2-ST1 | As an engineer, I want my suggestion to stay on the file and section I left it on | Given two files with the same heading, When I suggest on one, Then it attaches only to that file's section | Must |
| S5.2-ST2 | As an owner, I want to accept or dismiss suggestions on my claimed document, with a reason to dismiss | Given I hold the claim, When I dismiss, Then a nonblank reason is required; Given I do not, Then I cannot resolve | Must |
| S5.2-ST3 | As an owner of a shared overview, I want one claim across features | Given the overview is claimed from one feature, Then a claim from another feature contends normally; suggestions keep their origin feature | Must |
| S5.2-ST4 | As an engineer, I want a suggestion on a changed section marked stale | Given the section changed, Then the suggestion is outdated and cannot be applied | Must |

### S5.3 External edit protection

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S5.3-ST1 | As an owner, I want an edit made outside the dashboard protected | Given the file changed on disk after I loaded it, When I save or accept a suggestion, Then it is refused and both versions are shown | Must |

### S5.4 Revision-bound commitment and ratification

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S5.4-ST1 | As an owner, I want an approval to apply only to the revision it approved | Given a ratified revision is edited, Then the old ratification does not unlock planning | Must |
| S5.4-ST2 | As a solo owner, I want commitment to auto-ratify when nobody else can | Given no eligible ratifier, When I commit, Then automatic ratification is recorded with `source: no-eligible-ratifier` | Must |

### S5.5 Legacy selector compatibility

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S5.5-ST1 | As an existing client, I want `prd`, `design` and `rfc` selectors to keep working | Given a one-document-per-type feature, Then type selectors resolve as before | Must |
| S5.5-ST2 | As any user, I want an ambiguous selector refused, not guessed | Given two product files and selector `prd`, Then the API returns `AMBIGUOUS_DOCUMENT` with both paths | Must |

## User Flows

**Suggest and resolve.** The engineer opens Define and leaves a suggestion on a section of
`product/adaptive-auth/2-card-testing.md`. The PM claims that file, sees the suggestion and
dismisses it with a reason. The architect claims `architecture/adaptive-auth.md` and
accepts a suggestion, which applies only if that section is unchanged.

**External edit.** The PM has a file open. The file changes on disk. The PM saves. Define
refuses, shows both versions, and blocks saving until the PM resolves the conflict.

## Success Criteria

- [ ] Every document has a tab; suggestions stay on the right file (AC7)
- [ ] No Define save or suggestion overwrites an external edit (AC12)
- [ ] Commit with no eligible ratifier auto-ratifies (AC15a)

## Scope

### In Scope

- Document-oriented GraphQL APIs and tabs
- Per-document claims, suggestions, validation, commitment and ratification
- External edit conflict handling
- Compatibility adapters for type selectors

### Out of Scope (and why)

- **Generating missing tech drafts on import.** The engineer writes the RFCs.
- **History transfer across renames.** Later work.

## RFC Decomposition

One tech spec, [speed-define-documents.md](../tech/speed-define-documents.md), sections
S5.1 to S5.5. Depends on [S1](speed-spec-bundle-discovery.md).

## Dependencies

- [S1 spec bundle discovery](speed-spec-bundle-discovery.md).
- Existing Define claim, suggestion, validation and commitment infrastructure.
- Existing records move with [S7](speed-spec-migration.md).

## Security & Controls

- Writes need the claim, the expected hash, the document lock and atomic replacement.
- Self-ratification and stale-revision ratification are rejected.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Define overwrites an external edit | High | Expected-hash saves (S5.3) |
| Shared overview gets two owners | High | One global claim (S5.2) |
| Old approval unlocks a new revision | High | Revision binding (S5.4) |

## Open Questions

None.
