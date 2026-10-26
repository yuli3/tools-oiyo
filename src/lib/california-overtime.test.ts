import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateCaliforniaOvertime} from './california-overtime.ts';
const input=(hours:number[])=>({hours,regularRate:20,scopeConfirmed:true});
test('DLSE no-pyramiding examples preserve daily premiums without adding them twice',()=>{
  for(const [hours,total,ordinary,overtime,double] of [
    [[10,10,10,10,10,0,0],1100,40,10,0],
    [[9,9,9,9,4,0,0],840,36,4,0],
    [[7,7,7,7,7,7,0],860,40,2,0],
    [[13,0,0,0,0,0,0],320,8,4,1],
    [[8,8,8,8,8,8,0],1040,40,8,0],
  ] as const){
    const r=calculateCaliforniaOvertime(input([...hours]));assert.ok(r.ok);
    if(r.ok){assert.equal(r.total,total);assert.deepEqual([r.ordinaryHours,r.overtimeHours,r.doubleHours],[ordinary,overtime,double]);assert.equal(r.rows.reduce((s,x)=>s+x.ordinary+x.dailyOvertime+x.weeklyOvertime+x.doubleTime,0),hours.reduce<number>((s,n)=>s+n,0));}
  }
});
test('unconfirmed scope and seven worked days do not produce a lower ordinary estimate',()=>{
 assert.equal(calculateCaliforniaOvertime({...input([8,8,8,8,8,0,0]),scopeConfirmed:false}).ok,false);
 const r=calculateCaliforniaOvertime(input([1,1,1,1,1,1,1]));assert.deepEqual(r,{ok:false,reason:'unsupported'});
});
test('invalid and fractional hours are treated explicitly',()=>{
 for(const hours of [[8],[-1,0,0,0,0,0,0],[25,0,0,0,0,0,0],[NaN,0,0,0,0,0,0]]) assert.equal(calculateCaliforniaOvertime(input(hours)).ok,false);
 const r=calculateCaliforniaOvertime(input([8.5,0,0,0,0,0,0]));assert.ok(r.ok);if(r.ok)assert.equal(r.total,175);
 assert.equal(calculateCaliforniaOvertime({...input([1,0,0,0,0,0,0]),regularRate:Infinity}).ok,false);
});
