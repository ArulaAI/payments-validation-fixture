import test from 'node:test';
import assert from 'node:assert/strict';
import { redact } from '../src/obs/index.ts';

test('a 12-digit Luhn-valid card number, the shortest card length, is redacted', () => {
  assert.equal(redact('card 4000 0000 0002 declined'), 'card [redacted] declined');
});

test('an 11-digit Luhn-valid run is shorter than any card and survives', () => {
  assert.equal(redact('ref 4000 0000 006'), 'ref 4000 0000 006');
});
