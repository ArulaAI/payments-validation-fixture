/*
 * The four invariants and checkAll. TR6 to TR9.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { PaymentsService } from '../src/payments/service.ts';
import { Ledger } from '../src/domain/ledger.ts';
import { minor } from '../src/domain/money.ts';
import {
  CAPTURE_WITHIN_AUTH,
  LEDGER_BALANCED,
  NO_PAN_AT_REST,
  REFUND_TRACES_CAPTURE,
  checkAll,
} from '../src/domain/invariants.ts';
import { TEST_CARDS, EXPIRY } from './fixtures/cards.ts';

const svc = () => new PaymentsService();
const auth = (s: PaymentsService, amount = 10_000) =>
  s.authorise({ pan: TEST_CARDS.visa, expiry: EXPIRY, amount });
const names = (vs: { invariant: string }[]) => vs.map(v => v.invariant);

/** A ledger stand-in with hand-written entries, since the real one only writes balanced pairs. */
const fakeLedger = (entries: { pairId: string; amount: number; paymentId: string }[]) =>
  ({
    entries: entries.map((e, i) => ({ id: `ent_${i}`, account: 'cardholder', kind: 'capture', at: 0, ...e })),
    net: (pairId?: string) =>
      entries.filter(e => pairId === undefined || e.pairId === pairId).reduce((s, e) => s + e.amount, 0),
  }) as unknown as Ledger;

test('[INV-01] checkAll is empty for an empty service', () => {
  const s = svc();
  assert.deepEqual(checkAll(s.ledger, s.payments), []);
});

test('[INV-02] checkAll is empty after a valid authorise, capture, refund and void sequence', () => {
  const s = svc();
  const p = s.authorise({ pan: TEST_CARDS.visa, expiry: EXPIRY, amount: 10_000, idempotencyKey: 'k1' });
  const c1 = s.capture(p.id, 6_000, 'c1');
  s.capture(p.id, 4_000);
  s.refund(p.id, c1.id, 2_500);
  s.void(auth(s, 750).id);
  assert.deepEqual(checkAll(s.ledger, s.payments, s['idempotent']), []);
});

test('[INV-03] LEDGER_BALANCED reports a pair that does not net to zero', () => {
  const ledger = fakeLedger([
    { pairId: 'pair_a', amount: 100, paymentId: 'pay_1' },
    { pairId: 'pair_a', amount: -100, paymentId: 'pay_1' },
    { pairId: 'pair_b', amount: 50, paymentId: 'pay_2' },
    { pairId: 'pair_b', amount: -40, paymentId: 'pay_2' },
  ]);
  const vs = LEDGER_BALANCED(ledger);
  assert.equal(vs.length, 1);
  assert.equal(vs[0].paymentId, 'pay_2');
  assert.match(vs[0].detail, /pair_b nets to 10/);
});

test('[INV-04] LEDGER_BALANCED reports offsetting bad pairs even when the ledger total is zero', () => {
  const ledger = fakeLedger([
    { pairId: 'pair_a', amount: 10, paymentId: 'pay_1' },
    { pairId: 'pair_b', amount: -10, paymentId: 'pay_1' },
  ]);
  assert.equal(ledger.net(), 0);
  assert.deepEqual(names(LEDGER_BALANCED(ledger)), ['LEDGER_BALANCED', 'LEDGER_BALANCED']);
});

test('[INV-05] CAPTURE_WITHIN_AUTH reports captures summing above the authorisation', () => {
  const s = svc();
  const p = auth(s, 1_000);
  s.capture(p.id, 1_000);
  s.payments.get(p.id)!.captures.push({ id: 'cap_extra', amount: minor(1), at: Date.now() });
  const vs = CAPTURE_WITHIN_AUTH(s.payments);
  assert.equal(vs.length, 1);
  assert.equal(vs[0].paymentId, p.id);
  assert.match(vs[0].detail, /captured 1001 exceeds authorised 1000/);
});

test('[INV-06] REFUND_TRACES_CAPTURE reports a refund whose capture is on another payment', () => {
  const s = svc();
  const a = auth(s, 1_000);
  const b = auth(s, 1_000);
  s.capture(a.id, 1_000);
  const cb = s.capture(b.id, 1_000);
  s.payments.get(a.id)!.refunds.push({ id: 'ref_x', amount: minor(100), captureId: cb.id, at: Date.now() });
  const vs = REFUND_TRACES_CAPTURE(s.payments);
  assert.equal(vs.length, 1);
  assert.equal(vs[0].paymentId, a.id);
  assert.match(vs[0].detail, new RegExp(`capture ${cb.id}, which is not on ${a.id}`));
});

test('[INV-07] REFUND_TRACES_CAPTURE is per capture, not a payment-level total', () => {
  const s = svc();
  const p = auth(s, 10_000);
  const c1 = s.capture(p.id, 3_000);
  s.capture(p.id, 7_000);
  s.payments.get(p.id)!.refunds.push({ id: 'ref_x', amount: minor(4_000), captureId: c1.id, at: Date.now() });
  const vs = REFUND_TRACES_CAPTURE(s.payments);
  assert.equal(vs.length, 1);
  assert.match(vs[0].detail, new RegExp(`refunded 4000 against capture ${c1.id} exceeds its amount 3000`));
});

test('[INV-08] NO_PAN_AT_REST reports a Luhn-valid card number in a payment, capture or refund', () => {
  for (const pan of [TEST_CARDS.visa, TEST_CARDS.amex, '411111111117']) {
    const s = svc();
    const p = auth(s);
    const c = s.capture(p.id, 1_000);
    (s.payments.get(p.id)!.captures[0] as unknown as { note: string }).note = `card ${pan}`;
    s.refund(p.id, c.id, 10);
    const vs = NO_PAN_AT_REST(s.payments, s.ledger);
    assert.deepEqual(names(vs), ['NO_PAN_AT_REST'], pan);
    assert.equal(vs[0].paymentId, p.id);
  }
});

test('[INV-09] NO_PAN_AT_REST reports a card number in a ledger entry', () => {
  const ledger = fakeLedger([
    { pairId: 'pair_a', amount: 1, paymentId: TEST_CARDS.mastercard },
    { pairId: 'pair_a', amount: -1, paymentId: 'pay_1' },
  ]);
  const vs = NO_PAN_AT_REST(new Map(), ledger);
  assert.equal(vs.length, 1);
  assert.match(vs[0].detail, /ledger entry ent_0 holds a Luhn-valid 16-digit value/);
});

test('[INV-10] NO_PAN_AT_REST reports a card number in an idempotency key or stored result', () => {
  const s = svc();
  s.authorise({ pan: TEST_CARDS.visa, expiry: EXPIRY, amount: 500, idempotencyKey: TEST_CARDS.discover });
  assert.deepEqual(NO_PAN_AT_REST(s.payments, s.ledger), []);
  assert.deepEqual(names(checkAll(s.ledger, s.payments, s['idempotent'])), ['NO_PAN_AT_REST']);

  const stored = new Map<string, unknown>([['k1', { echo: { pan: TEST_CARDS.visaDebit } }]]);
  assert.deepEqual(names(NO_PAN_AT_REST(new Map(), undefined, stored)), ['NO_PAN_AT_REST']);
});

test('[INV-11] NO_PAN_AT_REST ignores 13-digit at timestamps, short and long digit runs and Luhn-invalid runs', () => {
  const s = svc();
  const p = auth(s);
  const c = s.capture(p.id, 1_000);
  s.refund(p.id, c.id, 10);
  // A Luhn-valid 13-digit timestamp. `at` is a number, and numbers are not walked.
  const at = 1_700_000_000_004;
  assert.equal(String(at).length, 13);
  const payment = s.payments.get(p.id)!;
  payment.captures[0].at = at;
  const extra = payment as unknown as Record<string, string>;
  extra.stamp = 'at 1729600000001'; // a Luhn-invalid 13-digit timestamp as a string
  extra.short = '41111111112'; // Luhn-valid, 11 digits
  extra.long = `${TEST_CARDS.visa}0000`; // 20 digits
  extra.invalid = '4111111111111112';
  assert.deepEqual(NO_PAN_AT_REST(s.payments, s.ledger), []);
  assert.deepEqual(checkAll(s.ledger, s.payments), []);
});
