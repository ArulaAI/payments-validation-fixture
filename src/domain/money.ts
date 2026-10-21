/*
 * Money as integer minor units. Plan 2.1, satisfying FR-3.
 *
 * This module is the natural home for F7, silent regression. Partial capture has to
 * split an authorised amount across several captures, and the split is where a rounding
 * defect hides. A one-cent drift here changes a webhook payload and a ledger row that
 * no test in the suite looks at.
 */

export type Minor = number & { readonly __brand: 'minor' };

export const minor = (n: number): Minor => {
  if (!Number.isInteger(n)) throw new RangeError(`money must be integer minor units, got ${n}`);
  return n as Minor;
};

export const add = (a: Minor, b: Minor): Minor => minor(a + b);
export const sub = (a: Minor, b: Minor): Minor => minor(a - b);

export const format = (m: Minor, currency = 'GBP'): string =>
  `${currency} ${(m / 100).toFixed(2)}`;

/*
 * Split an amount into n parts with no money created or destroyed.
 *
 * The remainder is distributed one minor unit at a time across the leading parts, which
 * is Fowler's allocation. The invariant that matters: sum(allocate(a, n)) === a for every
 * a and n. A naive implementation using Math.round on a/n breaks that quietly.
 */
export const allocate = (amount: Minor, parts: number): Minor[] => {
  if (!(parts >= 1)) throw new RangeError('parts must be at least 1');
  if (!Number.isInteger(parts)) throw new RangeError(`parts must be an integer, got ${parts}`);
  minor(amount);
  const base = Math.trunc(amount / parts);
  const remainder = amount - base * parts;
  const step = remainder < 0 ? -1 : 1;
  return Array.from({ length: parts }, (_, i) =>
    minor(base + (i < Math.abs(remainder) ? step : 0)),
  );
};

/*
 * A rate held as an integer ratio, so applying it never multiplies money by a float (TR1).
 * 1.49% is { numerator: 149, denominator: 10_000 }, built with bps(149).
 */
export type Rate = { readonly numerator: number; readonly denominator: number };

const toRate = (rate: Rate): Rate => {
  const { numerator, denominator } = rate;
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator) || denominator <= 0) {
    throw new RangeError(`rate must be an integer ratio with a positive denominator, got ${numerator}/${denominator}`);
  }
  return rate;
};

export const bps = (basisPoints: number): Rate => toRate({ numerator: basisPoints, denominator: 10_000 });

/** The single scheme fee rate, 1.49% (TR3). */
export const SCHEME_FEE_RATE: Rate = bps(149);

/*
 * Read a decimal rate such as 0.0149 as the exact ratio its literal spells, 149/10000.
 * The number is parsed from its decimal text, not multiplied, so no float enters the
 * calculation. Kept so callers that still pass a decimal rate get exact arithmetic.
 */
const fromDecimal = (rate: number): Rate => {
  const match = /^(-?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/.exec(String(rate));
  if (!Number.isFinite(rate) || !match) throw new RangeError(`rate must be finite, got ${rate}`);
  const [, sign, whole, fraction = '', exponent = '0'] = match;
  const shift = fraction.length - Number(exponent);
  const digits = BigInt(`${sign}${whole}${fraction}`);
  return shift >= 0
    ? { numerator: Number(digits), denominator: Number(10n ** BigInt(shift)) }
    : { numerator: Number(digits * 10n ** BigInt(-shift)), denominator: 1 };
};

/*
 * Apply a rate to an amount, for scheme fees and partial captures.
 * Rounds half up on the absolute value so that negative amounts round symmetrically (TR4).
 * Computed in integer arithmetic on BigInt, so there is no truncation and no float (TR1).
 */
export const applyRate = (amount: Minor, rate: Rate | number): Minor => {
  const { numerator, denominator } = typeof rate === 'number' ? fromDecimal(rate) : toRate(rate);
  const product = BigInt(minor(amount)) * BigInt(numerator);
  const magnitude = product < 0n ? -product : product;
  const den = BigInt(denominator);
  const rounded = magnitude / den + (2n * (magnitude % den) >= den ? 1n : 0n);
  return minor(Number(product < 0n ? -rounded : rounded));
};
