import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const locales = ['ko', 'en', 'ja', 'zh', 'fr', 'es'];
const slugs = ['image-converter', 'pdf-merge-split', 'qr-code-generator'];
const read = path => readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const sitemap = readdirSync(new URL('../dist/', import.meta.url)).filter(p => /^sitemap.*xml$/.test(p)).map(read).join('');
for (const locale of locales) for (const slug of slugs) {
  test(`${locale}/${slug}: canonical, locale, hydration and schema survive migration`, () => {
    const html = read(`${locale}/${slug}/index.html`);
    const url = `https://tools.oiyo.net/${locale}/${slug}/`;
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`));
    assert.ok(html.includes(`<link rel="canonical" href="${url}"`));
    for (const lang of locales) assert.ok(html.includes(`hreflang="${lang}" href="https://tools.oiyo.net/${lang}/${slug}/"`));
    assert.ok(html.includes(`hreflang="x-default" href="https://tools.oiyo.net/en/${slug}/"`));
    assert.match(html, /<astro-island[^>]+component-url=/);
    assert.match(html, /"@type":"WebApplication"/);
    assert.match(html, /"@type":"FAQPage"/);
    assert.match(html, /<h1/);
    assert.ok(html.includes('"slot":"1685510894"'), 'keep the Tools-specific ad unit');
    assert.ok(html.includes('G-915L6V38X6'), 'keep the existing GA4 property');
    assert.doesNotMatch(html, /<meta[^>]*name="robots"[^>]*content="noindex|https:\/\/blog.oiyo.net\/(?:ko|en|ja|zh|fr|es)\/(?:image-converter|pdf-merge-split|qr-code-generator)/);
    assert.ok(sitemap.includes(url));
    // Related utilities must be real local destinations, not copied Blog-only siblings.
    for (const related of slugs.filter(s => s !== slug)) assert.ok(html.includes(`href="/${locale}/${related}/"`));
  });
}
test('home exposes all three tools; 404 stays outside sitemap and ads', () => {
  const home = read('index.html');
  for (const slug of slugs) assert.ok(home.includes(`href="/ko/${slug}/"`));
  assert.doesNotMatch(sitemap, /https:\/\/tools.oiyo.net\/404\/?</);
  const error = read('404.html');
  assert.match(error, /noindex/);
  assert.doesNotMatch(error, /<ins[^>]*adsbygoogle/);
});
