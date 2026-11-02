import { useState } from 'react';
import { addMonths, pmiDates } from '../../lib/country-finance-2';
const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
export default function UsPmiRemoval() {
  const [value, setValue] = useState('400000');
  const [loan, setLoan] = useState('360000');
  const [rate, setRate] = useState('6.5');
  const [years, setYears] = useState('30');
  const [first, setFirst] = useState('2026-12');
  const [extra, setExtra] = useState('');
  const r = pmiDates(value, loan, rate, years, extra);
  const when = (m: number | null) => m === null ? 'not within the term' : m === 0 ? 'already met' : `${addMonths(first, m) ?? `payment ${m}`} (payment ${m})`;
  return <div className="space-y-4" data-debt-worksheet="us-pmi">
    <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
      <label className="block text-sm">Original value (lower of price or appraisal, USD)<input inputMode="decimal" className={field} value={value} onChange={e => setValue(e.target.value)} /></label>
      <label className="block text-sm">Original loan amount (USD)<input inputMode="decimal" className={field} value={loan} onChange={e => setLoan(e.target.value)} /></label>
      <label className="block text-sm">Interest rate (%)<input inputMode="decimal" className={field} value={rate} onChange={e => setRate(e.target.value)} /></label>
      <label className="block text-sm">Term (years)<input inputMode="numeric" className={field} value={years} onChange={e => setYears(e.target.value)} /></label>
      <label className="block text-sm">First payment month<input type="month" className={field} value={first} onChange={e => setFirst(e.target.value)} /></label>
      <label className="block text-sm">Optional extra principal each month (USD)<input inputMode="decimal" className={field} value={extra} placeholder="e.g. 300" onChange={e => setExtra(e.target.value)} /></label>
    </section>
    <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
      {r ? <>
        <p className="text-sm">Starting loan-to-value {r.startLtv.toFixed(1)}% · principal and interest {usd(r.payment)} a month.</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-3"><dt className="text-sm font-semibold">You can ask to cancel (80%)</dt><dd className="mt-1 font-bold">{when(r.request80)}</dd></div>
          <div className="rounded-lg border border-border bg-card p-3"><dt className="text-sm font-semibold">Ends automatically (78%)</dt><dd className="mt-1 font-bold">{when(r.auto78)}</dd></div>
          <div className="rounded-lg border border-border bg-card p-3"><dt className="text-sm font-semibold">Final end (after midpoint)</dt><dd className="mt-1 font-bold">{addMonths(first, r.midpoint + 1) ?? `payment ${r.midpoint + 1}`}</dd></div>
        </dl>
        {r.extra > 0 ? <p className="mt-3 font-medium">With {usd(r.extra)} extra a month, the balance reaches 80% at {when(r.request80WithExtra)}. You can ask then; the automatic 78% date stays on the original schedule.</p> : null}
      </> : <p>Enter a value and loan above 0, a rate from 0 to 30 and a whole-number term from 1 to 40 years.</p>}
      <p className="mt-3 text-sm">Dates follow the original amortization schedule. Your servicer&apos;s PMI disclosure is the figure to trust; FHA and VA loans follow different rules.</p>
    </section>
  </div>;
}
