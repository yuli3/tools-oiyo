// Statutory late-payment interest between businesses (DE, FR, ES, UK). Logic: lib/world-late-payment-2026.ts
import { useState } from "react";
import { LATE_AS_OF, lateInterest, type LateCountry } from "../../../lib/world-late-payment-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "b2b-late-payment-interest-calculator";
const C: { value: LateCountry; label: string }[] = [{ value: "DE", label: "Germany" }, { value: "FR", label: "France" }, { value: "ES", label: "Spain" }, { value: "UK", label: "UK" }];
const CUR: Record<LateCountry, string> = { DE: "EUR", FR: "EUR", ES: "EUR", UK: "GBP" };
const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const plus = (s: string, d: number) => new Date(Date.parse(`${s}T00:00:00Z`) + d * 86_400_000).toISOString().slice(0, 10);
const diff = (a: string, b: string) => Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000));

export default function LatePaymentB2B() {
  const [x, setX] = useState({ country: "DE" as LateCountry, amount: 10_000, due: "2026-09-01", paid: "2026-11-20", baseRate: 3.75 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const calc = (paid: string) => lateInterest({ country: x.country, amount: x.amount, due: x.due, paid, baseRate: x.baseRate });
  const r = calc(x.paid);
  const cur = CUR[x.country];
  const days = diff(x.due, x.paid);
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency={cur}
      curve={{ title: "Interest and compensation by days late", caption: "Statutory rate on the invoice amount; fixed compensation once per invoice.", xLabel: "Days late", yLabel: "Amount you can claim", min: 0, max: Math.max(365, days * 2), step: 5, current: days, f: (d) => { const q = calc(plus(x.due, d)); return q.ok ? q.total : 0; }, formatX: (n) => `${Math.round(n)} d`, formatY: fmt, onPick: (d) => upd({ paid: plus(x.due, Math.round(d)) }), marks: [] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<LateCountry> legend="Law of the contract" value={x.country} options={C} onChange={(v) => upd({ country: v })} />
          <NumberField label={`Invoice amount (${cur})`} value={x.amount} onChange={(v) => upd({ amount: v })} step={500} />
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="Payment was due" value={x.due} onChange={(v) => upd({ due: v })} />
            <DateField label="Paid (or today)" value={x.paid} onChange={(v) => upd({ paid: v })} />
          </div>
          {x.country === "UK" && <NumberField label="Bank of England reference rate (%)" value={x.baseRate} onChange={(v) => upd({ baseRate: v })} step={0.25} />}
          {r.ok
            ? <LaborResult mode={mode} headline={`Claim ${fmt(r.total)} ${cur}`} sub={`Interest ${fmt(r.interest)} for ${r.days} days + compensation ${fmt(r.compensation)}`} items={[...r.segments.map((s) => ({ tone: "info", text: `${s.from} to ${s.to}: ${s.days} days at ${s.rate}% = ${fmt(s.interest)}`, cite: "Rate period" })), ...r.items] as never} dates={[]} datesTitle="" note={`Statutory rates from official pages. Not legal advice. Updated ${LATE_AS_OF}. What you type stays in your browser.`} />
            : <LaborResult mode={mode} headline="Missing input" sub={r.error} items={[]} dates={[]} datesTitle="" note="" />}
        </>
      )}
    </CurveShell>
  );
}
