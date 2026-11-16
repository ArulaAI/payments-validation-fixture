import test from 'node:test';
import assert from 'node:assert/strict';
import { PaymentsService } from '../src/payments/service.ts';
import { checkAll } from '../src/domain/invariants.ts';
import { TEST_CARDS, EXPIRY } from './fixtures/cards.ts';
import { redact, resetSinks, serialiseFailure, sinks } from '../src/obs/index.ts';

const svc = () => new PaymentsService();
const auth = (s: PaymentsService, amount = 10_000) =>
  s.authorise({ pan: TEST_CARDS.visa, expiry: EXPIRY, amount });

test('authorise records the amount and posts a balanced pair', () => {
  const s = svc();
  const p = auth(s, 2_500);
  assert.equal(p.authorised, 2_500);
  assert.equal(p.status, 'authorised');
  assert.equal(s.ledger.net(), 0);
  assert.equal(s.ledger.forPayment(p.id).length, 2);
});

test('authorise never stores a full PAN', () => {
  const s = svc();
  const p = auth(s);
  assert.equal(p.last4, '1111');
  assert.equal(JSON.stringify(p).includes(TEST_CARDS.visa), false);
});

test('idempotent authorise returns the original payment', () => {
  const s = svc();
  const a = s.authorise({ pan: TEST_CARDS.visa, expiry: EXPIRY, amount: 500, idempotencyKey: 'k1' });
  const b = s.authorise({ pan: TEST_CARDS.visa, expiry: EXPIRY, amount: 500, idempotencyKey: 'k1' });
  assert.equal(a.id, b.id);
  assert.equal(s.payments.size, 1);
});

test('capture splits into net and fee, and both post', () => {
  const s = svc();
  const p = auth(s, 10_000);
  s.capture(p.id, 10_000);
  assert.equal(s.ledger.totalFor(p.id, 'capture'), 10_000);
  assert.equal(s.ledger.net(), 0);
});

test('partial captures accumulate exactly and never exceed the authorisation', () => {
  const s = svc();
  const p = auth(s, 10_000);
  s.capture(p.id, 6_000);
  s.capture(p.id, 4_000);
  const captured = s.payments.get(p.id)!.captures.reduce((t, c) => t + c.amount, 0);
  assert.equal(captured, 10_000);
  assert.throws(() => s.capture(p.id, 1), RangeError);
});

test('capture beyond the authorisation is rejected', () => {
  const s = svc();
  const p = auth(s, 1_000);
  assert.throws(() => s.capture(p.id, 1_001), RangeError);
});

test('refund reduces nothing below zero and cannot exceed the capture', () => {
  const s = svc();
  const p = auth(s, 5_000);
  const c = s.capture(p.id, 5_000);
  s.refund(p.id, c.id, 3_000);
  assert.throws(() => s.refund(p.id, c.id, 2_001), RangeError);
  assert.equal(s.ledger.net(), 0);
});

test('void reverses an uncaptured authorisation', () => {
  const s = svc();
  const p = auth(s, 750);
  s.void(p.id);
  assert.equal(s.payments.get(p.id)!.status, 'voided');
  assert.equal(s.ledger.net(), 0);
});

test('a captured payment cannot be voided', () => {
  const s = svc();
  const p = auth(s, 750);
  s.capture(p.id, 750);
  assert.throws(() => s.void(p.id), RangeError);
});

test('settlement schedule conserves the captured total', () => {
  const s = svc();
  const p = auth(s, 10_000);
  s.capture(p.id, 10_000);
  for (const parts of [1, 2, 3, 7]) {
    const schedule = s.settlementSchedule(p.id, parts);
    assert.equal(schedule.reduce((a, b) => a + b, 0), 10_000);
  }
});

test('all four invariants hold after a mixed sequence', () => {
  const s = svc();
  const p = auth(s, 12_345);
  const c1 = s.capture(p.id, 5_000);
  s.capture(p.id, 7_345);
  s.refund(p.id, c1.id, 2_500);
  assert.deepEqual(checkAll(s.ledger, s.payments), []);
});

/*
 * End-to-end scenarios. Each drives the service through a sequence, then asks checkAll
 * (with the idempotency records included) for violations, and expects none.
 */

const PANS = Object.values(TEST_CARDS);
const idempotency = (s: PaymentsService) => s['idempotent'] as ReadonlyMap<string, unknown>;
const holds = (s: PaymentsService) => assert.deepEqual(checkAll(s.ledger, s.payments, idempotency(s)), []);

/** No fixture PAN in any sink, or in the serialised form of anything given. */
const noPanLeaked = (...extra: unknown[]) => {
  const text = JSON.stringify([sinks.logs, sinks.spans, sinks.webhooks, ...extra]);
  for (const pan of PANS) assert.equal(text.includes(pan), false, `sink holds fixture PAN ending ${pan.slice(-4)}`);
};

/** Run an operation, then check the sinks; on a throw, also check the serialised error. */
const step = <T>(op: () => T): T => {
  try {
    const result = op();
    noPanLeaked(result);
    return result;
  } catch (error) {
    noPanLeaked(serialiseFailure(error, null), String(error));
    throw error;
  }
};

const cardholderNet = (s: PaymentsService, paymentId: string) =>
  s.ledger
    .forPayment(paymentId)
    .filter(e => e.account === 'cardholder')
    .reduce((t, e) => t + e.amount, 0);

test('the Basic Example sequence', () => {
  resetSinks();
  const s = svc();
  const p = step(() => s.authorise({ pan: TEST_CARDS.visa, expiry: EXPIRY, amount: 10_000, idempotencyKey: 'k1' }));
  assert.match(p.id, /^pay_/);

  const c1 = step(() => s.capture(p.id, 6_000));
  assert.match(c1.id, /^cap_/);
  const s1 = sinks.spans.at(-1)!.attributes;
  assert.equal(s1.fee, 89);
  assert.equal(s1.net, 5_911);

  const c2 = step(() => s.capture(p.id, 4_000));
  assert.match(c2.id, /^cap_/);
  const s2 = sinks.spans.at(-1)!.attributes;
  assert.equal(s2.fee, 60);
  assert.equal(s2.net, 3_940);
  assert.equal(s.ledger.totalFor(p.id, 'capture'), 10_000);

  assert.throws(() => step(() => s.capture(p.id, 1)), { name: 'RangeError', message: 'capture 1 exceeds remaining 0' });

  const r = step(() => s.refund(p.id, c1.id, 2_500));
  assert.match(r.id, /^ref_/);
  assert.equal(r.amount, 2_500);

  assert.deepEqual(step(() => s.settlementSchedule(p.id, 3)), [3_334, 3_333, 3_333]);
  holds(s);
});

test('full capture with the default amount', () => {
  resetSinks();
  const s = svc();
  const p = step(() => auth(s, 7_777));
  const c = step(() => s.capture(p.id));
  assert.equal(c.amount, 7_777);
  assert.equal(s.payments.get(p.id)!.status, 'captured');
  assert.equal(s.ledger.totalFor(p.id, 'capture'), 7_777);
  holds(s);
});

test('capture of exactly the remaining amount succeeds, remaining + 1 is rejected', () => {
  resetSinks();
  const s = svc();
  const p = step(() => auth(s, 10_000));
  step(() => s.capture(p.id, 3_000));
  assert.throws(() => step(() => s.capture(p.id, 7_001)), {
    name: 'RangeError',
    message: 'capture 7001 exceeds remaining 7000',
  });
  const c = step(() => s.capture(p.id, 7_000));
  assert.equal(c.amount, 7_000);
  holds(s);
});

test('fee + net === capture for a range of amounts', () => {
  resetSinks();
  const amounts = [1, 2, 33, 34, 67, 99, 100, 101, 999, 1_234, 6_000, 4_000, 9_999, 10_000, 123_457, 1_000_003];
  for (const amount of amounts) {
    const s = svc();
    const p = step(() => auth(s, amount));
    step(() => s.capture(p.id, amount));
    const { fee, net } = sinks.spans.at(-1)!.attributes as { fee: number; net: number };
    assert.ok(Number.isInteger(fee) && Number.isInteger(net));
    assert.equal(fee + net, amount, `capture ${amount}`);
    assert.equal(s.ledger.totalFor(p.id, 'capture'), amount);
    holds(s);
  }
});

test('refund over refundable is rejected, including after an earlier partial refund', () => {
  resetSinks();
  const s = svc();
  const p = step(() => auth(s, 5_000));
  const c = step(() => s.capture(p.id, 5_000));
  assert.throws(() => step(() => s.refund(p.id, c.id, 5_001)), {
    name: 'RangeError',
    message: 'refund 5001 exceeds refundable 5000',
  });
  step(() => s.refund(p.id, c.id, 2_000));
  const before = s.ledger.entries.length;
  assert.throws(() => step(() => s.refund(p.id, c.id, 3_001)), {
    name: 'RangeError',
    message: 'refund 3001 exceeds refundable 3000',
  });
  assert.equal(s.ledger.entries.length, before);
  assert.equal(s.payments.get(p.id)!.refunds.length, 1);
  step(() => s.refund(p.id, c.id, 3_000));
  holds(s);
});

test('refund against a capture id from another payment is rejected', () => {
  resetSinks();
  const s = svc();
  const a = step(() => auth(s, 1_000));
  const b = step(() => auth(s, 1_000));
  const ca = step(() => s.capture(a.id, 1_000));
  step(() => s.capture(b.id, 1_000));
  const before = s.ledger.entries.length;
  assert.throws(() => step(() => s.refund(b.id, ca.id, 100)), {
    name: 'RangeError',
    message: `no capture ${ca.id} on ${b.id}`,
  });
  assert.equal(s.ledger.entries.length, before);
  assert.equal(s.payments.get(b.id)!.refunds.length, 0);
  holds(s);
});

test('void before capture releases the reservation', () => {
  resetSinks();
  const s = svc();
  const p = step(() => auth(s, 4_200));
  assert.equal(cardholderNet(s, p.id), 4_200);
  step(() => s.void(p.id));
  assert.equal(s.payments.get(p.id)!.status, 'voided');
  assert.equal(cardholderNet(s, p.id), 0);
  holds(s);
});

test('void after a partial capture is rejected', () => {
  resetSinks();
  const s = svc();
  const p = step(() => auth(s, 4_200));
  step(() => s.capture(p.id, 1_000));
  const before = s.ledger.entries.length;
  assert.throws(() => step(() => s.void(p.id)), { name: 'RangeError', message: 'cannot void a captured payment' });
  assert.equal(s.ledger.entries.length, before);
  assert.equal(s.payments.get(p.id)!.status, 'captured');
  holds(s);
});

test('capture after void is rejected and posts nothing', () => {
  resetSinks();
  const s = svc();
  const p = step(() => auth(s, 2_000));
  step(() => s.void(p.id));
  const before = s.ledger.entries.length;
  assert.throws(() => step(() => s.capture(p.id, 500)), {
    name: 'RangeError',
    message: 'cannot capture a voided payment',
  });
  assert.throws(() => step(() => s.capture(p.id)), {
    name: 'RangeError',
    message: 'cannot capture a voided payment',
  });
  assert.equal(s.ledger.entries.length, before);
  assert.equal(s.payments.get(p.id)!.captures.length, 0);
  holds(s);
});

test('idempotent replay of authorise and capture returns the identical result and writes nothing', () => {
  resetSinks();
  const s = svc();
  const req = { pan: TEST_CARDS.mastercard, expiry: EXPIRY, amount: 9_000, idempotencyKey: 'auth-1' };
  const p = step(() => s.authorise(req));
  const ledgerAfterAuth = s.ledger.entries.length;
  assert.equal(step(() => s.authorise(req)), p);
  assert.equal(s.payments.size, 1);
  assert.equal(s.ledger.entries.length, ledgerAfterAuth);

  const c = step(() => s.capture(p.id, 1_000, 'cap-1'));
  const ledgerAfterCapture = s.ledger.entries.length;
  assert.equal(step(() => s.capture(p.id, 1_000, 'cap-1')), c);
  assert.equal(s.payments.get(p.id)!.captures.length, 1);
  assert.equal(s.ledger.entries.length, ledgerAfterCapture);

  // The payment changes, then the same capture key is replayed.
  step(() => s.capture(p.id, 2_000));
  step(() => s.refund(p.id, c.id, 500));
  const ledgerAfterChange = s.ledger.entries.length;
  const replay = step(() => s.capture(p.id, 1_000, 'cap-1'));
  assert.equal(replay, c);
  assert.deepEqual(replay, { id: c.id, amount: 1_000, at: c.at });
  assert.equal(s.payments.get(p.id)!.captures.length, 2);
  assert.equal(s.ledger.entries.length, ledgerAfterChange);
  assert.equal(step(() => s.authorise(req)), p);
  assert.equal(s.payments.size, 1);
  holds(s);
});

test('99.99 in 7 instalments sums exactly', () => {
  resetSinks();
  const s = svc();
  const p = step(() => auth(s, 9_999));
  step(() => s.capture(p.id));
  const schedule = step(() => s.settlementSchedule(p.id, 7));
  assert.equal(schedule.length, 7);
  assert.ok(schedule.every(Number.isInteger));
  assert.equal(schedule.reduce((a, b) => a + b, 0), 9_999);
  assert.ok(Math.max(...schedule) - Math.min(...schedule) <= 1);
  holds(s);
});

test('a fractional amount is rejected and writes nothing', () => {
  resetSinks();
  const s = svc();
  assert.throws(() => step(() => auth(s, 99.99)), RangeError);
  assert.equal(s.payments.size, 0);
  assert.equal(s.ledger.entries.length, 0);

  const p = step(() => auth(s, 10_000));
  const before = s.ledger.entries.length;
  assert.throws(() => step(() => s.capture(p.id, 10.5)), RangeError);
  const c = step(() => s.capture(p.id, 5_000));
  assert.throws(() => step(() => s.refund(p.id, c.id, 0.01)), RangeError);
  assert.equal(s.ledger.entries.length, before + 4);
  assert.equal(s.payments.get(p.id)!.captures.length, 1);
  assert.equal(s.payments.get(p.id)!.refunds.length, 0);
  holds(s);
});

test('no fixture PAN reaches any sink across every card and operation', () => {
  resetSinks();
  const s = svc();
  for (const pan of PANS) {
    const p = step(() => s.authorise({ pan, expiry: EXPIRY, amount: 3_000, idempotencyKey: `idem-${pan.slice(-4)}` }));
    const c = step(() => s.capture(p.id, 2_000, `cap-${pan.slice(-4)}`));
    step(() => s.refund(p.id, c.id, 500));
    step(() => s.refund(p.id, c.id));
    step(() => s.settlementSchedule(p.id, 3));
    const q = step(() => s.authorise({ pan, expiry: EXPIRY, amount: 100 }));
    step(() => s.void(q.id));
  }
  assert.ok(sinks.logs.length > 0 && sinks.spans.length > 0 && sinks.webhooks.length > 0);
  noPanLeaked(s.payments, s.ledger.entries);
  holds(s);
});

test('a forced tokenisation failure leaks no PAN to the log or the serialised error', () => {
  resetSinks();
  const s = svc();
  // Twenty digits that begin with a fixture PAN: the vault rejects the length.
  const pan = `${TEST_CARDS.visa}0000`;
  let caught: unknown;
  try {
    step(() => s.authorise({ pan, expiry: EXPIRY, amount: 1_000 }));
  } catch (error) {
    caught = error;
  }
  assert.ok(caught instanceof RangeError);
  assert.equal(s.payments.size, 0);
  assert.equal(s.ledger.entries.length, 0);

  const errors = sinks.logs.filter(l => l.level === 'error');
  assert.equal(errors.length, 1);
  assert.equal(errors[0]!.message.includes(pan), false);
  noPanLeaked(serialiseFailure(caught, { pan }), redact({ pan, nested: { cardNumber: pan } }));
  holds(s);
});
