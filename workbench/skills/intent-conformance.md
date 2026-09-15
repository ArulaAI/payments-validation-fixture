# Skill: intent-conformance

Covers F6. Evidence type: opinion.

## Contract

Diff the implementation against the stated requirement and report behaviour present in
the code but absent from the requirement.

## Prompt

> Compare this diff to `specs/product/requirement.md`. List behaviour the code implements that the
> requirement does not ask for, and requirement clauses the code does not implement. Do
> not judge whether the extra behaviour is good.

## Reading its output

Unauthorised behaviour is not automatically a defect. It may be harmless, or it may be
policy nobody decided, which makes it F8 rather than F6. The scope-guard hook decides the
mechanical part faster and cheaper. Run the hook first, per Rule 2.
