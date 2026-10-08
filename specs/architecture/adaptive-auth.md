# Architecture: adaptive authorisation (F2)

Owner: Dana K., principal architect. Version 0.7.
Builds on: [platform architecture](overview.md).
Product: [F2.1 high-value purchases](../product/adaptive-auth/1-high-value-traveller.md),
[F2.2 card testing](../product/adaptive-auth/2-card-testing.md).

Replaces risk rules v1 with a scored decision that can approve, step up, hold or decline.
Covers both F2 product specs, because both change the same decision point.

## Components

| Component | New or changed | Responsibility |
|---|---|---|
| Authorisation gateway | Changed | Calls the scoring service instead of risk rules v1; acts on its decision |
| Scoring service | New | Scores each authorisation 0 to 1000 with the fraud model |
| Decision policy | New | Maps a score to approve, step-up, hold or decline using thresholds |
| Step-up adapter | New | Starts a 3-D Secure challenge through our provider and reports the result |
| Review queue | New | Stores held payments for analysts; analysts approve or decline |
| Risk narrative | New | Writes a short plain-English explanation of each scored payment for analysts, using a hosted large language model |

## Decision flow

```
 gateway ──► scoring service ──► risk narrative ──► decision policy
                (score)          (explanation)         │
                                                       ├── score < 300   approve
                                                       ├── 300 to 699    step-up
                                                       ├── 700 to 849    hold for review
                                                       └── 850 and over  decline
```

Thresholds are configuration, not code, so Risk can tune them without a deploy.

## Scoring service

- Gradient-boosted model trained offline by data science on twelve months of labelled
  authorisations. Delivered as a serialised model file and loaded at start-up.
- The service is stateless. Every feature the model needs is derived from the
  authorisation request itself: amount, currency, BIN, issuer country, IP country,
  merchant category, time of day.
- Output is a single integer score. Higher means more likely fraudulent.
- Runs in process with the gateway, as the v1 rules do, so it fits inside the 40 ms risk
  budget.

## Step-up

- 3-D Secure 2 through our provider's REST API. The provider handles the issuer
  conversation and returns authenticated, not authenticated, or unavailable.
- The checkout renders the provider's challenge in a frame; see the
  [design](../design/adaptive-auth/1-checkout-challenge.md).
- An authenticated payment continues to the payments service as an approval.

## Review queue

- Held payments are authorised with the scheme and the capture is blocked until an
  analyst decides. Postgres table, same cluster as the ledger.
- Analysts work the queue in the operations console; see the
  [design](../design/adaptive-auth/2-risk-review-queue.md).

## Risk narrative

- Prompted with the scored request, the score and the merchant's descriptor, the model
  returns two or three sentences an analyst can read at a glance.
- Hosted model from our approved AI vendor, called over HTTPS.

## Rollout

Shadow mode first: the new decision is computed and logged alongside the v1 rules for
two weeks, and v1 still decides. Then the new decision takes over, merchant by merchant.

## Open questions

1. Model refresh cadence, once data science has a retraining pipeline.
