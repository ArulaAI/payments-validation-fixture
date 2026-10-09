# S3: Whole-feature planning

Owner: SPEED product. Version 0.1 (draft, 9 October 2026).
Related: [overview](speed-overview.md#s3-whole-feature-planning),
[tech spec](../tech/speed-feature-planning.md),
[feature audit](speed-feature-audit.md), [plan versioning](speed-plan-versioning.md)

## Problem

`speed plan` loads one tech file plus at most one derived product file and one derived
design file. Other documents reach the Architect only if related-spec scoring picks them
within its token budget. On the adaptive authorisation feature, the architecture and the
second product and design files can disappear from planning with nobody told. Two numbered
RFCs planned separately would produce two conflicting task namespaces. The audit is not
cached, so every rerun repeats it, and a failed gate can leave no plan at all.

## Users

- An engineer who needs every document to shape one task graph.
- A learner who reruns Plan after edits and needs to see which stages reran.
- An operator who needs a failed plan never to destroy the working one.

## User Stories

### S3.1 Full-bundle planning inputs

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S3.1-ST1 | As an engineer, I want Plan to see every document in the feature | Given `speed plan --feature adaptive-auth` or `speed plan specs/tech/adaptive-auth/1.md`, Then the Guardian and Architect receive every member and both overviews, labelled by path | Must |
| S3.1-ST2 | As an engineer, I want required documents never scored out | Given related-spec scoring, Then members and overviews are always included and only external specs compete | Must |
| S3.1-ST3 | As an engineer, I want Plan to tell me when there is no tech spec yet | Given an empty tech folder, Then Plan exits 3 naming the feature and the expected directory | Must |

### S3.2 Mandatory input budget

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S3.2-ST1 | As an operator, I want planning to stop rather than drop a required document | Given mandatory inputs above `mandatory_spec_budget`, Then Plan stops before any Architect call and names the largest inputs | Must |
| S3.2-ST2 | As an operator, I want to set the budget for my provider | Given `[context] mandatory_spec_budget`, Then it is used; nonpositive values are rejected | Should |

### S3.3 One feature DAG and phased planning

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S3.3-ST1 | As an engineer, I want one task graph for the feature | Given `1.md` and `2.md`, Then one DAG with unique task IDs is produced | Must |
| S3.3-ST2 | As an engineer, I want large features planned in phases without losing a section | Given an estimate of 11, Then planning phases unless `--single-pass`; every required section appears in a phase | Must |

### S3.4 Planning gates and staged publication

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S3.4-ST1 | As an engineer, I want the audit to gate every plan | Given a structural audit failure, Then Plan stops | Must |
| S3.4-ST2 | As an engineer, I want missing requirements caught on every plan | Given a single-pass or phased plan, Then the coverage verifier runs | Must |
| S3.4-ST3 | As an operator, I want a failed plan to leave the previous one in place | Given a failed gate, Then the previously published plan is unchanged | Must |

### S3.5 Stage caching

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S3.5-ST1 | As a learner, I want unchanged stages reused and shown | Given no input change, Then audit, Guardian and Architect results are reused and each hit prints its input hash | Should |
| S3.5-ST2 | As an engineer, I want any input change to rerun the stages that used it | Given a changed member, overview, related input, template, learning, prompt or model, Then every stage that used it reruns | Must |
| S3.5-ST3 | As an engineer, I want to force a full rerun | Given `--force`, Then no stage cache is used | Must |

## User Flows

**Plan the feature.** The learner runs `speed plan --feature adaptive-auth`. Every document
is audited as a gate. The Guardian reads the product vision, learnings and full feature and
approves. The estimate is above 10, so the Architect plans in phases. The coverage verifier
adds missing tasks after confirmation. The decomposition gate passes. One DAG is published.

**Replan after an edit.** The learner edits one design file and reruns. Cache hits print
for the unchanged audits; the edited document's audit, the Guardian and the Architect
rerun.

## Success Criteria

- [ ] Every member and both overviews reach the Architect; one DAG results (AC6)
- [ ] Each input change invalidates exactly the stages that used it; `--force` bypasses all
      (AC11)
- [ ] A failed gate leaves the previous plan published

## Scope

### In Scope

- Full-bundle Guardian and Architect inputs
- Mandatory input budget
- One DAG with document-scoped phase splitting
- Audit, coverage and decomposition gates with staged publication
- Audit caching and complete Guardian and Architect cache keys

### Out of Scope (and why)

- **Changing decomposition thresholds or algorithm.** The course teaches them as they are.
- **Discovering the provider's context limit.** Operators configure the budget.

## RFC Decomposition

One tech spec, [speed-feature-planning.md](../tech/speed-feature-planning.md), sections
S3.1 to S3.5. Depends on [S1](speed-spec-bundle-discovery.md) and
[S2](speed-feature-audit.md).

## Dependencies

- [S1](speed-spec-bundle-discovery.md), [S2](speed-feature-audit.md).
- Code index, related-spec scoring, coverage verifier and decomposition gate.

## Security & Controls

- Architect and coverage verifier stay tool-disabled; Guardian stays read-only.
- Failures are never cached as approval.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Required specs dropped to fit context | High | Mandatory budget stops planning (S3.2) |
| Stale cached decisions | High | Complete cache keys (S3.5) |
| Larger prompts cost more | Medium | Explicit size diagnostic |

## Open Questions

1. Is the 60,000-token default right for the provider the course uses?
