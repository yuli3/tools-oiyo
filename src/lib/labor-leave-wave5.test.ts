import {test} from 'node:test';
import assert from 'node:assert/strict';
import {australiaAnnualLeave,canadaFederalHoliday,canadaFederalVacation} from './labor-leave-wave5.ts';
test('AU ordinary-hours proportions, no universal 20 days',()=>{
 assert.deepEqual(australiaAnnualLeave({weeklyHours:38,eligibleWeeks:26,scopeConfirmed:true}),{ok:true,annualHours:152,accruedHours:76});
 assert.deepEqual(australiaAnnualLeave({weeklyHours:20,eligibleWeeks:52,scopeConfirmed:true}),{ok:true,annualHours:80,accruedHours:80});
 assert.equal(australiaAnnualLeave({weeklyHours:38,eligibleWeeks:0,scopeConfirmed:true}).ok,true);
});
test('AU rejects scope, unsupported hours and nonfinite values',()=>{
 for(const [weeklyHours,eligibleWeeks] of [[0,1],[NaN,1],[38,-1],[39,1],[38,53],[38,Infinity]])assert.equal(australiaAnnualLeave({weeklyHours,eligibleWeeks,scopeConfirmed:true}).ok,false);
 assert.equal(australiaAnnualLeave({weeklyHours:20,eligibleWeeks:1,scopeConfirmed:false}).ok,false);
});
test('CA federal holiday uses twenty even for a partial earning window',()=>{
 for(const [eligibleWages,pay] of [[4000,200],[800,40],[0,0]])assert.deepEqual(canadaFederalHoliday({eligibleWages,scopeConfirmed:true}),{ok:true,holidayPay:pay});
 for(const eligibleWages of [-1,NaN,Infinity,100000001])assert.equal(canadaFederalHoliday({eligibleWages,scopeConfirmed:true}).ok,false);
 assert.equal(canadaFederalHoliday({eligibleWages:4000,scopeConfirmed:false}).ok,false);
});
test('CA completed anniversary-year tiers and wages including existing vacation pay',()=>{
 for(const [years,weeks,rate] of [[1,2,.04],[4,2,.04],[5,3,.06],[9,3,.06],[10,4,.08],[30,4,.08]])assert.deepEqual(canadaFederalVacation({completedYears:years,eligibleWages:43600,scopeConfirmed:true}),{ok:true,weeks,rate,vacationPay:43600*rate});
});
test('CA vacation rejects first-year/stub inputs, incomplete years and bad amounts',()=>{
 for(const completedYears of [0,-1,4.9,NaN,101])assert.equal(canadaFederalVacation({completedYears,eligibleWages:1000,scopeConfirmed:true}).ok,false);
 for(const eligibleWages of [-1,Infinity,NaN,100000001])assert.equal(canadaFederalVacation({completedYears:5,eligibleWages,scopeConfirmed:true}).ok,false);
 assert.equal(canadaFederalVacation({completedYears:5,eligibleWages:0,scopeConfirmed:false}).ok,false);
});
