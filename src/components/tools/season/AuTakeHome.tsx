// Australia take-home 2026-27 (ATO resident rates, LITO, Medicare levy, super 12%). Logic: lib/world-tax-season-2027.ts
import { useState } from "react";
import { auTakeHome, SEASON_AS_OF, type AuYear } from "../../../lib/world-tax-season-2027";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "australia-take-home-pay-calculator-2026-27";
const aud = (n: number) => `$${Math.round(n).toLocaleString("en-AU")}`;
type Pkg = "plus" | "incl";

export default function AuTakeHome() {
  const [x, setX] = useState({ annual: 90_000, year: "2026-27" as AuYear, pkg: "plus" as Pkg });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const calc = (v: number) => auTakeHome({ annual: v, year: x.year, packageIncludesSuper: x.pkg === "incl" });
  const r = calc(x.annual);
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="AUD"
      curve={{ title: "Take-home pay by salary", caption: `${x.year} resident tax, low income tax offset and Medicare levy.`, xLabel: x.pkg === "incl" ? "Package incl. super" : "Salary (super on top)", yLabel: "Take-home a year", min: 0, max: 300_000, step: 5_000, current: Math.min(300_000, x.annual), f: (v) => calc(v).net, formatX: aud, formatY: aud, onPick: (v) => upd({ annual: Math.round(v) }), marks: [{ at: 45_000, label: "$45k" }, { at: 135_000, label: "$135k" }, { at: 190_000, label: "$190k" }] }}
    >
      {(mode) => (
        <>
          <NumberField label="Annual pay before tax (AUD)" value={x.annual} onChange={(v) => upd({ annual: v })} step={1000} />
          <ChoiceChips<Pkg> legend="Is super included in that number?" value={x.pkg} options={[{ value: "plus", label: "No, super is on top" }, { value: "incl", label: "Yes, it's a package incl. super" }]} onChange={(v) => upd({ pkg: v })} />
          {mode === "expert" && <ChoiceChips<AuYear> legend="Income year" value={x.year} options={[{ value: "2026-27", label: "2026-27 (from 1 July 2026)" }, { value: "2025-26", label: "2025-26" }]} onChange={(v) => upd({ year: v })} />}
          <LaborResult mode={mode} headline={`Take-home: ${aud(r.net)} a year (${aud(r.fortnightlyNet)} a fortnight)`} sub={`Income tax ${aud(r.incomeTax)} · Medicare levy ${aud(r.medicare)} · super ${aud(r.super)} paid by your employer`} items={r.items} dates={[]} datesTitle="" note={`From ATO resident tax rates ${x.year}. Estimate only, not tax advice. Updated ${SEASON_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
