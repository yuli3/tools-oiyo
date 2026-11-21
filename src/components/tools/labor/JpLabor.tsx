// 日本：解雇予告手当・基本手当の給付日数・年次有給休暇・最低賃金。計算：lib/world-labor-pack-2026.ts
import { useState } from "react";
import { LABOR_AS_OF, jpLaborExit } from "../../../lib/world-labor-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import LaborResult from "./LaborResult";
import LaborShell from "./LaborShell";

const TOOL_ID = "japan-dismissal-unemployment-checker";
type R = "self" | "dismissal";
type G = "tokyo" | "osaka" | "other";

export default function JpLabor() {
  const [x, setX] = useState({ start: "2016-04-01", end: "2026-11-30", age: 40, insured: 10, reason: "dismissal" as R, daily: 12_000, notice: 10, hourly: 1_300, region: "tokyo" as G });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = jpLaborExit({ start: x.start || "2016-04-01", end: x.end || "2026-11-30", age: x.age, insuredYears: x.insured, reason: x.reason, dailyAverageWage: x.daily, noticeDays: x.notice, hourlyWage: x.hourly, region: x.region });
  const run = (insuredYears: number) => jpLaborExit({ start: x.start || "2016-04-01", end: x.end || "2026-11-30", age: x.age, insuredYears, reason: x.reason, dailyAverageWage: x.daily, noticeDays: x.notice });
  return (
    <LaborShell
      toolId={TOOL_ID}
      lang="ja"
      currency="JPY"
      curve={{
        title: "被保険者期間による基本手当の給付日数", caption: "年齢と離職理由はそのまま。確認できない区分は0日として描いています（結果欄で要確認と表示）。",
        xLabel: "被保険者期間", yLabel: "所定給付日数", min: 0, max: 30, step: 1, current: x.insured,
        f: (y) => run(y).benefitDays ?? 0, formatX: (y) => `${y}年`, formatY: (d) => `${Math.round(d)}日`,
        onPick: (y) => upd({ insured: y }), marks: [{ at: 1, label: "1年" }, { at: 5, label: "5年" }, { at: 10, label: "10年" }, { at: 20, label: "20年" }],
      }}
    >
      {(mode) => (
    <>
      <ChoiceChips<R> legend="離職の理由" value={x.reason} options={[{ value: "dismissal", label: "解雇・倒産など" }, { value: "self", label: "自己都合など" }]} onChange={(v) => upd({ reason: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <DateField label="入社日" value={x.start} onChange={(v) => upd({ start: v })} />
        <DateField label="離職日" value={x.end} onChange={(v) => upd({ end: v })} />
        <NumberField label="離職時の年齢" value={x.age} onChange={(v) => upd({ age: v })} suffix="歳" />
        <NumberField label="雇用保険の被保険者期間" value={x.insured} onChange={(v) => upd({ insured: v })} suffix="年" />
        {x.reason === "dismissal" && <NumberField label="解雇予告は何日前にあったか" value={x.notice} onChange={(v) => upd({ notice: v })} suffix="日" />}
        {x.reason === "dismissal" && <NumberField label="1日あたりの平均賃金" value={x.daily} onChange={(v) => upd({ daily: v })} suffix="円" step={500} />}
        {mode === "expert" && <NumberField label="時給（最低賃金チェック）" value={x.hourly} onChange={(v) => upd({ hourly: v })} suffix="円" step={10} />}
      </div>
      {mode === "expert" && <ChoiceChips<G> legend="勤務地" value={x.region} options={[{ value: "tokyo", label: "東京" }, { value: "osaka", label: "大阪" }, { value: "other", label: "その他" }]} onChange={(v) => upd({ region: v })} />}
      <LaborResult mode={mode} headline={r.benefitDays != null ? `基本手当 ${r.benefitDays}日${r.noticePay ? ` ・ 解雇予告手当 約${r.noticePay.toLocaleString("ja-JP")}円` : ""}` : "給付日数は要確認"} sub={`勤続${r.service.years}年${r.service.months}か月 ・ 有給休暇 ${r.paidLeaveDays}日`} items={r.items} dates={r.dates} datesTitle="期限" note={`法令と厚生労働省の資料にもとづく一般的な情報と試算です。個別の法律相談ではなく、手続きの代理もしません。更新日：${LABOR_AS_OF}。入力内容はブラウザの中だけに残ります。`} />
    </>
      )}
    </LaborShell>
  );
}
