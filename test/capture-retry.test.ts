import test from 'node:test';
import assert from 'node:assert/strict';
import { retryCapture } from '../src/payments/capture-retry.ts';
import { PaymentsService } from '../src/payments/service.ts';
import { TEST_CARDS, EXPIRY } from './fixtures/cards.ts';

const timeout = (): Error => Object.assign(new Error('acquirer did not answer'), { name: 'AcquirerTimeout' });

test('retryCapture sends the capture again after an acquirer timeout', () => {
  const svc = new PaymentsService();
  const p = svc.authorise({ pan: TEST_CARDS.visa, expiry: EXPIRY, amount: 5000 });
  const real = svc.capture.bind(svc);
  let calls = 0;
  svc.capture = (id, amount) => (calls += 1) === 1 ? (() => { throw timeout(); })() : real(id, amount);
  const capture = retryCapture(svc, p.id, 5000);
  assert.equal(capture.amount, 5000);
  assert.equal(calls, 2);
});

test('retryCapture rethrows a refusal without retrying', () => {
  const svc = new PaymentsService();
  const p = svc.authorise({ pan: TEST_CARDS.visa, expiry: EXPIRY, amount: 5000 });
  assert.throws(() => retryCapture(svc, p.id, 6000), /exceeds remaining/);
});
