import {useEffect,useId,useState} from 'react';
import {compareHongKongWeek} from '../../lib/hong-kong-work-hours';
import {laborDate,laborIso,DAY_MS} from '../../lib/labor-date';
export default function HongKongWorkHoursTracker(){
 const id=useId();
 const [ready,setReady]=useState(false);useEffect(()=>setReady(true),[]);
 const [end,setEnd]=useState('2026-10-24'),[hire,setHire]=useState('2025-01-01'),[hours,setHours]=useState(['20','20','20','8']),[confirmed,setConfirmed]=useState(false);
 const r=compareHongKongWeek({weekEnding:end,employmentStart:hire,hours:hours.map(h=>h.trim()===''?null:Number(h)),sameEmployerConfirmed:confirmed});
 const endMs=laborDate(end);
 return <section className="space-y-4" aria-label="香港單週工時參考">
  <p className="text-sm text-muted-foreground">以下為示例，不是您的紀錄。未知時數請留白，不要以0代替。</p>
  <fieldset disabled={!ready} className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><label htmlFor={id+'-end'} className="space-y-1 text-sm">所選一週結束日（星期六）<input id={id+'-end'} type="date" value={end} onInput={e=>setEnd(e.currentTarget.value)} onChange={e=>setEnd(e.target.value)} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2"/></label><label htmlFor={id+'-hire'} className="space-y-1 text-sm">同一僱主的僱用開始日<input id={id+'-hire'} type="date" value={hire} onInput={e=>setHire(e.currentTarget.value)} onChange={e=>setHire(e.target.value)} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2"/></label></div>
  <fieldset className="grid gap-3 sm:grid-cols-2"><legend className="mb-2 text-sm font-semibold">所選一週及之前三週的已確認時數</legend>{hours.map((value,i)=><label htmlFor={id+'-week-'+i} key={i} className="space-y-1 text-sm">{i===3?'所選一週':'之前第'+(3-i)+'週'}{endMs!==null&&<span className="block text-xs text-muted-foreground">{laborIso(endMs-(27-i*7)*DAY_MS)} → {laborIso(endMs-(21-i*7)*DAY_MS)}</span>}<input id={id+'-week-'+i} type="number" min="0" max="168" step="any" placeholder="未知請留白" value={value} onChange={e=>setHours(v=>v.map((n,j)=>i===j?e.target.value:n))} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2"/></label>)}</fieldset>
  <label className="flex min-h-11 items-start gap-3 rounded-lg border border-border p-3 text-sm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} className="mt-1 h-5 w-5 shrink-0"/>我確認輸入屬同一僱主，並理解這只是單週時數參考；可能需要核對法定視作工時，不會據此判定整份合約或福利資格。</label>
  </fieldset>{!ready&&<p className="text-sm text-muted-foreground">正在準備計算功能… 互動結果需要JavaScript。</p>}
  <div role="status" aria-live="polite">{!confirmed?<p className="text-sm text-muted-foreground">確認範圍後才會顯示對照。</p>:!r.ok?<p className="text-sm text-destructive">{r.reason==='incomplete'?'紀錄未齊：缺漏時數不會當作0，暫時無法比較468替代門檻。':r.reason==='unsupported'?'四週內並非全程由同一僱主僱用，超出本版468對照範圍。這不代表沒有法定權利。':'請核對真實日期、星期六結束日、僱用期間及0至168小時的紀錄。'}</p>:<div className="space-y-4 rounded-xl border border-border p-4" data-labor-result="hk">
   <h2 className="text-lg font-semibold">{r.assessment==='reference-met'?'所選一週：輸入時數達參考門檻':'所選一週：請覆核時數與適用規定'}</h2>
   <p className="text-sm">{r.weekStart} → {r.weekEnding} · 所選一週 {r.selectedHours} 小時 · 該週門檻 {r.threshold} 小時。{r.pathway==='rolling'&&<>四週合計 {r.windowTotal} 小時，與68小時替代門檻比較。</>}</p>
   <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-2 text-left">各週時數紀錄（不代表每週均符合資格）</caption><thead><tr><th className="p-2">星期</th><th className="p-2">輸入時數</th><th className="p-2">紀錄</th></tr></thead><tbody>{hours.map((value,i)=><tr key={i} className="border-t border-border"><th className="p-2">{i===3?'所選一週':'之前第'+(3-i)+'週'}</th><td className="p-2">{value.trim()===''?'未提供':value+' 小時'}</td><td className="p-2"><svg viewBox="0 0 168 12" className="h-3 w-32" aria-hidden="true"><rect width={value.trim()===''?0:Math.min(Number(value),168)} height="12" fill="currentColor" className="text-primary"/></svg></td></tr>)}</tbody></table></div>
   <p className="text-sm font-medium">這不是連續性合約、假期或其他福利資格裁定。輸入未達門檻或本版不支援，均不能視為沒有法定權利。</p>
  </div>}</div>
 </section>;
}
