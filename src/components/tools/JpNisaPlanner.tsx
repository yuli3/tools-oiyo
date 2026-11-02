import { useState } from 'react';
import { NISA, nisaPlan } from '../../lib/country-finance-2';
const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
const yen = (n: number) => `${Math.round(n).toLocaleString('ja-JP')}円`;
export default function JpNisaPlanner() {
  const [used, setUsed] = useState('0');
  const [usedGrowth, setUsedGrowth] = useState('0');
  const [monthly, setMonthly] = useState('50000');
  const [growth, setGrowth] = useState('600000');
  const [start, setStart] = useState('2027');
  const r = nisaPlan(used, usedGrowth, monthly, growth, start);
  return <div className="space-y-4" data-debt-worksheet="jp-nisa">
    <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
      <label className="block text-sm">これまでの利用額（簿価・円）<input inputMode="numeric" className={field} value={used} onChange={e => setUsed(e.target.value)} /></label>
      <label className="block text-sm">うち成長投資枠（簿価・円）<input inputMode="numeric" className={field} value={usedGrowth} onChange={e => setUsedGrowth(e.target.value)} /></label>
      <label className="block text-sm">つみたて投資枠 毎月（円、上限10万円）<input inputMode="numeric" className={field} value={monthly} onChange={e => setMonthly(e.target.value)} /></label>
      <label className="block text-sm">成長投資枠 毎年（円、上限240万円）<input inputMode="numeric" className={field} value={growth} onChange={e => setGrowth(e.target.value)} /></label>
      <label className="block text-sm">開始年<input inputMode="numeric" className={field} value={start} onChange={e => setStart(e.target.value)} /></label>
    </section>
    <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
      {!r ? <p>金額は0以上の整数で、成長投資枠の利用額は全体の利用額以下（1,200万円以内）、全体は1,800万円以内で入力してください。</p>
        : r.errors.length ? <p>{r.errors.includes('tsumitate') ? `つみたて投資枠は年${yen(NISA.tsumitateYear)}（月10万円）まで。` : ''}{r.errors.includes('growth') ? `成長投資枠は年${yen(NISA.growthYear)}まで。` : ''}</p>
        : r.rows.length === 0 ? <p>毎月または毎年の投資額を入力すると、生涯枠を埋める年が分かります。</p>
        : <>
          <p className="text-xl font-bold">{r.fullYear ? `${r.fullYear}年に生涯枠1,800万円を使い切ります` : `この配分では生涯枠を使い切れません（最終 ${yen(r.rows.at(-1)!.total)}）`}</p>
          <div className="mt-3 overflow-x-auto"><table className="w-full min-w-80 text-sm">
            <thead><tr className="text-left"><th className="py-1 pr-2">年</th><th className="py-1 pr-2">つみたて</th><th className="py-1 pr-2">成長</th><th className="py-1">累計（簿価）</th></tr></thead>
            <tbody>{r.rows.map(x => <tr key={x.year} className="border-t border-border"><td className="py-1 pr-2">{x.year}</td><td className="py-1 pr-2">{yen(x.tsumitate)}</td><td className="py-1 pr-2">{yen(x.growth)}</td><td className="py-1">{yen(x.total)}</td></tr>)}</tbody>
          </table></div>
        </>}
      <p className="mt-3 text-sm">枠は取得価額（簿価）で数えます。売却すると簿価分の枠が翌年以降に復活しますが、年間投資枠（合計360万円）は増えません。運用益や手数料は含めていません。</p>
    </section>
  </div>;
}
