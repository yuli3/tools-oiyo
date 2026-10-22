import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const locales = ['ko','en','ja','zh','fr','es'];
for(const locale of locales) test(`${locale}: real build retains static schedules, graphs, currency and six-language owner`,()=>{
  const html=readFileSync(new URL(`../dist/${locale}/loan-comparison-calculator/index.html`,import.meta.url),'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);
  assert.ok(html.includes(`data-loan-comparison="${locale}"`));
  assert.equal((html.match(/data-loan-method=/g)||[]).length,3);
  assert.equal((html.match(/<table/g)||[]).length,3);
  assert.equal((html.match(/<svg role="img"/g)||[]).length,3);
  assert.equal((html.match(/<polyline/g)||[]).length,9);
  assert.ok(html.includes('value="USD"'));
  assert.ok(html.includes('value="KRW"'));
  assert.match(html, /"@type":"WebApplication"/);
  assert.ok(html.includes(`rel="canonical" href="https://tools.oiyo.net/${locale}/loan-comparison-calculator/"`));
  for(const lang of locales) assert.ok(html.includes(`hreflang="${lang}" href="https://tools.oiyo.net/${lang}/loan-comparison-calculator/"`));
  assert.doesNotMatch(html,/NaN|Infinity|undefined|\*\*/);
  // The shared shell has existing localized-navigation labels; protect this
  // complete new article rather than claiming to retranslate the whole shell.
  const article = html.match(/<article\b[\s\S]*?<\/article>/)?.[0];
  assert.ok(article);
  if(locale!=='ko') assert.doesNotMatch(article,/[가-힣]/);
});
