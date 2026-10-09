# S6: Define demonstration personas

Owner: SPEED product. Version 0.1 (draft, 9 October 2026).
Related: [overview](speed-overview.md#s6-define-demonstration-personas),
[tech spec](../tech/speed-define-personas.md),
[Define documents](speed-define-documents.md)

## Problem

The Define actor comes from `SPEED_ACTOR`, then git `user.name`, and is cached for the life
of the dashboard process. In 301.1E one learner acts as engineer to leave suggestions, then
as PM, designer and architect to claim documents and resolve them. Today that needs a
restart for every switch, and changing a process-wide actor would change it for every
other learner using the same dashboard.

## Users

- A learner playing every role from one browser.
- A facilitator running a shared classroom dashboard.
- Anyone reading the decision record afterwards.

## User Stories

### S6.1 Persona configuration

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S6.1-ST1 | As a facilitator, I want to configure engineer, PM, designer and architect personas | Given `[define.demo] enabled = true` and four personas, Then all four are offered | Must |
| S6.1-ST2 | As an operator, I want demo mode off unless I turn it on, and only locally | Given no config, or a non-loopback binding, Then no persona selector exists | Must |

### S6.2 Session-scoped persona switching

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S6.2-ST1 | As a learner, I want to switch persona without restarting | Given demo mode, When I select each persona in turn, Then the effective actor changes immediately | Must |
| S6.2-ST2 | As a learner, I want switching to change who I am, not what I may do | Given the PM persona, When I resolve on an unclaimed product file, Then I am refused until the PM claims it | Must |
| S6.2-ST3 | As a facilitator, I want one learner's switch not to affect another | Given two browsers, When one switches, Then the other's identity is unchanged | Must |

### S6.3 Captured actor propagation

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S6.3-ST1 | As a learner, I want a job I started to finish as me | Given a generation job started as engineer, When I switch to PM, Then the job's records show engineer | Must |

### S6.4 Demo decision provenance

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| S6.4-ST1 | As a reviewer of the record, I want demo decisions labelled | Given a demo decision, Then it records `actor_mode: demo`, the persona, the effective actor and the real operator | Must |
| S6.4-ST2 | As a reviewer, I want personas never to count as independent ratifiers | Given personas, Then none becomes an eligible ratifier | Must |

## User Flows

**Play every role.** The learner opens Define in demo mode as engineer and leaves
suggestions on the product, design and architecture files. They select PM, claim
`2-card-testing.md` and dismiss one suggestion with a reason. They select architect, claim
`architecture/adaptive-auth.md` and accept one. They commit each document; automatic
ratification records the demo provenance.

**Shared classroom.** Two learners use the same dashboard. One switches to PM. The other
stays engineer, and their in-flight save completes as engineer.

## Success Criteria

- [ ] One browser switches among four personas without restart (AC8)
- [ ] A second browser and in-flight mutations are unaffected (AC9)
- [ ] Switching creates no eligible ratifiers or independent approvals (AC15)

## Scope

### In Scope

- Opt-in persona configuration
- Session-scoped selection with an opaque cookie
- Explicit actor capture in resolvers, jobs and events
- Demo provenance on decisions

### Out of Scope (and why)

- **General login and role-based access.** Personas are a course demonstration, not
  authentication.
- **Non-loopback deployment without a same-origin proxy.** The cookie transport needs it.

## RFC Decomposition

One tech spec, [speed-define-personas.md](../tech/speed-define-personas.md), sections S6.1
to S6.4. Ships last; depends on [S5](speed-define-documents.md).

## Dependencies

- [S5 Define multi-document collaboration](speed-define-documents.md).
- Per-request actors must reach every protected resolver before the UI is enabled.

## Security & Controls

- GraphQL accepts persona IDs, never client-supplied emails.
- Request origin is validated; cookies are HttpOnly and SameSite.
- Process environment and global actor caches are never changed.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Persona leaks across sessions or jobs | High | Session scope and captured actors (S6.2, S6.3) |
| Simulated approval read as real | High | Provenance; no ratifier enrolment (S6.4) |

## Open Questions

None.
