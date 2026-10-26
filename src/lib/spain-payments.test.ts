import test from 'node:test';
import assert from 'node:assert/strict';
import {annualizeOffer} from './spain-payments.ts';
test('equal annual cash despite different ordinary and extra payments',()=>{
 const a=annualizeOffer({monthly:'2000',extra1:'0',extra2:'0'}),b=annualizeOffer({monthly:'1700',extra1:'1800',extra2:'1800'});
 assert.ok(a.ok&&b.ok);assert.equal(a.annualCents,2_400_000);assert.equal(a.annualCents,b.annualCents);
});
test('unequal extras and Spanish decimal comma retain cents',()=>{
 const r=annualizeOffer({monthly:'1000,01',extra1:'500.25',extra2:'700,32'});
 assert.ok(r.ok);assert.equal(r.annualCents,1_320_069);assert.equal(r.regularCents+r.extraCents,r.annualCents);
});
test('missing is unknown, zero is a valid explicit input',()=>{
 assert.deepEqual(annualizeOffer({monthly:'2000',extra1:'',extra2:'0'}),{ok:false,reason:'missing'});
 const r=annualizeOffer({monthly:'0',extra1:'0',extra2:'0'});assert.ok(r.ok);assert.equal(r.annualCents,0);
});
test('malformed or impractical amounts are refused rather than guessed',()=>{
 for(const monthly of ['-1','Infinity','1e3','1.234','1.000,50','1,000.50','NaN','100000001','0x10'])assert.deepEqual(annualizeOffer({monthly,extra1:'0',extra2:'0'}),{ok:false,reason:'invalid'},monthly);
});
