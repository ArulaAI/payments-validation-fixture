import test from 'node:test';
import assert from 'node:assert/strict';
import { redact } from '../src/obs/index.ts';

test('a 12-digit Luhn-valid card number, the shortest card length, is redacted', () => {
  assert.equal(redact('card 4000 0000 0002 declined'), 'card [redacted] declined');
});

test('an 11-digit Luhn-valid run is shorter than any card and survives', () => {
  assert.equal(redact('ref 4000 0000 006'), 'ref 4000 0000 006');
});

/** A Luhn-valid number of the given length, built at run time so no card number sits in source. */
const luhnNumber = (length: number): string => {
  const body = '4' + '0'.repeat(length - 2);
  for (let check = 0; check <= 9; check += 1) {
    const digits = body + check;
    let sum = 0;
    for (let i = 0; i < digits.length; i += 1) {
      let d = Number(digits[digits.length - 1 - i]);
      if (i % 2 === 1) d = d * 2 > 9 ? d * 2 - 9 : d * 2;
      sum += d;
    }
    if (sum % 10 === 0) return digits;
  }
  throw new Error('unreachable');
};

test('17- and 19-digit Luhn-valid card numbers, the longest card lengths, are redacted', () => {
  for (const length of [17, 19]) {
    assert.equal(redact(`card ${luhnNumber(length)} declined`), 'card [redacted] declined', `${length} digits`);
  }
});
