import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
const read=p=>readFileSync(new URL('../dist/'+p,import.meta.url),'utf8');
const slugs=[['ja','japan-overtime-calculator','ja-JP','日本の残業'],['en','singapore-incomplete-month-calculator','en-SG','Singapore'],['zh','taiwan-annual-leave-calculator','zh-Hant-TW','台灣特休']];
for(const [locale,slug,language,title] of slugs) {
  test(`${slug} has a native-language canonical, scope, formula and source before JS`,()=>{
    const html=read(`${locale}/${slug}/index.html`);
    assert.ok(html.includes(`<html lang="${language}"`));
    assert.ok(html.includes(`href="https://tools.oiyo.net/${locale}/${slug}/"`));
    assert.ok(html.includes(title));
    assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);
    assert.match(html, /"@type":"WebApplication"/);
    assert.match(html,/2026-10-24|24 October 2026/);
    assert.match(html, /type="checkbox"/);
    assert.doesNotMatch(html,/hreflang=/);
    assert.match(html, /client="load"/);
    assert.ok(read(`${locale}/index.html`).includes(`href="/${locale}/${slug}/"`));
    for(const other of ['ko','en','ja','zh','fr','es'].filter(l=>l!==locale)) {
      assert.equal(existsSync(new URL(`../dist/${other}/${slug}/index.html`,import.meta.url)),false);
      assert.equal(read(other==='ko'?'index.html':`${other}/index.html`).includes(`data-country-tool="${slug}"`),false);
    }
  });
}
test('root offers language discovery without listing foreign labor calculators',()=>{
  const root=read('index.html');
  for(const [locale,slug] of slugs){assert.ok(root.includes(`href="/${locale}/"`));assert.ok(!root.includes(`href="/${locale}/${slug}/"`));}
  const sitemap=readdirSync(new URL('../dist',import.meta.url)).filter(p=>/^sitemap.*xml$/.test(p)).map(read).join('');
  for(const [locale,slug] of slugs) assert.ok(sitemap.includes(`https://tools.oiyo.net/${locale}/${slug}/`));
});
