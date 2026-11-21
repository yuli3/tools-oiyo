// UK VAT registration threshold and Flat Rate Scheme check. Logic: lib/uk-tax-pack-2026.ts
import { useState } from "react";
import { UK_TAX_AS_OF, UK_TAX_NOTE, UK_VAT, ukVatCheck } from "../../../lib/uk-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "uk-vat-registration-threshold-check";
type YN = "y" | "n";
const head: Record<string, string> = { "must-register": "You must register for VAT", "can-deregister": "You can cancel your VAT registration", below: "Registration is voluntary", registered: "Registered for VAT" };

export default function UkVatCheck() {
  const [x, setX] = useState({ last12: 75_000, next30: 6_000, next12: 85_000, reg: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = ukVatCheck({ last12: x.last12, next30: x.next30, next12: x.next12, registered: x.reg === "y" });
  return (
    <div className="space-y-5">
      <ChoiceChips<YN> legend="Already VAT registered?" value={x.reg} options={[{ value: "y", label: "Yes" }, { value: "n", label: "No" }]} onChange={(v) => upd({ reg: v })} />
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Taxable turnover, last 12 months" value={x.last12} onChange={(v) => upd({ last12: v })} suffix="£" step={1000} />
        <NumberField label="Expected in the next 30 days alone" value={x.next30} onChange={(v) => upd({ next30: v })} suffix="£" step={1000} />
        <NumberField label="Expected in the next 12 months" value={x.next12} onChange={(v) => upd({ next12: v })} suffix="£" step={1000} />
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{head[r.status]}</p>
        <progress className="mt-2 h-2 w-full accent-(--primary)" max={UK_VAT.register} value={Math.min(UK_VAT.register, x.last12)} aria-label="Turnover against the £90,000 threshold" />
        <p className="mt-1 text-muted-foreground">£{Math.round(x.last12).toLocaleString("en-GB")} of the £90,000 threshold (rolling 12 months, not the tax year).</p>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{UK_TAX_NOTE} Last checked: {UK_TAX_AS_OF}.</p>
    </div>
  );
}
