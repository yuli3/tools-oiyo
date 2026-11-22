// 台灣遺產稅申報期限（115年9月11日修正）。計算：lib/world-inheritance-pack-2026.ts
import { useState } from "react";
import { INHERITANCE_AS_OF, twEstate } from "../../../lib/world-inheritance-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell, { TW_VIZ_TEXT } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "taiwan-estate-tax-filing-deadline";
const plus = (d: string, n: number) => new Date(Date.parse(d) + n * 86_400_000).toISOString().slice(0, 10);
const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export default function TwEstate() {
  const [x, setX] = useState({ death: "2026-10-15", extended: false, elapsed: 30 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = twEstate({ death: x.death || undefined, extended: x.extended });
  const due = r.dates.find((d) => d.id === (x.extended ? "ext" : "file"))?.date;
  return (
    <CurveShell toolId={TOOL_ID} lang="zh" currency="TWD" text={TW_VIZ_TEXT}
      curve={{ title: "死亡後經過的天數與剩餘天數", caption: "到申報期限還剩幾天。", xLabel: "經過天數", yLabel: "剩餘天數", min: 0, max: 280, step: 5, current: x.elapsed, f: (n) => (x.death && due ? Math.max(0, days(plus(x.death, n), due)) : 0), formatX: (n) => `${Math.round(n)}天`, formatY: (n) => `${Math.round(n)}天`, onPick: (n) => upd({ elapsed: n }) }}
    >
      {(mode) => (
        <>
          <DateField label="被繼承人死亡日期" value={x.death} onChange={(v) => upd({ death: v })} />
          {mode === "expert" && <ChoiceChips<"y" | "n"> legend="會申請延長申報嗎？" value={x.extended ? "y" : "n"} options={[{ value: "n", label: "不會" }, { value: "y", label: "會（最多三個月）" }]} onChange={(v) => upd({ extended: v === "y" })} />}
          <LaborResult mode={mode} headline={due ? `遺產稅申報期限 ${due}` : "死亡之次日起算六個月內申報"} items={r.items} dates={r.dates} datesTitle="日期" note={`一般資訊，依據《遺產及贈與稅法》（全國法規資料庫，115年9月11日修正公布）。不計算稅額，非稅務意見。可洽各地區國稅局。更新於 ${INHERITANCE_AS_OF}。您輸入的資料不會離開瀏覽器。`} />
        </>
      )}
    </CurveShell>
  );
}
