// Self-employment tax + QBI + federal income tax estimate (2026). Logic: lib/us-tax-pack-2026.ts
import { useState } from "react";
import { US_TAX_AS_OF, US_TAX_NOTE, usSelfEmployment, type Filing } from "../../../lib/us-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell from "../viz/CurveShell";

const TOOL_ID = "self-employment-tax-qbi-calculator";
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export default function UsSelfEmployment() {
  const [x, setX] = useState({ net: 80_000, filing: "single" as Filing, wages: 0, other: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = usSelfEmployment({ net: x.net, filing: x.filing, wages: x.wages, otherIncome: x.other });
  const parts = [{ label: "Self-employment tax", v: r.seTax }, { label: "Additional Medicare", v: r.addlMedicare }, { label: "Federal income tax", v: r.incomeTax }];
  const max = Math.max(1, ...parts.map((p) => p.v));
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="en"
      currency="USD"
      curve={{
        title: "Total federal tax by net self-employment earnings", caption: "Self-employment tax plus income tax, with the same filing status and other income.",
        xLabel: "Net earnings", yLabel: "Federal tax", min: 0, max: 300000, step: 5000, current: x.net,
        f: (v) => usSelfEmployment({ net: v, filing: x.filing, wages: x.wages, otherIncome: x.other }).total, formatX: (n: number) => `$${Math.round(n).toLocaleString("en-US")}`, formatY: (n: number) => `$${Math.round(n).toLocaleString("en-US")}`,
        onPick: (v) => upd({ net: v }), marks: [],
      }}
    >
      {() => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Net self-employment profit (Schedule C)" value={x.net} onChange={(v) => upd({ net: v })} suffix="USD" step={1000} />
        <NumberField label="W-2 wages (if any)" value={x.wages} onChange={(v) => upd({ wages: v })} suffix="USD" step={1000} />
        <NumberField label="Other taxable income" value={x.other} onChange={(v) => upd({ other: v })} suffix="USD" step={1000} />
      </div>
      <ChoiceChips<Filing> legend="Filing status" value={x.filing} options={[{ value: "single", label: "Single" }, { value: "mfj", label: "Married filing jointly" }]} onChange={(v) => upd({ filing: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">About {usd(r.total)} in federal tax (estimate), {Math.round(r.effective * 100)}% of your profit</p>
        <ul className="mt-3 space-y-2">
          {parts.map((p) => (
            <li key={p.label}>
              <div className="flex justify-between gap-2"><span>{p.label}</span><span className="font-mono">{usd(p.v)}</span></div>
              <progress className="mt-1 h-2 w-full accent-(--primary)" max={max} value={p.v} aria-label={p.label} />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-muted-foreground">AGI {usd(r.agi)} · QBI deduction {r.qbi == null ? "not estimated" : usd(r.qbi)} · taxable income {usd(r.taxable)}</p>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{US_TAX_NOTE} As of {US_TAX_AS_OF}.</p>
    </>
      )}
    </CurveShell>
  );
}
