export type JapanHours = { hourly:number; ordinary:number; overtime:number; night:number; overtimeNight:number; holiday:number; holidayNight:number };
export function calculateJapanPremium(input:JapanHours) {
  if(!Object.values(input).every(n=>Number.isFinite(n)&&n>=0)||input.hourly<=0||input.hourly>10_000_000) return {ok:false as const,reason:'invalid' as const};
  // WHY 2026-10-24: over-60h premiums need a different tier; never return the
  // lower rate silently. This is a scoped estimate, not a legal hours approval.
  if(input.overtime+input.overtimeNight>60) return {ok:false as const,reason:'unsupported' as const};
  if(input.ordinary+input.overtime+input.night+input.overtimeNight+input.holiday+input.holidayNight>744) return {ok:false as const,reason:'invalid' as const};
  const entries = [
    {key:'ordinary',hours:input.ordinary,rate:1},
    {key:'overtime',hours:input.overtime,rate:1.25},
    {key:'night',hours:input.night,rate:1.25},
    {key:'overtimeNight',hours:input.overtimeNight,rate:1.5},
    {key:'holiday',hours:input.holiday,rate:1.35},
    {key:'holidayNight',hours:input.holidayNight,rate:1.6},
  ];
  const rows = entries.map(e=>({...e,base:input.hourly*e.hours,premium:input.hourly*e.hours*(e.rate-1)}));
  const base=rows.reduce((sum,r)=>sum+r.base,0), premium=rows.reduce((sum,r)=>sum+r.premium,0);
  return {ok:true as const,rows,base,premium,total:base+premium};
}
