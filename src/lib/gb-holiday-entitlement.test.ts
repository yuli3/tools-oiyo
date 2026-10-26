import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateGbHoliday} from './gb-holiday-entitlement.ts';
const base={leaveYearStart:'2026-01-01',hireDate:'2020-01-01',leavingDate:'2026-12-31',daysPerWeek:4,leavingConfirmed:true,scopeConfirmed:true};
test('GOV.UK regular four-day full year is 22.4 statutory days',()=>{
 const r=calculateGbHoliday(base);assert.ok(r.ok);if(r.ok){assert.equal(r.annualDays,22.4);assert.equal(r.displayDays,22.4);assert.equal(r.yearDays,365);}
});
test('official leap-year leaver example preserves 139/366 of 28 days',()=>{
 const r=calculateGbHoliday({...base,leaveYearStart:'2019-07-01',leavingDate:'2019-11-16',hireDate:'2018-01-01',daysPerWeek:5});assert.ok(r.ok);
 if(r.ok){assert.equal(r.employedDays,139);assert.equal(r.yearDays,366);assert.equal(r.annualDays,28);assert.equal(r.displayDays,10.64);assert.ok(r.displayDays>=r.exactDays);}
});
test('joining and leaving uses the inclusive employment intersection, not working weekdays',()=>{
 const r=calculateGbHoliday({...base,hireDate:'2026-07-01',leavingDate:'2026-07-01',daysPerWeek:5});assert.ok(r.ok);if(r.ok){assert.equal(r.employedDays,1);assert.equal(r.displayDays,0.08);}
});
test('ongoing starters, irregular scope and invalid calendar values are not silently prorated',()=>{
 assert.deepEqual(calculateGbHoliday({...base,leavingConfirmed:false}),{ok:false,reason:'unsupported'});
 for(const x of [{hireDate:'2026-02-30'},{leavingDate:'2027-01-01'},{daysPerWeek:0},{daysPerWeek:5.5},{daysPerWeek:Infinity},{hireDate:'2027-01-01'}]) assert.equal(calculateGbHoliday({...base,...x}).ok,false);
 assert.equal(calculateGbHoliday({...base,scopeConfirmed:false}).ok,false);
});
