export function calculateTaiwanLeave(input:{hireDate:string;asOf:string;used:number}) {
  const valid=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
  if(!valid(input.hireDate)||!valid(input.asOf)||input.asOf<input.hireDate||!Number.isFinite(input.used)||input.used<0||!Number.isInteger(input.used*2)) return {ok:false as const,reason:'invalid' as const};
  const hire=new Date(input.hireDate+'T00:00:00Z'), asOf=new Date(input.asOf+'T00:00:00Z');
  if(hire.getUTCFullYear()<1950||asOf.getUTCFullYear()>2100) return {ok:false as const,reason:'invalid' as const};
  // WHY 2026-10-24: this first release does not decide month-end/leap-day
  // legal anniversaries or historical pre-2017 entitlements by Date rollover.
  if(hire.getUTCDate()>28||input.asOf<'2017-01-01') return {ok:false as const,reason:'unsupported' as const};
  let months=(asOf.getUTCFullYear()-hire.getUTCFullYear())*12+asOf.getUTCMonth()-hire.getUTCMonth();
  if(asOf.getUTCDate()<hire.getUTCDate()) months--;
  if(months>1200) return {ok:false as const,reason:'invalid' as const};
  const years=Math.floor(months/12);
  const days=months<6?0:months<12?3:years<2?7:years<3?10:years<5?14:years<10?15:Math.min(30,years+6);
  if(input.used>days) return {ok:false as const,reason:'invalid' as const};
  const dateAt=(m:number)=>new Date(Date.UTC(hire.getUTCFullYear(),hire.getUTCMonth()+m,hire.getUTCDate()));
  const startMonths=months<6?0:months<12?6:years*12;
  const nextMonths=months<6?6:months<12?12:(years+1)*12;
  const next=dateAt(nextMonths), end=new Date(next.getTime()-86400000);
  return {ok:true as const,months,days,remaining:days-input.used,start:dateAt(startMonths).toISOString().slice(0,10),end:end.toISOString().slice(0,10),next:next.toISOString().slice(0,10)};
}
