import {useEffect,useId,useState} from 'react';
import {calculateGbHoliday} from '../../lib/gb-holiday-entitlement';
export default function GbHolidayCalculator(){
 const id=useId();
 const [ready,setReady]=useState(false);useEffect(()=>setReady(true),[]);
 const [year,setYear]=useState('2026-01-01'),[hire,setHire]=useState('2020-01-01'),[leaving,setLeaving]=useState('2026-06-30'),[days,setDays]=useState('5'),[confirmed,setConfirmed]=useState(false),[leaver,setLeaver]=useState(true);
 const r=calculateGbHoliday({leaveYearStart:year,hireDate:hire,leavingDate:leaving,daysPerWeek:days.trim()===''?NaN:Number(days),scopeConfirmed:confirmed,leavingConfirmed:leaver});
 const dateFields=[{label:'Leave year starts',value:year,set:setYear},{label:'Employment starts',value:hire,set:setHire},{label:'Confirmed leaving date',value:leaving,set:setLeaving}];
 return <section className="space-y-4" aria-label="GB leaver holiday calculator">
  <p className="text-sm text-muted-foreground">These dates are an example. This is total statutory entitlement for the period, not unused holiday or pay.</p>
  <fieldset disabled={!ready} className="space-y-4"><div className="grid gap-3 sm:grid-cols-2">{dateFields.map((field,i)=><label key={field.label} htmlFor={id+'-date-'+i} className="space-y-1 text-sm">{field.label}<input id={id+'-date-'+i} type="date" value={field.value} onInput={e=>field.set(e.currentTarget.value)} onChange={e=>field.set(e.target.value)} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2"/></label>)}
   <label htmlFor={id+'-days'} className="space-y-1 text-sm">Regular working days per week (1–5)<input id={id+'-days'} type="number" min="1" max="5" step="1" value={days} onChange={e=>setDays(e.target.value)} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2"/></label></div>
  <label className="flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" checked={leaver} onChange={e=>setLeaver(e.target.checked)} className="mt-1 h-5 w-5 shrink-0"/>A leaving date is confirmed. I am not calculating an ongoing first-year starter’s monthly accrual.</label>
  <label className="flex min-h-11 items-start gap-3 rounded-lg border border-border p-3 text-sm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} className="mt-1 h-5 w-5 shrink-0"/>I meet the Great Britain regular-hours, one-to-five-day scope. Extra contractual holiday, carry-over, leave taken, holiday pay and Northern Ireland are excluded.</label>
  </fieldset>{!ready&&<p className="text-sm text-muted-foreground">Preparing calculator… JavaScript is needed for interactive results.</p>}
  <div role="status" aria-live="polite">{!confirmed?<p className="text-sm text-muted-foreground">Confirm the supported scope to see the estimate.</p>:!r.ok?<p className="text-sm text-destructive">{r.reason==='unsupported'?'This arrangement is not supported. Ongoing starters use different accrual rules; February-29 leave-year starts also need separate checking.':'Check the dates, leaving within the selected leave year, and a whole number of working days from 1 to 5.'}</p>:<div className="space-y-4 rounded-xl border border-border p-4" data-labor-result="gb">
   <h2 className="text-lg font-semibold">Statutory proportion: {r.displayDays.toFixed(2)} days</h2><p className="text-sm">{r.annualDays} annual days × {r.employedDays} employed calendar days ÷ {r.yearDays} calendar days in the leave year.</p>
   <svg viewBox="0 0 320 74" className="w-full" role="img" aria-label="Employment period within the leave year; the dates and counts are also written below"><rect x="0" y="8" width="320" height="22" fill="currentColor" className="text-muted"/><rect x={r.startOffsetDays/r.yearDays*320} y="8" width={r.employedDays/r.yearDays*320} height="22" fill="currentColor" className="text-primary"/><text x="0" y="58" className="fill-current text-sm">{r.employedDays} / {r.yearDays} calendar days</text></svg>
   <dl className="grid gap-2 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Leave year</dt><dd>{year} → {r.leaveYearEnd}</dd></div><div><dt className="text-muted-foreground">Employment counted</dt><dd>{r.employedStart} → {r.leavingDate} (both included)</dd></div></dl>
   <p className="text-sm text-muted-foreground">Raw proportion: {r.exactDays.toFixed(6)} days. The headline rounds upwards to two decimal places for display only. It does not tell an employer how to round payroll. Bank holidays are not automatically added.</p>
  </div>}</div>
 </section>;
}
