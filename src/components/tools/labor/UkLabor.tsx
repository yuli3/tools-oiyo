// UK: statutory redundancy pay, notice, holiday, minimum wage, SSP and tribunal time limit. Logic: lib/world-labor-pack-2026.ts
import { useState } from "react";
import { LABOR_AS_OF, ukLaborExit } from "../../../lib/world-labor-pack-2026";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import LaborResult from "./LaborResult";
import LaborShell, { startFor } from "./LaborShell";

const TOOL_ID = "uk-redundancy-notice-tribunal-calculator";
const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

export default function UkLabor() {
  const [x, setX] = useState({ start: "2016-01-04", end: "2026-11-30", age: 45, weekly: 700, days: 5, hourly: 13, incident: "2026-11-30", awe: 600 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const end = x.end || "2026-11-30";
  const run = (start: string) => ukLaborExit({ start, end, age: x.age, weeklyPay: x.weekly, daysPerWeek: x.days, hourlyPay: x.hourly, incident: x.incident || undefined, averageWeeklyEarnings: x.awe });
  const r = run(x.start || "2016-01-04");
  return (
    <LaborShell
      toolId={TOOL_ID}
      lang="en"
      currency="GBP"
      curve={{
        title: "Redundancy pay by years of service", caption: "Same age and weekly pay. Only full years count, up to 20.",
        xLabel: "Years of service", yLabel: "Statutory redundancy pay", min: 0, max: 25, step: 1, current: r.service.years,
        f: (y) => run(startFor(end, y)).redundancyPay, formatX: (y) => `${y} yr`, formatY: gbp,
        onPick: (y) => upd({ start: startFor(end, y) }), marks: [{ at: 2, label: "2 years" }, { at: 20, label: "20-year cap" }],
      }}
    >
      {(mode) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="Start date" value={x.start} onChange={(v) => upd({ start: v })} />
            <DateField label="Date your job ends" value={x.end} onChange={(v) => upd({ end: v })} />
            <NumberField label="Age when the job ends" value={x.age} onChange={(v) => upd({ age: v })} />
            <NumberField label="Weekly pay before tax" value={x.weekly} onChange={(v) => upd({ weekly: v })} suffix="£" step={10} />
            {mode === "expert" && <NumberField label="Days worked a week" value={x.days} onChange={(v) => upd({ days: v })} />}
            {mode === "expert" && <NumberField label="Hourly pay" value={x.hourly} onChange={(v) => upd({ hourly: v })} suffix="£" step={0.1} />}
            {mode === "expert" && <NumberField label="Average weekly earnings (for SSP)" value={x.awe} onChange={(v) => upd({ awe: v })} suffix="£" step={10} />}
            <DateField label="Date of the problem (for a tribunal claim)" value={x.incident} onChange={(v) => upd({ incident: v })} />
          </div>
          <LaborResult mode={mode} headline={`Redundancy pay about ${gbp(r.redundancyPay)} · notice ${r.noticeWeeks} week(s)`} sub={`${r.service.years} years ${r.service.months} months of service · holiday ${r.holidayDays} days a year`} items={r.items} dates={r.dates} datesTitle="Time limits" note={`General information and estimates from gov.uk. Not legal advice; we do not represent you or file claims. Last checked: ${LABOR_AS_OF}. What you enter stays in your browser.`} />
        </>
      )}
    </LaborShell>
  );
}
