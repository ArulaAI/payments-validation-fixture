# Architecture: card payments platform

Owner: Dana K., principal architect. Version 3.1.

How the platform is built today, the constraints every feature works within, and the
decisions that are not reopened per feature. Feature architectures in this folder build
on this one.

## System context

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

## Runtime

- The gateway runs as six identical replicas behind a load balancer. Requests are spread
  round-robin, so consecutive requests for one card rarely reach the same replica.
- Replicas hold no shared state. Anything a replica remembers lives in its own memory and
  is lost on restart or redeploy. We redeploy most days.
- The payments service and the ledger are backed by the primary Postgres cluster.
- There is no shared cache or stream platform in production today. Platform engineering
  offers managed Redis and Kafka on request, with roughly a four-week lead time.

## Latency budget

The card scheme waits up to 2 seconds for our answer. We hold ourselves to far less.

| Hop | p99 budget |
|---|---|
| Gateway, end to end | 150 ms |
| Risk decision | 40 ms |
| Payments service and vault | 60 ms |
| Network and serialisation | 50 ms |

## Data handling

- The full card number exists only between the gateway's request parser and the vault.
  Everything after the vault carries a token, the BIN and the last four.
- Logs, spans and webhooks carry masked cards only (`411111******1111`).
- Nothing containing card or cardholder data leaves our network. Third-party services
  receive tokens or nothing.

## Decisions not reopened per feature

| Decision | Reason |
|---|---|
| TypeScript on Node 22, no runtime dependencies in the payments path | Every dependency is a third party in the payments path; see the repository rules |
| Integer minor units for all money | Rounding defects are invisible until settlement |
| The gateway decides; the payments service never declines on risk | One place to audit every risk decision |
| Synchronous risk decision inside the authorisation call | Merchants need an answer in the same response |
