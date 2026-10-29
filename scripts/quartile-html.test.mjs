import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const lang of ['ko','en','ja','zh','fr','es']) test(`${lang}: quartile discovery, convention, source and canonical`,()=>{
 const html=readFileSync(new URL(`../dist/${lang}/quartile-calculator/index.html`,import.meta.url),'utf8');
 assert.ok(html.includes(`https://tools.oiyo.net/${lang}/quartile-calculator/`));
 assert.ok(html.includes('https://stat.ethz.ch/R-manual/R-devel/library/stats/html/quantile.html'));
 assert.ok(html.includes('type 7') || html.includes('tipo 7'));
 assert.ok(html.includes('IQR=4'));
 const home=readFileSync(new URL(`../dist/${lang==='ko'?'':lang+'/'}index.html`,import.meta.url),'utf8');
 assert.ok(home.includes(`/${lang}/quartile-calculator/`));
 assert.ok(html.includes('"@type":"WebApplication"'));
 assert.ok(!html.includes('**'));
});
