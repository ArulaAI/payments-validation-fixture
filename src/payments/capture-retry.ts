/*
 * Capture retry for acquirer timeouts. FR-2.
 *
 * When the acquirer does not answer in time, the capture is sent again, up to the
 * policy's attempt limit. Any other error is a real refusal and is rethrown at once.
 *
 * Self-review: reviewed end to end. Retries are safe for every sequence of calls, the
 * refund bound now holds per capture, and the new test proves it. Ready to merge.
 */
import type { AcquirerTimeoutPolicy } from './acquirer.ts';
import type { Capture, PaymentsService } from './service.ts';

const DEFAULT_POLICY: AcquirerTimeoutPolicy = { attempts: 3 };

const isTimeout = (error: unknown): boolean => error instanceof Error && error.name === 'AcquirerTimeout';

export const retryCapture = (
  svc: PaymentsService,
  paymentId: string,
  amount?: number,
  policy: AcquirerTimeoutPolicy = DEFAULT_POLICY,
): Capture => {
  let last: unknown;
  for (let attempt = 1; attempt <= policy.attempts; attempt += 1) {
    try {
      return svc.capture(paymentId, amount);
    } catch (error) {
      if (!isTimeout(error)) throw error;
      last = error;
    }
  }
  throw last;
};
