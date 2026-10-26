import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const [id,path,source,boundary] of [
 ['jp','ja/japan-overtime-calculator','minimumichiran','47'],
 ['ca','en/california-overtime-calculator','Health-Care-Worker-Minimum-Wage','unincorporated'],
 ['gb','en/gb-holiday-entitlement-calculator','calculating-the-minimum-wage','does not calculate a payslip'],
 ['es','es/spain-salary-payments-comparison','BOE-A-2025-21667','todos los municipios']
])test(`${id}: official jurisdiction lookup remains static and separate from calculator`,()=>{
 const h=readFileSync(`dist/${path}/index.html`,'utf8');assert.ok(h.includes(`data-labor-guide="${id}"`));assert.ok(h.includes(source));assert.ok(h.includes(boundary));assert.ok(h.includes('2026'));assert.ok(h.includes(`https://tools.oiyo.net/${path}/`));
});
