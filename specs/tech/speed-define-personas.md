# RFC S6: Define demonstration personas

> See [product spec](../product/speed-define-personas.md)
> See [product overview](../product/speed-overview.md#s6-define-demonstration-personas)

Owner: SPEED engineering. Version 0.1 (draft, 9 October 2026). Status: proposed.
Depends on: [S5](speed-define-documents.md).

## Overview

New `dashboard/backend/actor_context.py` resolves the effective actor per request, from the
browser session's selected persona or the existing environment and git chain. The captured
actor is passed explicitly everywhere a decision is made.

```toml
[define.demo]
enabled = true

[[define.demo.personas]]
id = "pm"
name = "Product manager"
email = "pm@example.test"
role = "PM"          # engineer | PM | designer | architect
```

## Subfeatures

| Section | Product spec | Overview |
|---|---|---|
| S6.1 | [S6.1 stories](../product/speed-define-personas.md#s61-persona-configuration) | [S6.1](../product/speed-overview.md#s61-persona-configuration) |
| S6.2 | [S6.2 stories](../product/speed-define-personas.md#s62-session-scoped-persona-switching) | [S6.2](../product/speed-overview.md#s62-session-scoped-persona-switching) |
| S6.3 | [S6.3 stories](../product/speed-define-personas.md#s63-captured-actor-propagation) | [S6.3](../product/speed-overview.md#s63-captured-actor-propagation) |
| S6.4 | [S6.4 stories](../product/speed-define-personas.md#s64-demo-decision-provenance) | [S6.4](../product/speed-overview.md#s64-demo-decision-provenance) |

### S6.1 Persona configuration

| ID | Requirement |
|----|-------------|
| S6.1-TR1 | `[define.demo] enabled` defaults to false. `[[define.demo.personas]]` entries have `id`, `name`, `email`, `role` |
| S6.1-TR2 | IDs and emails are unique and stable; role is one of engineer, PM, designer, architect |
| S6.1-TR3 | Demo mode is allowed only when the dashboard is bound to loopback. Frontend and API share the loopback hostname; different hostnames need a same-origin proxy |
| S6.1-TR4 | Removing the config removes the selector and restores operator identity |

### S6.2 Session-scoped persona switching

| Field | Inputs | Result and errors |
|-------|--------|-------------------|
| `demoPersonas` | none | Configured personas when enabled |
| `selectDemoPersona` | `personaId` | Effective actor for the calling session; `INVALID_PERSONA`, `DEMO_DISABLED` |
| `resetDemoPersona` | none | Clears selection to the operator |
| `currentActor` | none | Adds mode, role and real operator identity |

| ID | Requirement |
|----|-------------|
| S6.2-TR1 | Selection is held in server memory, keyed by an opaque, HttpOnly, SameSite cookie. Server restart resets to the operator; a cookie for a vanished session is ignored |
| S6.2-TR2 | GraphQL HTTP requests send credentials; subscriptions reconnect after a switch and use the same session transport |
| S6.2-TR3 | Switching never transfers claims, approves records, enrols ratifiers or resets lifecycle state. Permissions follow claims and actor emails |
| S6.2-TR4 | GraphQL accepts persona IDs only, never actor emails. Request origin is validated |

### S6.3 Captured actor propagation

| ID | Requirement |
|----|-------------|
| S6.3-TR1 | The GraphQL request context resolves the actor once per request from the session or the environment and git chain |
| S6.3-TR2 | The captured actor is passed explicitly to authorization, mutations, background generation and event creation |
| S6.3-TR3 | Background jobs receive an immutable captured actor and never look up the session again |
| S6.3-TR4 | Selecting a persona never changes process environment variables or a global actor cache |

### S6.4 Demo decision provenance

| ID | Requirement |
|----|-------------|
| S6.4-TR1 | Decision records made in demo mode include `actor_mode: demo`, persona ID, effective actor and real operator |
| S6.4-TR2 | Persona configuration never enrols eligible ratifiers or manufactures roster members |
| S6.4-TR3 | Solo commitment keeps `source: no-eligible-ratifier`; multiplayer eligibility comes from the roster |
| S6.4-TR4 | The active persona is always visible in the UI |

## Acceptance Criteria

| ID | Observable behaviour | Section |
|----|---------------------|---------|
| AC8 | One browser switches among four personas, suggests as engineer, and resolves as claiming owner without restart | S6.1, S6.2 |
| AC9 | A second browser's identity and concurrent in-flight mutations are unaffected by the first switching | S6.2, S6.3 |
| AC15 | Persona switching creates no eligible ratifiers or independent approvals | S6.4 |

## Testing

Concurrent browser sessions with a delayed mutation and a delayed generation job: assert
captured identities and an unchanged operator. Server restart and stale cookie. Disabled
mode and non-loopback binding return `DEMO_DISABLED`. End-to-end in
`dashboard/frontend/e2e/ceremony-ownership.spec.ts`: switch to all four personas, claim,
resolve, commit, inspect provenance, with a second browser running.

## Key Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Persona switching | Opt-in, session-scoped, with provenance | Global env mutation; role labels only | No cross-session contamination; real identity change for ownership lessons |

## File Impact

| File | Change |
|---|---|
| New `dashboard/backend/actor_context.py` | Per-request actor resolution |
| `dashboard/backend/app.py`, `schema.py`, `resolvers/ceremony_types.py` | Session cookie, persona fields, captured actor |
| `dashboard/frontend/components/ceremony/CeremonyLayout.tsx`, `dashboard/frontend/lib/graphql/queries/ceremony*.ts` | Persona selector, credentials, subscription reconnect |

## Out of Scope

General login and RBAC; non-loopback demo deployments without a same-origin proxy.
