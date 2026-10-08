# Docs

How this teaching repository is built and why. **Ours, not the learner's.**

Nothing here specifies the payments service. A change to the service is judged against
[`../specs/`](../specs/), never against these.

| File | Contains |
| --- | --- |
| [`00-analysis.md`](00-analysis.md) | Why the fixture is built from scratch, what it is modelled on, where it should live |
| [`01-prd.md`](01-prd.md) | Product requirements for the fixture: users, goals, non-goals, success criteria |
| [`02-requirements.md`](02-requirements.md) | FR, CR and NFR ids the build plan cites |
| [`03-manifest-schema.md`](03-manifest-schema.md) | Round manifest, evidence bundle and score report schemas |
| [`04-plan.md`](04-plan.md) | Build plan, every task citing a requirement id, and what is deliberately not done |
| [`course-301-1-define-execute-framework.md`](course-301-1-define-execute-framework.md) | Draft framework for 301.1: Define through Specify and Design, then Plan and Execute; SPEED controls and the handoff to 301.2 |
| [`course-301-1e-define-audit-plan.md`](course-301-1e-define-audit-plan.md) | 301.1E: Define, Audit, Plan on the adaptive authorisation feature. Replaces the Define and Plan half of 301.1 |
| [`Arula-301.1E-Define-Audit-Plan-Overview.pdf`](Arula-301.1E-Define-Audit-Plan-Overview.pdf) | Seven-page client overview of 301.1E, rendered from [`course-301-1e-overview.html`](course-301-1e-overview.html) with headless Chrome |
| [`course-301-1e-facilitator-gap-map.md`](course-301-1e-facilitator-gap-map.md) | Facilitator reference: where the provided adaptive authorisation documents fall short, who owns each gap, and what surfaces it |
| [`course-301-1e-speed-requirements.md`](course-301-1e-speed-requirements.md) | SPEED behaviour 301.1E is written against, what SPEED does today, and which course moment depends on each |

## The two requirement documents

Worth keeping straight, because both describe the payments service and only one of them is
the specification.

| | Audience | Role |
| --- | --- | --- |
| `specs/product/payments.md` | Learners | The requirement. Deliberately incomplete, and the incompleteness is Course 5 |
| `docs/02-requirements.md` | Us | The build spec. FR-6 explains why that incompleteness exists |

One holds the gap. The other records that we put it there on purpose.
