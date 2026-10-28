import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Ledger } from '../src/domain/ledger.ts';
import { minor } from '../src/domain/money.ts';

test('every post writes a balanced pair', () => {
  const ledger = new Ledger();
  ledger.post({ debit: 'cardholder', credit: 'merchant_receivable', amount: minor(2500), paymentId: 'p1', kind: 'authorise' });
  assert.equal(ledger.entries.length, 2);
  assert.equal(ledger.net(), 0);
});

test('ledger nets to zero across many postings', () => {
  const ledger = new Ledger();
  for (let i = 0; i < 50; i += 1) {
    ledger.post({ debit: 'merchant_receivable', credit: 'merchant_settled', amount: minor(i * 7 + 1), paymentId: `p${i}`, kind: 'capture' });
  }
  assert.equal(ledger.net(), 0);
});

test('one post writes exactly two entries sharing a pairId that sum to zero', () => {
  const ledger = new Ledger();
  const pairId = ledger.post({ debit: 'cardholder', credit: 'merchant_receivable', amount: minor(2500), paymentId: 'p1', kind: 'authorise' });
  const [debit, credit] = ledger.entries;
  assert.equal(ledger.entries.length, 2);
  assert.equal(debit.pairId, pairId);
  assert.equal(credit.pairId, pairId);
  assert.notEqual(debit.id, credit.id);
  assert.equal(debit.account, 'cardholder');
  assert.equal(debit.amount, 2500);
  assert.equal(credit.account, 'merchant_receivable');
  assert.equal(credit.amount, -2500);
  assert.equal(debit.amount + credit.amount, 0);
});

test('each posted entry records paymentId, kind and at', () => {
  const ledger = new Ledger();
  const before = Date.now();
  for (const kind of ['authorise', 'capture', 'refund', 'void'] as const) {
    ledger.post({ debit: 'merchant_receivable', credit: 'merchant_settled', amount: minor(100), paymentId: `p_${kind}`, kind });
  }
  const after = Date.now();
  assert.equal(ledger.entries.length, 8);
  for (const e of ledger.entries) {
    assert.equal(e.paymentId, `p_${e.kind}`);
    assert.ok(['authorise', 'capture', 'refund', 'void'].includes(e.kind));
    assert.ok(Number.isInteger(e.at) && e.at >= before && e.at <= after);
  }
});

test('after many postings the ledger and every pair net to zero', () => {
  const ledger = new Ledger();
  const accounts = ['cardholder', 'merchant_receivable', 'merchant_settled', 'scheme_fees', 'refunds_payable'] as const;
  const kinds = ['authorise', 'capture', 'refund', 'void'] as const;
  const pairIds: string[] = [];
  for (let i = 0; i < 200; i += 1) {
    pairIds.push(ledger.post({
      debit: accounts[i % 5],
      credit: accounts[(i + 2) % 5],
      amount: minor((i % 2 === 0 ? 1 : -1) * (i * 131 + 3)),
      paymentId: `p${i % 17}`,
      kind: kinds[i % 4],
    }));
  }
  assert.equal(ledger.entries.length, 400);
  assert.equal(ledger.net(), 0);
  assert.equal(new Set(pairIds).size, 200);
  const byPair = new Map<string, number[]>();
  for (const e of ledger.entries) byPair.set(e.pairId, [...(byPair.get(e.pairId) ?? []), e.amount]);
  assert.equal(byPair.size, 200);
  for (const [pairId, amounts] of byPair) {
    assert.equal(amounts.length, 2);
    assert.equal(amounts[0] + amounts[1], 0);
    assert.equal(ledger.net(pairId), 0);
  }
});

test('posting a fractional amount throws RangeError from minor and writes nothing', () => {
  const ledger = new Ledger();
  ledger.post({ debit: 'cardholder', credit: 'merchant_receivable', amount: minor(100), paymentId: 'p1', kind: 'authorise' });
  assert.throws(
    () => ledger.post({ debit: 'merchant_receivable', credit: 'merchant_settled', amount: 10.5 as never, paymentId: 'p1', kind: 'capture' }),
    { name: 'RangeError', message: 'money must be integer minor units, got 10.5' },
  );
  assert.equal(ledger.entries.length, 2);
  assert.equal(ledger.net(), 0);
});

test('the ledger exposes no way to write a single entry', () => {
  const ledger = new Ledger();
  ledger.post({ debit: 'cardholder', credit: 'merchant_receivable', amount: minor(500), paymentId: 'p1', kind: 'authorise' });
  const methods = Object.getOwnPropertyNames(Ledger.prototype).filter(n => n !== 'constructor' && n !== 'entries');
  assert.deepEqual(methods.sort(), ['forPayment', 'net', 'post', 'reset', 'totalFor']);
  assert.deepEqual(Object.keys(ledger), []);

  const entry = { id: 'ent_x', pairId: 'pair_x', account: 'cardholder', amount: minor(1), paymentId: 'p1', kind: 'authorise', at: 0 };
  const entries = ledger.entries as unknown as typeof entry[];
  assert.throws(() => entries.push(entry), TypeError);
  assert.throws(() => { entries[0].amount = minor(1); }, TypeError);
  assert.throws(() => { (ledger as unknown as { entries: unknown }).entries = [entry]; }, TypeError);
  assert.equal(ledger.entries.length, 2);
  assert.equal(ledger.entries[0].amount, 500);
  assert.equal(ledger.net(), 0);
});

test('the Account union and the accounts the ledger accepts are exactly the five ledger accounts', () => {
  const expected = ['cardholder', 'merchant_receivable', 'merchant_settled', 'scheme_fees', 'refunds_payable'];
  // The union is a type, erased at run time, so read it from the source.
  const source = readFileSync(new URL('../src/domain/ledger.ts', import.meta.url), 'utf8');
  const union = /export type Account =([^;]+);/.exec(source)?.[1] ?? '';
  assert.deepEqual([...union.matchAll(/'([a-z_]+)'/g)].map(m => m[1]), expected);
  // And the ledger accepts each of them and nothing else.
  const ledger = new Ledger();
  for (const account of expected) {
    const other = account === 'cardholder' ? 'merchant_receivable' : 'cardholder';
    ledger.post({ debit: account as never, credit: other as never, amount: minor(1), paymentId: 'p', kind: 'authorise' });
  }
  for (const unknown of ['cash', 'Cardholder', '']) {
    assert.throws(() => ledger.post({ debit: unknown as never, credit: 'cardholder', amount: minor(1), paymentId: 'p', kind: 'authorise' }),
      /unknown debit account/);
  }
});
