# Persistent authoring records

Create these four Markdown records under `.speed/authoring/adaptive-auth/` on the
first invoked authoring session. Fill fields from observed inputs and the engineer's
answers. Replace bracketed instructions before saving; write `not yet assessed` or
`awaiting owner` when that is the actual status. Tables may start with headers only.

Resume by reading existing records. Use stable question and decision IDs such as
`Q001` and `D001`; preserve IDs when reordering the queue. Record amendments instead
of deleting rejected or superseded decisions. Save after each meaningful answer or
accepted edit and at handoff. These are local authoring notes, not approvals recorded
by SPEED's commitment system.

## session.md

```markdown
# Adaptive-authorisation authoring session

Feature: adaptive-auth
Course: 301-1E
Status: [understanding, interviewing, drafting, reviewing, or handoff]
Engineer: [provided identity, or unspecified]
Updated: [timestamp]
Next action: [specific question or investigation]
Confirmed understanding: [engineer's confirmation reference, or awaiting confirmation]

## Inputs

| Path | Role | Content digest | Loaded at | Availability |
| --- | --- | --- | --- | --- |

## RFC contract

SPEED executable: [resolved executable]
Installation revision or version: [observed value, or unavailable]
Template: [resolved path and content digest]
Audit instructions: [resolved path and content digest]
Heading tree: [H2 and H3 headings extracted from the loaded template, in order]
Optional-section convention: [observed rule and chosen compatibility convention]

## Working drafts

| Path | Content digest at last read | Last accepted edit | Pending proposal |
| --- | --- | --- | --- |

## Checks performed

| Time | Command or review | Result | Evidence |
| --- | --- | --- | --- |

## Changes to inputs

| Path | Previous digest | Current digest | Affected questions and decisions | Review status |
| --- | --- | --- | --- | --- |
```

## questions.md

```markdown
# Adaptive-authorisation questionnaire

## Roadmap

[Short list of consequential decisions in the current proposed order.]

## Question queue

| ID | Question | Status | Owner | Parent question | Blocking phase | RFC destinations |
| --- | --- | --- | --- | --- | --- | --- |

## Question details

### [question ID]: [question]

Evidence: [paths and sections or lines]
Why it matters: [stories and constraints affected]
Options and tradeoffs: [proposals, or existing consistent source answer]
Answer: [engineer's answer, source-derived answer, or awaiting answer]
Provenance: [engineer decision, source-derived, or unresolved]
Decision: [decision ID if one exists]
Follow-up: [next question, investigation, or owner request]
```

## decisions.md

```markdown
# Adaptive-authorisation decision record

## Decisions

| ID | Question | Decision | Provenance | Owner | Rationale | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Draft application

| Decision | RFC path | Exact template headings | Proposal | Engineer acceptance | Applied edit evidence |
| --- | --- | --- | --- | --- | --- |

## Pending owners

| Question | Owner | What it blocks | Resolution path | Current status |
| --- | --- | --- | --- | --- |

## Amendments

| Previous decision | Replacement decision | Reason | Engineer confirmation | Affected text |
| --- | --- | --- | --- | --- |
```

## coverage.md

```markdown
# Adaptive-authorisation coverage review

## Requirements and constraints

| Source requirement or constraint | Source reference | RFC path and section | Observable acceptance criterion | Supporting decision | Status |
| --- | --- | --- | --- | --- | --- |

## Template coverage

| RFC path | Exact template heading | Source-derived content | Supporting decisions | Remaining questions | Content status |
| --- | --- | --- | --- | --- | --- |

## Shared contracts

| Contract | Producer and section | Consumer and section | Match or discrepancy | Evidence |
| --- | --- | --- | --- | --- |

## Review findings

| Finding | Evidence | Owner | Question or proposed edit | Resolution |
| --- | --- | --- | --- | --- |
```

Populate requirement coverage from both PRDs, user flows, success criteria, relevant
design states, and architecture constraints. Populate template coverage from every
loaded H2 and H3 for each RFC. Distinguish `unassessed`, `drafted`, `reviewed`, and
`blocked` coverage; none of these means that implementation tests passed.
