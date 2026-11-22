// UK employer National Insurance, Employment Allowance and Apprenticeship Levy. Logic: lib/world-employer-cost-pack-2026.ts
import { useState } from "react";
import { EMPLOYER_AS_OF, ukEmployerCost, type UkCat } from "../../../lib/world-employer-cost-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "uk-employer-national-insurance-2026";
const gbp = (n: number) => `${n < 0 ? "−" : ""}£${Math.abs(Math.round(n)).toLocaleString("en-GB")}`;

export default function UkEmployerCost() {
  const [x, setX] = useState({ annual: 35_000, employees: 3, category: "standard" as UkCat, allowance: "yes" as "yes" | "no" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = ukEmployerCost({ ...x, allowance: x.allowance === "yes" });
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="GBP"
      curve={{ title: "Employer cost per employee by salary", caption: "15% above £5,000 a year, after sharing the Employment Allowance across your staff.", xLabel: "Annual salary", yLabel: "Employer cost per employee", min: 5_000, max: 120_000, step: 1_000, current: x.annual, f: (v) => ukEmployerCost({ ...x, annual: v, allowance: x.allowance === "yes" }).perEmployee, formatX: gbp, formatY: gbp, onPick: (v) => upd({ annual: v }), marks: [{ at: 50_270, label: "UST" }] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<UkCat> legend="Employee type" value={x.category} options={[{ value: "standard", label: "Standard (21+)" }, { value: "under21", label: "Under 21" }, { value: "apprentice", label: "Apprentice under 25" }]} onChange={(v) => upd({ category: v })} />
          <ChoiceChips<"yes" | "no"> legend="Claim the Employment Allowance?" value={x.allowance} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} onChange={(v) => upd({ allowance: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Annual salary per employee" value={x.annual} onChange={(v) => upd({ annual: v })} suffix="£" step={1_000} />
            <NumberField label="Number of employees on this salary" value={x.employees} onChange={(v) => upd({ employees: v })} step={1} />
          </div>
          <LaborResult mode={mode} headline={`Employer cost ${gbp(r.employer)} a year (${r.ratio}% of the pay bill)`} sub={`${gbp(r.perEmployee)} per employee`} items={r.items} dates={r.lines.map((l) => ({ id: l.id, label: `${l.label} (${l.rate})`, date: gbp(l.amount), cite: l.cite }))} datesTitle="Breakdown (year)" note={`Rates and thresholds for 2026 to 2027 from HMRC (from 6 April 2026). Not payroll advice. Updated ${EMPLOYER_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
