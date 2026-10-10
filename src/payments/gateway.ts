/*
 * The authorisation gateway. Every merchant authorisation passes through here before it
 * reaches the payments service.
 *
 * Risk rules v1 run first. What happens next depends on the rollout flag
 * (src/risk/rollout.ts, RFC F2.1 Migration Strategy):
 *
 *   v1       the rules decide, as before. The scorer is never called.
 *   shadow   the rules decide; the scored decision is computed and logged beside them.
 *   enforce  for an enforced merchant only CARD_VELOCITY runs, then the scored decision
 *            approves, steps up, holds or declines. Other merchants stay in shadow.
 *
 * A decline keeps the scheme code `do_not_honour`. A scored decline also carries a
 * cardholder reason from the allowlist in src/risk/reasons.ts, never the rule, the score
 * or a feature. Logs and spans carry the masked card only.
 */

import { type AuthoriseRequest, type Payment, PaymentsService } from './service.ts';
import type { GatewayResult } from './result.ts';
import { RiskRules, type RiskDecision, type RuleId } from '../risk/rules.ts';
import { type Scorer, toScoringInput } from '../risk/scoring.ts';
import type { DecisionPolicy, PolicyDecision } from '../risk/policy.ts';
import type { StepUpAdapter } from '../risk/stepup.ts';
import { CARDHOLDER_REASONS, cardholderReason } from '../risk/reasons.ts';
import { DEFAULT_ROLLOUT, type RiskRollout, scoredDecides } from '../risk/rollout.ts';
import { issuerCountry } from '../risk/issuers.ts';
import type { ReviewQueue } from '../review/queue.ts';
import type { AuditLog } from '../review/audit.ts';
import { tokenise } from '../vault.ts';
import { log, span } from '../obs/index.ts';

export type { GatewayResult } from './result.ts';

export type GatewayRequest = AuthoriseRequest & {
  merchantId: string;
  /** Country of the shopper's IP address, ISO 3166 alpha-2. */
  ipCountry: string;
  /** Epoch milliseconds. Defaults to now. */
  at?: number;
};

export type GatewayDeps = {
  scorer: Scorer;
  policy: DecisionPolicy;
  stepUp: StepUpAdapter<AuthoriseRequest>;
  queue: ReviewQueue;
  audit: AuditLog;
  rollout?: RiskRollout;
  /** The request carries no MCC, so the category comes from a lookup. Defaults to 'unknown'. */
  merchantCategory?: (merchantId: string) => string;
  rules?: RiskRules;
};

const masked = (bin: string, last4: string): string => `${bin}******${last4}`;

/** Drop the gateway-only fields before the request reaches the payments service. */
const toAuthorise = (req: GatewayRequest): AuthoriseRequest => {
  const { merchantId: _merchant, ipCountry: _ip, at: _at, ...authorise } = req;
  return authorise;
};

export class AuthorisationGateway {
  readonly payments: PaymentsService;
  readonly rules: RiskRules;
  readonly scorer: Scorer;
  readonly policy: DecisionPolicy;
  readonly stepUp: StepUpAdapter<AuthoriseRequest>;
  readonly queue: ReviewQueue;
  readonly audit: AuditLog;
  readonly rollout: RiskRollout;
  private readonly merchantCategory: (merchantId: string) => string;

  constructor(payments: PaymentsService, deps: GatewayDeps) {
    this.payments = payments;
    this.scorer = deps.scorer;
    this.policy = deps.policy;
    this.stepUp = deps.stepUp;
    this.queue = deps.queue;
    this.audit = deps.audit;
    this.rollout = deps.rollout ?? DEFAULT_ROLLOUT;
    this.merchantCategory = deps.merchantCategory ?? (() => 'unknown');
    this.rules = deps.rules ?? new RiskRules();
  }

  authorise(req: GatewayRequest): GatewayResult {
    const digits = req.pan.replace(/\D/g, '');
    const bin = digits.slice(0, 6);
    const last4 = digits.slice(-4);
    const card = masked(bin, last4);
    const input = {
      bin,
      last4,
      amount: req.amount,
      ipCountry: req.ipCountry,
      merchantId: req.merchantId,
      at: req.at ?? Date.now(),
    };

    if (!scoredDecides(this.rollout, req.merchantId)) {
      const v1 = this.rules.evaluate(input);
      if (this.rollout.mode !== 'v1') this.recordShadow(req, v1, card);
      if (v1.outcome === 'decline') {
        this.recordDecline(v1.rule as RuleId, req.merchantId, card);
        return { status: 'declined', code: 'do_not_honour' };
      }
      return { status: 'approved', payment: this.payments.authorise(toAuthorise(req)) };
    }

    const velocity = this.rules.evaluate(input, { highValueCrossBorder: false });
    if (velocity.outcome === 'decline') {
      this.recordDecline(velocity.rule as RuleId, req.merchantId, card);
      return { status: 'declined', code: 'do_not_honour', reason: CARDHOLDER_REASONS.decline_generic };
    }

    const decision = this.decide(req);
    this.recordDecision(decision, req.merchantId, card);

    switch (decision.outcome) {
      case 'approve':
        return { status: 'approved', payment: this.payments.authorise(toAuthorise(req)) };
      case 'step_up': {
        const { token } = tokenise(req.pan, req.expiry);
        const meta = { amount: req.amount, currency: req.currency ?? 'GBP', merchantId: req.merchantId };
        // The whole request is held so a later hold (task 8) still has merchant and IP country.
        const challenge = this.stepUp.begin(req, decision, token, meta, 'policy');
        return { status: 'step_up', challengeId: challenge.id };
      }
      case 'hold':
        return this.hold(req, decision);
      case 'decline':
        return {
          status: 'declined',
          code: 'do_not_honour',
          reason: cardholderReason(decision.reasons[0] ?? 'issuer_unknown'),
        };
    }
  }

  /** Score and apply the policy. A scorer that throws or returns garbage becomes a hold. */
  private decide(req: GatewayRequest): PolicyDecision {
    try {
      return this.policy.decide(this.scorer.score(toScoringInput(req, this.merchantCategory(req.merchantId))));
    } catch (error) {
      return this.policy.decide({ error });
    }
  }

  /**
   * Authorise, block capture and queue the payment for an analyst. The queue records the
   * audit 'hold' by 'system'.
   */
  private hold(req: GatewayRequest, decision: PolicyDecision): GatewayResult {
    const payment: Payment = this.payments.authorise(toAuthorise(req));
    this.payments.blockCapture(payment.id);
    const bin = req.pan.replace(/\D/g, '').slice(0, 6);
    const item = this.queue.hold({
      paymentId: payment.id,
      maskedCard: masked(bin, payment.last4),
      merchantId: req.merchantId,
      amount: req.amount,
      currency: payment.currency,
      score: decision.score,
      reasons: decision.reasons,
      merchantCategory: this.merchantCategory(req.merchantId),
      issuerCountry: issuerCountry(bin),
      ipCountry: req.ipCountry,
    });
    return { status: 'held', payment, reviewId: item.id };
  }

  /** Shadow mode: the scored decision is logged next to the v1 result and never changes it. */
  private recordShadow(req: GatewayRequest, v1: RiskDecision, card: string): void {
    const scored = this.decide(req);
    const v1Result = v1.rule ? `${v1.outcome} by ${v1.rule}` : v1.outcome;
    log.info(
      `risk.shadow ${card} at ${req.merchantId}: v1 ${v1Result}, scored ${scored.outcome} ` +
      `(${scored.score}, thresholds ${scored.thresholdsVersion})`,
    );
    span('risk.shadow', {
      merchantId: req.merchantId,
      card,
      v1Outcome: v1.outcome,
      v1Rule: v1.rule,
      outcome: scored.outcome,
      score: scored.score,
      reasons: scored.reasons,
      thresholdsVersion: scored.thresholdsVersion,
      scorerFailed: scored.scorerFailed ?? false,
    });
  }

  private recordDecision(decision: PolicyDecision, merchantId: string, card: string): void {
    log.info(
      `risk.decision ${card} at ${merchantId}: ${decision.outcome} ` +
      `(${decision.score}, thresholds ${decision.thresholdsVersion})`,
    );
    span('risk.decision', {
      merchantId,
      card,
      outcome: decision.outcome,
      score: decision.score,
      reasons: decision.reasons,
      thresholdsVersion: decision.thresholdsVersion,
      scorerFailed: decision.scorerFailed ?? false,
    });
  }

  private recordDecline(rule: RuleId, merchantId: string, card: string): void {
    log.info(`declined ${card} at ${merchantId} by ${rule}`);
    span('payment.decline', { rule, merchantId, card });
  }
}
