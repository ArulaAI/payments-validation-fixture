/*
 * Review queue store. Phase 1 builds the data model and the hold write path only.
 * Analyst decisions and expiry are added later without changing the gateway.
 */

import type { ReasonCode } from '../risk/reasons.ts';
import { analystReason } from '../risk/reasons.ts';
import type { AuditLog } from './audit.ts';

export type ReviewStatus = 'held' | 'approved' | 'declined' | 'expired';

export type ReviewItem = {
  id: string;
  paymentId: string;
  maskedCard: string;
  merchantId: string;
  amount: number;
  score: number;
  analystReason: string;
  narrative: string | null;
  heldAt: number;
  status: ReviewStatus;
  decidedBy: string | null;
  note: string | null;
  decidedAt: number | null;
  // Context for the queue design and the narrative. None of it is card data.
  reasons: ReasonCode[];
  currency: string;
  merchantCategory: string;
  issuerCountry: string | null;
  ipCountry: string;
};

export type HoldArgs = {
  paymentId: string;
  maskedCard: string;
  merchantId: string;
  amount: number;
  currency: string;
  score: number;
  reasons: ReasonCode[];
  merchantCategory: string;
  issuerCountry: string | null;
  ipCountry: string;
};

export interface ReviewQueue {
  hold(args: HoldArgs): ReviewItem;
  get(id: string): ReviewItem | undefined;
  /** Held items, oldest first. */
  listHeld(): ReviewItem[];
}

const MASKED_CARD = /^\d{6}\*+\d{4}$/;
const BIN_LAST4 = /^\d{6}:\d{4}$/;

export class InMemoryReviewQueue implements ReviewQueue {
  readonly #items = new Map<string, ReviewItem>();
  #seq = 0;

  readonly #audit: AuditLog;
  readonly #clock: () => number;

  constructor(audit: AuditLog, clock: () => number = Date.now) {
    this.#audit = audit;
    this.#clock = clock;
  }

  hold(args: HoldArgs): ReviewItem {
    if (!MASKED_CARD.test(args.maskedCard) && !BIN_LAST4.test(args.maskedCard)) {
      throw new RangeError('maskedCard must be BIN plus last four');
    }
    const heldAt = this.#clock();
    const item: ReviewItem = {
      id: `rev_${(++this.#seq).toString(36).padStart(6, '0')}`,
      paymentId: args.paymentId,
      maskedCard: args.maskedCard,
      merchantId: args.merchantId,
      amount: args.amount,
      score: args.score,
      analystReason: args.reasons.length > 0 ? analystReason(args.reasons[0]) : 'Scorer unavailable',
      narrative: null,
      heldAt,
      status: 'held',
      decidedBy: null,
      note: null,
      decidedAt: null,
      reasons: [...args.reasons],
      currency: args.currency,
      merchantCategory: args.merchantCategory,
      issuerCountry: args.issuerCountry,
      ipCountry: args.ipCountry,
    };
    this.#items.set(item.id, item);
    this.#audit.record({
      action: 'hold',
      subjectId: item.id,
      actor: 'system',
      reason: item.analystReason,
      at: heldAt,
    });
    return item;
  }

  get(id: string): ReviewItem | undefined {
    return this.#items.get(id);
  }

  listHeld(): ReviewItem[] {
    return [...this.#items.values()]
      .filter(i => i.status === 'held')
      .sort((a, b) => a.heldAt - b.heldAt);
  }
}
