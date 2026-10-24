import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../dist/', import.meta.url));
for (const locale of ['ko','en','ja','zh','fr','es']) {
  test(`${locale}: static results, canonical, language alternates and discoverability`, () => {
    const html = readFileSync(`${root}${locale}/usage-cost-calculator/index.html`, 'utf8');
    assert.match(html, new RegExp(`<html[^>]+lang="${locale}"`));
    assert.ok(html.includes(`https://tools.oiyo.net/${locale}/usage-cost-calculator/`));
    assert.match(html, /<table/);
    assert.match(html, /data-usage-cost/);
    assert.match(html, /aria-hidden="true"/);
    assert.match(html, /UtilitiesApplication/);
    // 2026-10-25: chart values must be real SSR text, not hover-only labels.
    for (const value of locale === 'fr' || locale === 'es' ? ['2,00','6,00'] : ['2.00','6.00']) assert.ok(html.includes(value));
    assert.match(html, /<th[^>]+scope="row"/);
    for (const code of ['ko','en','ja','zh','fr','es']) assert.ok(html.includes(`/${code}/usage-cost-calculator/`));
    const home = readFileSync(locale === 'ko' ? `${root}index.html` : `${root}${locale}/index.html`, 'utf8');
    assert.ok(home.includes(`/${locale}/usage-cost-calculator/`));
    if (locale !== 'ko') assert.doesNotMatch(html, /가상 예시|미사용|사용비 비교/);
  });
}
