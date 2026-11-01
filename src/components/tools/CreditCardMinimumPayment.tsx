import { useState } from 'react';
import { cardPayoffComparison, type CardPayoff } from '../../lib/debt-planning';
const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
const money = (cents: number) => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const duration = (months: number) => { const y = Math.floor(months / 12), m = months % 12; return [y ? `${y} yr` : '', m ? `${m} mo` : ''].filter(Boolean).join(' ') || '0 mo'; };
function Plan({ label, payment, plan }: { label: string; payment: string; plan: CardPayoff }) {
  return <div className="rounded-lg border border-border bg-card p-3">
    <dt className="text-sm font-semibold">{label}</dt>
    <dd className="mt-1 text-sm text-muted-foreground">{payment}</dd>
    {plan.months === null
      ? <dd className="mt-2 font-medium">{plan.reason === 'never' ? 'Never paid off: the payment does not cover the monthly interest.' : 'Takes more than 100 years.'}</dd>
      : <><dd className="mt-2 break-words text-xl font-bold">{duration(plan.months)}</dd><dd className="text-sm">Interest {money(plan.interestCents)} · total paid {money(plan.totalPaidCents)}</dd></>}
  </div>;
}
export default function CreditCardMinimumPayment() {
  const [balance, setBalance] = useState('5000');
  const [apr, setApr] = useState('22');
  const [percent, setPercent] = useState('1');
  const [floor, setFloor] = useState('35');
  const [addInterest, setAddInterest] = useState(true);
  const [fixed, setFixed] = useState('');
  const r = cardPayoffComparison(balance, apr, percent, floor, addInterest, fixed);
  return <div className="space-y-4" data-debt-worksheet="us-card">
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h2 className="text-lg font-bold">1. Your balance and APR</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">Current balance (USD)<input inputMode="decimal" className={field} value={balance} onChange={e => setBalance(e.target.value)} /></label>
        <label className="block text-sm">Purchase APR (%)<input inputMode="decimal" className={field} value={apr} onChange={e => setApr(e.target.value)} /></label>
      </div>
      <h2 className="text-lg font-bold">2. Your card&apos;s minimum payment rule</h2>
      <p className="text-sm text-muted-foreground">Issuers set their own formula. Look for &quot;minimum payment&quot; in your cardholder agreement. A common rule is 1% of the balance plus that month&apos;s interest, with a dollar floor.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">Percent of balance (%)<input inputMode="decimal" className={field} value={percent} onChange={e => setPercent(e.target.value)} /></label>
        <label className="block text-sm">Minimum dollar floor (USD)<input inputMode="decimal" className={field} value={floor} onChange={e => setFloor(e.target.value)} /></label>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={addInterest} onChange={e => setAddInterest(e.target.checked)} />Add the month&apos;s interest to the percent</label>
      <h2 className="text-lg font-bold">3. Optional: a fixed payment you could afford</h2>
      <label className="block text-sm">Fixed monthly payment (USD)<input inputMode="decimal" className={field} value={fixed} placeholder="e.g. 250" onChange={e => setFixed(e.target.value)} /></label>
    </section>
    <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
      {r ? <>
        <h2 className="text-lg font-bold">How long until the balance is gone</h2>
        <p className="mt-1 text-sm">Assumes no new purchases, fees or rate changes. First minimum payment: <strong>{money(r.firstMinimumCents)}</strong>.</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          <Plan label="Minimum payment only" payment="Payment shrinks as the balance falls" plan={r.minimum} />
          <Plan label="Pay off in 3 years" payment={`${money(r.in36Cents)} every month`} plan={r.in36} />
          {r.fixedPlan && r.fixedCents !== null ? <Plan label="Your fixed payment" payment={`${money(r.fixedCents)} every month`} plan={r.fixedPlan} /> : null}
        </dl>
        {r.minimum.months !== null && r.in36.months !== null ? <p className="mt-3 font-medium">Paying {money(r.in36Cents)} a month instead of the minimum saves about {money(r.minimum.interestCents - r.in36.interestCents)} in interest.</p> : null}
      </> : <p>Enter a positive balance, an APR from 0 to 100, a minimum percent above 0 and a dollar floor (0 is allowed). Blank values are not treated as zero.</p>}
      <p className="mt-3 text-sm">This is an estimate, not your statement. Issuers charge interest on the average daily balance and may change rates, so your statement&apos;s own minimum payment warning box is the figure to trust.</p>
    </section>
  </div>;
}
