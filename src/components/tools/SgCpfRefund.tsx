import { useState } from 'react';
import { CPF_OA_RATE, cpfRefund } from '../../lib/country-finance-3';
const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
const sgd = (n: number) => n.toLocaleString('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 });
export default function SgCpfRefund() {
  const [upfront, setUpfront] = useState('50000');
  const [monthly, setMonthly] = useState('1200');
  const [years, setYears] = useState('10');
  const [rate, setRate] = useState(String(CPF_OA_RATE));
  const [price, setPrice] = useState('');
  const [loan, setLoan] = useState('');
  const months = /^\d+(\.\d+)?$/.test(years.trim()) ? String(Math.round(Number(years) * 12)) : 'x';
  const r = cpfRefund(upfront, monthly, months, rate, price, loan);
  return <div className="space-y-4" data-debt-worksheet="sg-cpf">
    <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
      <label className="block text-sm">CPF used at purchase (SGD)<input inputMode="decimal" className={field} value={upfront} onChange={e => setUpfront(e.target.value)} /></label>
      <label className="block text-sm">CPF used each month for the loan (SGD)<input inputMode="decimal" className={field} value={monthly} onChange={e => setMonthly(e.target.value)} /></label>
      <label className="block text-sm">Years since you first used CPF<input inputMode="decimal" className={field} value={years} onChange={e => setYears(e.target.value)} /></label>
      <label className="block text-sm">OA interest rate (% a year)<input inputMode="decimal" className={field} value={rate} onChange={e => setRate(e.target.value)} /></label>
      <label className="block text-sm">Selling price (SGD, optional)<input inputMode="decimal" className={field} value={price} onChange={e => setPrice(e.target.value)} /></label>
      <label className="block text-sm">Outstanding housing loan (SGD, optional)<input inputMode="decimal" className={field} value={loan} onChange={e => setLoan(e.target.value)} /></label>
    </section>
    <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
      {!r ? <p>Enter amounts of 0 or more, between 1 month and 50 years, and a rate from 0 to 10.</p> : <>
        <p className="text-xl font-bold">Refund to CPF about {sgd(r.refund)}</p>
        <p className="mt-1 text-sm">CPF principal used {sgd(r.principal)} + accrued interest {sgd(r.interest)} = {sgd(r.total)}.</p>
        {r.proceeds !== null && <p className="mt-1 text-sm">Selling price less outstanding loan is {sgd(r.proceeds)}{r.proceeds < r.total ? ', so for a sale at market value you refund only that amount; the shortfall does not have to be topped up in cash.' : ', which covers the full refund.'}</p>}
        <p className="mt-1 text-sm">The refund goes back to your own CPF account (Ordinary Account below 55), not to the government.</p>
      </>}
      <p className="mt-3 text-sm">Estimate only: your CPF statement shows the exact amount. Amounts pledged at 55 and pre-2013 exemptions are not included.</p>
    </section>
  </div>;
}
