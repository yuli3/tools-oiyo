import {laborDate,laborIso,DAY_MS} from './labor-date.ts';
export function calculateGbHoliday(input:{leaveYearStart:string;hireDate:string;leavingDate:string;daysPerWeek:number;leavingConfirmed:boolean;scopeConfirmed:boolean}) {
  if(!input.scopeConfirmed) return {ok:false as const,reason:'unconfirmed' as const};
  // WHY 2026-10-26: GOV.UK ongoing first-year starters use monthly accrual.
  // This day-proportion model only covers confirmed leavers (guide §4/5).
  if(!input.leavingConfirmed) return {ok:false as const,reason:'unsupported' as const};
  const start=laborDate(input.leaveYearStart),hire=laborDate(input.hireDate),leaving=laborDate(input.leavingDate);
  if(start===null||hire===null||leaving===null||!Number.isInteger(input.daysPerWeek)||input.daysPerWeek<1||input.daysPerWeek>5) return {ok:false as const,reason:'invalid' as const};
  const date=new Date(start);
  if(date.getUTCMonth()===1&&date.getUTCDate()===29) return {ok:false as const,reason:'unsupported' as const};
  const next=Date.UTC(date.getUTCFullYear()+1,date.getUTCMonth(),date.getUTCDate()),end=next-DAY_MS;
  if(leaving<start||leaving>end||hire>leaving) return {ok:false as const,reason:'invalid' as const};
  const employedStart=Math.max(start,hire),yearDays=(next-start)/DAY_MS,employedDays=(leaving-employedStart)/DAY_MS+1;
  const annualDays=input.daysPerWeek*5.6,exactDays=annualDays*employedDays/yearDays;
  // A display-only upward precision rule, not a statutory payroll rounding rule.
  const displayDays=Math.ceil(exactDays*100-1e-9)/100;
  return {ok:true as const,annualDays,yearDays,employedDays,startOffsetDays:(employedStart-start)/DAY_MS,exactDays,displayDays,employedStart:laborIso(employedStart),leaveYearEnd:laborIso(end),leavingDate:input.leavingDate};
}
