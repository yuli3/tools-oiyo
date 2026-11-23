// Canada take-home 2026 (federal + Ontario, BC, Alberta; CPP, CPP2, EI). Logic: lib/world-tax-season-2027.ts
import { useState } from "react";
import { caTakeHome2026, SEASON_AS_OF, type CaProvince } from "../../../lib/world-tax-season-2027";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "canada-take-home-pay-calculator-2026";
const cad = (n: number) => `$${Math.round(n).toLocaleString("en-CA")}`;

export default function CaTakeHome2026() {
  const [x, setX] = useState({ annual: 70_000, province: "on" as CaProvince });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const calc = (v: number) => caTakeHome2026({ annual: v, province: x.province });
  const r = calc(x.annual);
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="CAD"
      curve={{ title: "Take-home pay by salary", caption: `2026 federal and ${r.provinceName} tax, CPP, CPP2 and EI.`, xLabel: "Annual salary", yLabel: "Take-home a year", min: 0, max: 300_000, step: 5_000, current: Math.min(300_000, x.annual), f: (v) => calc(v).net, formatX: cad, formatY: cad, onPick: (v) => upd({ annual: Math.round(v) }), marks: [{ at: 68_900, label: "EI max" }, { at: 74_600, label: "YMPE" }, { at: 85_000, label: "YAMPE" }] }}
    >
      {(mode) => (
        <>
          <NumberField label="Annual salary before tax (CAD)" value={x.annual} onChange={(v) => upd({ annual: v })} step={1000} />
          <ChoiceChips<CaProvince> legend="Province" value={x.province} options={[{ value: "on", label: "Ontario" }, { value: "bc", label: "British Columbia" }, { value: "ab", label: "Alberta" }]} onChange={(v) => upd({ province: v })} />
          <LaborResult mode={mode} headline={`Take-home: ${cad(r.net)} a year (${cad(r.monthlyNet)} a month)`} sub={`Federal ${cad(r.federal)} · ${r.provinceName} ${cad(r.provincial)} · CPP ${cad(r.cpp + r.cpp2)} · EI ${cad(r.ei)}`} items={r.items} dates={[]} datesTitle="" note={`From CRA 2026 payroll rates (T4032, T4127 July 2026). Estimate only, not tax advice. Updated ${SEASON_AS_OF}. What you type stays in your browser.`} />
          {mode === "expert" && <p className="text-xs text-muted-foreground">Taxable income after the enhanced CPP and CPP2 deduction: {cad(r.taxable)}{r.ohp ? ` · Ontario Health Premium ${cad(r.ohp)}` : ""}.</p>}
        </>
      )}
    </CurveShell>
  );
}
