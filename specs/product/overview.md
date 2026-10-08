# Product Vision

Owner: payments-product.

## Core Mission

A card payments gateway that merchants trust with every authorisation: money is never
created or lost, card data never leaks, and genuine customers get through.

## Key Decisions

- Correctness of money movement comes before features. Every movement is a balanced pair.
- Card numbers live only in the vault.
- The gateway decides what it forwards. Issuers and the scheme decide whether to approve.

## Personas

### Persona 1: Merchant

Takes card payments online and in store. Wants high approval rates, low fees and no
surprises at reconciliation.

### Persona 2: Finance and risk operations

Reconciles the ledger, investigates disputes and fraud, and answers to auditors.

## Priority Levels (MoSCoW)

### Must Have

- Authorise, capture, refund and void (F1)
- Stop card testing before it reaches issuers (F2)

### Should Have

- Fewer false declines on genuine unusual purchases (F2)

### Could Have

- Merchant-specific risk settings

### Won't Have (V1)

- Persistence, multi-currency, chargebacks, machine-learned scoring

## Anti-Goals

- Approving more by weakening card data protection.
- Deciding risk policy in code. Risk sets policy. Engineering implements it.
