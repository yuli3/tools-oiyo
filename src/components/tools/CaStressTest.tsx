import { useState } from "react";
import { caStressTest, CA_B20 } from "../../lib/country-finance-5";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const cad = (n: number) => n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

export default function CaStressTest() {
  const [income, setIncome] = useState("120000");
  const [rate, setRate] = useState("4.5");
  const [years, setYears] = useState("25");
  const [tax, setTax] = useState("350");
  const [heat, setHeat] = useState("100");
  const [condo, setCondo] = useState("0");
  const [debt, setDebt] = useState("500");
  let r: ReturnType<typeof caStressTest> | null = null;
  try {
    r = caStressTest({ grossAnnualIncome: num(income), contractRatePct: num(rate), amortizationYears: num(years), propertyTaxMonthly: num(tax), heatingMonthly: num(heat), condoFeesMonthly: num(condo), otherDebtMonthly: num(debt) });
  } catch {
    r = null;
  }
  const rows: [string, string, (v: string) => void][] = [
    ["Household gross income per year (CAD)", income, setIncome],
    ["Mortgage rate offered (%)", rate, setRate],
    ["Amortization (years)", years, setYears],
    ["Property tax per month (CAD)", tax, setTax],
    ["Heating per month (CAD)", heat, setHeat],
    ["Condo fees per month (CAD)", condo, setCondo],
    ["Other debt payments per month (car, cards, loans)", debt, setDebt],
  ];
  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        {rows.map(([label, value, set]) => (
          <label key={label} className="block text-sm">{label}<input inputMode="decimal" className={field} value={value} onChange={(e) => set(e.target.value)} /></label>
        ))}
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? (
          <p>Enter numbers of 0 or more, a rate up to 30% and an amortization of 1–40 years.</p>
        ) : (
          <>
            <p className="text-xl font-bold">You may qualify for about {cad(r.maxMortgage)}</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Qualifying rate: {r.qualifyingRate.toFixed(2)}% (the greater of {CA_B20.floorRate}% or your rate + {CA_B20.buffer}%).</li>
              <li>Highest payment allowed at that rate: {cad(r.maxPayment)} a month, limited by {r.bindingRatio === "GDS" ? `GDS ${CA_B20.gds * 100}%` : `TDS ${CA_B20.tds * 100}%`}.</li>
              <li>Your actual payment on that mortgage at {rate}%: {cad(r.actualPayment)} a month.</li>
            </ul>
          </>
        )}
        <p className="mt-3 text-sm">Lenders may use lower ratios, count other costs or require more down payment. This is not a pre-approval.</p>
      </section>
    </div>
  );
}
