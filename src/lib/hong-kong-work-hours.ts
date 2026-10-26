import {laborDate,laborIso,DAY_MS} from './labor-date.ts';
export function compareHongKongWeek(input:{weekEnding:string;employmentStart:string;hours:(number|null)[];sameEmployerConfirmed:boolean}) {
  if(!input.sameEmployerConfirmed)return {ok:false as const,reason:'unconfirmed' as const};
  const end=laborDate(input.weekEnding),hire=laborDate(input.employmentStart);
  if(end===null||hire===null||new Date(end).getUTCDay()!==6||hire>end||input.weekEnding<'2025-01-04'||input.hours.length!==4||!input.hours.every(n=>n===null||(Number.isFinite(n)&&n>=0&&n<=168)))return {ok:false as const,reason:'invalid' as const};
  const selectedHours=input.hours[3],windowStart=end-27*DAY_MS,threshold=input.weekEnding<'2026-01-18'?18:17;
  if(selectedHours===null)return {ok:false as const,reason:'incomplete' as const};
  const windowTotal=input.hours.every(n=>n!==null)?input.hours.reduce<number>((s,n)=>s+(n??0),0):null;
  const common={threshold,selectedHours,windowStart:laborIso(windowStart),weekStart:laborIso(end-6*DAY_MS),weekEnding:input.weekEnding,windowTotal};
  if(selectedHours>=threshold)return {ok:true as const,...common,pathway:'weekly' as const,assessment:'reference-met' as const};
  if(threshold===18)return {ok:true as const,...common,pathway:'weekly' as const,assessment:'review-needed' as const};
  // WHY 2026-10-26: 468 can explain ONE low-hours week's threshold, not a
  // continuous-contract or benefit decision. Limit the model to full-window
  // same-employer records; missing data must never become zero/ineligibility.
  if(hire>windowStart)return {ok:false as const,reason:'unsupported' as const};
  if(windowTotal===null)return {ok:false as const,reason:'incomplete' as const};
  return {ok:true as const,...common,pathway:'rolling' as const,assessment:windowTotal>=68?'reference-met' as const:'review-needed' as const};
}
