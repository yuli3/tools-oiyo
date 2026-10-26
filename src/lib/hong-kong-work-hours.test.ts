import test from 'node:test';
import assert from 'node:assert/strict';
import {compareHongKongWeek} from './hong-kong-work-hours.ts';
const base={weekEnding:'2026-01-24',employmentStart:'2025-01-01',hours:[20,20,20,8] as (number|null)[],sameEmployerConfirmed:true};
test('468 compares the selected low-hours week only, not all four weeks or benefit eligibility',()=>{
 const r=compareHongKongWeek(base);assert.ok(r.ok);if(r.ok){assert.equal(r.assessment,'reference-met');assert.equal(r.pathway,'rolling');assert.equal(r.windowTotal,68);assert.equal('contractEligible' in r,false);}
 const below=compareHongKongWeek({...base,hours:[20,20,19,8]});assert.ok(below.ok);if(below.ok)assert.equal(below.assessment,'review-needed');
});
test('transition is selected week specific and the old threshold is not replaced early',()=>{
 const old=compareHongKongWeek({...base,weekEnding:'2026-01-17',hours:[20,20,20,17]});assert.ok(old.ok);if(old.ok){assert.equal(old.threshold,18);assert.equal(old.assessment,'review-needed');}
 const now=compareHongKongWeek({...base,hours:[null,null,null,17]});assert.ok(now.ok);if(now.ok){assert.equal(now.threshold,17);assert.equal(now.pathway,'weekly');}
});
test('missing history and employment window gaps are unknown or unsupported, never legal ineligibility',()=>{
 assert.deepEqual(compareHongKongWeek({...base,hours:[20,null,20,8]}),{ok:false,reason:'incomplete'});
 assert.deepEqual(compareHongKongWeek({...base,employmentStart:'2026-01-10'}),{ok:false,reason:'unsupported'});
 assert.equal(compareHongKongWeek({...base,hours:[20,20,20,null]}).ok,false);
 assert.equal(compareHongKongWeek({...base,sameEmployerConfirmed:false}).ok,false);
});
test('requires a real Saturday ending and bounded weekly inputs',()=>{
 for(const x of [{weekEnding:'2026-01-25'},{weekEnding:'2026-02-30'},{hours:[20,20,20,169]},{hours:[20,20,20,NaN]},{hours:[20,20,20,-1]},{employmentStart:'2026-02-01'}])assert.equal(compareHongKongWeek({...base,...x}).ok,false);
});
