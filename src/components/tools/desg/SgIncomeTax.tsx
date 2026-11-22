// Singapore income tax (IRAS rates from YA 2024). Logic: lib/world-de-sg-pack-2026.ts
import { useState } from "react";
import { DESG_AS_OF, sgIncomeTax } from "../../../lib/world-de-sg-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "singapore-income-tax-calculator";
const sgd = (n: number) => `S$${n.toLocaleString("en-SG", { maximumFractionDigits: 2 })}`;
type R = "resident" | "nonresident";
type YA = "2025" | "2026";

export default function SgIncomeTax() {
  const [x, setX] = useState({ income: 80_000, r: "resident" as R, ya: "2026" as YA, other: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const resident = x.r === "resident";
  const calc = (v: number) => sgIncomeTax(resident ? { chargeableIncome: v, resident, ya: Number(x.ya) } : { chargeableIncome: 0, resident, employmentIncome: v, otherIncome: x.other });
  const r = calc(x.income);
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="SGD"
      curve={{ title: "Income tax by income", caption: resident ? "Resident progressive rates from YA 2024." : "Non-resident: 15% on employment income or resident rates, whichever is higher.", xLabel: resident ? "Chargeable income" : "Employment income", yLabel: "Tax payable", min: 0, max: 600_000, step: 5_000, current: Math.min(600_000, x.income), f: (v) => calc(v).payable, formatX: sgd, formatY: sgd, onPick: (v) => upd({ income: v }), marks: [{ at: 20_000, label: "$20k" }, { at: 80_000, label: "$80k" }, { at: 320_000, label: "$320k" }] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<R> legend="Tax residence" value={x.r} options={[{ value: "resident", label: "Resident" }, { value: "nonresident", label: "Non-resident" }]} onChange={(v) => upd({ r: v })} />
          <NumberField label={resident ? "Chargeable income for the year (S$)" : "Employment income for the year (S$)"} value={x.income} onChange={(v) => upd({ income: v })} step={1000} />
          {mode === "expert" && resident && <ChoiceChips<YA> legend="Year of Assessment" value={x.ya} options={[{ value: "2025", label: "YA 2025" }, { value: "2026", label: "YA 2026" }]} onChange={(v) => upd({ ya: v })} />}
          {mode === "expert" && !resident && <NumberField label="Other income such as director's fees (S$)" value={x.other} onChange={(v) => upd({ other: v })} step={1000} />}
          <LaborResult mode={mode} headline={`Tax payable: ${sgd(r.payable)}`} sub={r.rebate ? `Tax ${sgd(r.tax)} less rebate ${sgd(r.rebate)}` : `Marginal rate ${r.marginal}%`} items={r.items} dates={[]} datesTitle="" note={`From the IRAS individual income tax rates page (last updated 27 April 2026). Not tax advice. Updated ${DESG_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
