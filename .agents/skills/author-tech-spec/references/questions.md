# Fixed authoring agenda: adaptive-auth

This agenda makes the 301.1E interview predictable. It is facilitation guidance,
not specification evidence or an answer key. Recheck every premise against the
fresh inputs in input-manifest.md and the installed RFC template. No answer from
an earlier session is accepted in a new session without current evidence or an
explicit new decision. Do not load facilitator gap maps or corpus answer keys.

Keep this reference unchanged during an interview. Save statuses, evidence and
answers in `.speed/authoring/adaptive-auth/questions.md`; save decisions and RFC
edit acceptance separately. Show all eight topics after the understanding check.
Ask one unresolved topic at a time in this order. Keep the opening question short;
offer detail on request. Source-resolved or inapplicable topics need no learner vote.

## Q001: Trusting bank confirmation

Who supplies the result to `completeStepUp`, and what establishes that it really
comes from the bank/provider rather than a caller-controlled claim?

Inspect the F2.1 RFC's Basic Example, API Surface and Security & Controls; F2.2's
bank-challenge assumptions; feature architecture's adapter responsibilities; and
checkout Data Binding. Distinguish cancelling a challenge from authenticating it.
Compare feasible trust mechanisms; do not assume a provider supports lookup,
callbacks or signed evidence. Record capability confirmation as a dependency.

## Q002: Provider calls and latency

Where do challenge start and result retrieval run, and how does that fit the
authorisation-path constraints and checkout loading states?

Inspect feature architecture's component interactions and critical-path rules,
platform latency budgets, checkout Loading State and the RFC's challenge lifecycle.
Do not assume the draft makes synchronous calls if it does not say so. Ask the
architect to clarify conflicting constraints; a separate start endpoint is an
option, not an accepted design. Keep cancellation, expiry and retries consistent
if the learner chooses to alter the flow.

## Q003: Timeout evidence and ownership

Which provider waits need timeouts, where do any draft values come from, and who
proposes, measures and reviews them?

Inspect the RFC's timers and failure states, architecture failure modes, and both
PRDs' fallback and customer-experience requirements. Separate provider-call
timeouts from the challenge lifetime. Do not introduce an extra timeout merely
because a prior session did. Keep unsourced values provisional or unset, with an
owner and resolution path; distinguish planning dependencies from rollout gates.

## Q004: Shared contracts and responsibilities

Do F2.1's Produces and F2.2's Consumes agree on exact interfaces, types, errors,
challenge creation and source-specific outcomes, and which RFC owns each behavior?

Inspect both RFCs' Interface Contract, API Surface, Data Model, State Machine and
File Impact sections. Include changes accepted in Q001-Q003, if any. Use existing
interfaces where sufficient; do not prescribe a policy registry or new abstraction
just to reproduce the earlier rehearsal. Record cross-RFC changes explicitly.

## Q005: Policy decisions and owners

Which open decisions belong to engineering, and which require Product, Risk,
Legal, Design or data science?

Inspect both PRDs' Open Questions and Security & Controls, architecture constraints,
and both RFCs' Unresolved Questions. Cover fraud appetite, hold communication,
3-D Secure exemptions and block length/scope where present. Preserve source-named
owners; label suggested owners as proposed. Record what each decision blocks and
how to resolve it. Do not approve policy on an owner's behalf.

## Q006: Shadow-mode duration

Do F2.2's rollout period and the architecture's shadow period agree, and do they
refer to the same component and outcome?

Inspect architecture Verification and both RFCs' Migration Strategy. If one week
and two weeks conflict, establish scope before proposing alignment or an explicit
exception. If the current sources agree, mark this topic source-derived. Do not
invent a duration or a cutover approval.

## Q007: Source references and versions

Do section citations, architecture-version references and configuration labels
still point to the intended current source?

Inspect F2.1's Data Model and Key Decisions against both architecture documents.
Examples from the baseline include a Runtime section reference, the narrative
placement rationale and arch-0.7-defaults. Check whether these are actually stale.
A configuration identifier is not automatically wrong because a document version
changed; establish its meaning before renaming it. Keep fixes narrowly scoped.

## Q008: Impact of BIN-wide blocks

What happens to a genuine small payment sharing a blocked card prefix, and what
evidence would show that the chosen scope and thresholds are acceptable?

Inspect F2.2's block key and limits, its genuine-traffic criteria, and
test/fixtures/traffic.ts. Contrast the traveller's high-value purchase with genuine
small payments; do not assume both match the block. Distinguish a challenge from a
decline and identify the denominator and labels needed for a false-decline rate.
Record broad effects as risks and owner questions rather than silently narrowing
the block or approving thresholds.

## End of this interview pass

After Q008, summarise dispositions, accepted edits, remaining source/owner blockers
and requirement/template coverage. New findings use F-style IDs in a separate table
and do not extend the eight-topic agenda. A blocker may prevent readiness even if
all topics are answered. Do not claim Audit or Plan passed without running them,
and do not run Plan or implementation under this authoring skill.
