// 小规模纳税人增值税起征点与1%征收率。计算：lib/cn-tax-pack-2026.ts
import { useState } from "react";
import { CN_TAX_AS_OF, CN_TAX_NOTE, cnSmallScaleVat } from "../../../lib/cn-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell from "../viz/CurveShell";

const TOOL_ID = "china-small-scale-vat-threshold";
type P = "month" | "quarter";
type YN = "y" | "n";

export default function CnSmallScaleVat() {
  const [x, setX] = useState({ sales: 280_000, period: "quarter" as P, re: "n" as YN, annual: 1_200_000 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = cnSmallScaleVat({ sales: x.sales, period: x.period, realEstate: x.re === "y", annualSales: x.annual });
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="zh"
      currency="CNY"
      curve={{
        title: "销售额与应纳增值税", caption: "按次或按期的起征点：未达到的免征，达到后全额按1%计算。",
        xLabel: "销售额", yLabel: "应纳增值税", min: 0, max: x.period === "month" ? 200_000 : 600_000, step: 5000, current: x.sales,
        f: (v) => cnSmallScaleVat({ sales: v, period: x.period, realEstate: x.re === "y", annualSales: x.annual }).tax, formatX: (v) => `${Math.round(v / 10_000)}万`, formatY: (n: number) => `${Math.round(n).toLocaleString("zh-CN")}元`,
        onPick: (v) => upd({ sales: v }), marks: [],
      }}
    >
      {() => (
    <>
      <ChoiceChips<P> legend="纳税期限" value={x.period} options={[{ value: "month", label: "按月" }, { value: "quarter", label: "按季" }]} onChange={(v) => upd({ period: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="本期销售额（不含税）" value={x.sales} onChange={(v) => upd({ sales: v })} suffix="元" step={10000} />
        <NumberField label="近12个月销售额" value={x.annual} onChange={(v) => upd({ annual: v })} suffix="元" step={100000} />
      </div>
      <ChoiceChips<YN> legend="是否为销售、出租不动产或转让土地使用权？" value={x.re} options={[{ value: "y", label: "是" }, { value: "n", label: "否" }]} onChange={(v) => upd({ re: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{r.below ? "免征增值税" : `应纳增值税约${Math.round(r.tax).toLocaleString("zh-CN")}元`}</p>
        <progress className="mt-2 h-2 w-full accent-(--primary)" max={r.threshold} value={Math.min(r.threshold, x.sales)} aria-label="距起征点" />
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{CN_TAX_NOTE} 更新日期：{CN_TAX_AS_OF}。</p>
    </>
      )}
    </CurveShell>
  );
}
