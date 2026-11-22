import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRY_TOPICS, otherCountryLinks } from './country-topics.ts';

test('every topic entry resolves to a real page and has at least 3 countries', () => {
  for (const [topic, keys] of Object.entries(COUNTRY_TOPICS)) {
    assert.ok(keys.length >= 3, topic);
    assert.equal(new Set(keys).size, keys.length, `${topic} has no duplicates`);
    for (const k of keys) assert.ok(otherCountryLinks(k).length >= 2, `${topic}: ${k}`);
  }
});

test('links point across countries and never back to the page itself', () => {
  const links = otherCountryLinks('japan-rental-deposit-notice-checker');
  assert.ok(links.some((l) => l.href === '/fr/depot-de-garantie-preavis-irl/'));
  assert.ok(links.some((l) => l.href === '/de/widerruf-kaution-verjaehrung-rechner/' && l.flag === '🇩🇪'));
  assert.ok(!links.some((l) => l.key === 'japan-rental-deposit-notice-checker'));
  assert.equal(new Set(links.map((l) => l.href)).size, links.length);
  assert.deepEqual(otherCountryLinks('no-such-page'), []);
});
