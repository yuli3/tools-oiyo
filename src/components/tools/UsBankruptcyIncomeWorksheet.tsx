import { useState } from 'react';
import { bankruptcyIncomeWorksheet, precedingIncomeMonths } from '../../lib/debt-planning';
const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
const money = (cents: number) => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
export default function UsBankruptcyIncomeWorksheet() {
  const [date, setDate] = useState('');
  const [incomes, setIncomes] = useState(['','','','','','']);
  const [median, setMedian] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const months = precedingIncomeMonths(date);
  const result = months ? bankruptcyIncomeWorksheet(incomes, median, confirmed) : null;
  return <div className="space-y-4" data-debt-worksheet="us">
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h2 className="text-lg font-bold">1. Choose your expected filing date</h2>
      <label className="block text-sm">Filing date<input type="date" className={field} value={date} onInput={e => { setDate(e.currentTarget.value); setIncomes(['','','','','','']); setMedian(''); setConfirmed(false); }} /></label>
      <p className="text-sm text-muted-foreground">Form 122A-1 uses the six full calendar months before the month you file. Do not enter only your latest paycheck or take-home pay.</p>
      <h2 className="text-lg font-bold">2. Enter income included by Form 122A-1</h2>
      <p className="text-sm">Check the official form for income categories, exclusions and whether spouse income belongs in your calculation. Enter an explicit 0 for a month with no included income.</p>
      <div className="grid gap-3 sm:grid-cols-2">{incomes.map((value, index) => <label key={index} className="block text-sm">{months?.[index] ?? `Month ${index + 1}`} (USD)<input inputMode="decimal" className={field} value={value} onChange={e => setIncomes(previous => previous.map((item, i) => i === index ? e.target.value : item))} /></label>)}</div>
    </section>
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h2 className="text-lg font-bold">3. Optional: compare a verified annual median</h2>
      <p className="text-sm">Copy the annual median for your state, household size and filing period from the U.S. Trustee Program. This tool does not select or update that legal reference for you.</p>
      <label className="block text-sm">Official annual median (USD)<input inputMode="decimal" className={field} value={median} onChange={e => { setMedian(e.target.value); setConfirmed(false); }} /></label>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />I checked the applicable filing period, state and household size.</label>
    </section>
    <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
      {result ? <><h2 className="text-lg font-bold">Your income arithmetic</h2><dl className="mt-3 grid gap-3 sm:grid-cols-3">{[['Six-month total', money(result.totalCents)],['Monthly average', money(result.monthlyCents)],['Annualized income', money(result.annualCents)]].map(([label,value]) => <div key={label}><dt className="text-sm">{label}</dt><dd className="break-words text-xl font-bold">{value}</dd></div>)}</dl><p className="mt-3 text-sm">Six-month total ÷ 6 → monthly average × 12 → annualized income. Display rounding does not change the annual calculation.</p><p className="mt-3 font-medium">{result.differenceCents === null ? 'Median comparison pending: enter and confirm a positive official annual reference.' : result.differenceCents === 0 ? 'Annualized income equals the reference you entered.' : `${money(Math.abs(result.differenceCents))} ${result.differenceCents < 0 ? 'below' : 'above'} the reference you entered.`}</p></> : <p>Enter a valid filing date and six non-negative amounts, using up to two decimal places. Blank values are not treated as zero.</p>}
      <p className="mt-3 text-sm">This is not a bankruptcy eligibility result or the complete means test. Form 122A-1, its supplement and Form 122A-2 address additional rules and exceptions. A higher figure here is not an automatic refusal; a lower figure does not guarantee Chapter 7 relief.</p>
    </section>
  </div>;
}
