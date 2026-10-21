import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
const read = p => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const sitemap = readdirSync(new URL('../dist', import.meta.url)).filter(p => /^sitemap.*xml$/.test(p)).map(read).join('');
for (const locale of ['ko','en','ja','zh','fr','es']) {
  test(`${locale} PPI keeps geometry, accessible diagram, discovery and canonical owner`, () => {
    const html = read(`${locale}/monitor-ppi-calculator/index.html`);
    const url = `https://tools.oiyo.net/${locale}/monitor-ppi-calculator/`;
    assert.ok(html.includes(`<link rel="canonical" href="${url}"`));
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
    assert.match(html, /"@type":"WebApplication"/);
    assert.match(html, /<svg[^>]*role="img"/);
    assert.match(html, /<title id="ppi-geometry-title">/);
    assert.match(html, /<desc id="ppi-geometry-desc">/);
    assert.match(html, /<astro-island[^>]+component-url=/);
    assert.match(html, /PPI/);
    for(const lang of ['ko','en','ja','zh','fr','es']) assert.ok(html.includes(`hreflang="${lang}" href="https://tools.oiyo.net/${lang}/monitor-ppi-calculator/"`));
    assert.ok(sitemap.includes(url));
    assert.ok(read('index.html').includes(`href="/${locale}/monitor-ppi-calculator/"`));
    assert.ok(html.includes('"slot":"1685510894"'));
    assert.doesNotMatch(html, /<meta[^>]*name="robots"[^>]*content="noindex/);
  });
}
