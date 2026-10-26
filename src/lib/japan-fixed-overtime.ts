import {calculateJapanPremium} from './japan-premium.ts';
export function compareJapanFixedOvertime(input:{hourly:number;hours:number;allowance:number;scopeConfirmed:boolean}){
 if(!input.scopeConfirmed)return {ok:false as const,reason:'scope' as const};
 if(![input.hourly,input.hours,input.allowance].every(Number.isFinite)||input.hourly<=0||input.hours<0||input.allowance<0||input.allowance>1_000_000_000)return {ok:false as const,reason:'invalid' as const};
 const r=calculateJapanPremium({hourly:input.hourly,ordinary:0,overtime:input.hours,night:0,overtimeNight:0,holiday:0,holidayNight:0});
 if(!r.ok)return r;
 // 2026-10-26 MHLW Q11: compare the complete daytime overtime amount,
 // not just its 25% premium. A signed difference is not a legal payment finding.
 return {ok:true as const,calculated:r.total,allowance:input.allowance,difference:r.total-input.allowance};
}
