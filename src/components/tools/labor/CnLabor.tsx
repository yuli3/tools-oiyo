// 中国：经济补偿N、违法解除2N、代通知金与失业保险金期限。计算：lib/world-labor-pack-2026.ts
import { useState } from "react";
import { LABOR_AS_OF, cnLaborExit } from "../../../lib/world-labor-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import LaborResult from "./LaborResult";
import LaborShell, { startFor } from "./LaborShell";

const TOOL_ID = "china-severance-compensation-calculator";
type YN = "y" | "n";
const yn = [{ value: "y", label: "是" }, { value: "n", label: "否" }] as const;

export default function CnLabor() {
  const [x, setX] = useState({ start: "2019-03-01", end: "2026-11-30", wage: 12_000, avg: 0, unlawful: "n" as YN, noNotice: "n" as YN, insured: 7 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = cnLaborExit({ start: x.start || "2019-03-01", end: x.end || "2026-11-30", monthlyWage: x.wage, localAverageMonthly: x.avg > 0 ? x.avg : undefined, unlawful: x.unlawful === "y", noNotice: x.noNotice === "y", insuredYears: x.insured });
  const end = x.end || "2026-11-30";
  const run = (y: number) => cnLaborExit({ start: startFor(end, y), end, monthlyWage: x.wage, localAverageMonthly: x.avg > 0 ? x.avg : undefined, unlawful: x.unlawful === "y" }).total;
  return (
    <LaborShell
      toolId={TOOL_ID}
      lang="zh"
      currency="CNY"
      curve={{
        title: "工作年限与经济补偿", caption: "月工资不变。满6个月按1年、不满6个月按半个月计，所以曲线是台阶状。月工资高于当地平均3倍时最多计12年。",
        xLabel: "工作年限", yLabel: x.unlawful === "y" ? "赔偿金（2N）" : "经济补偿（N）", min: 0, max: 25, step: 0.25, current: r.service.exactYears,
        f: run, formatX: (y) => `${y}年`, formatY: (n) => `${Math.round(n).toLocaleString("zh-CN")}元`,
        onPick: (y) => upd({ start: startFor(end, y) }),
      }}
    >
      {(mode) => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <DateField label="入职日期" value={x.start} onChange={(v) => upd({ start: v })} />
        <DateField label="解除或终止日期" value={x.end} onChange={(v) => upd({ end: v })} />
        <NumberField label="解除前12个月平均月工资" value={x.wage} onChange={(v) => upd({ wage: v })} suffix="元" step={500} />
        {mode === "expert" && <NumberField label="当地上年职工月平均工资（不知道可填0）" value={x.avg} onChange={(v) => upd({ avg: v })} suffix="元" step={500} />}
        <NumberField label="失业保险累计缴费年限" value={x.insured} onChange={(v) => upd({ insured: v })} suffix="年" />
      </div>
      <ChoiceChips<YN> legend="单位是否违法解除或终止？" value={x.unlawful} options={[...yn]} onChange={(v) => upd({ unlawful: v })} />
      {mode === "expert" && <ChoiceChips<YN> legend="依第40条解除且未提前30日书面通知？" value={x.noNotice} options={[...yn]} onChange={(v) => upd({ noNotice: v })} />}
      <LaborResult mode={mode} headline={`${x.unlawful === "y" ? "赔偿金（2N）" : "经济补偿（N）"}约${Math.round(r.total).toLocaleString("zh-CN")}元`} sub={`工作年限${r.service.years}年${r.service.months}个月，计${r.months}个月`} items={r.items} dates={r.dates} datesTitle="期限" note={`根据法律法规整理的一般信息和估算，不是法律咨询，也不代理仲裁或诉讼。更新日期：${LABOR_AS_OF}。输入内容只保存在你的浏览器中。`} />
    </>
      )}
    </LaborShell>
  );
}
