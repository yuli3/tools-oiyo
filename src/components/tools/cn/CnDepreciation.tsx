// 企业所得税固定资产折旧。计算：lib/cn-tax-pack-2026.ts
import { useState } from "react";
import { CN_TAX_AS_OF, CN_TAX_NOTE, MIN_YEARS, cnDepreciation, type Category, type Method } from "../../../lib/cn-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell from "../viz/CurveShell";

const TOOL_ID = "china-depreciation-calculator";
type YN = "y" | "n";

export default function CnDepreciation() {
  const [x, setX] = useState({ cat: "electronics" as Category, cost: 60_000, start: "2026-03-10", years: 3, residual: 5, method: "straight" as Method, acc: "n" as YN, oneOff: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = cnDepreciation({ category: x.cat, cost: x.cost, start: x.start || "2026-01-01", years: x.years, residualRate: x.residual / 100, method: x.method, accelerated: x.acc === "y", oneOff: x.oneOff === "y" });
  const max = Math.max(1, ...r.schedule.map((s) => s.amount));
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="zh"
      currency="CNY"
      curve={{
        title: "折旧年限与第一年折旧额", caption: "原值和残值率不变。不得短于最低年限。",
        xLabel: "折旧年限", yLabel: "第一年折旧额", min: r.minYears, max: Math.max(r.minYears + 5, 10), step: 1, current: x.years,
        f: (v) => cnDepreciation({ category: x.cat, cost: x.cost, start: x.start || "2026-01-01", years: v, residualRate: x.residual / 100, method: x.method, accelerated: x.acc === "y", oneOff: x.oneOff === "y" }).schedule[0]?.amount ?? 0, formatX: (v) => `${v}年`, formatY: (n: number) => `${Math.round(n).toLocaleString("zh-CN")}元`,
        onPick: (v) => upd({ years: v }), marks: [],
      }}
    >
      {() => (
    <>
      <ChoiceChips<Category> legend="资产类别" value={x.cat} options={(Object.keys(MIN_YEARS) as Category[]).map((k) => ({ value: k, label: `${MIN_YEARS[k].label}（${MIN_YEARS[k].years}年）` }))} onChange={(v) => upd({ cat: v, years: MIN_YEARS[v].years })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="计税基础（原值）" value={x.cost} onChange={(v) => upd({ cost: v })} suffix="元" step={1000} />
        <DateField label="投入使用日期" value={x.start} onChange={(v) => upd({ start: v })} />
        <NumberField label="折旧年限" value={x.years} onChange={(v) => upd({ years: v })} suffix="年" />
        <NumberField label="预计净残值率" value={x.residual} onChange={(v) => upd({ residual: v })} suffix="%" />
      </div>
      <ChoiceChips<YN> legend="2024—2027年新购设备、器具，选择一次性扣除？" value={x.oneOff} options={[{ value: "y", label: "是" }, { value: "n", label: "否" }]} onChange={(v) => upd({ oneOff: v })} />
      <ChoiceChips<YN> legend="可以采取加速折旧？" value={x.acc} options={[{ value: "y", label: "是" }, { value: "n", label: "否" }]} onChange={(v) => upd({ acc: v })} />
      {x.acc === "y" && <ChoiceChips<Method> legend="折旧方法" value={x.method} options={[{ value: "straight", label: "直线法（缩短年限）" }, { value: "double", label: "双倍余额递减法" }, { value: "sum", label: "年数总和法" }]} onChange={(v) => upd({ method: v })} />}
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{r.method === "one-off" ? "一次性税前扣除" : `折旧年限${r.years}年，自${r.firstMonth}起计提`}</p>
        <ul className="mt-3 space-y-1">
          {r.schedule.map((s) => (
            <li key={s.year} className="flex items-center gap-2">
              <span className="w-14 shrink-0">第{s.year}年</span>
              <progress className="h-2 w-full accent-(--primary)" max={max} value={s.amount} aria-label={`第${s.year}年`} />
              <span className="w-24 shrink-0 text-right font-mono">{Math.round(s.amount).toLocaleString("zh-CN")}</span>
            </li>
          ))}
        </ul>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{CN_TAX_NOTE} 更新日期：{CN_TAX_AS_OF}。</p>
    </>
      )}
    </CurveShell>
  );
}
