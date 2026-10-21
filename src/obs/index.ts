/*
 * The observability surface. Plan 2.5, satisfying FR-7.
 *
 * Five sinks, each capable of carrying a PAN out of the process. This is the home for
 * F2, and the sink list comes straight from PCI DSS v4.0 requirements 3.x and 10.x.
 *
 *   1. application log
 *   2. webhook error body
 *   3. telemetry attributes
 *   4. test fixture files (see test/fixtures)
 *   5. serialised exception path
 *
 * The fifth is the one worth having. A regex over source will not find it, because the
 * PAN is never written literally. Taint analysis will, because it follows the value.
 */

export type LogRecord = { level: 'debug' | 'info' | 'error'; message: string; at: number };
export type TelemetrySpan = { name: string; attributes: Record<string, unknown> };
export type WebhookDelivery = { url: string; status: number; body: unknown };

export const sinks = {
  logs: [] as LogRecord[],
  spans: [] as TelemetrySpan[],
  webhooks: [] as WebhookDelivery[],
};

export const log = {
  debug: (message: string) => sinks.logs.push({ level: 'debug', message: redactText(message), at: Date.now() }),
  info: (message: string) => sinks.logs.push({ level: 'info', message: redactText(message), at: Date.now() }),
  error: (message: string) => sinks.logs.push({ level: 'error', message: redactText(message), at: Date.now() }),
};

export const span = (name: string, attributes: Record<string, unknown>): void => {
  sinks.spans.push({ name, attributes: redact(attributes) as Record<string, unknown> });
};

export const webhook = (url: string, status: number, body: unknown): void => {
  sinks.webhooks.push({ url, status, body: redact(body) });
};

/*
 * Sink 5. Serialising a caught error together with the request that caused it is a
 * standard and useful debugging habit. It is also how a whole request object, including
 * whatever it holds, leaves the process.
 */
const PAN_FIELDS = new Set(['pan', 'cardNumber', 'primaryAccountNumber', 'cvv', 'cvc']);
const REDACTED = '[redacted]';

const luhnValid = (digits: string): boolean => {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = digits.charCodeAt(i) - 48;
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
};

/*
 * A chain is a run of digit groups joined by single spaces or dashes, so "4111 1111 1111
 * 1111" is caught as well as the bare form. Any window of consecutive groups holding
 * 12 to 19 digits that passes Luhn is replaced. Luhn, not length, is the test: a
 * 13-digit millisecond timestamp is a digit run of card length and must survive.
 */
const DIGIT_CHAIN = /\d+(?:[ -]\d+)*/g;

const redactChain = (chain: string): string => {
  const parts = chain.split(/([ -])/);
  const groups = parts.filter((_, i) => i % 2 === 0);
  const hidden = groups.map(() => false);
  for (let i = 0; i < groups.length; i += 1) {
    let digits = '';
    for (let j = i; j < groups.length; j += 1) {
      digits += groups[j];
      if (digits.length > 19) break;
      if (digits.length >= 12 && luhnValid(digits)) hidden.fill(true, i, j + 1);
    }
  }
  let out = '';
  groups.forEach((group, k) => {
    if (k > 0 && !(hidden[k] && hidden[k - 1])) out += parts[2 * k - 1];
    if (!hidden[k]) out += group;
    else if (k === 0 || !hidden[k - 1]) out += REDACTED;
  });
  return out;
};

const redactText = (text: string): string => text.replace(DIGIT_CHAIN, redactChain);

const redactWalk = (value: unknown, seen: WeakSet<object>): unknown => {
  if (typeof value === 'string') return redactText(value);
  if (!value || typeof value !== 'object' || value instanceof Date) return value;
  if (seen.has(value)) return '[circular]';
  seen.add(value);
  if (Array.isArray(value)) return value.map(v => redactWalk(v, seen));
  const entries: [string, unknown][] =
    value instanceof Error
      ? [
          ['name', value.name],
          ['message', value.message],
          ['stack', value.stack],
          ...(value.cause === undefined ? [] : [['cause', value.cause] as [string, unknown]]),
          ...Object.entries(value),
        ]
      : Object.entries(value as Record<string, unknown>);
  return Object.fromEntries(
    entries.map(([k, v]) => (PAN_FIELDS.has(k) ? [k, REDACTED] : [k, redactWalk(v, seen)])),
  );
};

/**
 * Deep-sanitise any value before it leaves the process. Strings have Luhn-valid card
 * numbers replaced, known card fields are blanked, and an Error becomes a plain object
 * whose message and stack are redacted. Numbers are left alone, as NO_PAN_AT_REST does.
 */
export const redact = (value: unknown): unknown => redactWalk(value, new WeakSet());

export const serialiseFailure = (error: unknown, context: unknown): string =>
  JSON.stringify({ error: redact(error), context: redact(context) });

export const resetSinks = (): void => {
  sinks.logs.length = 0;
  sinks.spans.length = 0;
  sinks.webhooks.length = 0;
};
