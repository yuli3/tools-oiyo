import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const slug='spain-salary-payments-comparison';
test('Spain static page preserves jurisdiction, source, scope and self canonical',()=>{
 const h=readFileSync(`dist/es/${slug}/index.html`,'utf8');
 for(const s of ['lang="es-ES"',`href="https://tools.oiyo.net/es/${slug}/"`,'BOE-A-2015-11430#a31','IRPF','convenio colectivo','12 ×','Primera paga extra','Segunda paga extra','No calcula'])assert.ok(h.includes(s),s);
 assert.ok(!h.includes('hreflang='));
});
test('only Spanish hub lists the Spain comparison',()=>{
 assert.ok(readFileSync('dist/es/index.html','utf8').includes(`/${slug}/`));
 for(const locale of ['en','fr','ja','zh'])assert.ok(!readFileSync(`dist/${locale}/index.html`,'utf8').includes(`/${slug}/`));
});
