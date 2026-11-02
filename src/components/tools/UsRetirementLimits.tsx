import { useState } from "react";
import { rothIraLimit, tradVsRoth, us401kLimit, usIraLimit, US_2026, type UsFiling } from "../../lib/country-pension-4";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const RATES = [10, 12, 22, 24, 32, 35, 37];
const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

export default function UsRetirementLimits() {
  const [age, setAge] = useState("40");
  const [filing, setFiling] = useState<UsFiling>("single");
  const [magi, setMagi] = useState("120000");
  const [contribution, setContribution] = useState("10000");
  const [years, setYears] = useState("25");
  const [growth, setGrowth] = useState("6");
  const [rateNow, setRateNow] = useState(22);
  const [rateLater, setRateLater] = useState(12);

  const a = num(age);
  const m = num(magi);
  const ok = Number.isInteger(a) && a >= 18 && a <= 100 && Number.isFinite(m) && m >= 0;
  const k = ok ? us401kLimit(a) : null;
  const ira = ok ? usIraLimit(a) : null;
  const roth = ok ? rothIraLimit(a, m, filing) : null;
  const c = num(contribution);
  const y = num(years);
  const g = num(growth);
  const cmpOk = Number.isFinite(c) && c >= 0 && Number.isInteger(y) && y >= 1 && y <= 60 && Number.isFinite(g) && g >= 0 && g <= 15;
  const cmp = cmpOk ? tradVsRoth({ contribution: c, years: y, growth: g / 100, rateNow: rateNow / 100, rateLater: rateLater / 100 }) : null;

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
        <label className="block text-sm">Age at the end of 2026<input inputMode="numeric" className={field} value={age} onChange={(e) => setAge(e.target.value)} /></label>
        <label className="block text-sm">Filing status
          <select className={field} value={filing} onChange={(e) => setFiling(e.target.value as UsFiling)}>
            <option value="single">Single / head of household</option>
            <option value="joint">Married filing jointly</option>
          </select>
        </label>
        <label className="block text-sm">Modified AGI (USD)<input inputMode="decimal" className={field} value={magi} onChange={(e) => setMagi(e.target.value)} /></label>
      </section>

      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!k || !ira || roth === null ? (
          <p>Enter an age from 18 to 100 and an income of 0 or more.</p>
        ) : (
          <>
            <p className="text-xl font-bold">Your 2026 limits: {usd(k.total)} in a 401(k), {usd(ira.total)} in IRAs</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>401(k), 403(b), TSP employee deferral: {usd(k.base)}{k.catchUp ? ` + ${usd(k.catchUp)} catch-up${a >= 60 && a <= 63 ? " (ages 60–63 super catch-up)" : ""}` : ""}.</li>
              <li>IRA (traditional and Roth combined): {usd(ira.base)}{ira.catchUp ? ` + ${usd(ira.catchUp)} catch-up` : ""}.</li>
              <li>
                Roth IRA at your income: {roth === ira.total ? `the full ${usd(roth)}` : roth === 0 ? "not allowed directly (income above the phase-out); a backdoor Roth is the usual route" : `reduced to ${usd(roth)}`}
                {" "}(phase-out {usd(US_2026.rothPhaseOut[filing][0])}–{usd(US_2026.rothPhaseOut[filing][1])}).
              </li>
              <li>
                Traditional IRA deduction if you have a workplace plan: phases out from {usd(US_2026.tradIraDeductionPhaseOut[filing][0])} to {usd(US_2026.tradIraDeductionPhaseOut[filing][1])}. Without a workplace plan it is fully deductible.
              </li>
            </ul>
          </>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Traditional or Roth?</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">Yearly contribution, pre-tax (USD)<input inputMode="decimal" className={field} value={contribution} onChange={(e) => setContribution(e.target.value)} /></label>
          <label className="block text-sm">Years until you withdraw<input inputMode="numeric" className={field} value={years} onChange={(e) => setYears(e.target.value)} /></label>
          <label className="block text-sm">Growth after fees (% a year)<input inputMode="decimal" className={field} value={growth} onChange={(e) => setGrowth(e.target.value)} /></label>
          <label className="block text-sm">Federal bracket now
            <select className={field} value={rateNow} onChange={(e) => setRateNow(Number(e.target.value))}>{RATES.map((r) => <option key={r} value={r}>{r}%</option>)}</select>
          </label>
          <label className="block text-sm">Expected bracket in retirement
            <select className={field} value={rateLater} onChange={(e) => setRateLater(Number(e.target.value))}>{RATES.map((r) => <option key={r} value={r}>{r}%</option>)}</select>
          </label>
        </div>
        <div aria-live="polite" className="rounded-lg bg-muted p-3 text-sm">
          {!cmp ? (
            <p>Enter a contribution of 0 or more, 1 to 60 years and growth from 0 to 15%.</p>
          ) : (
            <>
              <p className="text-base font-semibold">
                {cmp.better === "same" ? "Same result: with equal tax rates the two come out even." : cmp.better === "traditional" ? `Traditional leaves more: ${usd(cmp.traditional)} vs ${usd(cmp.roth)} after tax.` : `Roth leaves more: ${usd(cmp.roth)} vs ${usd(cmp.traditional)} after tax.`}
              </p>
              <p className="mt-1">
                Traditional saves {usd(cmp.taxSavedNow)} of federal tax a year now and grows to {usd(cmp.tradGross)} before tax. Roth puts in {usd(c * (1 - rateNow / 100))} after tax each year and is withdrawn tax-free.
              </p>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Federal tax only. State tax, employer match (always take it first), the Saver&apos;s Credit and required minimum distributions are left out.</p>
      </section>
    </div>
  );
}
