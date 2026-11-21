// De minimis, Section 179, bonus and MACRS depreciation (2026). Logic: lib/us-tax-pack-2026.ts
import { useState } from "react";
import { US_TAX_AS_OF, US_TAX_NOTE, usDepreciation } from "../../../lib/us-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell from "../viz/CurveShell";

const TOOL_ID = "macrs-section-179-calculator";
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
type YN = "y" | "n";
type Life = "5" | "7";

export default function UsDepreciation() {
  const [x, setX] = useState({ cost: 12_000, life: "5" as Life, placed: "2026-06-01", s179: 0, bonus: "y" as YN, afs: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = usDepreciation({ cost: x.cost, life: Number(x.life) as 5 | 7, placed: x.placed || "2026-06-01", sec179: x.s179, bonus: x.bonus === "y", afs: x.afs === "y" });
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="en"
      currency="USD"
      curve={{
        title: "First-year deduction by cost", caption: "Same recovery period and elections.",
        xLabel: "Cost", yLabel: "First-year deduction", min: 0, max: 100000, step: 1000, current: x.cost,
        f: (v) => usDepreciation({ cost: v, life: Number(x.life) as 5 | 7, placed: x.placed || "2026-06-01", sec179: Math.min(x.s179, v), bonus: x.bonus === "y", afs: x.afs === "y" }).firstYear, formatX: (n: number) => `$${Math.round(n).toLocaleString("en-US")}`, formatY: (n: number) => `$${Math.round(n).toLocaleString("en-US")}`,
        onPick: (v) => upd({ cost: v }), marks: [],
      }}
    >
      {() => (
    <>
      <ChoiceChips<Life> legend="Property class" value={x.life} options={[{ value: "5", label: "5-year (computers, cars, light trucks)" }, { value: "7", label: "7-year (furniture, fixtures, most equipment)" }]} onChange={(v) => upd({ life: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Cost (business-use share)" value={x.cost} onChange={(v) => upd({ cost: v })} suffix="USD" step={500} />
        <DateField label="Placed in service" value={x.placed} onChange={(v) => upd({ placed: v })} />
        <NumberField label="Section 179 amount to elect" value={x.s179} onChange={(v) => upd({ s179: v })} suffix="USD" step={500} />
      </div>
      <ChoiceChips<YN> legend="Take bonus depreciation?" value={x.bonus} options={[{ value: "y", label: "Yes (default)" }, { value: "n", label: "Elect out" }]} onChange={(v) => upd({ bonus: v })} />
      <ChoiceChips<YN> legend="Do you have audited (applicable) financial statements?" value={x.afs} options={[{ value: "y", label: "Yes" }, { value: "n", label: "No" }]} onChange={(v) => upd({ afs: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{r.treatment === "expense" ? "Expense it under the de minimis safe harbor" : `First-year deduction about ${usd(r.firstYear)}`}</p>
        <Items items={r.items} />
        {r.schedule.length > 1 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-56 text-sm">
              <thead><tr className="text-left"><th className="py-1 pr-2">Year</th><th className="py-1">Deduction</th></tr></thead>
              <tbody>{r.schedule.map((s) => <tr key={s.year} className="border-t border-border"><td className="py-1 pr-2">{s.year}</td><td className="py-1 font-mono">{usd(s.amount)}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{US_TAX_NOTE} As of {US_TAX_AS_OF}.</p>
    </>
      )}
    </CurveShell>
  );
}
