export function calculateCaliforniaOvertime(input:{hours:number[];regularRate:number;scopeConfirmed:boolean}) {
  if(!input.scopeConfirmed) return {ok:false as const,reason:'unconfirmed' as const};
  if(input.hours.length!==7||!input.hours.every(h=>Number.isFinite(h)&&h>=0&&h<=24)||!Number.isFinite(input.regularRate)||input.regularRate<=0||input.regularRate>1_000_000) return {ok:false as const,reason:'invalid' as const};
  // WHY 2026-10-26: seventh-day exceptions need another model. The scope also
  // excludes alternative weeks, makeup time and special industry agreements.
  if(input.hours.every(h=>h>0)) return {ok:false as const,reason:'unsupported' as const};
  let remainingStraight=40;
  const rows=input.hours.map((hours,index)=>{
    const candidate=Math.min(hours,8),ordinary=Math.min(candidate,remainingStraight);
    remainingStraight-=ordinary;
    // DLSE 2000-01-19 no-pyramiding: daily OT/DT do not count a second time
    // toward weekly OT; only remaining straight-time hours cross this tier.
    return {index,hours,ordinary,weeklyOvertime:candidate-ordinary,dailyOvertime:Math.min(Math.max(hours-8,0),4),doubleTime:Math.max(hours-12,0)};
  });
  const ordinaryHours=rows.reduce((s,r)=>s+r.ordinary,0),overtimeHours=rows.reduce((s,r)=>s+r.dailyOvertime+r.weeklyOvertime,0),doubleHours=rows.reduce((s,r)=>s+r.doubleTime,0);
  const ordinaryPay=ordinaryHours*input.regularRate,overtimePay=overtimeHours*input.regularRate*1.5,doublePay=doubleHours*input.regularRate*2;
  return {ok:true as const,rows,ordinaryHours,overtimeHours,doubleHours,ordinaryPay,overtimePay,doublePay,total:ordinaryPay+overtimePay+doublePay};
}
