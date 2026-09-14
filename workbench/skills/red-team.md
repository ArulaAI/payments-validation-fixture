# Skill: red-team

Covers F5. Evidence type: opinion.

## Contract

Prompted to break the change, not to assess it. The asymmetric objective is the point: an
agent asked "is this correct" tends to agree, and an agent asked "make this fail" does not
get the same reward from agreement.

## Prompt

> Here is a diff to a card payments service. Your goal is to find an input, ordering or
> retry pattern that makes it behave wrongly. Produce a concrete sequence of calls and
> the state you expect afterwards. If you cannot construct one, say so plainly.

## Reading its output

A proposed sequence is a hypothesis, never a finding. Run it. If it reproduces, the
counterexample is the evidence and the agent was only the route to it.
