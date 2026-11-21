// UK Self Assessment, MTD, Corporation Tax and VAT deadlines (2026-11-21, country localisation: UK). Logic: lib/uk-tax-pack-2026.ts
import { useState } from "react";
import { UK_TAX_AS_OF, UK_TAX_NOTE, ukTaxCalendar } from "../../../lib/uk-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import { track } from "../viz/track";
import { Items, useToday } from "../nts/Items";

const TOOL_ID = "uk-self-assessment-deadlines-2026";
type YN = "y" | "n";
const yn = [{ value: "y", label: "Yes" }, { value: "n", label: "No" }] as const;
const years = [2024, 2025, 2026] as const;

export default function UkTaxCalendar() {
  const today = useToday();
  const [x, setX] = useState({ year: "2025", newToSA: "n" as YN, mtd: "n" as YN, company: "", vat: "" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = ukTaxCalendar({ taxYear: Number(x.year), newToSA: x.newToSA === "y", mtd: x.mtd === "y", companyYearEnd: x.company || undefined, vatPeriodEnd: x.vat || undefined, today });
  return (
    <div className="space-y-5">
      <ChoiceChips<string> legend="Tax year" value={x.year} options={years.map((y) => ({ value: String(y), label: `${y}-${String((y + 1) % 100).padStart(2, "0")}` }))} onChange={(v) => upd({ year: v })} />
      <ChoiceChips<YN> legend="First Self Assessment return (or none last year)?" value={x.newToSA} options={[...yn]} onChange={(v) => upd({ newToSA: v })} />
      <ChoiceChips<YN> legend="Signed up to Making Tax Digital for Income Tax?" value={x.mtd} options={[...yn]} onChange={(v) => upd({ mtd: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <DateField label="Company accounting period end (optional)" value={x.company} onChange={(v) => upd({ company: v })} />
        <DateField label="VAT period end (optional)" value={x.vat} onChange={(v) => upd({ vat: v })} />
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <ol className="space-y-3">
          {r.events.map((e) => (
            <li key={e.id}>
              <p className="font-semibold text-foreground"><span className="font-mono">{e.date ?? "Date to check"}</span>{e.daysLeft != null && <span className="ml-2 font-normal text-muted-foreground">{e.daysLeft >= 0 ? `${e.daysLeft} days left` : `${-e.daysLeft} days ago`}</span>}</p>
              <p>{e.label} <span className="text-xs text-muted-foreground">({e.cite})</span></p>
            </li>
          ))}
        </ol>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{UK_TAX_NOTE} Last checked: {UK_TAX_AS_OF}. What you enter stays in your browser.</p>
    </div>
  );
}
