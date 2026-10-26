import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const slugs=['australia-annual-leave-accrual-calculator','canada-federal-holiday-pay-calculator','canada-federal-vacation-calculator'];
for(const slug of slugs)test(`${slug}: static scope, official source, accessible guide, canonical and hydration gate`,()=>{
 const html=readFileSync(`dist/en/${slug}/index.html`,'utf8');
 assert.ok(html.includes(`https://tools.oiyo.net/en/${slug}/`));
 assert.ok(html.includes('Supported scope and exclusions'));assert.ok(html.includes('Calculation guide'));
 assert.ok(html.includes('Confirm the supported scope'));assert.ok(html.includes('disabled'));
 assert.ok(html.includes(slug.startsWith('australia')?'www.fairwork.gov.au':'Federal labour standards only'));
 assert.ok(html.includes('WebApplication'));assert.ok(!html.includes('data-leave-result='));
});
test('native English hub discovers all three and no foreign-locale routes activated',()=>{
 const hub=readFileSync('dist/en/index.html','utf8');
 for(const slug of slugs){assert.ok(hub.includes(`/en/${slug}/`));for(const locale of ['ko','ja','zh','fr','es'])assert.equal(existsSync(`dist/${locale}/${slug}/index.html`),false);}
});
