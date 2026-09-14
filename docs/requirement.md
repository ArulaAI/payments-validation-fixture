# Requirement: card payment capture and refund

Owner: payments-product. Version 1.3.

## Scope

A merchant authorises a card payment, captures all or part of it, and may refund against
a capture. Scheme fees are deducted at capture.

## Behaviour

1. An authorisation reserves an amount against a card. It does not move money.
2. A capture may be for the full authorised amount or for part of it. The sum of captures
   must never exceed the authorised amount.
3. A scheme fee of 1.49% is deducted from each captured amount. The merchant receives the
   remainder.
4. A refund returns money against a named capture. A refund must never return more than
   was captured.
5. An uncaptured authorisation may be voided. A captured payment may not.
6. Every movement of money is recorded as a balanced double-entry pair.
7. No full card number is stored anywhere outside the token vault.

## Retries

Authorise and capture accept an idempotency key. A repeated request carrying a key that
has already been seen returns the original result and does not create a second record.

## Settlement

A capture may be paid out in instalments. The instalments must sum exactly to the captured
amount.

## Out of scope for version 1.3

Chargebacks, multi-currency, partial reversals of a refund, and network tokenisation.
