// US federal business return due dates by tax year end. Logic: lib/world-company-calendar-2026.ts
import { useState } from "react";
import { CALENDAR_AS_OF, usCompanyCalendar, type UsEntity } from "../../../lib/world-company-calendar-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { calCurve } from "./CalCurve";

const TOOL_ID = "us-business-tax-return-due-dates";

export default function UsCompanyCalendar() {
  const [x, setX] = useState({ yearEnd: "2026-12-31", entity: "ccorp" as UsEntity, today: "2026-11-22", day: 30 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = usCompanyCalendar({ yearEnd: x.yearEnd, entity: x.entity, today: x.today || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="USD"
      curve={calCurve({ yearEnd: x.yearEnd, dates: r.dates, title: "Federal due dates still ahead after year end", caption: "Original and extended due dates, by days after the tax year ends.", xLabel: "Days after year end", yLabel: "Due dates left", day: (n) => `${Math.round(n)} days`, current: x.day, onPick: (v) => upd({ day: v }), max: 500 })}
    >
      {(mode) => (
        <>
          <ChoiceChips<UsEntity> legend="Type of business return" value={x.entity} options={[{ value: "ccorp", label: "C corporation (1120)" }, { value: "scorp", label: "S corporation (1120-S)" }, { value: "partnership", label: "Partnership (1065)" }]} onChange={(v) => upd({ entity: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="Tax year end" value={x.yearEnd} onChange={(v) => upd({ yearEnd: v })} />
            {mode === "expert" && <DateField label="Today's date" value={x.today} onChange={(v) => upd({ today: v })} />}
          </div>
          <LaborResult mode={mode} headline={r.dates[0] ? `File by ${r.dates[0].date}` : "Enter the tax year end"} sub={r.next ? `Next: ${r.next.label} (${r.next.date})` : undefined} items={r.items} dates={r.dates} datesTitle="Due dates" note={`From the IRS Form 7004 due date chart for 2026. Federal returns only. Not tax advice. Updated ${CALENDAR_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
