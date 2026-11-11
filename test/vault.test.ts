/*
 * The card-data boundary: the vault, redaction and the observability sinks. TR9, TR11.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { describe, maskedFor, reset, snapshot, tokenise } from '../src/vault.ts';
import { log, redact, resetSinks, serialiseFailure, sinks, span, webhook } from '../src/obs/index.ts';
import { TEST_CARDS, EXPIRY } from './fixtures/cards.ts';
import { ALLOWLIST_BINS } from '../workbench/hooks/pan-scan.ts';
import { luhn } from '../workbench/lib.ts';

const PAN = TEST_CARDS.visaDebit;
const MIDDLE = PAN.slice(6, -4);
// Date.UTC(2026, 9, 3, 14, 0, 0): a 13-digit millisecond timestamp that fails Luhn.
const TIMESTAMP = 1791036000000;

test('[VLT-01] tokenise keeps the card record and never the PAN', () => {
  reset();
  const card = tokenise(PAN, EXPIRY);
  assert.match(card.token, /^tok_/);
  assert.deepEqual(describe(card.token), { token: card.token, last4: '5556', bin: '400005', expiry: EXPIRY });
  assert.deepEqual(Object.keys(card).sort(), ['bin', 'expiry', 'last4', 'token']);
  for (const value of [card, describe(card.token), snapshot()]) {
    assert.equal(JSON.stringify(value).includes(PAN), false);
    assert.equal(JSON.stringify(value).includes(MIDDLE), false);
  }
});

test('[VLT-02] tokenise strips separators and rejects a non-card length without echoing it', () => {
  reset();
  const card = tokenise('4111 1111 1111 1111', EXPIRY);
  assert.equal(card.bin, '411111');
  assert.equal(card.last4, '1111');
  assert.throws(() => tokenise('12345', EXPIRY), (e: Error) => e instanceof RangeError && !e.message.includes('12345'));
  assert.equal(snapshot().length, 1);
});

test('[VLT-03] describe and maskedFor handle an unknown token', () => {
  reset();
  const card = tokenise(PAN, EXPIRY);
  reset();
  assert.equal(describe(card.token), undefined);
  assert.equal(maskedFor(card.token), 'unknown');
});

test('[VLT-04] maskedFor shows only the BIN and the last four', () => {
  reset();
  const masked = maskedFor(tokenise(PAN, EXPIRY).token);
  assert.equal(masked, '400005******5556');
  assert.equal(masked.includes(MIDDLE), false);
  assert.equal(masked.replace(/\D/g, ''), '4000055556');
  const amex = maskedFor(tokenise(TEST_CARDS.amex, EXPIRY).token);
  assert.equal(amex, '378282******0005');
});

test('[RED-01] redact replaces card numbers in strings, bare or separated', () => {
  assert.equal(redact(`card ${PAN} declined`), 'card [redacted] declined');
  assert.equal(redact('card 4111-1111-1111-1111.'), 'card [redacted].');
  assert.equal(redact('amex 3782 822463 10005 ok'), 'amex [redacted] ok');
  assert.equal(redact(`ts 2026 ${TEST_CARDS.mastercard}`).includes(TEST_CARDS.mastercard), false);
});

test('[RED-02] redact walks nested objects and arrays', () => {
  const out = JSON.stringify(redact({
    request: { note: `retry ${TEST_CARDS.visa}`, items: [{ memo: TEST_CARDS.discover }], pan: 'x', cvv: '123' },
    list: [[`a ${TEST_CARDS.amex}`]],
  }));
  for (const pan of [TEST_CARDS.visa, TEST_CARDS.discover, TEST_CARDS.amex]) assert.equal(out.includes(pan), false);
  assert.equal(out.includes('123'), false);
  assert.match(out, /retry \[redacted\]/);
});

test('[RED-03] redact sanitises an Error message, stack and cause', () => {
  const error = new Error(`tokenise failed for ${PAN}`, { cause: new Error(`inner ${TEST_CARDS.visa}`) });
  assert.ok(error.stack?.includes(PAN));
  const out = redact(error) as Record<string, unknown>;
  assert.equal(out.message, 'tokenise failed for [redacted]');
  assert.match(String(out.stack), /tokenise failed for \[redacted\]/);
  const text = JSON.stringify(redact({ nested: { error } }));
  assert.equal(text.includes(PAN), false);
  assert.equal(text.includes(TEST_CARDS.visa), false);
});

test('[RED-04] redact leaves a millisecond timestamp and non-Luhn digit runs alone', () => {
  assert.equal(luhn(String(TIMESTAMP)), false);
  assert.deepEqual(redact({ at: TIMESTAMP, label: `at ${TIMESTAMP}` }), { at: TIMESTAMP, label: `at ${TIMESTAMP}` });
  assert.equal(redact('order 4111111111111112'), 'order 4111111111111112');
  assert.equal(redact('ref 12345678901234567890'), 'ref 12345678901234567890');
  assert.equal(redact('phone 020 7946 0018'), 'phone 020 7946 0018');
  const when = new Date(TIMESTAMP);
  assert.equal(redact(when), when);
});

test('[RED-05] redact survives a circular reference', () => {
  const a: Record<string, unknown> = { pan: PAN };
  a.self = a;
  assert.deepEqual(redact(a), { pan: '[redacted]', self: '[circular]' });
});

test('[OBS-01] serialiseFailure emits no PAN from message, stack or context', () => {
  const error = new Error(`bad card ${PAN}`);
  const out = serialiseFailure(error, { attempt: { note: `card was ${TEST_CARDS.visa}`, at: TIMESTAMP } });
  assert.equal(out.includes(PAN), false);
  assert.equal(out.includes(TEST_CARDS.visa), false);
  assert.ok(out.includes(String(TIMESTAMP)));
  const parsed = JSON.parse(out);
  assert.equal(parsed.error.message, 'bad card [redacted]');
  assert.equal(serialiseFailure(`raw ${PAN}`, null).includes(PAN), false);
});

test('[OBS-02] the log, span and webhook sinks redact what they receive', () => {
  resetSinks();
  log.info(`saw ${PAN}`);
  span('s', { card: PAN, at: TIMESTAMP });
  webhook('https://merchant.example/hooks', 500, { error: `card ${TEST_CARDS.visa}` });
  assert.equal(JSON.stringify(sinks).includes(PAN), false);
  assert.equal(JSON.stringify(sinks).includes(TEST_CARDS.visa), false);
  assert.equal(sinks.spans[0].attributes.at, TIMESTAMP);
});

test('[OBS-03] resetSinks empties the log, span and webhook sinks', () => {
  log.error('x');
  span('s', {});
  webhook('https://merchant.example/hooks', 200, {});
  resetSinks();
  assert.deepEqual(sinks, { logs: [], spans: [], webhooks: [] });
});

test('[FIX-01] every fixture card is a Luhn-valid, allowlisted scheme test number', () => {
  for (const [scheme, pan] of Object.entries(TEST_CARDS)) {
    assert.ok(luhn(pan), `${scheme} fails Luhn`);
    assert.ok(ALLOWLIST_BINS.includes(pan.slice(0, 6)), `${scheme} BIN is not allowlisted`);
  }
});
