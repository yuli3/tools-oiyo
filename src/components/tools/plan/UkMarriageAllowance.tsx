import { useState } from "react";
import { UK_MA, ukMarriageAllowance } from "../../../lib/new-calc-5-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const gbp = (n: number) => n.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/,/g, "")));

export default function UkMarriageAllowance() {
  const [low, setLow] = useState("9000");
  const [high, setHigh] = useState("32000");
  const [scot, setScot] = useState(false);
  const [mar, setMar] = useState(true);
  let r: ReturnType<typeof ukMarriageAllowance> | null = null;
  try { r = ukMarriageAllowance({ lowerIncome: num(low), higherIncome: num(high), scotland: scot, married: mar }); } catch { r = null; }
  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <label className="block text-sm">Lower earner's yearly income (£)<input inputMode="numeric" className={field} value={low} onChange={(e) => setLow(e.target.value)} /></label>
        <label className="block text-sm">Partner's yearly income (£)<input inputMode="numeric" className={field} value={high} onChange={(e) => setHigh(e.target.value)} /></label>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={mar} onChange={(e) => setMar(e.target.checked)} />Married or in a civil partnership</label>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={scot} onChange={(e) => setScot(e.target.checked)} />The partner pays Scottish income tax</label>
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? <p>Enter both incomes.</p> : r.eligible ? (
          <>
            <p className="text-xl font-bold">You can transfer {gbp(r.transfer)} and save up to {gbp(r.yearlySaving)} a year</p>
            <p className="mt-2 text-sm">You can also backdate to the {r.backdateFrom} tax year for any year you were eligible. {r.note}</p>
          </>
        ) : (
          <>
            <p className="text-xl font-bold">Not eligible as entered</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{r.reasons.map((x) => <li key={x}>{x}</li>)}</ul>
          </>
        )}
        <p className="mt-3 text-sm">Apply free on GOV.UK. The lower earner applies; tax codes change within about 2 months. Personal Allowance assumed: {gbp(UK_MA.personalAllowance)}.</p>
      </section>
    </div>
  );
}
