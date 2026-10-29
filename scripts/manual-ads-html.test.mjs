import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const root = new URL('../dist/', import.meta.url);
function files(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(new URL(`${e.name}/`, dir)) : e.name.endsWith('.html') ? [new URL(e.name, dir)] : []); }
const pages = files(root).map(url => ({ url, html: readFileSync(url, 'utf8') }));
const ads = pages.flatMap(({ url, html }) => [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].filter(m => m[1].includes('tools-result-end')).map(m => ({ url, script: m[1] })));
function placement(script, relatedAvailable) {
  const calls = [];
  const element = () => ({ setAttribute() {}, appendChild() {} });
  const related = { parentNode: { insertBefore() { calls.push('before-related'); } } };
  const main = { querySelector(selector) {
    // An unrelated last section deliberately appears first, even on pages with related links.
    return selector.includes('section') ? { parentNode: { insertBefore() { calls.push('before-input'); } } } : relatedAvailable ? related : null;
  }, appendChild() { calls.push('main-end'); } };
  runInNewContext(script, { location: { hostname: 'tools.oiyo.net' }, localStorage: { getItem() { return null; } }, document: { getElementById() { return main; }, createElement: element }, window: {} });
  return calls;
}
test('every built manual unit uses only the explicit related-tools anchor', () => {
  assert.ok(ads.length > 20, 'audit must cover the built site');
  for (const { url, script } of ads) {
    assert.deepEqual(placement(script, true), ['before-related'], url.pathname);
    assert.deepEqual(placement(script, false), ['main-end'], url.pathname);
  }
});
test('built noindex pages contain no manual ad script', () => {
  const excluded = pages.filter(({ html }) => /<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html));
  assert.ok(excluded.length > 0);
  for (const { url, html } of excluded) assert.ok(!html.includes('tools-result-end'), url.pathname);
});
