# Product vision: card payments platform

Owner: head of payments product. Version 2.0.

## What we are

A card payments platform for UK merchants selling online. Merchants send us an
authorisation, we decide whether to forward it to the card scheme, and we move the money
through capture, refund and settlement. Our customers are the merchants. Their customers,
the cardholders, never sign up with us, but every decision we make lands on them at
checkout.

## Who we serve

| Persona | What they need from us |
|---|---|
| Online merchant | Every genuine sale completed, every fraudulent one stopped, and as few chargebacks as possible |
| Cardholder | To pay without friction, and to be asked rather than refused when something looks unusual |
| Fraud operations analyst | To see why a payment was stopped and to act on it quickly |
| Finance operator | A ledger that reconciles to the scheme to the penny |

## Principles

1. **Ask before refusing.** When a genuine customer might be behind an unusual payment,
   we ask them to confirm through their bank before we consider declining.
2. **Every decision has a reason we can state.** Whoever stopped a payment, rule or model,
   we can tell the merchant and our own analysts why in plain words.
3. **Fraud is a network problem.** We see traffic across thousands of merchants, and we
   use that view. A single merchant cannot see a stolen card being tried at fifty shops.
4. **Card data stays in the vault.** No full card number is stored, logged or sent to a
   third party outside the tokenisation boundary.

## Anti-goals

- Declining a payment outright when a step-up challenge could have settled the question.
- A decision to decline that rests on a model output nobody can explain.
- Anything in the authorisation path that can push a payment past the scheme response
  window.
- Sending cardholder or card data to an external AI service.

## Features

| ID | Feature | Spec |
|---|---|---|
| F1 | Card payment capture and refund | [payments.md](payments.md) |
| F2 | Adaptive authorisation | [adaptive-auth/](adaptive-auth/) |
