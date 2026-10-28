/*
 * PaymentsService operations against the API surface and state machine. TR1, TR5, TR10, TR11.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { PaymentsService } from '../src/payments/service.ts';
import { SCHEME_FEE_RATE, allocate, minor } from '../src/domain/money.ts';
import { resetSinks, sinks } from '../src/obs/index.ts';
import { snapshot } from '../src/vault.ts';
import { TEST_CARDS, EXPIRY } from './fixtures/cards.ts';

const svc = () => new PaymentsService();
const auth = (s: PaymentsService, amount = 10_000) =>
  s.authorise({ pan: TEST_CARDS.visa, expiry: EXPIRY, amount });

const pairs = (s: PaymentsService, paymentId: string, kind: string) => {
  const entries = s.ledger.forPayment(paymentId).filter(e => e.kind === kind);
  const byPair = new Map<string, typeof entries>();
  for (const e of entries) byPair.set(e.pairId, [...(byPair.get(e.pairId) ?? []), e]);
  return [...byPair.values()].map(([debit, credit]) => ({
    debit: debit.account,
    credit: credit.account,
    amount: debit.amount,
  }));
};

test('[SVC-01] authorise stores a tokenised payment and posts one authorise pair', () => {
  resetSinks();
  const s = svc();
  const p = auth(s, 10_000);
  assert.match(p.id, /^pay_/);
  assert.equal(p.status, 'authorised');
  assert.equal(p.currency, 'GBP');
  assert.equal(p.authorised, 10_000);
  assert.deepEqual(p.captures, []);
  assert.deepEqual(p.refunds, []);
  assert.match(p.token, /^tok_/);
  assert.equal(JSON.stringify(p).includes(TEST_CARDS.visa), false);
  assert.deepEqual(pairs(s, p.id, 'authorise'), [
    { debit: 'cardholder', credit: 'merchant_receivable', amount: 10_000 },
  ]);
  assert.equal(s.ledger.entries.length, 2);
  const out = JSON.stringify([sinks.logs, sinks.spans]);
  assert.equal(out.includes(TEST_CARDS.visa), false);
  assert.equal(sinks.spans.at(-1)?.name, 'payment.authorise');
});

test('[SVC-02] authorise with a fractional amount throws and writes nothing', () => {
  const s = svc();
  const vaultBefore = snapshot().length;
  assert.throws(
    () => s.authorise({ pan: TEST_CARDS.visa, expiry: EXPIRY, amount: 10.5 }),
    { name: 'RangeError', message: 'money must be integer minor units, got 10.5' },
  );
  assert.equal(s.payments.size, 0);
  assert.equal(s.ledger.entries.length, 0);
  assert.equal(snapshot().length, vaultBefore);
});

test('[SVC-03] a tokenisation failure serialises a redacted request and rethrows', () => {
  resetSinks();
  const s = svc();
  const badPan = '4111 1111';
  assert.throws(
    () => s.authorise({ pan: badPan, expiry: EXPIRY, amount: 1_000 }),
    { name: 'RangeError', message: 'card number must be 12 to 19 digits' },
  );
  const errors = sinks.logs.filter(l => l.level === 'error');
  assert.equal(errors.length, 1);
  const record = JSON.parse(errors[0].message);
  assert.equal(record.error.message, 'card number must be 12 to 19 digits');
  assert.equal(record.context.pan, '[redacted]');
  assert.equal(record.context.amount, 1_000);
  assert.equal(errors[0].message.includes(badPan), false);
  assert.equal(s.payments.size, 0);
  assert.equal(s.ledger.entries.length, 0);
});

test('[SVC-04] partial captures take a 1.49% fee and the remainder cannot be exceeded', () => {
  resetSinks();
  const s = svc();
  const p = auth(s, 10_000);
  s.capture(p.id, 6_000);
  s.capture(p.id, 4_000);
  assert.deepEqual(pairs(s, p.id, 'capture'), [
    { debit: 'merchant_receivable', credit: 'merchant_settled', amount: 5_911 },
    { debit: 'merchant_receivable', credit: 'scheme_fees', amount: 89 },
    { debit: 'merchant_receivable', credit: 'merchant_settled', amount: 3_940 },
    { debit: 'merchant_receivable', credit: 'scheme_fees', amount: 60 },
  ]);
  const captureSpans = sinks.spans.filter(x => x.name === 'payment.capture').map(x => x.attributes);
  assert.deepEqual(captureSpans, [
    { paymentId: p.id, amount: 6_000, fee: 89, net: 5_911 },
    { paymentId: p.id, amount: 4_000, fee: 60, net: 3_940 },
  ]);
  assert.equal(s.payments.get(p.id)!.status, 'captured');
  const before = s.ledger.entries.length;
  assert.throws(() => s.capture(p.id, 1), { name: 'RangeError', message: 'capture 1 exceeds remaining 0' });
  assert.equal(s.ledger.entries.length, before);
  assert.equal(s.payments.get(p.id)!.captures.length, 2);
});

test('[SVC-05] capture rejects unknown and voided payments without posting', () => {
  const s = svc();
  assert.throws(() => s.capture('pay_missing', 100), { name: 'RangeError', message: 'unknown payment pay_missing' });
  const p = auth(s, 1_000);
  s.void(p.id);
  const before = s.ledger.entries.length;
  assert.throws(() => s.capture(p.id, 100), { name: 'RangeError', message: 'cannot capture a voided payment' });
  assert.throws(() => s.capture(p.id), { name: 'RangeError', message: 'cannot capture a voided payment' });
  assert.equal(s.ledger.entries.length, before);
  assert.deepEqual(s.payments.get(p.id)!.captures, []);
  assert.equal(s.payments.get(p.id)!.status, 'voided');
});

test('[SVC-06] capture with no amount takes the whole remaining authorisation', () => {
  const s = svc();
  const p = auth(s, 10_000);
  s.capture(p.id, 2_500);
  const c = s.capture(p.id);
  assert.equal(c.amount, 7_500);
  assert.equal(s.ledger.totalFor(p.id, 'capture'), 10_000);
});

test('[SVC-07] refund is bounded per capture and must belong to the payment', () => {
  const s = svc();
  const p = auth(s, 10_000);
  const c1 = s.capture(p.id, 6_000);
  const c2 = s.capture(p.id, 4_000);
  s.refund(p.id, c1.id, 2_500);
  const before = s.ledger.entries.length;
  // 10000 captured on the payment, but only 3500 remains on c1.
  assert.throws(() => s.refund(p.id, c1.id, 3_501), {
    name: 'RangeError',
    message: 'refund 3501 exceeds refundable 3500',
  });
  assert.equal(s.ledger.entries.length, before);
  assert.equal(s.payments.get(p.id)!.refunds.length, 1);
  s.refund(p.id, c1.id, 3_500);
  s.refund(p.id, c2.id, 4_000);
  assert.throws(() => s.refund(p.id, c2.id, 1), { name: 'RangeError', message: 'refund 1 exceeds refundable 0' });

  const other = auth(s, 500);
  const otherCapture = s.capture(other.id, 500);
  assert.throws(() => s.refund(p.id, otherCapture.id, 100), {
    name: 'RangeError',
    message: `no capture ${otherCapture.id} on ${p.id}`,
  });
  assert.deepEqual(pairs(s, p.id, 'refund')[0], {
    debit: 'merchant_settled',
    credit: 'refunds_payable',
    amount: 2_500,
  });
  assert.equal(s.payments.get(p.id)!.status, 'captured');
});

test('[SVC-08] refund logs and sends a webhook with the masked card only', () => {
  resetSinks();
  const s = svc();
  const p = auth(s, 1_000);
  const c = s.capture(p.id, 1_000);
  const r = s.refund(p.id, c.id, 400);
  const hook = sinks.webhooks.at(-1)!;
  assert.deepEqual(hook.body, { paymentId: p.id, refundId: r.id, amount: 400, card: '411111******1111' });
  assert.equal(JSON.stringify(sinks).includes(TEST_CARDS.visa), false);
});

test('[SVC-09] void releases an uncaptured authorisation and is refused after a capture', () => {
  const s = svc();
  const p = auth(s, 750);
  const voided = s.void(p.id);
  assert.equal(voided.status, 'voided');
  assert.deepEqual(pairs(s, p.id, 'void'), [
    { debit: 'merchant_receivable', credit: 'cardholder', amount: 750 },
  ]);

  const q = auth(s, 750);
  s.capture(q.id, 100);
  const before = s.ledger.entries.length;
  assert.throws(() => s.void(q.id), { name: 'RangeError', message: 'cannot void a captured payment' });
  assert.equal(s.ledger.entries.length, before);
  assert.equal(s.payments.get(q.id)!.status, 'captured');
});

test('[SVC-10] settlementSchedule allocates the captured total', () => {
  const s = svc();
  const p = auth(s, 10_000);
  s.capture(p.id, 6_000);
  s.capture(p.id, 4_000);
  assert.deepEqual(s.settlementSchedule(p.id, 3), allocate(minor(10_000), 3));
  assert.deepEqual(s.settlementSchedule(p.id, 3), [3_334, 3_333, 3_333]);
  assert.throws(() => s.settlementSchedule(p.id, 0), { name: 'RangeError', message: 'parts must be at least 1' });
});

test('[SVC-11] a repeated idempotency key returns the stored result and writes nothing', () => {
  const s = svc();
  const req = { pan: TEST_CARDS.visa, expiry: EXPIRY, amount: 10_000, idempotencyKey: 'auth-1' };
  const a = s.authorise(req);
  const entriesAfterAuth = s.ledger.entries.length;
  assert.equal(s.authorise(req), a);
  assert.equal(s.authorise({ ...req, amount: 1 }), a);
  assert.equal(s.payments.size, 1);
  assert.equal(s.ledger.entries.length, entriesAfterAuth);

  const c = s.capture(a.id, 6_000, 'cap-1');
  s.capture(a.id, 4_000);
  const entries = s.ledger.entries.length;
  // The payment has changed since, and is now fully captured. The key still replays.
  assert.equal(s.capture(a.id, 6_000, 'cap-1'), c);
  assert.equal(s.capture(a.id, undefined, 'cap-1'), c);
  assert.equal(s.payments.get(a.id)!.captures.length, 2);
  assert.equal(s.ledger.entries.length, entries);
});

test('[SVC-12] the scheme fee rate is the single 1.49% constant', () => {
  assert.deepEqual(SCHEME_FEE_RATE, { numerator: 149, denominator: 10_000 });
});
