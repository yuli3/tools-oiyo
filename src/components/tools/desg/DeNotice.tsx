// Kündigungsfrist nach § 622 BGB. Logic: lib/world-de-sg-pack-2026.ts
import { useState } from "react";
import { DESG_AS_OF, deNoticePeriod } from "../../../lib/world-de-sg-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell, { DE_VIZ_TEXT } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "kuendigungsfrist-rechner";
type By = "employer" | "employee";
type YN = "y" | "n";
const minusYears = (s: string, y: number) => { const [a, b, c] = s.split("-").map(Number); return new Date(Date.UTC(a - y, b - 1, c)).toISOString().slice(0, 10); };
const yearsBetween = (a: string, b: string) => Math.max(0, (Date.parse(b) - Date.parse(a)) / 31_557_600_000);
const months = (from: string, to: string | null) => (to ? Math.round((Date.parse(to) - Date.parse(from)) / 2_629_800_000 * 10) / 10 : 0);

export default function DeNotice() {
  const [x, setX] = useState({ noticeDate: "2026-11-23", startDate: "2019-04-01", by: "employer" as By, probation: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = deNoticePeriod({ ...x, probation: x.probation === "y" });
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="EUR" text={DE_VIZ_TEXT}
      curve={{ title: "Kündigungsfrist nach Beschäftigungsdauer", caption: x.by === "employer" ? "Kündigung durch den Arbeitgeber: die Frist wächst mit den Jahren im Betrieb." : "Kündigung durch den Arbeitnehmer: 4 Wochen zum 15. oder Monatsende.", xLabel: "Jahre im Betrieb", yLabel: "Monate bis zum Ende", min: 0, max: 25, step: 1, current: Math.min(25, Math.floor(yearsBetween(x.startDate, x.noticeDate))), f: (v) => months(x.noticeDate, deNoticePeriod({ noticeDate: x.noticeDate, startDate: minusYears(x.noticeDate, v), by: x.by, probation: x.probation === "y" }).end), formatX: (n) => `${Math.round(n)} J.`, formatY: (n) => `${n.toLocaleString("de-DE")} M.`, onPick: (v) => upd({ startDate: minusYears(x.noticeDate, v) }), marks: [2, 5, 8, 10, 12, 15, 20].map((y) => ({ at: y, label: String(y) })) }}
    >
      {(mode) => (
        <>
          <ChoiceChips<By> legend="Wer kündigt?" value={x.by} options={[{ value: "employer", label: "Arbeitgeber" }, { value: "employee", label: "Arbeitnehmer" }]} onChange={(v) => upd({ by: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="Zugang der Kündigung" value={x.noticeDate} onChange={(v) => upd({ noticeDate: v })} />
            <DateField label="Beginn des Arbeitsverhältnisses" value={x.startDate} onChange={(v) => upd({ startDate: v })} />
          </div>
          {mode === "expert" && <ChoiceChips<YN> legend="In der vereinbarten Probezeit (höchstens 6 Monate)?" value={x.probation} options={[{ value: "n", label: "Nein" }, { value: "y", label: "Ja" }]} onChange={(v) => upd({ probation: v })} />}
          <LaborResult mode={mode} headline={r.end ? `Ende des Arbeitsverhältnisses: ${r.end}` : "Datum fehlt"} sub={r.rule} items={r.items} dates={r.dates} datesTitle="Termin" note={`Nach § 622 BGB. Keine Rechtsberatung. Stand ${DESG_AS_OF}. Ihre Eingaben bleiben im Browser.`} />
        </>
      )}
    </CurveShell>
  );
}
