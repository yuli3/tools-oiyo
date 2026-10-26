type Failure = {ok:false;reason:'scope'|'invalid'|'unsupported'};
const fail=(reason:Failure['reason']):Failure=>({ok:false,reason});
const valid=(...values:number[])=>values.every(v=>Number.isFinite(v)&&v>=0);
/** WHY 2026-10-27: fixed weekly ordinary hours, four-week NES scope only.
 * 52-week proportional estimate, not a statutory payroll rounding rule. */
export function australiaAnnualLeave(input:{weeklyHours:number;eligibleWeeks:number;scopeConfirmed:boolean}) {
 if(!input.scopeConfirmed)return fail('scope');
 const {weeklyHours,eligibleWeeks}=input;
 if(!valid(weeklyHours,eligibleWeeks)||weeklyHours===0)return fail('invalid');
 if(weeklyHours>38||eligibleWeeks>52)return fail('unsupported');
 return {ok:true as const,annualHours:weeklyHours*4,accruedHours:weeklyHours*4*eligibleWeeks/52};
}
/** WHY 2026-10-27: federal holiday wages exclude OT, unlike vacation wages.
 * Caller confirms the four full weeks BEFORE the holiday week; no inferred calendar. */
export function canadaFederalHoliday(input:{eligibleWages:number;scopeConfirmed:boolean}) {
 if(!input.scopeConfirmed)return fail('scope');
 if(!valid(input.eligibleWages)||input.eligibleWages>100000000)return fail('invalid');
 return {ok:true as const,holidayPay:input.eligibleWages/20};
}
/** WHY 2026-10-27: completed anniversary-based employment year only; no
 * first-year termination, designated-year stub, leave balance or payout decision. */
export function canadaFederalVacation(input:{completedYears:number;eligibleWages:number;scopeConfirmed:boolean}) {
 if(!input.scopeConfirmed)return fail('scope');
 const {completedYears,eligibleWages}=input;
 if(!valid(completedYears,eligibleWages)||!Number.isInteger(completedYears)||eligibleWages>100000000)return fail('invalid');
 if(completedYears<1||completedYears>100)return fail('unsupported');
 const weeks=completedYears>=10?4:completedYears>=5?3:2,rate=weeks*.02;
 return {ok:true as const,weeks,rate,vacationPay:eligibleWages*rate};
}
