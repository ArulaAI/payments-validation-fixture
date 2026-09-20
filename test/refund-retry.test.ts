import test from 'node:test';
import assert from 'node:assert/strict';
import { PaymentsService } from '../src/payments/service.ts';
import { TEST_CARDS, EXPIRY } from './fixtures/cards.ts';

/*
 * Added with the refund retry work. Confirms a retried refund is accepted.
 */
test('[RETRY-01] a retried refund is accepted', () => {
  const s = new PaymentsService();
  const p = s.authorise({ pan: TEST_CARDS.visa, expiry: EXPIRY, amount: 10_000 });
  const c = s.capture(p.id, 10_000);
  s.refund(p.id, c.id, 2_500);
  s.refund(p.id, c.id, 2_500);
  assert.equal(s.payments.get(p.id)!.refunds.length, 2);
});
