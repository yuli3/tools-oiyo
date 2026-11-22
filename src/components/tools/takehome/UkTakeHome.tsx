// UK take-home pay 2026-27 (employees). Logic: lib/world-take-home-2026.ts
import { useState } from "react";
import { TAKE_HOME_AS_OF, ukTakeHome, type UkLoan } from "../../../lib/world-take-home-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "uk-take-home-pay-calculator-2026";
const gbp = (n: number) => `£${n.toLocaleString("en-GB", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
type Where = "ewni" | "scotland";
type Loan = "none" | UkLoan;

export default function UkTakeHome() {
  const [x, setX] = useState({ annual: 35_000, where: "ewni" as Where, loan: "none" as Loan });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const calc = (v: number) => ukTakeHome({ annual: v, scotland: x.where === "scotland", loans: x.loan === "none" ? [] : [x.loan] });
  const r = calc(x.annual);
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="GBP"
      curve={{ title: "Take-home pay by salary", caption: "Income Tax, employee National Insurance and student loan for 2026-27.", xLabel: "Annual salary", yLabel: "Take-home a year", min: 0, max: 200_000, step: 1_000, current: Math.min(200_000, x.annual), f: (v) => calc(v).net, formatX: gbp, formatY: gbp, onPick: (v) => upd({ annual: v }), marks: [{ at: 12_570, label: "£12,570" }, { at: 50_270, label: "£50,270" }, { at: 100_000, label: "£100k" }] }}
    >
      {(mode) => (
        <>
          <NumberField label="Annual salary before tax (£)" value={x.annual} onChange={(v) => upd({ annual: v })} step={1000} />
          <ChoiceChips<Where> legend="Where you pay Income Tax" value={x.where} options={[{ value: "ewni", label: "England, Wales, NI" }, { value: "scotland", label: "Scotland" }]} onChange={(v) => upd({ where: v })} />
          {mode === "expert" && <ChoiceChips<Loan> legend="Student loan" value={x.loan} options={[{ value: "none", label: "None" }, { value: "plan1", label: "Plan 1" }, { value: "plan2", label: "Plan 2" }, { value: "plan4", label: "Plan 4" }, { value: "plan5", label: "Plan 5" }, { value: "pg", label: "Postgraduate" }]} onChange={(v) => upd({ loan: v })} />}
          <LaborResult mode={mode} headline={`Take-home: ${gbp(r.net)} a year (${gbp(r.monthlyNet)} a month)`} sub={`Income Tax ${gbp(r.incomeTax)} · National Insurance ${gbp(r.ni)}${r.loan ? ` · student loan ${gbp(r.loan)}` : ""}`} items={r.items} dates={[]} datesTitle="" note={`From gov.uk Rates and thresholds for employers 2026 to 2027. Not tax advice. Updated ${TAKE_HOME_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
