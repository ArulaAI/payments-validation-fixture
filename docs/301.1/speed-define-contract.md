# speed define: inputs, output, and how audit and plan read them today

For the Workbench team extending `speed define`, and as the reference for what a
well-built technical specification contains. Based on SPEED `feat/301-latest` (`ea72f5f`).
The Workbench was not modified.

## The flow

```
upstream specs (not owned by engineering)      engineer-owned
product + design + architecture + compliance -> speed define -> specs/tech/authorisation-risk.md
                                                                 -> speed audit -> speed plan (+ speed verify) -> [speed run, optional]
```

## Inputs speed define receives

All at checkpoint `301.1-learner-start` of `payments-validation-fixture`:

| File | Owner |
|------|-------|
| `specs/product/overview.md` | Product |
| `specs/product/authorisation-risk.md` | Product |
| `specs/design/authorisation-risk.md` | Design |
| `specs/architecture/authorisation-risk.md` | Architecture |
| `specs/architecture/authorisation-risk-threat-model.md` | Architecture and risk |
| `specs/compliance/authorisation-risk.md` | Risk and legal |
| `src/`, `test/`, `specs/product/payments.md`, `specs/tech/payments.md` | The existing system the feature changes |

## Output speed define should produce

One file, `specs/tech/authorisation-risk.md`, in SPEED's RFC template (`templates/rfc.md`).
The filename matters: plan pairs `specs/tech/X.md` with `specs/product/X.md` and
`specs/design/X.md` by name.

### Header, so today's audit and plan see every input without workbench changes

```markdown
---
related:
  - specs/architecture/authorisation-risk.md
  - specs/architecture/authorisation-risk-threat-model.md
  - specs/compliance/authorisation-risk.md
---
# RFC: Authorisation risk check

> See [specs/product/authorisation-risk.md](../product/authorisation-risk.md) for product context.
> Depends on: [architecture](../architecture/authorisation-risk.md), [threat model](../architecture/authorisation-risk-threat-model.md), [compliance](../compliance/authorisation-risk.md).
```

Why each line is there:

- `related:` front matter gives each listed file the highest relevance boost (0.75) in
  `lib/context/related_specs.py`, so `speed plan --specs-dir specs` includes them.
- `> See [...]` must come first and must point at the product spec. `speed audit` loads
  only the first `> See` link (`lib/cmd/audit.sh`, cross-reference resolution).
- `> Depends on:` adds a second boost for the same files.

### Sections and what good looks like

The RFC template headings, with the content this feature needs. Omit sections marked n/a.

| Section | What good looks like |
|---------|----------------------|
| Basic Example | One authorise call that ends in challenge, showing the outcome and reason category returned |
| Data Model | The attempt view, decision, decision record and policy values, with types. No full card number anywhere |
| State Machine | Payment states after the change, including what a challenged or declined attempt leaves behind, if anything |
| API Surface | The changed `authorise()` request and result, and the call that changes policy values |
| Validation Rules | RP1 to RP3 as precise conditions, their precedence, and what counts as an attempt |
| Testing | One acceptance criterion per behaviour, each named and mapped to an upstream ID. Edge cases: window boundaries, retries, a flood of distinct cards. Invariants extended to decision records |
| Security & Controls | Each threat T1 to T8 mapped to the control and the test that checks it |
| Key Decisions | Engineering's choices with the alternatives considered, for example where the check sits in `authorise()` and how time reaches the rules |
| Drawbacks | What this makes harder to change later |
| Search / Query Strategy, Migration Strategy | n/a. In memory, no persistence |
| File Impact | Every file created or changed, checked against the repository |
| Dependencies | None new. The repository forbids them |
| Unresolved Questions | Every open upstream question carried forward with its owner, plus any assumption engineering had to make, labelled as an assumption |

Three things the template does not ask for, which make the spec trustworthy:

1. **Traceability.** A table mapping each criterion to its source: ST8 to ST14, RP1 to RP3,
   T1 to T8, and the architecture constraints and domain rules. Anything with no source is
   scope the inputs did not ask for.
2. **Codebase grounding.** What is reused, what changes and what is new, with file paths.
   For example, `tokenise()` issues a new token on every call, so it cannot recognise the
   same card.
3. **Upstream conflicts.** Where two inputs disagree, both positions and the owner who
   decides. Engineering does not pick one.

## What audit should catch in a weak tech spec

A spec that does any of these is not ready to plan:

- Contradicts a rule an input already states, such as the fail-closed behaviour in the
  compliance spec
- Answers an open question itself, such as a merchant exemption (OQ1), what a reason
  category reveals (OQ3) or how a challenge continues (OQ4). Those belong to the owners
  named in the product spec
- Recognises a card by its vault token, or by an unkeyed hash of the card number
- Has a criterion with no upstream source, or an upstream rule with no criterion
- Names a file or function that does not exist
- Adds a dependency

## Limits of today's SPEED

Identified from the SPEED source, for the Workbench team to consider. None blocks the course.

- `speed audit` rejects files under `specs/architecture/` and `specs/compliance/` as an
  unrecognised spec type. This is expected: those are inputs, and engineers audit the
  tech spec.
- `speed audit` reads the product spec through the `> See` link, but not the
  architecture, threat model or compliance files. Its codebase and cross-spec dimensions
  therefore cannot see RP1 to RP3 or T1 to T8 unless the tech spec carries them.
- The design template expects pages and components. The gateway has no screens, so the
  design spec carries those sections marked N/A to pass the design audit.
- `speed plan` loads `specs/tests/authorisation-risk.md` as a scenario catalog if it
  exists. `speed define` could produce one from the Testing section, but it is optional.
