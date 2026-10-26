import {useEffect,useId,useState} from 'react';
import {laborPay,type LaborPayId} from '../../data/labor-wave4';

export default function LaborPayWorksheet({tool}:{tool:LaborPayId}) {
  const t=laborPay[tool], id=useId(), english=t.locale==='en';
  const [ready,setReady]=useState(false), [confirmed,setConfirmed]=useState(false);
  const [values,setValues]=useState<Record<string,string>>(()=>Object.fromEntries(t.fields.map(f=>[f.id,f.initial])));
  useEffect(()=>setReady(true),[]);
  const result=confirmed?t.run(values):null;
  const currency=tool==='tw'?'TWD':tool==='hk'?'HKD':'SGD';
  const money=(v:number)=>new Intl.NumberFormat(t.languageTag,{style:'currency',currency,minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
  const numeric=(v:number)=>new Intl.NumberFormat(t.languageTag,{maximumFractionDigits:4}).format(v);
  const set=(key:string,value:string)=>setValues(old=>({...old,[key]:value}));
  return <section className="space-y-4" aria-label={t.title}>
    <p className="text-sm text-muted-foreground">{english?'Prefilled values are examples, not recommended rates. Replace them with verified inputs.':'欄位為說明用範例，請換成已確認的輸入資料；不是建議工資。'}</p>
    <fieldset disabled={!ready} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">{t.fields.map(f=><label key={f.id} htmlFor={id+f.id} className="block space-y-1 text-sm"><span>{f.label}</span>
        {f.type==='select'?<select id={id+f.id} value={values[f.id]} onChange={e=>set(f.id,e.target.value)} className="min-h-11 w-full rounded-lg border border-input bg-background px-2 py-2">{f.options?.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>:<input id={id+f.id} type={f.type} min={f.type==='number'?'0':undefined} step={f.type==='number'?'any':undefined} value={values[f.id]} onInput={f.type==='date'?e=>set(f.id,e.currentTarget.value):undefined} onChange={e=>set(f.id,e.target.value)} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2"/>}
      </label>)}</div>
      <label className="flex min-h-11 items-start gap-3 rounded-lg border border-border p-3 text-sm leading-relaxed"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} className="mt-1 h-5 w-5 shrink-0"/>{t.ack}</label>
    </fieldset>
    {!ready&&<p className="text-sm">{english?'Preparing calculator…':'正在準備計算…'}</p>}
    <div role="status" aria-live="polite">{!confirmed?<p className="text-sm text-muted-foreground">{english?'Confirm the supported scope to see the estimate.':'確認適用範圍後才顯示試算。'}</p>:result&&!result.ok?<p className="text-sm text-destructive">{result.reason==='date'?t.dateError:result.reason==='unsupported'?t.unsupported:t.error} {english?'Previous results are removed.':'不顯示先前的結果。'}</p>:result?.ok?<div className="space-y-3 rounded-lg border border-border p-3" data-labor-result={tool}>
      <h2 className="text-lg font-semibold">{t.resultTitle}：{money(result.total)}</h2>
      <p className="text-xs text-muted-foreground">{english?'Money is displayed to cents; this is not a payroll rounding instruction or an individual legal determination.':'金額顯示至小數兩位，不代表指定薪資端數處理或個案法律裁定。'}</p>
      <svg viewBox="0 0 320 80" className="w-full" role="img" aria-label={t.chart}>{result.bars.map((bar,i)=><g key={bar.label}><text x="0" y={i*38+22} className="fill-current text-sm">{i+1}</text><rect x="24" y={i*38+6} width={bar.value/Math.max(...result.bars.map(b=>b.value),1)*290} height="22" className={i===0?'fill-primary':'fill-success'}/></g>)}</svg>
      <ol className="list-decimal space-y-1 pl-5 text-sm">{result.bars.map(bar=><li key={bar.label}>{bar.label}: {money(bar.value)}</li>)}</ol>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-2 text-left">{english?'Inputs, rates and amount breakdown':'時數、基準與金額明細'}</caption><thead><tr><th className="p-2">{english?'Component':'項目'}</th><th className="p-2">{english?'Value':'數值'}</th></tr></thead><tbody>{result.rows.map(row=><tr key={row.label} className="border-t border-border"><th className="p-2 font-medium">{row.label}</th><td className="p-2 tabular-nums">{row.money?money(row.value):numeric(row.value)}</td></tr>)}</tbody></table></div>
    </div>:null}</div>
  </section>;
}
