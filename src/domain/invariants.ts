/*
 * The four named invariants. Plan 2.3, satisfying FR-9 and FR-10.
 *
 * These are assertable after an arbitrary operation sequence, which is what lets the
 * property command generate interleavings and retries and still check something real.
 */

import type { Ledger } from './ledger.ts';
import { add, minor } from './money.ts';
import type { PaymentStore } from '../payments/service.ts';

export type Violation = { invariant: string; detail: string; paymentId?: string };

/** TR6. Every pair nets to zero on its own, so two offsetting bad pairs cannot hide. */
export const LEDGER_BALANCED = (ledger: Ledger): Violation[] => {
  const out: Violation[] = [];
  const seen = new Map<string, string>();
  for (const e of ledger.entries) if (!seen.has(e.pairId)) seen.set(e.pairId, e.paymentId);
  for (const [pairId, paymentId] of seen) {
    const net = ledger.net(pairId);
    if (net !== 0) {
      out.push({ invariant: 'LEDGER_BALANCED', paymentId, detail: `pair ${pairId} nets to ${net}, expected 0` });
    }
  }
  return out;
};

/** TR7. */
export const CAPTURE_WITHIN_AUTH = (store: PaymentStore): Violation[] => {
  const out: Violation[] = [];
  for (const p of store.values()) {
    const captured = p.captures.reduce((s, c) => add(s, c.amount), minor(0));
    if (captured > p.authorised) {
      out.push({
        invariant: 'CAPTURE_WITHIN_AUTH',
        paymentId: p.id,
        detail: `captured ${captured} exceeds authorised ${p.authorised}`,
      });
    }
  }
  return out;
};

/**
 * TR8. Each refund names a capture on its own payment, and the bound is per capture.
 * A payment-level total would let one capture be over-refunded while another is untouched.
 */
export const REFUND_TRACES_CAPTURE = (store: PaymentStore): Violation[] => {
  const out: Violation[] = [];
  for (const p of store.values()) {
    const captures = new Map(p.captures.map(c => [c.id, c]));
    for (const r of p.refunds) {
      if (!captures.has(r.captureId)) {
        out.push({
          invariant: 'REFUND_TRACES_CAPTURE',
          paymentId: p.id,
          detail: `refund ${r.id} references capture ${r.captureId}, which is not on ${p.id}`,
        });
      }
    }
    for (const c of p.captures) {
      const refunded = p.refunds
        .filter(r => r.captureId === c.id)
        .reduce((s, r) => add(s, r.amount), minor(0));
      if (refunded > c.amount) {
        out.push({
          invariant: 'REFUND_TRACES_CAPTURE',
          paymentId: p.id,
          detail: `refunded ${refunded} against capture ${c.id} exceeds its amount ${c.amount}`,
        });
      }
    }
  }
  return out;
};

/*
 * A stored record must never hold a full PAN. Only the vault may, and only as last4.
 *
 * Length alone is not enough. A millisecond timestamp is 13 digits, so a length-only
 * rule reports every record that carries an `at` field. Luhn plus a string-only walk is
 * what makes this assertable. That distinction is worth knowing: the same mistake in a
 * scanner is the difference between a useful hook and one nobody leaves enabled.
 */
const luhnValid = (digits: string): boolean => {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = digits.charCodeAt(i) - 48;
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
};

/** Every string in a value, including Map keys and values and object keys. Numbers are skipped. */
const strings = (value: unknown, out: string[] = []): string[] => {
  if (typeof value === 'string') out.push(value);
  else if (value instanceof Map) value.forEach((v, k) => (strings(k, out), strings(v, out)));
  else if (Array.isArray(value)) value.forEach(v => strings(v, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      out.push(k);
      strings(v, out);
    }
  }
  return out;
};

/** A maximal digit run of PAN length, so a longer run is not split into candidates. */
const PAN_RUN = /(?<!\d)\d{12,19}(?!\d)/g;

const scan = (record: unknown, where: string, paymentId: string | undefined, out: Violation[]): void => {
  for (const s of strings(record)) {
    for (const match of s.matchAll(PAN_RUN)) {
      if (!luhnValid(match[0])) continue;
      out.push({
        invariant: 'NO_PAN_AT_REST',
        ...(paymentId ? { paymentId } : {}),
        detail: `${where} holds a Luhn-valid ${match[0].length}-digit value`,
      });
    }
  }
};

/**
 * TR9. Walks payments (with their captures and refunds), ledger entries and, when given,
 * the idempotency records (keys and stored results).
 */
export const NO_PAN_AT_REST = (
  store: PaymentStore,
  ledger?: Ledger,
  idempotency?: ReadonlyMap<string, unknown>,
): Violation[] => {
  const out: Violation[] = [];
  for (const p of store.values()) scan(p, `payment ${p.id}`, p.id, out);
  for (const e of ledger?.entries ?? []) scan(e, `ledger entry ${e.id}`, e.paymentId, out);
  for (const [key, value] of idempotency ?? []) scan([key, value], 'idempotency record', undefined, out);
  return out;
};

/**
 * The oracle for the tests and the workbench. The optional idempotency map lets a caller
 * that can reach the service's idempotency records include them in the PAN walk.
 */
export const checkAll = (
  ledger: Ledger,
  store: PaymentStore,
  idempotency?: ReadonlyMap<string, unknown>,
): Violation[] => [
  ...LEDGER_BALANCED(ledger),
  ...CAPTURE_WITHIN_AUTH(store),
  ...REFUND_TRACES_CAPTURE(store),
  ...NO_PAN_AT_REST(store, ledger, idempotency),
];
