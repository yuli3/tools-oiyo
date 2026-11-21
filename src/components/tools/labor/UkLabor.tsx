// UK: statutory redundancy pay, notice, holiday, minimum wage, SSP and tribunal time limit. Logic: lib/world-labor-pack-2026.ts
import { useState } from "react";
import { LABOR_AS_OF, ukLaborExit } from "../../../lib/world-labor-pack-2026";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import LaborResult from "./LaborResult";

const TOOL_ID = "uk-redundancy-notice-tribunal-calculator";

export default function UkLabor() {
  const [x, setX] = useState({ start: "2016-01-04", end: "2026-11-30", age: 45, weekly: 700, days: 5, hourly: 13, incident: "2026-11-30", awe: 600 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = ukLaborExit({ start: x.start || "2016-01-04", end: x.end || "2026-11-30", age: x.age, weeklyPay: x.weekly, daysPerWeek: x.days, hourlyPay: x.hourly, incident: x.incident || undefined, averageWeeklyEarnings: x.awe });
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <DateField label="Start date" value={x.start} onChange={(v) => upd({ start: v })} />
        <DateField label="Date your job ends" value={x.end} onChange={(v) => upd({ end: v })} />
        <NumberField label="Age when the job ends" value={x.age} onChange={(v) => upd({ age: v })} />
        <NumberField label="Weekly pay before tax" value={x.weekly} onChange={(v) => upd({ weekly: v })} suffix="£" step={10} />
        <NumberField label="Days worked a week" value={x.days} onChange={(v) => upd({ days: v })} />
        <NumberField label="Hourly pay" value={x.hourly} onChange={(v) => upd({ hourly: v })} suffix="£" step={0.1} />
        <NumberField label="Average weekly earnings (for SSP)" value={x.awe} onChange={(v) => upd({ awe: v })} suffix="£" step={10} />
        <DateField label="Date of the problem (for a tribunal claim)" value={x.incident} onChange={(v) => upd({ incident: v })} />
      </div>
      <LaborResult headline={`Redundancy pay about £${Math.round(r.redundancyPay).toLocaleString("en-GB")} · notice ${r.noticeWeeks} week(s)`} sub={`${r.service.years} years ${r.service.months} months of service · holiday ${r.holidayDays} days a year`} items={r.items} dates={r.dates} datesTitle="Time limits" note={`General information and estimates from gov.uk. Not legal advice; we do not represent you or file claims. Last checked: ${LABOR_AS_OF}. What you enter stays in your browser.`} />
    </div>
  );
}
