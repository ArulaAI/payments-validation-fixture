/*
 * Generated operation sequences. Plan 3.9, satisfying FR-10 and FR-15.
 *
 * Encodes the invariant rather than the example. Each seed drives a sequence over
 * authorise, capture (partial, default and over the remaining amount), refund (per
 * capture, retried, and with a capture id from another payment), void, capture after
 * void and idempotent replays. A small model predicts whether each call must throw a
 * RangeError. After every step, checkAll must return [], and a rejected call must leave
 * the ledger and the payment untouched.
 *
 * A clean run here is statistical: N cases, no violation. It is not proof.
 */
import { PaymentsService } from '../../src/payments/service.ts';
import { checkAll } from '../../src/domain/invariants.ts';
import { TEST_CARDS, EXPIRY } from '../../test/fixtures/cards.ts';
import type { Finding, Result } from '../lib.ts';

const CASES = 200;
const STEPS = 25;

export const OPS = [
  'authorise',
  'capture-partial',
  'capture-default',
  'capture-over-remaining',
  'capture-after-void',
  'refund',
  'refund-retry',
  'refund-cross-payment',
  'void',
  'replay-authorise',
  'replay-capture',
] as const;

export type Op = (typeof OPS)[number];

type ModelCapture = { id: string; amount: number; refunded: number };
type ModelPayment = { id: string; authorised: number; captures: ModelCapture[]; voided: boolean };

/** Deterministic integer PRNG, so a failure is reproducible from its seed and no float is drawn. */
const rng = (seed: number) => {
  let state = seed;
  return (n: number): number => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state % n;
  };
};

const capturedOf = (p: ModelPayment): number => p.captures.reduce((s, c) => s + c.amount, 0);

/** One generated sequence. Returns the first violation, if any, and how often each op ran. */
export function runSeed(seed: number): { finding?: Finding; counts: Record<Op, number> } {
  const int = rng(seed);
  const pick = <T>(items: readonly T[]): T | undefined => (items.length ? items[int(items.length)] : undefined);
  const svc = new PaymentsService();
  const idempotency = svc['idempotent'];
  const model: ModelPayment[] = [];
  const authKeys = new Map<string, string>();
  const captureKeys = new Map<string, string>();
  let lastRefund: { paymentId: string; captureId: string; amount: number } | undefined;
  let keySeq = 0;
  const counts = Object.fromEntries(OPS.map(op => [op, 0])) as Record<Op, number>;

  const fail = (step: number, op: Op, detail: string): Finding => ({
    file: 'src/payments/service.ts',
    line: 1,
    summary: `seed ${seed} step ${step} (${op}): ${detail}`,
    severity: 'high',
  });

  for (let step = 1; step <= STEPS; step += 1) {
    const open = model.filter(p => !p.voided);
    const voided = model.filter(p => p.voided);
    const withCaptures = model.filter(p => p.captures.length > 0);
    const candidates: Op[] = ['authorise'];
    if (open.length) candidates.push('capture-partial', 'capture-over-remaining', 'void');
    if (open.some(p => capturedOf(p) < p.authorised)) candidates.push('capture-default');
    if (voided.length) candidates.push('capture-after-void');
    if (withCaptures.length) candidates.push('refund');
    if (lastRefund) candidates.push('refund-retry');
    if (withCaptures.length && model.length > 1) candidates.push('refund-cross-payment');
    if (authKeys.size) candidates.push('replay-authorise');
    if (captureKeys.size) candidates.push('replay-capture');
    const op = pick(candidates)!;
    counts[op] += 1;

    /*
     * Each branch returns the call to make, whether the model expects a RangeError, and
     * what to apply to the model when the call succeeds.
     */
    let call: () => unknown;
    let expectThrow = false;
    let onSuccess: (result: unknown) => string | undefined = () => undefined;
    let target: ModelPayment | undefined;

    switch (op) {
      case 'authorise': {
        const amount = 1 + int(100_000);
        const key = int(3) === 0 ? `auth-${seed}-${++keySeq}` : undefined;
        call = () => svc.authorise({ pan: TEST_CARDS.visa, expiry: EXPIRY, amount, idempotencyKey: key });
        onSuccess = result => {
          const p = result as { id: string; authorised: number };
          if (p.authorised !== amount) return `authorised ${p.authorised}, expected ${amount}`;
          model.push({ id: p.id, authorised: amount, captures: [], voided: false });
          if (key) authKeys.set(key, p.id);
          return undefined;
        };
        break;
      }
      case 'capture-partial':
      case 'capture-default':
      case 'capture-over-remaining':
      case 'capture-after-void': {
        const pool = op === 'capture-after-void'
          ? voided
          : op === 'capture-default' ? open.filter(p => capturedOf(p) < p.authorised) : open;
        target = pick(pool)!;
        const p = target;
        const remaining = p.authorised - capturedOf(p);
        const amount = op === 'capture-default'
          ? undefined
          : op === 'capture-over-remaining'
            ? remaining + 1 + int(1_000)
            : remaining > 0 ? 1 + int(remaining) : 1 + int(1_000);
        const key = int(3) === 0 ? `cap-${seed}-${++keySeq}` : undefined;
        expectThrow = p.voided || (amount ?? remaining) > remaining;
        call = () => svc.capture(p.id, amount, key);
        onSuccess = result => {
          const c = result as { id: string; amount: number };
          const expected = amount ?? remaining;
          if (c.amount !== expected) return `captured ${c.amount}, expected ${expected}`;
          p.captures.push({ id: c.id, amount: expected, refunded: 0 });
          if (key) captureKeys.set(key, c.id);
          return undefined;
        };
        break;
      }
      case 'refund':
      case 'refund-retry': {
        let paymentId: string;
        let captureId: string;
        let amount: number | undefined;
        if (op === 'refund-retry') {
          ({ paymentId, captureId, amount } = lastRefund!);
        } else {
          const p = pick(withCaptures)!;
          const c = pick(p.captures)!;
          const refundable = c.amount - c.refunded;
          const shape = int(3);
          paymentId = p.id;
          captureId = c.id;
          amount = shape === 0 && refundable > 0
            ? undefined
            : shape === 1 ? refundable + 1 : 1 + int(Math.max(refundable, 1));
        }
        target = model.find(p => p.id === paymentId)!;
        const capture = target.captures.find(c => c.id === captureId)!;
        const refundable = capture.amount - capture.refunded;
        const requested = amount ?? refundable;
        expectThrow = requested > refundable;
        call = () => svc.refund(paymentId, captureId, amount);
        onSuccess = result => {
          const r = result as { amount: number; captureId: string };
          if (r.amount !== requested || r.captureId !== captureId) {
            return `refunded ${r.amount} against ${r.captureId}, expected ${requested} against ${captureId}`;
          }
          capture.refunded += requested;
          if (amount !== undefined) lastRefund = { paymentId, captureId, amount };
          return undefined;
        };
        break;
      }
      case 'refund-cross-payment': {
        const owner = pick(withCaptures)!;
        const captureId = pick(owner.captures)!.id;
        target = pick(model.filter(p => p.id !== owner.id))!;
        const p = target;
        expectThrow = true;
        call = () => svc.refund(p.id, captureId, 1);
        break;
      }
      case 'void': {
        target = pick(open)!;
        const p = target;
        expectThrow = p.captures.length > 0;
        call = () => svc.void(p.id);
        onSuccess = () => {
          p.voided = true;
          return undefined;
        };
        break;
      }
      case 'replay-authorise': {
        const key = pick([...authKeys.keys()])!;
        const id = authKeys.get(key)!;
        call = () => svc.authorise({ pan: TEST_CARDS.visa, expiry: EXPIRY, amount: 1 + int(100_000), idempotencyKey: key });
        onSuccess = result => ((result as { id: string }).id === id ? undefined : `replay returned ${(result as { id: string }).id}, expected ${id}`);
        break;
      }
      case 'replay-capture': {
        const key = pick([...captureKeys.keys()])!;
        const id = captureKeys.get(key)!;
        const p = pick(model)!;
        call = () => svc.capture(p.id, 1 + int(1_000), key);
        onSuccess = result => ((result as { id: string }).id === id ? undefined : `replay returned ${(result as { id: string }).id}, expected ${id}`);
        break;
      }
    }

    const entriesBefore = svc.ledger.entries.length;
    const isReplay = op === 'replay-authorise' || op === 'replay-capture';
    const stored = target ? svc.payments.get(target.id) : undefined;
    const snapshot = stored ? JSON.stringify(stored) : undefined;
    let thrown: unknown;
    let result: unknown;
    try {
      result = call();
    } catch (error) {
      thrown = error;
    }

    if (thrown !== undefined) {
      if (!(thrown instanceof RangeError)) {
        return { counts, finding: fail(step, op, `threw ${(thrown as Error)?.name ?? typeof thrown}, expected RangeError`) };
      }
      if (!expectThrow) return { counts, finding: fail(step, op, `rejected a valid call: ${thrown.message}`) };
      if (svc.ledger.entries.length !== entriesBefore) {
        return { counts, finding: fail(step, op, 'a rejected call wrote ledger entries') };
      }
      if (stored && JSON.stringify(stored) !== snapshot) {
        return { counts, finding: fail(step, op, 'a rejected call changed the payment') };
      }
    } else {
      if (expectThrow) return { counts, finding: fail(step, op, 'accepted a call the model expects to be rejected') };
      const mismatch = onSuccess(result);
      if (mismatch) return { counts, finding: fail(step, op, mismatch) };
      if (isReplay && svc.ledger.entries.length !== entriesBefore) {
        return { counts, finding: fail(step, op, 'an idempotent replay wrote ledger entries') };
      }
    }

    const violation = checkAll(svc.ledger, svc.payments, idempotency)[0];
    if (violation) {
      return { counts, finding: fail(step, op, `${violation.invariant} violated: ${violation.detail}`) };
    }
  }
  return { counts };
}

export function run(): Result {
  for (let seed = 1; seed <= CASES; seed += 1) {
    // Shrink to the first violating seed rather than reporting all of them.
    const { finding } = runSeed(seed);
    if (finding) return { findings: [finding] };
  }
  return { findings: [] };
}
