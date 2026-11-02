import { useState } from 'react';
import { UK_PLANS, ukStudentLoan } from '../../lib/country-finance-2';
const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
const gbp = (n: number) => n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
export default function UkStudentLoan() {
  const [plan, setPlan] = useState<'plan2' | 'plan5'>('plan5');
  const [balance, setBalance] = useState('45000');
  const [salary, setSalary] = useState('30000');
  const [growth, setGrowth] = useState('3');
  const [base, setBase] = useState('4.1');
  const [tg, setTg] = useState('0');
  const r = ukStudentLoan(plan, balance, salary, growth, base, tg);
  return <div className="space-y-4" data-debt-worksheet="uk-sl">
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Plan">
        {(['plan2', 'plan5'] as const).map(p => <button key={p} type="button" role="radio" aria-checked={plan === p} onClick={() => setPlan(p)} className={`min-h-11 rounded-lg border px-4 text-sm ${plan === p ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{p === 'plan2' ? 'Plan 2' : 'Plan 5'}</button>)}
      </div>
      <p className="text-sm text-muted-foreground">Threshold {gbp(UK_PLANS[plan].threshold)} a year · 9% above it · written off after {UK_PLANS[plan].writeOffYears} years.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">Balance now (GBP)<input inputMode="decimal" className={field} value={balance} onChange={e => setBalance(e.target.value)} /></label>
        <label className="block text-sm">Salary now (GBP a year)<input inputMode="decimal" className={field} value={salary} onChange={e => setSalary(e.target.value)} /></label>
        <label className="block text-sm">Salary growth (% a year)<input inputMode="decimal" className={field} value={growth} onChange={e => setGrowth(e.target.value)} /></label>
        <label className="block text-sm">{plan === 'plan2' ? 'Base interest rate (%, rises to 6% with income)' : 'Interest rate (%)'}<input inputMode="decimal" className={field} value={base} onChange={e => setBase(e.target.value)} /></label>
        <label className="block text-sm">Threshold growth (% a year, 0 = frozen)<input inputMode="decimal" className={field} value={tg} onChange={e => setTg(e.target.value)} /></label>
      </div>
    </section>
    <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
      {r ? <>
        <p className="text-xl font-bold">{r.clearedYear ? `Repaid in year ${r.clearedYear}` : `Written off after ${r.writeOffYears} years`}</p>
        <p className="mt-1 text-sm">Total repaid {gbp(r.paid)}{r.clearedYear ? '' : ` · about ${gbp(r.writtenOff)} written off`}. First year repayment {gbp(r.rows[0].repaid)} ({gbp(r.rows[0].repaid / 12)} a month).</p>
        <div className="mt-3 overflow-x-auto"><table className="w-full min-w-80 text-sm">
          <thead><tr className="text-left"><th className="py-1 pr-2">Year</th><th className="py-1 pr-2">Salary</th><th className="py-1 pr-2">Rate</th><th className="py-1 pr-2">Repaid</th><th className="py-1">Balance</th></tr></thead>
          <tbody>{r.rows.filter((x, i) => i < 3 || x.year % 5 === 0 || x.year === r.rows.length).map(x => <tr key={x.year} className="border-t border-border"><td className="py-1 pr-2">{x.year}</td><td className="py-1 pr-2">{gbp(x.income)}</td><td className="py-1 pr-2">{x.rate.toFixed(1)}%</td><td className="py-1 pr-2">{gbp(x.repaid)}</td><td className="py-1">{gbp(x.balance)}</td></tr>)}</tbody>
        </table></div>
      </> : <p>Enter a balance above 0, a salary, and growth and interest rates from 0 to 20.</p>}
      <p className="mt-3 text-sm">A yearly approximation with today&apos;s gov.uk figures held constant except the growth you enter. Real rates change each September and thresholds each April; your Student Loans Company account is the figure to trust.</p>
    </section>
  </div>;
}
