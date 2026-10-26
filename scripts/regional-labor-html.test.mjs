import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
const root=new URL('../dist/',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const pages=[
 ['en','california-overtime-calculator','en-US','California','dir.ca.gov'],
 ['en','gb-holiday-entitlement-calculator','en-GB','confirmed leaving','gov.uk'],
 ['zh','hong-kong-work-hours-tracker','zh-Hant-HK','並非連續性合約裁定','labour.gov.hk'],
];
for(const [locale,slug,language,scope,source] of pages)test(`${slug}: native, discoverable, scoped, static sources and inert initial result`,()=>{
 const html=read(`${locale}/${slug}/index.html`);
 assert.ok(html.includes(`<html lang="${language}"`));
 assert.ok(html.includes(`href="https://tools.oiyo.net/${locale}/${slug}/"`));
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);
 assert.ok(html.includes(scope));assert.ok(html.includes(source));
 assert.match(html,/"@type":"WebApplication"/);assert.match(html,/type="checkbox"/);
 assert.match(html,/<fieldset[^>]*disabled/);
 assert.doesNotMatch(html,/data-labor-result=/);assert.doesNotMatch(html,/hreflang=/);
 assert.ok(read(`${locale}/index.html`).includes(`href="/${locale}/${slug}/"`));
 for(const other of ['ko','en','ja','zh','fr','es'].filter(x=>x!==locale)){
  assert.equal(existsSync(new URL(`${other}/${slug}/index.html`,root)),false);
  assert.ok(!read(other==='ko'?'index.html':`${other}/index.html`).includes(`data-country-tool="${slug}"`));
 }
});
test('new routes are in sitemap and foreign calculators stay out of Korean home',()=>{
 const sitemap=readdirSync(root).filter(x=>/^sitemap.*xml$/.test(x)).map(read).join('');
 for(const [locale,slug] of pages){assert.ok(sitemap.includes(`https://tools.oiyo.net/${locale}/${slug}/`));assert.ok(!read('index.html').includes(`href="/${locale}/${slug}/"`));}
});
