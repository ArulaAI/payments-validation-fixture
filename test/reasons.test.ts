import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REASON_CODES, isReasonCode, cardholderReason, analystReason, CARDHOLDER_REASONS,
} from '../src/risk/reasons.ts';

const BANNED = /fraud|suspicious|score|threshold|\d/i;

test('ReasonCode list holds exactly the six codes', () => {
  assert.deepEqual([...REASON_CODES].sort(), [
    'amount_unusual', 'card_testing_pattern', 'country_mismatch',
    'issuer_unknown', 'merchant_category_risk', 'time_of_day',
  ]);
  assert.ok(isReasonCode('time_of_day'));
  assert.ok(!isReasonCode('nope'));
});

test('cardholderReason is short and free of banned terms for every code', () => {
  for (const code of REASON_CODES) {
    const text = cardholderReason(code);
    assert.ok(text !== undefined);
    assert.ok(text.length <= 140);
    assert.doesNotMatch(text, BANNED);
  }
});

test('every allowlist entry is safe', () => {
  for (const text of Object.values(CARDHOLDER_REASONS)) {
    assert.ok(text.length <= 140);
    assert.doesNotMatch(text, BANNED);
  }
  assert.ok(Object.isFrozen(CARDHOLDER_REASONS));
});

test('model-feature codes do not reveal the feature', () => {
  assert.equal(cardholderReason('amount_unusual'), cardholderReason('country_mismatch'));
});

test('step_up_not_confirmed has its own text', () => {
  assert.equal(cardholderReason('step_up_not_confirmed'), "Your bank couldn't confirm this payment.");
});

test('analystReason is non-empty and never a cardholder string', () => {
  const cardholder = new Set(Object.values(CARDHOLDER_REASONS));
  for (const code of REASON_CODES) {
    assert.ok(analystReason(code).length > 0);
    assert.ok(!cardholder.has(analystReason(code)));
  }
});
