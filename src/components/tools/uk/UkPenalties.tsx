// HMRC Self Assessment late filing and payment penalties, interest and appeal dates. Logic: lib/uk-tax-pack-2026.ts
import { useState } from "react";
import { UK_TAX_AS_OF, UK_TAX_NOTE, ukAppealDeadlines, ukSaPenalties } from "../../../lib/uk-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "hmrc-late-filing-penalty-interest-calculator";
const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

export default function UkPenalties() {
  const [x, setX] = useState({ tax: 3_000, year: "2024", filed: "2026-05-15", paid: "2026-05-15", decision: "" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = ukSaPenalties({ tax: x.tax, taxYear: Number(x.year), filed: x.filed || undefined, paid: x.paid || undefined });
  const a = ukAppealDeadlines({ decision: x.decision || undefined, taxYear: Number(x.year) });
  return (
    <div className="space-y-5">
      <ChoiceChips<string> legend="Tax year of the return" value={x.year} options={[2023, 2024, 2025].map((y) => ({ value: String(y), label: `${y}-${String((y + 1) % 100).padStart(2, "0")} (due 31 Jan ${y + 2})` }))} onChange={(v) => upd({ year: v })} />
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Tax due" value={x.tax} onChange={(v) => upd({ tax: v })} suffix="£" step={100} />
        <DateField label="Date the return was (or will be) filed online" value={x.filed} onChange={(v) => upd({ filed: v })} />
        <DateField label="Date the tax was (or will be) paid" value={x.paid} onChange={(v) => upd({ paid: v })} />
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">About {gbp(r.total)}: penalties {gbp(r.filing + r.payment)} + interest {gbp(r.interest)}</p>
        <p className="mt-1 text-muted-foreground">Online deadline {r.due}</p>
        <Items items={r.items} />
      </div>
      <section className="space-y-3 rounded-md border border-border bg-card px-4 py-4 text-sm">
        <h3 className="font-semibold">Disagree with HMRC: time limits</h3>
        <DateField label="Date of HMRC's decision letter (optional)" value={x.decision} onChange={(v) => upd({ decision: v })} />
        <ul className="space-y-2">
          {a.map((d) => <li key={d.id}><span className="font-mono font-semibold">{d.date}</span> {d.label} <span className="text-xs text-muted-foreground">({d.cite})</span></li>)}
        </ul>
        <p className="text-muted-foreground">A reasonable excuse (for example serious illness or a bereavement) can cancel a penalty. You appeal yourself through your HMRC online account or by post.</p>
      </section>
      <p className="text-xs leading-5 text-muted-foreground">{UK_TAX_NOTE} Last checked: {UK_TAX_AS_OF}.</p>
    </div>
  );
}
