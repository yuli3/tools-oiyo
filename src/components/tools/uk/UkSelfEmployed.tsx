// UK self-employed Income Tax and Class 2/4 NI estimate, with the MTD start date. Logic: lib/uk-tax-pack-2026.ts
import { useState } from "react";
import { UK_TAX_AS_OF, UK_TAX_NOTE, ukSelfEmployed } from "../../../lib/uk-tax-pack-2026";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "uk-self-employed-tax-ni-calculator";
const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

export default function UkSelfEmployed() {
  const [x, setX] = useState({ profit: 40_000, other: 0, qi2425: 45_000, qi2526: 45_000, qi2627: 45_000 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = ukSelfEmployed({ profit: x.profit, otherIncome: x.other, qi2425: x.qi2425, qi2526: x.qi2526, qi2627: x.qi2627 });
  const keep = Math.max(0, x.profit - r.total);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Taxable profit 2026-27" value={x.profit} onChange={(v) => upd({ profit: v })} suffix="£" step={1000} />
        <NumberField label="Other income (salary, pension)" value={x.other} onChange={(v) => upd({ other: v })} suffix="£" step={1000} />
      </div>
      <details className="rounded-md border border-border px-4 py-3 text-sm">
        <summary className="cursor-pointer font-semibold">Making Tax Digital: qualifying income (self-employment + property turnover)</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <NumberField label="2024-25" value={x.qi2425} onChange={(v) => upd({ qi2425: v })} suffix="£" step={1000} />
          <NumberField label="2025-26" value={x.qi2526} onChange={(v) => upd({ qi2526: v })} suffix="£" step={1000} />
          <NumberField label="2026-27" value={x.qi2627} onChange={(v) => upd({ qi2627: v })} suffix="£" step={1000} />
        </div>
      </details>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">About {gbp(r.total)} on your profit: {gbp(r.incomeTaxOnProfit)} Income Tax + {gbp(r.class4)} Class 4 NI</p>
        <progress className="mt-2 h-2 w-full accent-(--primary)" max={Math.max(1, x.profit)} value={keep} aria-label="Share of profit you keep" />
        <p className="mt-1 text-muted-foreground">You keep about {gbp(keep)} of {gbp(x.profit)}.</p>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{UK_TAX_NOTE} Last checked: {UK_TAX_AS_OF}.</p>
    </div>
  );
}
