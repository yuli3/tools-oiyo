// UK capital allowances: AIA, full expensing, 40%/50% FYA and writing down allowances. Logic: lib/uk-tax-pack-2026.ts
import { useState } from "react";
import { UK_TAX_AS_OF, UK_TAX_NOTE, ukCapitalAllowances } from "../../../lib/uk-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell from "../viz/CurveShell";

const TOOL_ID = "uk-capital-allowances-aia-calculator";
type YN = "y" | "n";
type Pool = "main" | "special";
const yn = [{ value: "y", label: "Yes" }, { value: "n", label: "No" }] as const;
const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

export default function UkCapitalAllowances() {
  const [x, setX] = useState({ cost: 30_000, pool: "main" as Pool, company: "y" as YN, date: "2026-06-01", aiaUsed: 0, car: "n" as YN, cash: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = ukCapitalAllowances({ cost: x.cost, pool: x.pool, company: x.company === "y", date: x.date || "2026-06-01", aiaUsed: x.aiaUsed, car: x.car === "y", cashBasis: x.company === "n" && x.cash === "y" });
  const max = Math.max(1, x.cost);
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="en"
      currency="GBP"
      curve={{
        title: "Best first-year allowance by cost", caption: "The largest first-year amount among the options you can use.",
        xLabel: "Cost", yLabel: "First-year allowance", min: 0, max: 200000, step: 2000, current: x.cost,
        f: (v) => Math.max(0, ...ukCapitalAllowances({ cost: v, pool: x.pool, company: x.company === "y", date: x.date || "2026-06-01", aiaUsed: x.aiaUsed, car: x.car === "y", cashBasis: x.company === "n" && x.cash === "y" }).options.map((o) => o.firstYear)), formatX: (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`, formatY: (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`,
        onPick: (v) => upd({ cost: v }), marks: [],
      }}
    >
      {() => (
    <>
      <ChoiceChips<YN> legend="Limited company?" value={x.company} options={[...yn]} onChange={(v) => upd({ company: v })} />
      {x.company === "n" && <ChoiceChips<YN> legend="Sole trader using the cash basis?" value={x.cash} options={[...yn]} onChange={(v) => upd({ cash: v })} />}
      <ChoiceChips<Pool> legend="Pool" value={x.pool} options={[{ value: "main", label: "Main rate (most plant and machinery)" }, { value: "special", label: "Special rate (integral features, long-life assets)" }]} onChange={(v) => upd({ pool: v })} />
      <ChoiceChips<YN> legend="Is it a car?" value={x.car} options={[...yn]} onChange={(v) => upd({ car: v })} />
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Cost" value={x.cost} onChange={(v) => upd({ cost: v })} suffix="£" step={1000} />
        <DateField label="Date of expenditure" value={x.date} onChange={(v) => upd({ date: v })} />
        <NumberField label="AIA already used this period" value={x.aiaUsed} onChange={(v) => upd({ aiaUsed: v })} suffix="£" step={1000} />
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        {r.options.length > 0 && <>
          <p className="font-semibold text-foreground">First-year deduction by option</p>
          <ul className="mt-2 space-y-2">
            {r.options.map((o) => (
              <li key={o.id}>
                <p>{o.label}: <span className="font-mono font-semibold">{gbp(o.firstYear)}</span></p>
                <progress className="h-2 w-full accent-(--primary)" max={max} value={o.firstYear} aria-label={o.label} />
              </li>
            ))}
          </ul>
          <p className="mt-4 font-semibold text-foreground">Writing down allowance only</p>
          <ul className="mt-2 space-y-1">
            {r.wda.map((w) => (
              <li key={w.year} className="flex items-center gap-2">
                <span className="w-14 shrink-0">Year {w.year}</span>
                <progress className="h-2 w-full accent-(--primary)" max={max} value={w.allowance} aria-label={`Year ${w.year}`} />
                <span className="w-24 shrink-0 text-right font-mono">{gbp(w.allowance)}</span>
              </li>
            ))}
          </ul>
        </>}
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{UK_TAX_NOTE} Last checked: {UK_TAX_AS_OF}.</p>
    </>
      )}
    </CurveShell>
  );
}
