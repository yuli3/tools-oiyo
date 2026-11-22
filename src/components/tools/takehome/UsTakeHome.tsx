// US take-home pay 2026 (federal income tax + employee FICA). Logic: lib/world-take-home-2026.ts
import { useState } from "react";
import { TAKE_HOME_AS_OF, usTakeHome } from "../../../lib/world-take-home-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "us-take-home-pay-calculator-2026";
const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
type F = "single" | "mfj";

export default function UsTakeHome() {
  const [x, setX] = useState({ annual: 60_000, filing: "single" as F });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const calc = (v: number) => usTakeHome({ annual: v, filing: x.filing });
  const r = calc(x.annual);
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="USD"
      curve={{ title: "Take-home pay by salary", caption: "Federal income tax (standard deduction) and employee FICA for 2026. State tax not included.", xLabel: "Annual wages", yLabel: "Take-home a year", min: 0, max: 400_000, step: 5_000, current: Math.min(400_000, x.annual), f: (v) => calc(v).net, formatX: usd, formatY: usd, onPick: (v) => upd({ annual: v }), marks: [{ at: 184_500, label: "SS wage base" }, { at: 200_000, label: "$200k" }] }}
    >
      {(mode) => (
        <>
          <NumberField label="Annual wages before tax ($)" value={x.annual} onChange={(v) => upd({ annual: v })} step={1000} />
          <ChoiceChips<F> legend="Filing status" value={x.filing} options={[{ value: "single", label: "Single" }, { value: "mfj", label: "Married filing jointly" }]} onChange={(v) => upd({ filing: v })} />
          <LaborResult mode={mode} headline={`Take-home: ${usd(r.net)} a year (${usd(r.monthlyNet)} a month)`} sub={`Federal tax ${usd(r.federalTax)} · Social Security ${usd(r.socialSecurity)} · Medicare ${usd(r.medicare + r.additionalMedicare)}`} items={r.items} dates={[]} datesTitle="" note={`From IRS Topic 751 and the 2026 brackets (IR-2025-103). No state tax. Not tax advice. Updated ${TAKE_HOME_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
