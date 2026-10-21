import test from 'node:test';
import assert from 'node:assert/strict';
import { SCHEME_FEE_RATE, add, allocate, applyRate, bps, minor, sub } from '../src/domain/money.ts';

test('allocate never creates or destroys money', () => {
  for (const amount of [1, 7, 100, 1000, 9999, 123457]) {
    for (const parts of [1, 2, 3, 7, 11]) {
      const split = allocate(minor(amount), parts);
      assert.equal(split.reduce((a, b) => a + b, 0), amount, `${amount} into ${parts}`);
      assert.equal(split.length, parts);
    }
  }
});

test('allocate front-loads the remainder', () => {
  assert.deepEqual(allocate(minor(1000), 3), [334, 333, 333]);
});

test('applyRate rounds symmetrically about zero', () => {
  assert.equal(applyRate(minor(1000), 0.0149), 15);
  assert.equal(applyRate(minor(-1000), 0.0149), -15);
});

test('money rejects fractional minor units', () => {
  assert.throws(() => minor(1.5), RangeError);
});

test('minor rejects fractional and non-finite values with a clear message', () => {
  for (const bad of [10.5, NaN, Infinity, -Infinity]) {
    assert.throws(() => minor(bad), (e: unknown) =>
      e instanceof RangeError && e.message.startsWith('money must be integer minor units, got'));
  }
});

test('a single minor unit is a valid amount and add/sub stay integer', () => {
  assert.equal(minor(1), 1);
  assert.ok(Number.isInteger(add(minor(1), minor(2))));
  assert.equal(add(minor(1), minor(2)), 3);
  assert.equal(sub(minor(1), minor(2)), -1);
  assert.deepEqual(allocate(minor(1), 3), [1, 0, 0]);
  assert.equal(applyRate(minor(1), SCHEME_FEE_RATE), 0);
});

test('allocate spreads the remainder one unit at a time across the leading parts', () => {
  assert.deepEqual(allocate(minor(10000), 3), [3334, 3333, 3333]);
  const split = allocate(minor(9999), 7);
  assert.equal(split.reduce((a, b) => a + b, 0), 9999);
  assert.deepEqual(split, [1429, 1429, 1429, 1428, 1428, 1428, 1428]);
});

test('allocate conserves every amount across part counts 1..20, including negatives', () => {
  const amounts = [1, 2, 3, 19, 99, 100, 101, 997, 9999, 10000, 123457, 1_000_003, -1, -10, -9999];
  for (const amount of amounts) {
    for (let parts = 1; parts <= 20; parts += 1) {
      const split = allocate(minor(amount), parts);
      assert.equal(split.length, parts);
      assert.equal(split.reduce((a, b) => a + b, 0), amount, `${amount} into ${parts}`);
      assert.ok(Math.max(...split) - Math.min(...split) <= 1, `${amount} into ${parts} is even`);
      split.forEach(p => assert.ok(Number.isInteger(p)));
    }
  }
});

test('allocate rejects fewer than one part', () => {
  for (const parts of [0, -1, NaN]) {
    assert.throws(() => allocate(minor(100), parts), { name: 'RangeError', message: 'parts must be at least 1' });
  }
  assert.throws(() => allocate(minor(100), 2.5), RangeError);
});

test('applyRate takes the 1.49% scheme fee with an integer-scaled rate', () => {
  assert.deepEqual(SCHEME_FEE_RATE, { numerator: 149, denominator: 10_000 });
  assert.equal(applyRate(minor(6000), SCHEME_FEE_RATE), 89);
  assert.equal(applyRate(minor(4000), SCHEME_FEE_RATE), 60);
  assert.equal(applyRate(minor(6000), 0.0149), 89);
  assert.equal(applyRate(minor(4000), 0.0149), 60);
});

test('applyRate rounds half up at the .5 boundary instead of truncating', () => {
  assert.equal(applyRate(minor(1), { numerator: 1, denominator: 2 }), 1);
  assert.equal(applyRate(minor(3), { numerator: 1, denominator: 2 }), 2);
  assert.equal(applyRate(minor(50), bps(100)), 1);
  assert.equal(applyRate(minor(49), bps(100)), 0);
  // 1.005 is not exact in binary, so a float path rounds this case down.
  assert.equal(applyRate(minor(1005), bps(100)), 10);
  assert.equal(applyRate(minor(1005), 0.01), 10);
  // 1.49% of 3356 is 50.0044 and of 3355 is 49.9895, either side of 50.
  assert.equal(applyRate(minor(3355), SCHEME_FEE_RATE), 50);
  assert.equal(applyRate(minor(10_000_00), bps(5)), 500);
});

test('applyRate is symmetric for negative amounts', () => {
  for (const x of [1, 3, 50, 1000, 1005, 3355, 4000, 6000, 123457]) {
    for (const rate of [SCHEME_FEE_RATE, bps(100), { numerator: 1, denominator: 2 }]) {
      assert.equal(applyRate(minor(-x), rate), 0 - applyRate(minor(x), rate), `${-x} at ${rate.numerator}/${rate.denominator}`);
    }
  }
  assert.equal(applyRate(minor(-1), { numerator: 1, denominator: 2 }), -1);
});

test('applyRate rejects a rate that is not an integer ratio', () => {
  assert.throws(() => applyRate(minor(100), { numerator: 1.5, denominator: 100 }), RangeError);
  assert.throws(() => applyRate(minor(100), { numerator: 1, denominator: 0 }), RangeError);
  assert.throws(() => applyRate(minor(100), NaN), RangeError);
});
