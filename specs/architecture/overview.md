# Architecture: card payments platform

> See [product vision](../product/overview.md) for product context.

Owner: Dana K., principal architect. Version 3.2.

How the platform is built today, the constraints every feature works within, and the
decisions that are not reopened per feature. Feature architectures in this folder build
on this one.

## Context

The platform authorises card payments for our merchants, records every movement of money
in a double-entry ledger and keeps card numbers in a token vault. The card scheme waits
up to 2 seconds for our answer, and merchants need it in the same response, so the
authorisation path is synchronous and held to a tight latency budget.

```
 merchant checkout
        │  POST /authorise  (PAN, expiry, amount, merchantId, ipCountry)
        ▼
 ┌──────────────────────┐     ┌───────────────┐
 │ authorisation gateway│────►│ risk rules v1 │   in-process, src/risk/rules.ts
 │ src/payments/gateway │◄────│               │
 └──────────┬───────────┘     └───────────────┘
            │ approve
            ▼
 ┌──────────────────────┐     ┌───────────────┐
 │ payments service     │────►│ token vault   │   src/vault.ts
 │ src/payments/service │     └───────────────┘
 │                      │────► ledger          src/domain/ledger.ts
 └──────────┬───────────┘
            ▼
     card scheme
```

## Responsibilities

| Component | Responsible for | Not responsible for |
|---|---|---|
| Authorisation gateway | Parsing the request, every risk decision, and the response to the merchant | Moving money |
| Risk rules | Deciding whether an authorisation proceeds | Storing anything |
| Payments service | Authorise, capture, refund and void; posting every movement to the ledger | Declining on risk |
| Token vault | Holding card data and issuing tokens | Anything downstream of tokenisation |
| Ledger | Balanced double-entry records of every movement | Business rules |

## Boundaries

- The gateway decides; the payments service never declines on risk. One place audits
  every risk decision.
- The full card number exists only between the gateway's request parser and the vault.
- Third-party services receive tokens or nothing.
- Merchant details (name, category, notification contact) belong to the existing merchant
  directory service, looked up by `merchantId`; the platform holds only the id.

## Components and Dependencies

| Component | Depends on |
|---|---|
| Authorisation gateway | Risk rules (in process), payments service |
| Payments service | Token vault, ledger, primary Postgres cluster |
| Ledger | Primary Postgres cluster |
| Merchant notifications | The existing merchant notification service, which sends settlement emails |

- The gateway runs as six identical replicas behind a load balancer. Requests are spread
  round-robin, so consecutive requests for one card rarely reach the same replica.
- Replicas hold no shared state. Anything a replica remembers lives in its own memory and
  is lost on restart or redeploy. We redeploy most days. A feature that needs a follow-up
  call to reach the same replica must use sticky routing on its own key, agreed with
  platform engineering.
- Adaptive authorisation (F2) is the first such feature: step-up completion calls are
  routed by challenge id, and a pending challenge holds the card number in that replica's
  memory for at most 10 minutes. See [adaptive authorisation](adaptive-auth.md).
- The payments service and the ledger are backed by the primary Postgres cluster.
- There is no shared cache or stream platform in production today. Platform engineering
  offers managed Redis and Kafka on request, with roughly a four-week lead time.

## Data and Trust Boundaries

- The full card number exists only between the gateway's request parser and the vault.
  Everything after the vault carries a token, the BIN and the last four.
  The one exception is a pending F2 step-up challenge, held in the memory of one gateway
  replica for at most 10 minutes and never persisted, logged or sent anywhere.
- Logs, spans and webhooks carry masked cards only (`411111******1111`).
- Nothing containing card or cardholder data leaves our network. Third-party services
  receive tokens or nothing.
- Merchant input (descriptors and other merchant-controlled text) is untrusted.

## Failure Modes

| Failure | Behaviour |
|---|---|
| A replica restarts or is redeployed | Its in-memory state is lost; requests continue on the other replicas |
| The primary Postgres cluster is slow | Authorisations that need the payments service slow down; the gateway still answers within the scheme's 2-second limit or declines |
| The risk decision exceeds its budget | The gateway's end-to-end budget is at risk; features must design for the 40 ms risk budget |

## Quality Constraints

The card scheme waits up to 2 seconds for our answer. We hold ourselves to far less.

| Hop | p99 budget |
|---|---|
| Gateway, end to end | 150 ms |
| Risk decision | 40 ms |
| Payments service and vault | 60 ms |
| Network and serialisation | 50 ms |

## Decisions

Decisions not reopened per feature.

| Decision | Choice | Alternatives Considered | Rationale |
|----------|--------|------------------------|-----------|
| Language and dependencies | TypeScript on Node 22, no runtime dependencies in the payments path | Frameworks and libraries in the payments path | Every dependency is a third party in the payments path; see the repository rules |
| Money | Integer minor units for all money | Decimal or floating point | Rounding defects are invisible until settlement |
| Where risk is decided | The gateway decides; the payments service never declines on risk | Risk checks in each service | One place to audit every risk decision |
| Risk decision timing | Synchronous inside the authorisation call | Asynchronous decision after the response | Merchants need an answer in the same response |

## Verification

- The latency budget is checked by replaying fixture traffic through the gateway and
  asserting the p99 per hop.
- Card data handling is checked by the repository's PAN scan and by the invariant that no
  stored record holds a card number outside the vault.
- Every feature architecture states how it verifies the constraints above.
