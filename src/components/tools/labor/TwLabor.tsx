// 臺灣：資遣費（新制、舊制）、預告期間、特別休假與失業給付。計算：lib/world-labor-pack-2026.ts
import { useState } from "react";
import { LABOR_AS_OF, twLaborExit } from "../../../lib/world-labor-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import LaborResult from "./LaborResult";
import LaborShell, { TW_VIZ_TEXT, startFor } from "./LaborShell";

const TOOL_ID = "taiwan-severance-notice-calculator";
type Sys = "new" | "old";

export default function TwLabor() {
  const [x, setX] = useState({ system: "new" as Sys, start: "2018-07-01", end: "2026-11-30", wage: 42_000, age: 40, insured: 42_000 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = twLaborExit({ start: x.start || "2018-07-01", end: x.end || "2026-11-30", averageMonthlyWage: x.wage, system: x.system, age: x.age, insuredMonthlyWage: x.insured });
  const end = x.end || "2026-11-30";
  const run = (y: number) => twLaborExit({ start: startFor(end, y), end, averageMonthlyWage: x.wage, system: x.system }).severance;
  return (
    <LaborShell
      toolId={TOOL_ID}
      lang="zh"
      currency="TWD"
      text={TW_VIZ_TEXT}
      curve={{
        title: "年資與資遣費", caption: x.system === "new" ? "平均工資不變。勞退新制每滿1年0.5個月，最高6個月（滿12年後不再增加）。" : "平均工資不變。舊制年資每滿1年1個月。",
        xLabel: "年資", yLabel: "資遣費", min: 0, max: 25, step: 0.25, current: r.service.exactYears,
        f: run, formatX: (y) => `${y}年`, formatY: (n) => `${Math.round(n).toLocaleString("zh-TW")}元`,
        onPick: (y) => upd({ start: startFor(end, y) }), marks: x.system === "new" ? [{ at: 12, label: "6個月上限" }] : [],
      }}
    >
      {(mode) => (
    <>
      <ChoiceChips<Sys> legend="年資適用" value={x.system} options={[{ value: "new", label: "勞退新制" }, { value: "old", label: "舊制" }]} onChange={(v) => upd({ system: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <DateField label="到職日" value={x.start} onChange={(v) => upd({ start: v })} />
        <DateField label="終止契約日" value={x.end} onChange={(v) => upd({ end: v })} />
        <NumberField label="平均工資（月）" value={x.wage} onChange={(v) => upd({ wage: v })} suffix="元" step={500} />
        <NumberField label="年齡" value={x.age} onChange={(v) => upd({ age: v })} suffix="歲" />
        {mode === "expert" && <NumberField label="平均月投保薪資" value={x.insured} onChange={(v) => upd({ insured: v })} suffix="元" step={500} />}
      </div>
      <LaborResult mode={mode} headline={`資遣費約${Math.round(r.severance).toLocaleString("zh-TW")}元，預告${r.noticeDays}日`} sub={`年資${r.service.years}年${r.service.months}個月，特別休假${r.specialLeaveDays}日`} items={r.items} dates={r.dates} datesTitle="期限" note={`依法規整理的一般資訊與試算，不是法律諮詢，也不代理調解或訴訟。更新日期：${LABOR_AS_OF}。輸入內容只保存在你的瀏覽器中。`} />
    </>
      )}
    </LaborShell>
  );
}
