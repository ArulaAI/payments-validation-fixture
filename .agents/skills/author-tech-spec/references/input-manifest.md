# Adaptive-authorisation input manifest

All paths below are relative to the fixture repository root. This manifest covers
the whole F2 adaptive-authorisation feature: F2.1 traveller purchases and F2.2 card
testing. Confirm file contents when loading; these roles do not certify correctness
or approval of the documents.

## Required product inputs

| Path | Role |
| --- | --- |
| `specs/product/overview.md` | Product principles and scope boundaries |
| `specs/product/adaptive-auth/1-high-value-traveller.md` | F2.1 intended behaviour, stories, success criteria, and open policy questions |
| `specs/product/adaptive-auth/2-card-testing.md` | F2.2 intended behaviour, stories, success criteria, and open policy questions |

## Required design and architecture inputs

| Path | Role |
| --- | --- |
| `specs/design/adaptive-auth/1-checkout-challenge.md` | Cardholder challenge interaction and result states |
| `specs/design/adaptive-auth/2-risk-review-queue.md` | Held-payment review, attack review, and analyst actions |
| `specs/architecture/overview.md` | Production platform, available infrastructure, performance and trust boundaries |
| `specs/architecture/adaptive-auth.md` | Feature responsibilities, shared dependencies, failure behaviour and constraints |

## Required implementation baseline

| Path | Role |
| --- | --- |
| `specs/tech/payments.md` | Existing payments contracts and invariants |
| `src/payments/gateway.ts` | Current authorisation entry point and result contract |
| `src/payments/service.ts` | Current payment lifecycle and service boundary |
| `src/risk/rules.ts` | Existing decisions and attempt-counting behaviour |
| `test/gateway.test.ts` | Characterisation scenarios; reading assertions is not evidence of a test run |
| `test/fixtures/traffic.ts` | Traveller and cross-merchant traffic inputs |

Follow imports and relevant tests when a question needs further evidence. Examples
include `src/risk/issuers.ts`, `src/vault.ts`, `src/obs/index.ts`,
`src/domain/invariants.ts`, and `test/service.test.ts`. Record additional files in
the session input table. Distinguish the in-memory fixture from the production
architecture; a fixture implementation does not establish production capability.

## Existing proposals and intended outputs

| Path | Role |
| --- | --- |
| `specs/tech/adaptive-auth/1-high-value-traveller.md` | Existing draft and intended F2.1 output; includes contracts shared with F2.2 |
| `specs/tech/adaptive-auth/2-card-testing.md` | Existing draft and intended F2.2 output; depends on F2.1 |

Read these before proposing edits so existing work is preserved. Their statements
are proposals until supported by the inputs or an accepted decision. Their presence
does not resolve upstream disagreements. Preserve this fixture's numbered filenames
and relative links; do not rename them to a generic template naming example.

## Optional historical evidence

If `.speed/logs/validation.log` exists, read it as a historical report. Record its
date and whether its cited findings still apply to the current input revisions.
Keep the raw report intact. Its presence or reported status does not establish a
fresh successful `speed validate` run. If missing, continue and record that absence.

Do not load facilitator gap maps, speaker scripts, or `corpus/` answer keys as
authoring evidence. Discover additional learner specifications through explicit
links in the required inputs and record why each is relevant.

## Installed RFC contract

Locate `speed` with `command -v speed`, follow filesystem symlinks, and inspect that
installation's bootstrap and configuration to find the template directory Audit
uses. Read its `rfc.md` and `agents/audit.md`; record their resolved paths, content
digests, and the installation revision or version when available. An installation
path supplied by the learner may be used after verifying these same files.

Load the installed template directly. This skill does not ship an RFC copy. If SPEED
or its template is unavailable, explain the missing resource before promising an
Audit-compatible document; continue reading the other available inputs.
