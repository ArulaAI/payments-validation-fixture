# Architecture: adaptive authorisation (F2)

> See [F2.1 high-value purchases](../product/adaptive-auth/1-high-value-traveller.md) and [F2.2 card testing](../product/adaptive-auth/2-card-testing.md) for product context.
> See [platform architecture](overview.md).

Owner: Dana K., principal architect. Version 0.8.

## Context

Risk rules v1 decline payments on two hard-coded rules and tell nobody why. They decline
genuine travellers and let card testing spread across merchants through. This architecture
replaces them with a scored decision that can approve, step up, hold or decline, and adds
cross-merchant card-testing detection. It covers both F2 product specs, because both
change the same decision point in the authorisation gateway.

The forces that shape it come from the [platform architecture](overview.md): the gateway
runs as six stateless replicas, the risk decision has a 40 ms p99 budget inside a 150 ms
gateway budget, and card data never leaves our network.

## Responsibilities

| Component | New or changed | Responsible for | Not responsible for |
|---|---|---|---|
| Authorisation gateway | Changed | Calling the block check, scorer and decision policy, and acting on the result | Scoring, or deciding thresholds |
| Scoring service | New | Scoring each authorisation 0 to 1000 and returning the top 1 to 3 reason codes | Any state across requests; card-testing detection |
| Decision policy | New | Mapping a score to approve, step-up, hold or decline using configured thresholds | Explaining a decision in prose |
| Step-up adapter | New | Starting a 3-D Secure challenge through our provider and reporting the result | Deciding what a failed challenge means |
| Review queue | New | Holding payments for analysts, who approve or decline them | Automated decisions |
| Card-testing detector | New (F2.2) | Recording small attempts, flagging attacks across merchants, publishing blocks | Scoring single payments |
| Risk narrative | New | Writing a short plain-English summary of a held payment for analysts | Any automated decision; anything on the authorisation path |

## Boundaries

- The gateway decides. The payments service never declines on risk, as the platform
  architecture requires; holding a payment blocks its capture but is not a decline.
- The scoring service is stateless. Cross-request knowledge lives only in the card-testing
  detector, which the gateway consults through an in-memory block list.
- The risk narrative is outside the authorisation path. It runs asynchronously after a
  payment is held and its output never feeds an automated decision.
- The step-up provider is the only external party the authorisation path calls. As the
  platform requires of every third party, it receives the vault token, never the card
  number.

## Components and Dependencies

```
 gateway ──► block list ──► scoring service ──► decision policy
   │         (F2.2)          (score, reasons)        │
   │                                                 ├── score < 300   approve
   │                                                 ├── 300 to 699    step-up
   │                                                 ├── 700 to 849    hold for review
   │                                                 └── 850 and over  decline
   │
   └── a block match goes to step-up, not to scoring

 held payment ──► review queue ──► risk narrative (asynchronous, after the hold)
```

| Component | Depends on |
|---|---|
| Authorisation gateway | Block list, scoring service, decision policy, step-up adapter, review queue |
| Scoring service | Model file loaded at start-up; nothing at request time |
| Decision policy | Threshold configuration owned by Risk |
| Step-up adapter | Our 3-D Secure provider's REST API |
| Review queue | Primary Postgres cluster |
| Card-testing detector | Attempt and block tables on the primary Postgres cluster |
| Risk narrative | Hosted model from our approved AI vendor, called over HTTPS |

Thresholds are configuration, not code, so Risk can tune them without a deploy. The model
is gradient-boosted, trained offline by data science on twelve months of labelled
authorisations, delivered as a serialised model file and run in process with the gateway,
as the v1 rules are. Every feature it uses is derived from the authorisation request:
amount, currency, BIN, issuer country, IP country, merchant category and time of day.

## Data and Trust Boundaries

- The full card number never leaves the gateway and the vault, as the platform requires.
  The scorer, the decision policy and the detector see the BIN and last four at most;
  attempt records hold the card key `bin:last4` and are deleted after one hour.
- The risk narrative receives reason codes, the score, an amount band, the merchant
  category and the issuer and IP countries only. It never receives the request, the card
  number, BIN, token, last four or the merchant descriptor, which is merchant-controlled
  text.
- Merchant card-testing notifications carry no card data, not even masked.
- Cardholder-facing reasons come only from an allowlist reviewed by Legal. Analyst reasons
  are separate and never reach the merchant.

## Failure Modes

| Failure | Behaviour |
|---|---|
| Scorer throws or returns an out-of-range score | The decision falls back to hold, never to approve |
| Step-up provider unavailable or slow (F2.1 challenge) | The payment is held for review |
| Step-up on a card-testing block match not completed by the bank | The attempt is declined as card testing |
| Risk narrative unavailable | The held payment is shown without a narrative; analysts decide from the reasons |
| Shared attempt store unavailable | Authorisations continue, detection pauses, an alert is logged |
| A held payment with no analyst decision | It expires after 72 hours and is voided |

## Quality Constraints

- The risk decision, including the block check, scoring and policy, completes within
  40 ms p99. The block check alone adds under 1 ms p99.
- Nothing slower than an in-memory read or an in-process model call runs on the
  authorisation path.
- Card blocks expire; no block outlives its configured lifetime without a new attack.
- Every automated decline carries a reason the merchant can show the cardholder.
- Attempt records are retained for one hour.

## Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|----------|--------|------------------------|-----------|
| Where the scorer runs | In process with the gateway | A separate scoring service over the network | Only an in-process call fits the 40 ms budget |
| What the scorer returns | A score and the top 1 to 3 reason codes | A single integer score | One number cannot explain a decision; the product, checkout and queue all need a reason |
| Risk narrative placement | Asynchronous, only for held payments, reason codes and bands as input | Inline between scoring and policy, prompted with the scored request | A hosted model call cannot fit the 40 ms budget, the request holds the card number, and a model's output must not drive an automated decision |
| Card-testing state | Attempt and block tables on the primary Postgres cluster | Managed Redis or Kafka; per-replica memory | Postgres exists today; Redis and Kafka have a four-week lead time; per-replica memory misses attacks spread across replicas |
| Action on a card-testing block match | A 3-D Secure step-up; decline only when the bank cannot confirm | Decline outright | The product asks before refusing; a testing script cannot pass a bank challenge, and genuine shoppers caught by a block can still pay |
| Threshold ownership | Configuration owned by Risk | Constants in code | Risk tunes thresholds without a deploy |

## Verification

- Shadow mode first: the new decision is computed and logged alongside the v1 rules for
  two weeks while v1 still decides. Then the new decision takes over, merchant by merchant.
- Latency: the fixture traffic replay asserts the 40 ms p99 decision budget and the 1 ms
  block check (F2.1 AC8, F2.2 AC9).
- Data handling: a spy on the narrative client asserts zero calls during authorisation and
  no card data in its input (F2.1 AC8, AC9); notification payloads are validated and
  snapshotted (F2.2 AC5).
- Detection: the 3 October replay is flagged within 60 seconds and later attempts are
  challenged (F2.2 AC1, AC2).
- Open question: model refresh cadence, once data science has a retraining pipeline.
