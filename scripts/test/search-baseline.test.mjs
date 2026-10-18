import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const dist = new URL('../../dist/', import.meta.url);
test('built Tools baseline preserves public verification, crawl files and manual ad slot', async () => {
  const file = 'naver52146f2078cb44bdde5177bd3a0e3e0a.html';
  assert.equal((await readFile(new URL(file, dist), 'utf8')).trim(), `naver-site-verification: ${file}`);
  assert.match(await readFile(new URL('robots.txt', dist), 'utf8'), /https:\/\/tools\.oiyo\.net\/sitemap-index\.xml/);
  assert.match(await readFile(new URL('ads.txt', dist), 'utf8'), /pub-9541920090543312/);
  assert.match(await readFile(new URL('llms.txt', dist), 'utf8'), /tools\.oiyo\.net/);
  const home = await readFile(new URL('index.html', dist), 'utf8');
  assert.match(home, /G-915L6V38X6/);
  assert.match(home, /1685510894/);
  assert.match(home, /783A69A1E6B2817777BDE8F3083852CD/);
  const missing = await readFile(new URL('404.html', dist), 'utf8');
  assert.match(missing, /noindex/);
  assert.doesNotMatch(missing, /rel="canonical"/);
  assert.doesNotMatch(missing, /adsbygoogle\.js|1685510894/);
});
