import { useId, useMemo, useState } from 'react';
import type { Locale } from '../../lib/i18n';
import { loanCopy } from '../../lib/loan-comparison-copy';
import { compareLoans, type LoanSchedule } from '../../lib/loan-comparison';

const currencies = ['USD','KRW','EUR','GBP','JPY','CNY'] as const;
const inputClass = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-primary';

function ScheduleChart({schedule, locale, currency}: {schedule:LoanSchedule; locale:Locale; currency:string}) {
  const c = loanCopy[locale];
  const id = useId();
  const maximum = Math.max(...schedule.rows.flatMap(row=>[row.principal,row.interest,row.balance]),1);
  const points = (key:'principal'|'interest'|'balance') => schedule.rows.map((row,i)=>`${65+(i/Math.max(1,schedule.rows.length-1))*275},${155-row[key]/maximum*125}`).join(' ');
  const tick = new Intl.NumberFormat(locale,{style:'currency',currency,notation:'compact',maximumFractionDigits:1});
  return (
    <figure className="m-0 border-y border-border py-3">
      <figcaption className="text-sm font-semibold">{c.chart}</figcaption>
      <svg role="img" aria-labelledby={`${id}-title ${id}-description`} viewBox="0 0 360 190" className="mt-2 w-full">
        <title id={`${id}-title`}>{c.methods[schedule.method]}: {c.chart}</title>
        <desc id={`${id}-description`}>{c.chartNote}</desc>
        <path d="M65 25V155H340" fill="none" stroke="currentColor" className="text-muted-foreground"/>
        <text x="60" y="30" textAnchor="end" fill="currentColor" fontSize="11">{tick.format(maximum)}</text>
        <text x="60" y="158" textAnchor="end" fill="currentColor" fontSize="11">0</text>
        <text x="65" y="177" fill="currentColor" fontSize="11">1</text>
        <text x="340" y="177" textAnchor="end" fill="currentColor" fontSize="11">{schedule.rows.length} {c.month}</text>
        <polyline points={points('principal')} fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"/>
        <polyline points={points('interest')} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3" className="text-foreground"/>
        <polyline points={points('balance')} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2 3" className="text-muted-foreground"/>
        {schedule.rows.length === 1 && <>
          <circle cx="65" cy={155-schedule.rows[0].principal/maximum*125} r="3" fill="currentColor" className="text-primary"/>
          <circle cx="65" cy={155-schedule.rows[0].interest/maximum*125} r="3" fill="currentColor"/>
          <circle cx="65" cy={155-schedule.rows[0].balance/maximum*125} r="3" fill="currentColor" className="text-muted-foreground"/>
        </>}
      </svg>
      <ul className="flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-xs">
        <li className="flex items-center gap-1"><svg width="22" height="8" aria-hidden="true" className="text-primary"><path d="M0 4H22" stroke="currentColor" strokeWidth="2"/></svg>{c.repaid}</li>
        <li className="flex items-center gap-1"><svg width="22" height="8" aria-hidden="true"><path d="M0 4H22" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3"/></svg>{c.interest}</li>
        <li className="flex items-center gap-1"><svg width="22" height="8" aria-hidden="true" className="text-muted-foreground"><path d="M0 4H22" stroke="currentColor" strokeWidth="2" strokeDasharray="2 3"/></svg>{c.balance}</li>
      </ul>
      <p className="mb-0 mt-2 text-xs text-muted-foreground">{c.chartNote}</p>
    </figure>
  );
}

export default function LoanComparison({locale}: {locale:Locale}) {
  const c = loanCopy[locale];
  const id = useId();
  const [input,setInput] = useState({principal:'12000',annualRate:'4.2',months:'36',graceMonths:'0',currency:'USD'});
  const parse = (text:string) => text.trim()==='' ? NaN : Number(text);
  const result = useMemo(()=>compareLoans({principal:parse(input.principal),annualRate:parse(input.annualRate),months:parse(input.months),graceMonths:parse(input.graceMonths)}),[input.principal,input.annualRate,input.months,input.graceMonths]);
  const money = (value:number) => new Intl.NumberFormat(locale,{style:'currency',currency:input.currency}).format(value);
  const fields = [
    {key:'principal',label:c.principal,error:'principal',step:'any',min:'0',max:String(Number.MAX_SAFE_INTEGER)},
    {key:'annualRate',label:c.rate,error:'rate',step:'any',min:'0',max:'1000'},
    {key:'months',label:c.months,error:'months',step:'1',min:'1',max:'1200'},
    {key:'graceMonths',label:c.grace,error:'grace',step:'1',min:'0',max:input.months},
  ] as const;
  return (
    <div className="space-y-5" data-loan-comparison={locale}>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(field=><label key={field.key} className="min-w-0 text-sm font-semibold" htmlFor={`${id}-${field.key}`}>
          {field.label}
          <input id={`${id}-${field.key}`} type="number" inputMode="decimal" value={input[field.key]} step={field.step} min={field.min} max={field.max}
            aria-describedby={`${id}-bounds${!result.ok ? ` ${id}-error` : ''}`} aria-invalid={!result.ok && result.error===field.error}
            onChange={event=>setInput(previous=>({...previous,[field.key]:event.target.value}))} className={inputClass}/>
        </label>)}
        <label className="min-w-0 text-sm font-semibold" htmlFor={`${id}-currency`}>{c.currency}
          <select id={`${id}-currency`} value={input.currency} aria-describedby={`${id}-currency-note`} className={inputClass}
            onChange={event=>setInput(previous=>({...previous,currency:event.target.value}))}>
            {currencies.map(currency=><option key={currency} value={currency}>{currency}</option>)}
          </select>
        </label>
      </div>
      <p id={`${id}-currency-note`} className="text-sm text-muted-foreground">{c.currencyNote}</p>
      <p id={`${id}-bounds`} className="text-xs text-muted-foreground">{c.bounds}</p>
      {!result.ok ? <p id={`${id}-error`} role="alert" className="rounded-lg border border-destructive bg-background p-3 text-sm">{c.errors[result.error]}</p> : (
        <section aria-labelledby={`${id}-results`}>
          <h2 id={`${id}-results`} className="text-lg font-semibold">{c.compare}</h2>
          <div className="mt-3 space-y-6">
            {result.schedules.map(schedule=><section key={schedule.method} data-loan-method={schedule.method} className="min-w-0 border-t border-border pt-4">
              <h3 className="text-base font-semibold">{c.methods[schedule.method]}</h3>
              <dl className="my-3 grid gap-3 text-sm sm:grid-cols-2">
                {[[c.first,schedule.firstPayment],[c.start,schedule.repaymentStart],[c.last,schedule.lastPayment],[c.totalInterest,schedule.totalInterest],[c.totalPayment,schedule.totalPayment]].map(([label,value])=><div key={label} className="min-w-0"><dt className="text-muted-foreground">{label}</dt><dd className="m-0 break-words font-semibold tabular-nums">{money(Number(value))}</dd></div>)}
              </dl>
              <ScheduleChart schedule={schedule} locale={locale} currency={input.currency}/>
              <details className="mt-3">
                <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary">{c.schedule}</summary>
                <div tabIndex={0} role="region" aria-label={`${c.methods[schedule.method]}: ${c.schedule}`} className="overflow-x-auto rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-primary">
                  <table className="w-full text-left text-xs tabular-nums">
                    <caption className="px-3 py-2 text-left font-semibold">{c.methods[schedule.method]} · {input.currency}</caption>
                    <thead><tr>{[c.month,c.repaid,c.interest,c.payment,c.balance].map(label=><th scope="col" key={label} className="whitespace-nowrap border-b border-border px-3 py-2">{label}</th>)}</tr></thead>
                    <tbody>{schedule.rows.map(row=><tr key={row.month}><th scope="row" className="border-b border-border px-3 py-2">{row.month}</th>{[row.principal,row.interest,row.payment,row.balance].map((value,index)=><td key={index} className="whitespace-nowrap border-b border-border px-3 py-2">{money(value)}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              </details>
            </section>)}
          </div>
        </section>
      )}
      <p className="text-xs leading-relaxed text-muted-foreground">{c.rounding}</p>
    </div>
  );
}
