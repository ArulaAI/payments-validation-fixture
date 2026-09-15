# Skill: requirements-coverage

Narrows F8. Covers nothing. Evidence type: silence.

## Contract

Produces two sets worth reading:

1. requirement clauses with no implementing code
2. behaviour in code that no clause authorises

The second set is where unspecified policy hides.

## Prompt

> Map every clause in `specs/product/requirement.md` to the code that implements it. Then list
> behaviour in the diff that no clause authorises. Do not decide whether any gap matters.

## Why this covers nothing

It narrows the surface a human must read. It does not decide whether a missing policy
matters, and it cannot, because deciding that means choosing a policy. A tool that chose
one would be inventing a requirement. F8 stays reserved, and the residual is escalated to
a named role rather than absorbed.
