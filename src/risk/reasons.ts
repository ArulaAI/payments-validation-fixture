/*
 * Reason codes and the wording attached to them.
 *
 * Cardholder text is a draft allowlist pending Legal approval. Analyst text names features
 * and must never reach the merchant or a GatewayResult.
 */

export type ReasonCode =
  | 'amount_unusual'
  | 'country_mismatch'
  | 'merchant_category_risk'
  | 'time_of_day'
  | 'issuer_unknown'
  | 'card_testing_pattern'; // reserved for F2.2

export const REASON_CODES: readonly ReasonCode[] = Object.freeze([
  'amount_unusual',
  'country_mismatch',
  'merchant_category_risk',
  'time_of_day',
  'issuer_unknown',
  'card_testing_pattern',
] as const);

export const isReasonCode = (x: unknown): x is ReasonCode =>
  typeof x === 'string' && (REASON_CODES as readonly string[]).includes(x);

export const CARDHOLDER_REASONS: Readonly<Record<string, string>> = Object.freeze({
  decline_generic: 'Your bank could not approve this payment.',
  step_up_not_confirmed: "Your bank couldn't confirm this payment.",
  card_testing: 'Your bank could not approve this payment. Please try again later.',
});

/** Every model reason maps to the same text, so a reason cannot help tune the next attempt. */
export const cardholderReason = (code: ReasonCode | 'step_up_not_confirmed'): string | undefined =>
  code === 'step_up_not_confirmed'
    ? CARDHOLDER_REASONS.step_up_not_confirmed
    : isReasonCode(code)
      ? CARDHOLDER_REASONS.decline_generic
      : undefined;

const ANALYST_REASONS: Readonly<Record<ReasonCode, string>> = Object.freeze({
  amount_unusual: 'Amount is unusual for this card or merchant category',
  country_mismatch: 'IP country differs from issuer country',
  merchant_category_risk: 'Merchant category carries elevated risk',
  time_of_day: 'Transaction time is unusual for this card',
  issuer_unknown: 'Issuer could not be determined from the BIN',
  card_testing_pattern: 'Card-testing pattern detected across cards and merchants',
});

export const analystReason = (code: ReasonCode): string => ANALYST_REASONS[code];
