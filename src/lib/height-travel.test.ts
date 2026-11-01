import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {heightPosition,equivalentHeight} from './height-travel.ts';
const data=JSON.parse(fs.readFileSync(new URL('../data/height-reference.json',import.meta.url),'utf8'));
test('all 20 official reference groups are monotonic and invertible at published quantiles',()=>{
 assert.equal(data.rows.length,20);
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
