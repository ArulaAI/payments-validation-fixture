# 00. Analysis: why this repo exists and what shape it takes

Status: accepted. This is the reasoning the PRD and requirements are built on. It is
recorded so that later readers can challenge the conclusions rather than rediscover them.

Prose in this repo follows AP style. No em-dashes, no mirrored sentence pairs, no
negative-then-positive constructions.

## 1. What this repo is for

The Validation Workbench course teaches L1 judgment: knowing which tool or agent
catches which class of AI mistake, composing several into one chain and weighing the
evidence they report. The course needs a codebase to validate. This is that codebase.

It is not a payments product. It is a teaching artifact that behaves like a payments
service, instrumented so that every defect a learner meets was placed there on purpose
and is documented in a manifest.

## 2. Build from scratch, rather than adopt an existing repository

The previous lab pinned a JHipster sample app. That worked because L0 only needed
something real to read. L1 needs something instrumented, and three course commitments
make a borrowed repository unusable.

**Seeded, not discovered.** Every round ships a manifest naming the defect id, its
failure class, the check expected to catch it, the evidence type that would count as a
catch and the correct learner action. That manifest cannot be written against code
nobody on the team authored.

**Seeded evidence pathologies.** Chapter 4 requires an allowlisted test-BIN false
positive, a fluent wrong review and an equivalent mutant, each in a known place. An
equivalent mutant is delicate to construct deliberately and impossible to guarantee by
luck. The course depends on every learner meeting one, not on most learners meeting one.

**Paired fixtures per check.** Chapter 1 has learners run all 20 checks against a ref
where the target defect is present and a ref where a plausible lookalike is absent.
That is roughly 40 authored refs, all pinned.

The cost driver is therefore not the service. It is the paired refs and the round
manifests. The service should stay as small as the failure classes allow.

## 3. Competing constraints the design has to hold

| Constraint | Source | Consequence |
| --- | --- | --- |
| Hand reading must fail | The course premise | A 210-line diff needs non-obvious blast radius, so the service needs real depth |
| Full chain under 90 seconds | Fixture page | Small codebase, fast checks, mutation over changed files only |
| No external accounts for hooks and commands | Preparation guide | Vendor the checks. Write them here rather than pulling a SaaS |
| Synthetic card data only | Fixture page, PCI | Scheme test BINs throughout, allowlisted, because the Chapter 4 false positive depends on the allowlist existing |
| Eight failure classes need somewhere to live | Failure-class matrix | The domain has to have a natural home for each, or seeded defects read as planted |

The first two constraints pull against each other. The resolution is that reading fails
because of *blast radius*, not line count. A refund change touching money rounding has
consequences in the ledger, the capture path and the webhook payload, none of which are
visible in the diff.

## 4. Inspiration, by what it teaches us

**Corpus design, which is the part most likely to sink this**

- **Defects4J.** Paired buggy and fixed versions with the triggering test isolated, plus
  per-defect metadata. Its layout is close to the paired-fixture requirement, and its
  metadata schema is the starting point for the round manifest. Take the structure.
- **OWASP Juice Shop.** The clearest example of this genre. A coherent app whose flaws
  are all deliberate, with a challenge manifest and scoring. Its solved problem is ours:
  keeping the app feeling real while every defect is intentional and documented.
- **SWE-bench and BugsInPy** for reproducible pinning of task instances.

**Payments domain**

- **Stripe's API shape** for authorise, capture, refund and void, and for idempotency
  keys. Note the irony: the reserved F8 defect is that the specification is silent on
  refund idempotency. That gap is realistic because Stripe made idempotency explicit and
  most in-house systems never did.
- **ISO 8583 and scheme message flow** for authentic reversal and partial-capture
  semantics, which is where a silent rounding regression lives naturally.
- **Fowler's Money pattern and Accounting Patterns** for the ledger and for rounding. A
  one-cent partial-capture drift is a textbook Money-pattern failure.

**The cardholder-data sink inventory**

- **PCI DSS v4.0 requirements 3.x and 10.x** generate the sink list directly. Logs,
  webhook error bodies, telemetry attributes, test fixtures and an exception path that
  serialises a whole request object. The last is the most valuable, because taint
  analysis catches it and a regex does not.

**Toolchain, mapped to the three kinds**

- Hooks: a Luhn and BIN scanner written here, secret and entropy scanning, a taint pass,
  a diff-scope guard, dependency provenance
- Commands: mutation, property-based generation, invariant assertion, differential replay
- Skills: zero-context reviewer, adversarial red-teamer, intent conformance, requirements
  coverage. These need a coding agent, so the repo defines them and the harness records
  their absence as silence when they do not run.

## 5. Authoring order

Write the manifests before the service.

If the service is built first and defects are seeded afterwards, two or three classes
will have nowhere natural to live and the seeded defects will read as planted. Start
from the eight classes, write each target defect as a manifest entry, then build the
service around them. That is the discipline Juice Shop mostly keeps and most teaching
repositories do not.

## 6. Where the repository lives

**One canonical upstream, one working copy per learner.** Chapter 7 makes learners push,
because its gate requires the new rule to run in CI on the round branch. A single shared
repository cannot serve that without giving every learner write access to the same
branches.

**Fork, not template.** Template generation squashes history to a single commit and
drops tags by default, which would destroy the pinned-commit model and every paired
fixture. A fork carries full history, all branches and tags, gives the learner write
access and their own CI, and leaves `upstream` available for pulling round branches.

**Use GitHub Classroom if the Chapter 8 score is real assessment.** It gives each learner
a private repository from a template and its autograding is the natural home for the
scored run against ground truth. That is the one capability that would otherwise need
building.

**Refs: tags for fixtures, branches for rounds.** The paired fixtures are immutable, so
they are annotated tags. Only the six rounds are branches, because learners branch off
them. This keeps the branch list short enough to be navigation.

### Open questions for the client

1. Is there a real GitHub organisation? `ArulaAI` was illustrative.
2. Is Meridian on GitHub at all, rather than GitLab or Bitbucket? Classroom has no
   equivalent elsewhere and would need building.
3. Is the course internal to Meridian or sold by Arula? A commercial course cannot have
   learners forking a public repository that gives the defect manifests away.
4. Public hosting will trip secret scanners on purpose. The repository is full of
   Luhn-valid scheme test BINs because the Chapter 4 allowlist lesson depends on them.
   Push protection and organisation DLP should be told in advance.
