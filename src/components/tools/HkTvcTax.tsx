import { useState } from 'react';
import { HK_TVC_MAX, HK_YEARS, hkTvc, type HkYear } from '../../lib/country-finance-3';
const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
const hkd = (n: number) => 'HK$' + n.toLocaleString('zh-HK', { maximumFractionDigits: 0 });
export default function HkTvcTax() {
  const [year, setYear] = useState<HkYear>('2026/27');
  const [net, setNet] = useState('400000');
  const [allow, setAllow] = useState(String(HK_YEARS['2026/27'].basic));
  const [tvc, setTvc] = useState('60000');
  const r = hkTvc(net, allow, tvc);
  return <div className="space-y-4" data-debt-worksheet="hk-tvc">
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="課稅年度">
        {(Object.keys(HK_YEARS) as HkYear[]).map(y => <button key={y} type="button" role="radio" aria-checked={year === y} onClick={() => { setYear(y); setAllow(String(HK_YEARS[y].basic)); }} className={`min-h-11 rounded-lg border px-4 text-sm ${year === y ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{y} 課稅年度</button>)}
      </div>
      <p className="text-sm text-muted-foreground">{year} 基本免稅額 {hkd(HK_YEARS[year].basic)} · 已婚人士免稅額 {hkd(HK_YEARS[year].married)}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">入息淨額（未扣可扣稅自願性供款，港元）<input inputMode="decimal" className={field} value={net} onChange={e => setNet(e.target.value)} /></label>
        <label className="block text-sm">免稅額合計（港元）<input inputMode="decimal" className={field} value={allow} onChange={e => setAllow(e.target.value)} /></label>
        <label className="block text-sm">可扣稅自願性供款＋合資格延期年金保費（港元，上限 {hkd(HK_TVC_MAX)}）<input inputMode="decimal" className={field} value={tvc} onChange={e => setTvc(e.target.value)} /></label>
      </div>
    </section>
    <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
      {!r ? <p>請輸入不小於 0 的數字。</p> : <>
        <p className="text-xl font-bold">薪俸稅約少繳 {hkd(r.saving)}</p>
        <p className="mt-1 text-sm">扣除 {hkd(r.used)}{r.capped ? `（超過上限，只計 ${hkd(HK_TVC_MAX)}）` : ''} · 稅款 {hkd(r.before.tax)} → {hkd(r.after.tax)}{r.after.standardApplies ? ' · 按標準稅率計算' : ' · 按累進稅率計算'}</p>
      </>}
      <p className="mt-3 text-sm">這是按累進稅率與標準稅率取較低者的估算，未計一次性寬減及其他扣除，不是稅務局評稅結果。供款須保留至65歲。</p>
    </section>
  </div>;
}
