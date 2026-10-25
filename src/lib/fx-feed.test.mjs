import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFrankfurterV2, parseFawaz, validateFeed, findOutliers, fetchKrwFeed, convertViaKrw, FX_CURRENCIES, FRANKFURTER_V2_URL, FAWAZ_URLS } from './fx-feed.mjs';
import snapshot from '../data/fx-snapshot.json' with { type: 'json' };

// USD 1 = 1300 KRW, 다른 통화는 USD 1 = 2 단위 → KRW 650
const v2Rows = (skip = []) => [{ date: '2026-10-25', base: 'USD', quote: 'KRW', rate: 1300 },
  ...FX_CURRENCIES.filter(c => c !== 'USD' && !skip.includes(c)).map(c => ({ date: c === 'PHP' ? '2026-10-24' : '2026-10-25', base: 'USD', quote: c, rate: 2 }))];
const fawazJson = { date: '2026-10-24', krw: Object.fromEntries(FX_CURRENCIES.map(c => [c.toLowerCase(), c === 'USD' ? 1 / 1310 : 1 / 640])) };
const ok = body => ({ ok: true, status: 200, json: async () => body });
const fail = status => ({ ok: false, status, json: async () => ({}) });
function mockFetch(routes) {
  const calls = [];
  const fn = async url => { calls.push(url); const r = routes[url]; if (!r) throw new Error(`unexpected ${url}`); if (r instanceof Error) throw r; return typeof r === 'function' ? r() : r; };
  fn.calls = calls; return fn;
}
const timeout = () => { const e = new Error('The operation was aborted due to timeout'); e.name = 'TimeoutError'; throw e; };
const NOW = () => '2026-10-25T00:00:00.000Z';

test('Frankfurter v2 USD-base rows become KRW per unit with per-currency dates', () => {
  const p = parseFrankfurterV2(v2Rows());
  assert.equal(p.asOf, '2026-10-25'); assert.equal(p.rates.USD, 1300); assert.equal(p.rates.TWD, 650);
  assert.equal(p.dates.PHP, '2026-10-24'); assert.equal(Object.keys(p.rates).length, FX_CURRENCIES.length);
  assert.throws(() => parseFrankfurterV2({ rates: {} }), /payload/);
  assert.throws(() => parseFrankfurterV2(v2Rows().slice(1)), /KRW/);
});
test('fawazahmed0 per-KRW payload is inverted', () => {
  const p = parseFawaz(fawazJson);
  assert.equal(p.asOf, '2026-10-24'); assert.equal(p.rates.USD, 1310); assert.equal(p.rates.AED, 640);
  assert.throws(() => parseFawaz({ date: 'x', krw: {} }), /payload/);
});
test('bad, zero, NaN or negative rates are dropped and fail validation', () => {
  const rows = v2Rows().map(r => r.quote === 'TWD' ? { ...r, rate: 0 } : r.quote === 'VND' ? { ...r, rate: NaN } : r.quote === 'AED' ? { ...r, rate: -1 } : r);
  const p = parseFrankfurterV2(rows);
  assert.ok(!('TWD' in p.rates) && !('VND' in p.rates) && !('AED' in p.rates));
  const base = { base: 'KRW', asOf: '2026-10-25', rates: Object.fromEntries(FX_CURRENCIES.map(c => [c, 1])) };
  assert.ok(validateFeed(base));
  for (const bad of [0, NaN, -5, '1', Infinity]) assert.equal(validateFeed({ ...base, rates: { ...base.rates, USD: bad } }), null);
  assert.equal(validateFeed({ ...base, asOf: 'x' }), null);
});
test('v2 success fills only missing currencies from fawazahmed0 and records sources', async () => {
  const f = mockFetch({ [FRANKFURTER_V2_URL]: ok(v2Rows(['TWD', 'VND'])), [FAWAZ_URLS[0]]: ok(fawazJson) });
  const feed = await fetchKrwFeed({ fetch: f, now: NOW });
  assert.equal(feed.asOf, '2026-10-25'); assert.equal(feed.rates.USD, 1300); assert.equal(feed.rates.TWD, 640);
  assert.deepEqual(feed.filled, ['TWD', 'VND']);
  assert.equal(feed.sources.TWD, 'fawazahmed0'); assert.equal(feed.sources.USD, 'frankfurter-v2');
  assert.match(feed.source, /Frankfurter v2.*fawazahmed0/);
});
test('complete v2 response does not call fawazahmed0', async () => {
  const f = mockFetch({ [FRANKFURTER_V2_URL]: ok(v2Rows()) });
  const feed = await fetchKrwFeed({ fetch: f, now: NOW });
  assert.deepEqual(f.calls, [FRANKFURTER_V2_URL]); assert.deepEqual(feed.filled, []);
});
test('chain falls through v2 HTTP error and jsDelivr timeout to pages.dev', async () => {
  const f = mockFetch({ [FRANKFURTER_V2_URL]: fail(503), [FAWAZ_URLS[0]]: timeout, [FAWAZ_URLS[1]]: ok(fawazJson) });
  const feed = await fetchKrwFeed({ fetch: f, now: NOW });
  assert.deepEqual(f.calls, [FRANKFURTER_V2_URL, ...FAWAZ_URLS]);
  assert.equal(feed.asOf, '2026-10-24'); assert.equal(feed.sources.USD, 'fawazahmed0'); assert.deepEqual(feed.filled, []);
});
test('AED peg is a last resort and is labeled', async () => {
  const f = mockFetch({ [FRANKFURTER_V2_URL]: ok(v2Rows(['AED'])), [FAWAZ_URLS[0]]: fail(500), [FAWAZ_URLS[1]]: new Error('ENOTFOUND') });
  const feed = await fetchKrwFeed({ fetch: f, now: NOW });
  assert.equal(feed.sources.AED, 'aed-peg'); assert.match(feed.notes.AED, /페그 환산/);
  assert.equal(feed.rates.AED, Number((1300 / 3.6725).toPrecision(8)));
});
test('total failure throws so the script keeps old files', async () => {
  const f = mockFetch({ [FRANKFURTER_V2_URL]: timeout, [FAWAZ_URLS[0]]: fail(404), [FAWAZ_URLS[1]]: fail(404) });
  await assert.rejects(fetchKrwFeed({ fetch: f, now: NOW }), /all sources failed/);
});
test('more than 30% move vs previous feed is rejected', async () => {
  const previous = { rates: { USD: 1300, TWD: 1000 } };
  assert.deepEqual(findOutliers({ rates: Object.fromEntries(FX_CURRENCIES.map(c => [c, c === 'USD' ? 1300 : 650])) }, previous), ['TWD']);
  const f = mockFetch({ [FRANKFURTER_V2_URL]: ok(v2Rows()) });
  await assert.rejects(fetchKrwFeed({ fetch: f, previous, now: NOW }), /TWD/);
  assert.ok(await fetchKrwFeed({ fetch: f, previous: { rates: { USD: 1250 } }, now: NOW }));
});
test('cross conversion goes through KRW', () => {
  const r = { USD: 1200, JPY: 8 };
  assert.equal(convertViaKrw(1, 'USD', 'KRW', r), 1200);
  assert.equal(convertViaKrw(1200, 'KRW', 'USD', r), 1);
  assert.equal(convertViaKrw(1, 'USD', 'JPY', r), 150);
});
test('committed build snapshot is a valid 19-currency feed', () => assert.ok(validateFeed(snapshot)));
