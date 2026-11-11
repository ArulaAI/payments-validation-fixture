/*
 * Tokenisation. Plan 2.6, satisfying FR-9 (NO_PAN_AT_REST).
 *
 * The vault is the only place a PAN is allowed to exist, and even here it is held as a
 * last-four plus a token. Everything downstream carries the token. That is what makes
 * "no PAN at rest" an invariant a command can assert rather than a slogan.
 */

export type Token = string & { readonly __brand: 'token' };

export type Card = {
  token: Token;
  last4: string;
  bin: string;
  expiry: string;
};

const store = new Map<Token, { last4: string; bin: string; expiry: string }>();
let counter = 0;

export const tokenise = (pan: string, expiry: string): Card => {
  const digits = pan.replace(/\D/g, '');
  // The message names the rule, never the value, because it reaches the failure sink.
  if (digits.length < 12 || digits.length > 19) {
    throw new RangeError('card number must be 12 to 19 digits');
  }
  const token = `tok_${(++counter).toString(36).padStart(8, '0')}` as Token;
  const record = { last4: digits.slice(-4), bin: digits.slice(0, 6), expiry };
  store.set(token, record);
  return { token, ...record };
};

export const describe = (token: Token): Card | undefined => {
  const r = store.get(token);
  return r ? { token, ...r } : undefined;
};

export const maskedFor = (token: Token): string => {
  const r = store.get(token);
  return r ? `${r.bin}******${r.last4}` : 'unknown';
};

/** Every record the vault holds, as copies. Lets a test assert no PAN at rest. */
export const snapshot = (): Card[] => [...store.keys()].map(token => describe(token) as Card);

export const reset = (): void => {
  store.clear();
  counter = 0;
};
