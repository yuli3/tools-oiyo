import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const pages=[['de','germany-work-rest-guide','de-DE'],['nl','netherlands-hours-holiday-ledger','nl-NL'],['fr','france-resignation-notice-guide','fr-FR'],['nl','netherlands-holiday-allowance-check','nl-NL'],['es','spain-final-pay-checklist','es-ES']];
for(const [locale,slug,tag] of pages)test('native labor guide '+slug,()=>{
 const h=readFileSync(new URL('../dist/'+locale+'/'+slug+'/index.html',import.meta.url),'utf8');
 assert.ok(h.includes('lang="'+tag+'"'));assert.ok(h.includes('https://tools.oiyo.net/'+locale+'/'+slug+'/'));
 assert.ok(h.includes('data-labor-checklist'));assert.ok(h.includes('application/ld+json'));assert.ok(h.includes('2026'));
 assert.equal((h.match(/type="checkbox"/g)||[]).length,3);
 const hub=readFileSync(new URL('../dist/'+locale+'/index.html',import.meta.url),'utf8');
 assert.ok(hub.includes('/'+locale+'/'+slug+'/'));
 assert.ok(!h.includes('href="https://blog.oiyo.net/de/license/'));assert.ok(!h.includes('href="https://blog.oiyo.net/nl/license/'));
});
const fixedPages=[['de','germany-annual-leave-minimum','de-DE','de-leave'],['nl','netherlands-annual-leave-minimum','nl-NL','nl-leave'],['de','germany-gross-offer-comparison','de-DE','de-offer']];
for(const [locale,slug,tag,kind] of fixedPages)test('fixed workweek native page '+slug,()=>{
 const h=readFileSync(new URL('../dist/'+locale+'/'+slug+'/index.html',import.meta.url),'utf8');
 assert.ok(h.includes('lang="'+tag+'"'));
 assert.ok(h.includes('rel="canonical" href="https://tools.oiyo.net/'+locale+'/'+slug+'/"'));
 assert.ok(h.includes('data-fixed-workweek="'+kind+'"'));
 assert.equal((h.match(/type="checkbox"/g)||[]).length,1);
 assert.ok(h.includes('aria-live="polite"'));
 assert.ok(!h.includes('data-labor-checklist'));
 assert.ok(!h.includes('<dd class="font-semibold">'));
 const hub=readFileSync(new URL('../dist/'+locale+'/index.html',import.meta.url),'utf8');
 assert.ok(hub.includes('/'+locale+'/'+slug+'/'));
});
