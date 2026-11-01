import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const locale of ['ko','en','ja','zh','fr','es']) test(`height travel ${locale} SSR, sources and discovery`,()=>{
 const html=readFileSync(`dist/${locale}/height-world-travel/index.html`,'utf8');
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);
 assert.ok(html.includes(`https://tools.oiyo.net/${locale}/height-world-travel/`));
 assert.ok(html.includes('sr03-050.pdf'));assert.ok(html.includes('sizekorea.kr/'));
 assert.ok(html.includes('aria-pressed="true"'));assert.ok(html.includes('<svg'));
 assert.ok(html.includes('2020–2021'));assert.ok(html.includes('2021–2023'));
 assert.ok(!html.includes('**'));
 const hub=readFileSync(locale==='ko'?'dist/index.html':`dist/${locale}/index.html`,'utf8');
 assert.ok(hub.includes(`/${locale}/height-world-travel/`));
});
