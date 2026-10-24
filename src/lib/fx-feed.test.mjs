import test from 'node:test';
import assert from 'node:assert/strict';
import { buildKrwFeed, validateFeed, convertViaKrw, FX_CURRENCIES } from './fx-feed.mjs';
import snapshot from '../data/fx-snapshot.json' with { type: 'json' };
const sample = { amount: 1, base: 'EUR', date: '2026-10-23', rates: Object.fromEntries([['KRW', 1500], ...FX_CURRENCIES.filter(c => c !== 'EUR').map(c => [c, c === 'USD' ? 1.25 : 2])]) };
test('EUR-based payload becomes KRW per unit', () => {
  const feed = buildKrwFeed(sample, '2026-10-25T00:00:00.000Z');
  assert.equal(feed.base, 'KRW'); assert.equal(feed.asOf, '2026-10-23');
  assert.equal(feed.rates.EUR, 1500); assert.equal(feed.rates.USD, 1200); assert.equal(feed.rates.JPY, 750);
  assert.equal(feed.fetchedAt, '2026-10-25T00:00:00.000Z'); assert.ok(validateFeed(feed));
});
test('missing currency or bad date fails instead of writing a partial feed', () => {
  const { USD, ...rest } = sample.rates;
  assert.throws(() => buildKrwFeed({ ...sample, rates: rest }), /USD/);
  assert.throws(() => buildKrwFeed({ ...sample, date: 'x' }), /date/);
  assert.throws(() => buildKrwFeed({ ...sample, base: 'USD' }));
  assert.equal(validateFeed({ base: 'KRW', asOf: '2026-10-23', rates: { USD: 0 } }), null);
});
test('cross conversion goes through KRW', () => {
  const r = { USD: 1200, JPY: 8 };
  assert.equal(convertViaKrw(1, 'USD', 'KRW', r), 1200);
  assert.equal(convertViaKrw(1200, 'KRW', 'USD', r), 1);
  assert.equal(convertViaKrw(1, 'USD', 'JPY', r), 150);
});
test('committed build snapshot is a valid feed', () => assert.ok(validateFeed(snapshot)));
