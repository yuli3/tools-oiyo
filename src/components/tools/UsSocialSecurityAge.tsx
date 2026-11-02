import { useState } from 'react';
import { breakEvenMonths, socialSecurityTable } from '../../lib/country-finance-2';
const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const age = (m: number) => `${Math.floor(m / 12)}${m % 12 ? ` y ${m % 12} m` : ''}`;
export default function UsSocialSecurityAge() {
  const [birth, setBirth] = useState('1965-06-15');
  const [pia, setPia] = useState('2000');
  const [life, setLife] = useState('85');
  const r = socialSecurityTable(birth, pia, life);
  const at62 = r?.rows[0], atFra = r?.rows.find(x => x.months === r.fra), at70 = r?.rows.at(-1);
  const be1 = at62 && atFra ? breakEvenMonths(at62, atFra) : null, be2 = atFra && at70 ? breakEvenMonths(atFra, at70) : null;
  return <div className="space-y-4" data-debt-worksheet="us-ss">
    <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
      <label className="block text-sm">Date of birth<input type="date" className={field} value={birth} onChange={e => setBirth(e.target.value)} /></label>
      <label className="block text-sm">Monthly benefit at full retirement age (USD)<input inputMode="decimal" className={field} value={pia} onChange={e => setPia(e.target.value)} /></label>
      <label className="block text-sm">Plan to age (for totals)<input inputMode="numeric" className={field} value={life} onChange={e => setLife(e.target.value)} /></label>
    </section>
    <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
      {r ? <>
        <p className="font-medium">Your full retirement age: <strong>{age(r.fra)}</strong></p>
        <div className="mt-3 overflow-x-auto"><table className="w-full min-w-80 text-sm">
          <thead><tr className="text-left"><th className="py-1 pr-2">Start at</th><th className="py-1 pr-2">Share</th><th className="py-1 pr-2">Monthly</th><th className="py-1">Total to age {life}</th></tr></thead>
          <tbody>{r.rows.map(x => <tr key={x.months} className={`border-t border-border ${x.months === r.fra ? 'font-semibold' : ''}`}><td className="py-1 pr-2">{age(x.months)}</td><td className="py-1 pr-2">{(x.factor * 100).toFixed(1)}%</td><td className="py-1 pr-2">{usd(x.monthly)}</td><td className="py-1">{usd(x.lifetime)}</td></tr>)}</tbody>
        </table></div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {be1 ? <li>Waiting from 62 to full retirement age pays more in total from about age <strong>{age(be1)}</strong>.</li> : null}
          {be2 ? <li>Waiting from full retirement age to 70 pays more in total from about age <strong>{age(be2)}</strong>.</li> : null}
          <li>Highest total if you live to {life}: starting at <strong>{age(r.best.months)}</strong>.</li>
        </ul>
      </> : <p>Enter a valid date of birth (1943 or later), a benefit amount above 0 and a planning age from 62 to 110.</p>}
      <p className="mt-3 text-sm">This is an estimate in today&apos;s dollars, not your SSA statement. It leaves out cost-of-living raises, taxes, the earnings test and spousal or survivor benefits.</p>
    </section>
  </div>;
}
