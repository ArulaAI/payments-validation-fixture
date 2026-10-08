# Threat model: Authorisation risk check

Owner: payments-architecture with payments-risk. Version 0.1, draft for engineering.
Related: [`specs/architecture/authorisation-risk.md`](authorisation-risk.md)

STRIDE over the risk check and the data it keeps. Each threat names the control the
technical spec must carry and how a test would show the control holds.

## Attacker

A card tester with a list of stolen card numbers and a script, increasingly written and
tuned with GenAI. They probe the merchant checkout, read every response, and adjust volume,
timing, amounts and expiry dates to stay under whatever limits they can infer. They cannot
see inside the gateway.

## Threats

| ID | STRIDE | Threat | Control | Verifiable by |
|----|--------|--------|---------|---------------|
| T1 | Spoofing | The tester rotates the merchant identity they present so that RP1 never trips | Merchant identity comes from the caller context, never the request body | A test that a request body naming another merchant changes nothing |
| T2 | Tampering | Thresholds are changed to weaken the rules | Policy values change only through the recorded change path, only for a caller with the payments-risk role, and only to valid values | Tests that a change is recorded with old value, new value, who and when, and that changes from other callers or with invalid values are rejected |
| T3 | Repudiation | Nobody can show why an attempt was declined | A decision record for every attempt, with the policy values in force | The domain rule "every attempt has exactly one decision record", asserted after generated sequences |
| T4 | Information disclosure | A card number reaches a decision record, a log or telemetry | Risk assessment receives a card reference, never the card number | `NO_PAN_AT_REST` extended to decision records, plus the existing PAN scan |
| T5 | Information disclosure | Responses reveal which rule fired or how close the attempt came, so the tester learns the limits | Merchants receive a reason category only. No rule ID, count, threshold or remaining allowance | A test that challenge and decline responses contain only an approved reason category |
| T6 | Denial of service | A testing flood grows rule state, vault entries or idempotency entries without limit | Every new store has a limit or retention period. Declined attempts store nothing they do not need | Tests that every store stays within its limit during a burst inside one window and over a long run |
| T7 | Elevation of privilege | Code outside risk assessment changes a decision after it is made | Payments acts on the decision and cannot alter it | A test that the recorded decision matches the outcome returned |
| T8 | Spoofing | A verification result is replayed or reused for a different purchase | A verification result is accepted once, for the challenged attempt's card, merchant and amount, within its time limit | Tests for reuse, mismatch and expiry |

## Out of scope

Attacks on the merchant's 3DS flow, the scheme and the issuer. Attacks that need access
inside the gateway process.
