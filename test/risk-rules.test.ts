/*
 * Boundary tests for risk rules v1. The high-value threshold is inclusive: 1,000.00 or
 * more from a different country is declined, one minor unit less is not.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RiskRules, HIGH_VALUE_MINOR } from '../src/risk/rules.ts';

const at = Date.UTC(2026, 9, 3, 9, 0, 0);
// BIN 411111 is issued in GB (src/risk/issuers.ts); the shopper is in FR, so it is cross-border.
const crossBorder = (amount: number) => ({
  bin: '411111', last4: '1111', amount, ipCountry: 'FR', merchantId: 'm_shop', at,
});

test('[RR-01] a cross-border purchase of exactly 1,000.00 is declined', () => {
  assert.deepEqual(new RiskRules().evaluate(crossBorder(HIGH_VALUE_MINOR)), {
    outcome: 'decline', rule: 'HIGH_VALUE_CROSS_BORDER',
  });
});

test('[RR-02] a cross-border purchase one minor unit below 1,000.00 is approved', () => {
  assert.deepEqual(new RiskRules().evaluate(crossBorder(HIGH_VALUE_MINOR - 1)), { outcome: 'approve' });
});
