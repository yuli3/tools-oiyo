// Singapore notice period (Employment Act, MOM). Logic: lib/world-de-sg-pack-2026.ts
import { useState } from "react";
import { DESG_AS_OF, sgNotice } from "../../../lib/world-de-sg-pack-2026";
import LaborResult from "../labor/LaborResult";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "singapore-notice-period-calculator";
const minusWeeks = (s: string, w: number) => new Date(Date.parse(s) - Math.round(w) * 7 * 86_400_000).toISOString().slice(0, 10);
const weeksBetween = (a: string, b: string) => Math.max(0, Math.floor((Date.parse(b) - Date.parse(a)) / (7 * 86_400_000)));

export default function SgNotice() {
  const [x, setX] = useState({ startDate: "2023-03-01", noticeDate: "2026-11-23", contractDays: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = sgNotice(x);
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="SGD"
      curve={{ title: "Statutory notice by length of service", caption: "Applies when the contract sets no notice period.", xLabel: "Weeks of service", yLabel: "Notice (days)", min: 0, max: 312, step: 1, current: Math.min(312, weeksBetween(x.startDate, x.noticeDate)), f: (v) => sgNotice({ startDate: minusWeeks(x.noticeDate, v), noticeDate: x.noticeDate }).days ?? 0, formatX: (n) => `${Math.round(n)} wk`, formatY: (n) => `${Math.round(n)} d`, onPick: (v) => upd({ startDate: minusWeeks(x.noticeDate, v) }), marks: [{ at: 26, label: "26 wk" }, { at: 104, label: "2 yr" }, { at: 260, label: "5 yr" }] }}
    >
      {(mode) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="Start of employment" value={x.startDate} onChange={(v) => upd({ startDate: v })} />
            <DateField label="Day notice is given" value={x.noticeDate} onChange={(v) => upd({ noticeDate: v })} />
          </div>
          {mode === "expert" && <NumberField label="Notice period in the contract (days, 0 if none)" value={x.contractDays} onChange={(v) => upd({ contractDays: v })} step={1} />}
          <LaborResult mode={mode} headline={r.lastDay ? `Last day of notice: ${r.lastDay}` : "Enter both dates"} sub={r.rule} items={r.items} dates={r.dates} datesTitle="Date" note={`From MOM "Termination with notice" (updated 22 April 2026). Not legal advice. Updated ${DESG_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
