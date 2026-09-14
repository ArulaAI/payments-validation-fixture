/*
 * Refund retry helper.
 *
 * Support tooling calls this when a merchant reports that a refund did not arrive. It
 * reissues the same refund request, retrying a few times if the ledger is contended.
 */
import type { PaymentsService } from './service.ts';
import type { Refund } from './service.ts';

export const MAX_ATTEMPTS = 3;

export const reissueRefund = (
  svc: PaymentsService,
  paymentId: string,
  captureId: string,
  amount: number,
  maxAttempts: number = MAX_ATTEMPTS,
): Refund => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return svc.refund(paymentId, captureId, amount);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};
