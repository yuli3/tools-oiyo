// Japan company annual tax calendar from the year end. Logic: lib/world-company-calendar-2026.ts
import { useState } from "react";
import { CALENDAR_AS_OF, jpCompanyCalendar } from "../../../lib/world-company-calendar-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { calCurve } from "./CalCurve";

const TOOL_ID = "japan-hojin-shinkoku-kigen-calendar";

export default function JpCompanyCalendar() {
  const [x, setX] = useState({ yearEnd: "2027-03-31", ct: "y", ext: "n", today: "2026-11-22", day: 30 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = jpCompanyCalendar({ yearEnd: x.yearEnd, consumptionTax: x.ct === "y", extensionFiled: x.ext === "y", today: x.today || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="ja" currency="JPY"
      curve={calCurve({ yearEnd: x.yearEnd, dates: r.dates, title: "決算日からの日数と残りの期限", caption: "決算日からの日数ごとに、まだ来ていない申告期限の数です。", xLabel: "決算日からの日数", yLabel: "残りの期限", day: (n) => `${Math.round(n)}日`, current: x.day, onPick: (v) => upd({ day: v }) })}
    >
      {(mode) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="事業年度の終了日（決算日）" value={x.yearEnd} onChange={(v) => upd({ yearEnd: v })} />
            {mode === "expert" && <DateField label="今日の日付" value={x.today} onChange={(v) => upd({ today: v })} />}
          </div>
          <ChoiceChips<"y" | "n"> legend="消費税の課税事業者ですか？" value={x.ct as "y" | "n"} options={[{ value: "y", label: "はい" }, { value: "n", label: "いいえ" }]} onChange={(v) => upd({ ct: v })} />
          {mode === "expert" && <ChoiceChips<"y" | "n"> legend="法人税の延長特例と消費税の延長届出をしていますか？" value={x.ext as "y" | "n"} options={[{ value: "n", label: "していない" }, { value: "y", label: "している" }]} onChange={(v) => upd({ ext: v })} />}
          <LaborResult mode={mode} headline={r.next ? `次の期限 ${r.next.date}（${r.next.label}）` : r.dates.length ? `法人税の申告期限 ${r.dates.find((d) => d.id === "corp")?.date ?? ""}` : "決算日を入れてください"} items={r.items} dates={r.dates} datesTitle="期限" note={`国税庁の案内（法人税・消費税の申告期限）による一般的な目安です。申告の代行や税務の助言ではありません。更新 ${CALENDAR_AS_OF}。入力はブラウザの外に送りません。`} />
        </>
      )}
    </CurveShell>
  );
}
