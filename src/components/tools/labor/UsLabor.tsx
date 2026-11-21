// US: minimum wage, FLSA overtime, WARN, final pay (CA) and EEOC/FLSA deadlines. Logic: lib/world-labor-pack-2026.ts
import { useState } from "react";
import { LABOR_AS_OF, usLaborExit } from "../../../lib/world-labor-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import LaborResult from "./LaborResult";
import LaborShell from "./LaborShell";

const TOOL_ID = "us-wage-layoff-deadline-checker";
type S = "federal" | "CA" | "NY-NYC" | "NY" | "TX";
type YN = "y" | "n";

export default function UsLabor() {
  const [x, setX] = useState({ state: "federal" as S, hourly: 15, hours: 46, incident: "2026-11-21", agency: "y" as YN, employees: 120, layoff: 55, fired: "y" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = usLaborExit({ state: x.state, hourlyWage: x.hourly, weeklyHours: x.hours, incident: x.incident || undefined, stateAgency: x.agency === "y", employees: x.employees, layoffAtSite: x.layoff, fired: x.fired === "y" });
  const run = (h: number) => usLaborExit({ state: x.state, hourlyWage: x.hourly, weeklyHours: h }).overtimePay;
  return (
    <LaborShell
      toolId={TOOL_ID}
      lang="en"
      currency="USD"
      curve={{
        title: "Overtime pay by hours worked in a week", caption: "Federal rule for non-exempt employees: 1.5x pay over 40 hours. California daily overtime is not drawn.",
        xLabel: "Hours in the week", yLabel: "Overtime pay", min: 30, max: 70, step: 1, current: x.hours,
        f: run, formatX: (h) => `${h} h`, formatY: (n) => `$${Math.round(n).toLocaleString("en-US")}`,
        onPick: (h) => upd({ hours: h }), marks: [{ at: 40, label: "40 h" }],
      }}
    >
      {(mode) => (
    <>
      <ChoiceChips<S> legend="Where you work" value={x.state} options={[{ value: "federal", label: "Federal only" }, { value: "CA", label: "California" }, { value: "NY-NYC", label: "NYC, Nassau, Suffolk, Westchester" }, { value: "NY", label: "Rest of New York" }, { value: "TX", label: "Texas" }]} onChange={(v) => upd({ state: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Hourly wage" value={x.hourly} onChange={(v) => upd({ hourly: v })} suffix="$" step={0.25} />
        <NumberField label="Hours worked this week" value={x.hours} onChange={(v) => upd({ hours: v })} />
        {mode === "expert" && <NumberField label="Employer's full-time employees" value={x.employees} onChange={(v) => upd({ employees: v })} />}
        {mode === "expert" && <NumberField label="Job losses at your site in 30 days" value={x.layoff} onChange={(v) => upd({ layoff: v })} />}
        <DateField label="Date of the problem" value={x.incident} onChange={(v) => upd({ incident: v })} />
      </div>
      <ChoiceChips<YN> legend="Does a state or local agency enforce a similar anti-discrimination law?" value={x.agency} options={[{ value: "y", label: "Yes (300 days)" }, { value: "n", label: "No (180 days)" }]} onChange={(v) => upd({ agency: v })} />
      {x.state === "CA" && <ChoiceChips<YN> legend="Were you fired?" value={x.fired} options={[{ value: "y", label: "Fired" }, { value: "n", label: "I quit" }]} onChange={(v) => upd({ fired: v })} />}
      <LaborResult mode={mode} headline={`Minimum wage $${r.minimumWage} · overtime this week $${r.overtimePay}`} items={r.items} dates={r.dates} datesTitle="Deadlines" note={`General information from DOL, eCFR, EEOC and CA DIR. Not legal advice; we do not represent you or file anything. Last checked: ${LABOR_AS_OF}. What you enter stays in your browser.`} />
    </>
      )}
    </LaborShell>
  );
}
