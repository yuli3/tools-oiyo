// Estimated tax safe harbor and quarterly payments. Logic: lib/us-tax-pack-2026.ts
import { useState } from "react";
import { US_TAX_AS_OF, US_TAX_NOTE, usEstimatedTax } from "../../../lib/us-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell from "../viz/CurveShell";

const TOOL_ID = "estimated-tax-safe-harbor-calculator";
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
type YN = "y" | "n";

export default function UsEstimatedTax() {
  const [x, setX] = useState({ priorTax: 12_000, priorAgi: 90_000, current: 18_000, wh: 0, mfs: "n" as YN, full: "y" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = usEstimatedTax({ priorTax: x.priorTax, priorAgi: x.priorAgi, currentTax: x.current, withholding: x.wh, mfs: x.mfs === "y", priorFullYear: x.full === "y", taxYear: 2026 });
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="en"
      currency="USD"
      curve={{
        title: "Estimated tax to pay by this year's expected tax", caption: "The safe harbor uses the smaller of 90% of this year or 100%/110% of last year, so the line flattens.",
        xLabel: "This year's expected tax", yLabel: "Estimated tax to pay", min: 0, max: 60000, step: 1000, current: x.current,
        f: (v) => usEstimatedTax({ priorTax: x.priorTax, priorAgi: x.priorAgi, currentTax: v, withholding: x.wh, mfs: x.mfs === "y", priorFullYear: x.full === "y", taxYear: 2026 }).toPay, formatX: (n: number) => `$${Math.round(n).toLocaleString("en-US")}`, formatY: (n: number) => `$${Math.round(n).toLocaleString("en-US")}`,
        onPick: (v) => upd({ current: v }), marks: [],
      }}
    >
      {() => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Last year's total tax (Form 1040)" value={x.priorTax} onChange={(v) => upd({ priorTax: v })} suffix="USD" step={500} />
        <NumberField label="Last year's AGI" value={x.priorAgi} onChange={(v) => upd({ priorAgi: v })} suffix="USD" step={1000} />
        <NumberField label="Expected total tax this year" value={x.current} onChange={(v) => upd({ current: v })} suffix="USD" step={500} />
        <NumberField label="Expected withholding this year" value={x.wh} onChange={(v) => upd({ wh: v })} suffix="USD" step={500} />
      </div>
      <ChoiceChips<YN> legend="Married filing separately?" value={x.mfs} options={[{ value: "y", label: "Yes" }, { value: "n", label: "No" }]} onChange={(v) => upd({ mfs: v })} />
      <ChoiceChips<YN> legend="Did you file a full 12-month return last year?" value={x.full} options={[{ value: "y", label: "Yes" }, { value: "n", label: "No" }]} onChange={(v) => upd({ full: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{r.needed ? `Pay about ${usd(r.toPay)} in four payments to stay in the safe harbor` : "No estimated payments needed"}</p>
        {r.needed && <ul className="mt-3 space-y-1">{r.schedule.map((s) => <li key={s.date}><span className="font-mono">{s.date}</span> · {usd(s.amount)}</li>)}</ul>}
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{US_TAX_NOTE} As of {US_TAX_AS_OF}.</p>
    </>
      )}
    </CurveShell>
  );
}
