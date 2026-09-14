# Skill: zero-context-review

Covers F5. Evidence type: opinion. Never proof.

## Contract

Start a session that has seen nothing else. Give it exactly two things:

1. the diff under review
2. `docs/requirement.md` for this change

Do not give it the authoring transcript, the author's summary, the plan, or any earlier
message in the session that produced the code. Independence is the configuration, not the
intention. A reviewer handed the author's rationale is an echo.

## Prompt

> You are reviewing a change to a card payments service. You have the diff and the
> requirement it claims to satisfy. You have not seen how it was written.
>
> For each concern, state the file and line, what behaviour you believe is wrong, and
> what would have to be true for you to be mistaken. Do not comment on style. If you
> cannot substantiate a concern from the diff alone, say so and stop.

## Reading its output

The last clause matters. A reviewer that cannot say what would make it wrong is
generating text, not evidence. One reviewer is a single opinion. Two genuinely
independent reviewers agreeing is corroboration, and corroboration raises a prior without
settling anything.

## How this fails

Context leaks. If your agent carries history between sessions, this skill produces a
confident, fluent, worthless review and nothing in the output will tell you. Verify the
input manifest, not the conclusion.
