import { useState } from 'react';
import { LISA, lisaPlan } from '../../lib/country-finance-3';
const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
const gbp = (n: number) => n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
export default function UkLifetimeIsa() {
  const [age, setAge] = useState('25');
  const [balance, setBalance] = useState('0');
  const [yearly, setYearly] = useState('4000');
  const [growth, setGrowth] = useState('3');
  const [target, setTarget] = useState('32');
  const r = lisaPlan(age, balance, yearly, growth, target);
  return <div className="space-y-4" data-debt-worksheet="uk-lisa">
    <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
      <label className="block text-sm">Your age now<input inputMode="numeric" className={field} value={age} onChange={e => setAge(e.target.value)} /></label>
      <label className="block text-sm">Lifetime ISA balance now (GBP, 0 if not opened)<input inputMode="decimal" className={field} value={balance} onChange={e => setBalance(e.target.value)} /></label>
      <label className="block text-sm">You pay in each tax year (GBP, up to {gbp(LISA.yearlyLimit)})<input inputMode="decimal" className={field} value={yearly} onChange={e => setYearly(e.target.value)} /></label>
      <label className="block text-sm">Growth after charges (% a year)<input inputMode="decimal" className={field} value={growth} onChange={e => setGrowth(e.target.value)} /></label>
      <label className="block text-sm">Age you plan to use it (first home, or 60)<input inputMode="numeric" className={field} value={target} onChange={e => setTarget(e.target.value)} /></label>
    </section>
    <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
      {!r ? <p>Enter whole ages from 18 (planned age above your age, at most 60) and a growth rate from 0 to 20.</p>
        : r.error === 'limit' ? <p>The yearly limit is {gbp(LISA.yearlyLimit)}. Payments above it get no bonus and are not allowed.</p>
        : r.error === 'age' ? <p>You can only open a Lifetime ISA from 18 and before 40. Enter your current balance if you already have one.</p>
        : <>
          <p className="text-xl font-bold">About {gbp(r.value)} at {target}</p>
          <p className="mt-1 text-sm">You pay in {gbp(r.paid)} and the government adds {gbp(r.bonus)} (25%, up to {gbp(LISA.bonusMax)} a year, payments stop at 50).</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>First home up to {gbp(LISA.priceCap)} or age 60: no charge, you keep {gbp(r.value)}.</li>
            <li>First home above {gbp(LISA.priceCap)} (from 29 October 2026): 20% charge, you get {gbp(r.overCap.net)}.</li>
            <li>Any other withdrawal: 25% charge, you get {gbp(r.other.net)}.</li>
          </ul>
        </>}
      <p className="mt-3 text-sm">A 25% charge takes more than the bonus: withdraw £1,250 made of £1,000 you paid plus £250 bonus and you get £937.50 back. Growth is an assumption, not a forecast.</p>
    </section>
  </div>;
}
