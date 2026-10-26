export type AustraliaOffer={rate:number;weeklyHours:number;workedWeeks:number;leaveHours:number;leaveRate:number};
export function calculateAustraliaOffer(input:AustraliaOffer){
 const {rate,weeklyHours,workedWeeks,leaveHours,leaveRate}=input;
 if(!Object.values(input).every(n=>Number.isFinite(n)&&n>=0)||rate>1_000_000||leaveRate>1_000_000||weeklyHours>168||workedWeeks>52)return {ok:false as const,reason:'invalid' as const};
 const workedHours=weeklyHours*workedWeeks,periodHours=weeklyHours*52;
 // 2026-10-26: leave replaces hours inside the same illustrative 52-week
 // budget; adding it on top of 52 worked weeks would inflate comparisons.
 if(workedHours+leaveHours>periodHours+1e-8)return {ok:false as const,reason:'hours' as const};
 const workedPay=workedHours*rate,leavePay=leaveHours*leaveRate,total=workedPay+leavePay;
 return {ok:true as const,workedHours,leaveHours,unpaidHours:Math.max(0,periodHours-workedHours-leaveHours),workedPay,leavePay,total};
}
