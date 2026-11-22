// UK company deadlines: Companies House accounts, Corporation Tax payment, CT600. Logic: lib/world-company-calendar-2026.ts
import { useState } from "react";
import { CALENDAR_AS_OF, ukCompanyCalendar } from "../../../lib/world-company-calendar-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { calCurve } from "./CalCurve";

const TOOL_ID = "uk-company-accounts-ct600-deadlines";

export default function UkCompanyCalendar() {
  const [x, setX] = useState({ yearEnd: "2026-03-31", first: "n", incorporated: "", today: "2026-11-22", day: 30 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = ukCompanyCalendar({ yearEnd: x.yearEnd, firstAccounts: x.first === "y", incorporated: x.incorporated || undefined, today: x.today || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="GBP"
      curve={calCurve({ yearEnd: x.yearEnd, dates: r.dates, title: "Deadlines still ahead after the year end", caption: "How many company filings and payments are still to come, by days after the year end.", xLabel: "Days after year end", yLabel: "Deadlines left", day: (n) => `${Math.round(n)} days`, current: x.day, onPick: (v) => upd({ day: v }) })}
    >
      {(mode) => (
        <>
          <ChoiceChips<"y" | "n"> legend="Are these the company's first accounts?" value={x.first as "y" | "n"} options={[{ value: "n", label: "No" }, { value: "y", label: "Yes" }]} onChange={(v) => upd({ first: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="Financial year end" value={x.yearEnd} onChange={(v) => upd({ yearEnd: v })} />
            {x.first === "y" && <DateField label="Date registered with Companies House" value={x.incorporated} onChange={(v) => upd({ incorporated: v })} />}
            {mode === "expert" && <DateField label="Today's date" value={x.today} onChange={(v) => upd({ today: v })} />}
          </div>
          <LaborResult mode={mode} headline={r.next ? `Next: ${r.next.label} by ${r.next.date}` : r.dates.length ? "All deadlines for this year end have passed" : "Enter the year end"} items={r.items} dates={r.dates} datesTitle="Deadlines" note={`From gov.uk guidance on annual accounts and Company Tax Returns. Private limited companies only. Not tax advice. Updated ${CALENDAR_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
