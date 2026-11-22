// Singapore CPF contributions from 1 January 2026. Logic: lib/world-de-sg-pack-2026.ts
import { useState } from "react";
import { DESG_AS_OF, sgCpf } from "../../../lib/world-de-sg-pack-2026";
import LaborResult from "../labor/LaborResult";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "singapore-cpf-contribution-calculator-2026";
const sgd = (n: number) => `S$${n.toLocaleString("en-SG", { maximumFractionDigits: 2 })}`;

export default function SgCpf() {
  const [x, setX] = useState({ monthlyWage: 5_000, age: 35 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = sgCpf(x);
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="SGD"
      curve={{ title: "Monthly CPF by ordinary wage", caption: `Employer plus employee, age ${r.ageBand}. Flat above the $8,000 ceiling.`, xLabel: "Monthly ordinary wage", yLabel: "Total CPF", min: 800, max: 12_000, step: 100, current: Math.max(800, Math.min(12_000, x.monthlyWage)), f: (v) => sgCpf({ monthlyWage: v, age: x.age }).total ?? 0, formatX: sgd, formatY: sgd, onPick: (v) => upd({ monthlyWage: v }), marks: [{ at: 8_000, label: "$8,000" }] }}
    >
      {(mode) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Monthly ordinary wage (S$)" value={x.monthlyWage} onChange={(v) => upd({ monthlyWage: v })} step={100} />
            <NumberField label="Age" value={x.age} onChange={(v) => upd({ age: v })} step={1} />
          </div>
          <LaborResult mode={mode} headline={r.computed ? `Employee ${sgd(r.employee!)} + employer ${sgd(r.employer!)} = ${sgd(r.total!)} a month` : "Not computed for wages of $750 or less"} sub={r.computed ? `Take-home before tax: ${sgd(r.takeHomeAfterCpf!)}` : undefined} items={r.items} dates={[]} datesTitle="" note={`Rates from cpf.gov.sg (updated 16 Jun and 7 Oct 2026). Not financial or legal advice. Updated ${DESG_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
