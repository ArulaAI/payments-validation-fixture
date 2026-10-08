# Compliance: Authorisation risk check

Owner: payments-risk for the risk policy, legal-compliance for the regulatory position.
Version 0.1, draft for engineering.
Related: [`specs/product/authorisation-risk.md`](../product/authorisation-risk.md)

> **Fictional training input.** Every policy, value and regulatory position in this
> document was written for this exercise. None of it is guidance from a real risk, legal or
> compliance function.

Engineering builds within this document and does not change it. If a rule here cannot be
met, raise it with the owner. Numbers marked *scenario value* were set for this exercise.

## Risk policy

Risk owns these rules and their values. Values change through change control, below.

| ID | Rule | Outcome | Values (*scenario values*) |
|----|------|---------|----------------------------|
| RP1 | A merchant has seen attempts for more than the allowed number of distinct cards within a rolling window | Decline | 20 distinct cards, 60 seconds |
| RP2 | One card has more than the allowed number of attempts within a rolling window, whatever the expiry date presented | Decline | 5 attempts, 10 minutes |
| RP3 | The amount is at or above the threshold, the card's issuing country differs from the merchant's country, and this gateway has approved no authorisation for the card within the look-back period | Challenge | GBP 1,000.00, 90 days |

How the rules combine:

- Decline wins over challenge, and challenge wins over approve.
- Every attempt counts toward RP1 and RP2, including attempts that end in decline or
  challenge. Failed attempts are the strongest testing signal.
- A retry carrying an idempotency key already seen is not a new attempt and does not count.
- "The same card" means the same card number. Testers vary the expiry date, so a match on
  expiry is not required.
- Amounts are in GBP. The gateway supports no other currency in this version.

## Verification results

A challenged cardholder verifies through the merchant's 3DS provider. The merchant then
submits a new authorisation carrying the verification result. RP3 does not challenge that
authorisation when the result:

- names the challenged attempt it answers
- matches that attempt's card, merchant and amount
- arrives within 15 minutes of the challenge (*scenario value*)
- has not been used before

Any other verification result is ignored, and the rules apply as normal. RP1 and RP2 apply
to every authorisation, verified or not.

## When the check cannot decide

If the risk check fails or cannot reach a decision, the attempt is declined with reason
`not_approved` and recorded with rule `FALLBACK`. The gateway never approves an attempt the
risk check did not assess.

## Change control

- A threshold change is approved by two people from payments-risk before it is applied.
  The approval happens outside the gateway.
- Only a caller with the payments-risk role may apply a change. The gateway rejects a change
  from any other caller.
- Every value must be a positive whole number. The gateway rejects a change containing any
  other value and keeps the values in force.
- The gateway records each applied change: the old value, the new value, who applied it and
  when.
- Attempts are judged against the values in force when they arrive.

## Card data

- PCI DSS v4.0.1 applies in full. No full card number may appear outside the vault, in any
  record, log, webhook, telemetry or error. This includes decision records.
- Recognising "the same card" without storing its number needs a stable reference. Under
  PCI DSS requirement 3.5.1.1, a hash used for this must be a keyed cryptographic hash of
  the entire card number, with the key managed like any other cryptographic key. An
  unkeyed hash of a card number counts as the card number.
- The BIN and last four digits may be kept, as they are today.
- In this version the HMAC key is generated when the service starts and is never stored or
  logged. Card references therefore do not survive a restart, which is accepted for this
  version.

## Decision records

- Every decision is recorded: outcome, the rule that decided it, the values that rule saw,
  the policy values in force, and when.
- A fraud analyst must be able to explain any single decision from its record alone.
- Records are internal. What a merchant may be told is a separate, open question (PRD OQ3).
- Records are kept in memory for the life of the process, up to a limit engineering sets
  and states in the technical spec. The oldest records are removed first.

## Regulatory position

The exercise's regulatory position. Engineering does not reinterpret it.

| Framework | Why it is relevant | Current position | Owner |
|-----------|--------------------|------------------|-------|
| PCI DSS v4.0.1 | The gateway handles card numbers | Applies. See card data above | legal-compliance |
| PSD2 strong customer authentication (UK and EEA) | Challenge leads to cardholder authentication | The merchant and issuer run authentication through 3DS. The gateway only returns challenge | legal-compliance |
| UK and EU GDPR, Article 22 | Decline is an automated decision about a person | Not expected to meet the "legal or similarly significant effect" bar, because the cardholder can retry or verify. Each decision must still be explainable on request | legal-compliance |
| EU AI Act | Automated decisions in financial services | Rules in this version are not an AI system. The Act also excludes fraud detection from its high-risk creditworthiness category. Revisit before any model is introduced | legal-compliance |
| Model risk management | Decisions that move money | Fixed rule thresholds are not treated as a model. A learned model would need independent validation before use | payments-risk |

## Open questions

- Retention of decision records once persistence exists. Not needed for this version.
  Owner: legal-compliance.
