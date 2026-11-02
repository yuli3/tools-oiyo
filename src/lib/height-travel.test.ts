import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {heightPosition,equivalentHeight,referenceFor} from './height-travel.ts';
const data=JSON.parse(fs.readFileSync(new URL('../data/height-reference.json',import.meta.url),'utf8'));
test('all 32 official reference groups are monotonic and invertible at published quantiles',()=>{
 assert.equal(data.rows.length,32);
 for(const row of data.rows) for(const [p,h] of row.quantiles){
  const r=heightPosition(h,row);assert.equal(r?.kind,'within');
  if(r?.kind==='within'){assert.ok(Math.abs(r.percentile-p)<1e-8);assert.ok(Math.abs((equivalentHeight(p,row)??0)-h)<1e-8);}
 }
});
test('bounded tails, invalid heights and malformed distribution never yield fabricated ranks',()=>{
 const row=data.rows[0];assert.equal(heightPosition(NaN,row),null);assert.equal(heightPosition(0,row),null);
 assert.equal(heightPosition(100,row)?.kind,'below');assert.equal(heightPosition(230,row)?.kind,'above');
 assert.equal(equivalentHeight(1,row),null);
 assert.equal(heightPosition(170,{...row,quantiles:[[5,160],[50,150]]}),null);
});
test('CDC male 20s median is 176.1 cm and hypothetical rank includes self',()=>{
 const row=data.rows.find((r:any)=>r.country==='US'&&r.sex==='male'&&r.ageMin===20);
 assert.deepEqual(heightPosition(176.1,row),{kind:'within',percentile:50,rank100:50.5});
});
test('every country has exactly one band per sex for each selectable decade',()=>{
 for(const country of ['KR','US','JP','CA']) for(const sex of ['male','female']) for(const decade of [20,30,40,50,60]){
  const matches=data.rows.filter((r:any)=>r.country===country&&r.sex===sex&&r.ageMin<=decade&&decade+9<=r.ageMax);
  assert.equal(matches.length,1,`${country} ${sex} ${decade}`);
  assert.ok(data.sources[country]?.url&&data.sources[country]?.credit);
 }
 assert.equal(referenceFor(data.rows,'JP','male',40)?.ageMin,30);
 assert.equal(referenceFor(data.rows,'CA','female',60)?.ageMax,79);
 assert.equal(referenceFor(data.rows,'JP','male',70),null);
});
test('official JP and CA medians match the published tables',()=>{
 const jp=referenceFor(data.rows,'JP','male',20)!,ca=referenceFor(data.rows,'CA','male',30)!;
 assert.deepEqual(heightPosition(171.0,jp),{kind:'within',percentile:50,rank100:50.5});
 assert.deepEqual(heightPosition(178.74,ca),{kind:'within',percentile:50,rank100:50.5});
 assert.deepEqual(heightPosition(158,jp),{kind:'below',bound:1});
 assert.deepEqual(heightPosition(188,ca),{kind:'above',bound:95});
 assert.equal(jp.n,706);assert.equal(ca.n,null);
});
