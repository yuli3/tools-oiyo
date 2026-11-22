// US employer FICA (Social Security + Medicare). Logic: lib/world-employer-cost-pack-2026.ts
import { useState } from "react";
import { EMPLOYER_AS_OF, US_WAGE_BASE_2026, usEmployerCost, usFicaEmployer } from "../../../lib/world-employer-cost-pack-2026";
import LaborResult from "../labor/LaborResult";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "us-employer-payroll-tax-fica-2026";
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export default function UsEmployerCost() {
  const [x, setX] = useState({ annual: 65_000 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = usEmployerCost(x);
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="USD"
      curve={{ title: "Employer FICA by annual wages (2026)", caption: "7.65% up to the Social Security wage base, then 1.45% Medicare only.", xLabel: "Annual wages", yLabel: "Employer FICA", min: 0, max: 300_000, step: 5_000, current: x.annual, f: usFicaEmployer, formatX: usd, formatY: usd, onPick: (v) => upd({ annual: v }), marks: [{ at: US_WAGE_BASE_2026, label: "wage base" }] }}
    >
      {(mode) => (
        <>
          <NumberField label="Annual wages for one employee" value={x.annual} onChange={(v) => upd({ annual: v })} suffix="$" step={1_000} />
          <LaborResult mode={mode} headline={`Employer FICA ${usd(r.employer)} a year (${r.ratio}% of wages)`} sub={`Total cost before benefits ${usd(r.total)}`} items={r.items} dates={r.lines.map((l) => ({ id: l.id, label: `${l.label} (${l.rate})`, date: usd(l.amount), cite: l.cite }))} datesTitle="Breakdown (year)" note={`Federal FICA only, from IRS Topic 751 and the SSA 2026 wage base of ${usd(US_WAGE_BASE_2026)}. Not payroll or tax advice. Updated ${EMPLOYER_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
