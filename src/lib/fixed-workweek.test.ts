import {test} from 'node:test';
import assert from 'node:assert/strict';
import {annualLeave,grossOffer} from './fixed-workweek.ts';
test('German full-year minimum follows days, not daily hours',()=>{
 for(const [input,expected] of [['1',4],['3',12],['5',20],['6',24]] as const) assert.equal(annualLeave('de-leave',input,true),expected);
 for(const input of ['', '0','7','-1','2.5','Infinity']) assert.throws(()=>annualLeave('de-leave',input,true));
 assert.throws(()=>annualLeave('de-leave','5',false));
});
test('Dutch minimum remains hours with decimal contract hours',()=>{
 for(const [input,expected] of [['40',160],['24',96],['25',100],['37,5',150]] as const) assert.equal(annualLeave('nl-leave',input,true),expected);
 for(const input of ['', '0','-1','NaN','169']) assert.throws(()=>annualLeave('nl-leave',input,true));
});
test('confirmed fixed gross offers keep additional pay and weekly hours separate',()=>{
 const result=grossOffer(['4000','2000','40','4200','0','38'],true);
 assert.deepEqual(result,{annualA:50000,annualB:50400,difference:400,monthlyComparison:400/12,hoursDifference:-2});
 assert.throws(()=>grossOffer(['4000','','40','4200','0','38'],true));
 assert.throws(()=>grossOffer(['4000','0','40','4200','0','38'],false));
});
