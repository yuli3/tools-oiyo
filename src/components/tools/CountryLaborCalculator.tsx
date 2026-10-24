import {useEffect,useId,useState} from 'react';
import {countryLabor,type LaborTool} from '../../data/country-labor';
import {calculateJapanPremium} from '../../lib/japan-premium';
import {calculateSingaporeMonth} from '../../lib/singapore-month';
import {calculateTaiwanLeave} from '../../lib/taiwan-leave';

export default function CountryLaborCalculator({tool}:{tool:LaborTool}) {
  const t=countryLabor[tool],id=useId();
  const suffix=tool==='jp'?'円':tool==='sg'?'SGD':'天';
  const [values,setValues]=useState<string[]>(t.fields.map(f=>f[1]));
  const [ready,setReady]=useState(false),[confirmed,setConfirmed]=useState(false);
  useEffect(()=>setReady(true),[]);
  const n=(i:number)=>values[i].trim()===''?NaN:Number(values[i]);
  const result=tool==='jp'?calculateJapanPremium({hourly:n(0),ordinary:n(1),overtime:n(2),night:n(3),overtimeNight:n(4),holiday:n(5),holidayNight:n(6)}):tool==='sg'?calculateSingaporeMonth({gross:n(0),workingDays:n(1),paidDays:n(2)}):calculateTaiwanLeave({hireDate:values[0],asOf:values[1],used:n(2)});
  const format=(v:number)=>new Intl.NumberFormat(t.languageTag,{maximumFractionDigits:2}).format(v);
  const base=result.ok?('base' in result?result.base:'amount' in result?n(0):result.days):0;
  const extra=result.ok?('premium' in result?result.premium:'unpaid' in result?result.unpaid:n(2)):0;
  const total=result.ok?('total' in result?result.total:'amount' in result?result.amount:result.remaining):0;
  const share=result.ok?('premium' in result?(base+extra===0?0:base/(base+extra)):'amount' in result?n(2)/n(1):base===0?0:extra/base):0;
  return <section className="space-y-4" aria-label={t.title}>
    <p className="text-xs text-muted-foreground">{tool==='jp'?'入力欄は説明用の例です。ご自身の条件に置き換えてください。':tool==='sg'?'The prefilled values are an illustrative example. Replace them with your own counts and pay.':'欄位為說明用範例，請換成自己的日期與已休天數；未來日期依現行規則模擬，不預測修法。'}</p>
    <fieldset disabled={!ready} className="grid gap-3 sm:grid-cols-2">
      {t.fields.map((f,i)=><div key={f[0]}><label htmlFor={id+'-'+i} className="mb-1 block text-sm font-medium">{f[0]}</label>
        <input id={id+'-'+i} type={f[2]} value={values[i]} inputMode={f[2]==='number'?'decimal':undefined} min={f[2]==='number'?'0':undefined} step="any"
          onChange={e=>setValues(v=>v.map((old,j)=>j===i?e.target.value:old))}
          className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-ring"/>
      </div>)}
    </fieldset>
    {!ready&&<p className="text-sm text-muted-foreground">{t.loading}</p>}
    <button type="button" disabled={!ready} onClick={()=>{setValues(t.fields.map(f=>f[1]));setConfirmed(false);}}
      className="min-h-11 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">{t.example}</button>
    <label className="flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" checked={confirmed} disabled={!ready} onChange={e=>setConfirmed(e.target.checked)} className="mt-1 size-5 shrink-0 accent-primary"/>{t.ack}</label>
    {!confirmed?<p className="text-sm text-muted-foreground">{t.unconfirmed}</p>:!result.ok?<p role="alert" className="rounded-lg border border-destructive p-3 text-sm text-destructive">{result.reason==='unsupported'?t.unsupported:t.error}</p>:
      <section className="space-y-3 border-t border-border pt-4" aria-labelledby={id+'result'} aria-live="polite" data-labor-result={tool}>
        <h2 id={id+'result'} className="text-lg font-semibold">{t.result}</h2>
        <dl className="grid gap-3 sm:grid-cols-3">
          {[[t.base,base],[t.extra,extra],[t.total,total]].map(([label,value])=><div key={String(label)}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="text-xl font-semibold tabular-nums">{format(Number(value))} {suffix}</dd></div>)}
        </dl>
        <svg viewBox="0 0 320 32" role="img" aria-labelledby={id+'chart'} className="h-8 w-full">
          <title id={id+'chart'}>{t.result}: {format(base)} / {format(extra)} / {format(total)}</title>
          <rect width="320" height="24" rx="4" className="fill-muted"/>
          <rect width={Math.max(0,Math.min(320,share*320))} height="24" rx="4" className="fill-primary"/>
        </svg>
        <p className="text-xs text-muted-foreground">{tool==='jp'?t.base:t.labels[0]} / {tool==='jp'?t.extra:t.labels[1]}</p>
        {'rows' in result&&<div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-2 text-left">{t.result}</caption><thead><tr><th className="py-2">{t.unit}</th><th className="py-2">×</th><th className="py-2">{t.value}</th></tr></thead><tbody>{result.rows.map((row,i)=><tr key={row.key} className="border-t border-border"><th scope="row" className="py-2 font-normal">{countryLabor.jp.labels[i]}: {format(row.hours)}</th><td>{row.rate}</td><td className="tabular-nums">{format(row.base+row.premium)}</td></tr>)}</tbody></table></div>}
        {'start' in result&&<dl className="space-y-2 text-sm"><div><dt className="font-medium">本期區間</dt><dd>{result.start} → {result.end}</dd></div><div><dt className="font-medium">下一階段開始</dt><dd>{result.next}</dd></div><div><dt className="font-medium">完整年資（月）</dt><dd>{result.months}</dd></div></dl>}
        {tool==='sg'&&<p className="text-sm tabular-nums">SGD {format(n(0))} ÷ {format(n(1))} × {format(n(2))} = SGD {format(total)}</p>}
      </section>}
  </section>;
}
