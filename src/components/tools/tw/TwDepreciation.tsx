// 臺灣固定資產折舊（耐用年數表、平均法、8萬元費用化）。計算：lib/tw-tax-pack-2026.ts
import { useState } from "react";
import { TW_LIFE, TW_TAX_AS_OF, TW_TAX_NOTE, twDepreciation, type TwCategory } from "../../../lib/tw-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell, { TW_VIZ_TEXT } from "../viz/CurveShell";

const TOOL_ID = "taiwan-depreciation-calculator";

export default function TwDepreciation() {
  const [x, setX] = useState({ cat: "computer" as TwCategory, cost: 120_000, start: "2026-04-10", residual: 0, years: 3 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = twDepreciation({ category: x.cat, cost: x.cost, start: x.start || "2026-01-01", residual: x.residual, years: x.years });
  const max = Math.max(1, ...r.schedule.map((s) => s.amount));
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="zh"
      currency="TWD"
      text={TW_VIZ_TEXT}
      curve={{
        title: "取得成本與第一年可列費用", caption: "8萬元以下（或耐用年數未滿2年）可一次列為費用。",
        xLabel: "取得成本", yLabel: "第一年費用", min: 0, max: 300000, step: 2000, current: x.cost,
        f: (v) => { const d = twDepreciation({ category: x.cat, cost: v, start: x.start || "2026-01-01", residual: Math.min(x.residual, v), years: x.years }); return d.expensable ? v : d.schedule[0]?.amount ?? 0; }, formatX: (v) => `${Math.round(v / 1_000)}千`, formatY: (n: number) => `${Math.round(n).toLocaleString("zh-TW")}元`,
        onPick: (v) => upd({ cost: v }), marks: [{ at: 80_000, label: "8萬" }],
      }}
    >
      {() => (
    <>
      <ChoiceChips<TwCategory> legend="資產類別（固定資產耐用年數表）" value={x.cat} options={(Object.keys(TW_LIFE) as TwCategory[]).map((k) => ({ value: k, label: `${TW_LIFE[k].label}（${TW_LIFE[k].years}年）` }))} onChange={(v) => upd({ cat: v, years: TW_LIFE[v].years })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="取得成本" value={x.cost} onChange={(v) => upd({ cost: v })} suffix="元" step={1000} />
        <DateField label="開始使用日" value={x.start} onChange={(v) => upd({ start: v })} />
        <NumberField label="預估殘值" value={x.residual} onChange={(v) => upd({ residual: v })} suffix="元" step={1000} />
        <NumberField label="耐用年數" value={x.years} onChange={(v) => upd({ years: v })} suffix="年" />
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">平均法 {r.years} 年，每年約{r.annual.toLocaleString("zh-TW")}元</p>
        <ul className="mt-3 space-y-1">
          {r.schedule.slice(0, 12).map((s) => (
            <li key={s.year} className="flex items-center gap-2">
              <span className="w-14 shrink-0">{s.year}</span>
              <progress className="h-2 w-full accent-(--primary)" max={max} value={s.amount} aria-label={`${s.year}年`} />
              <span className="w-24 shrink-0 text-right font-mono">{s.amount.toLocaleString("zh-TW")}</span>
            </li>
          ))}
        </ul>
        {r.schedule.length > 12 && <p className="mt-1 text-muted-foreground">另有 {r.schedule.length - 12} 年未列出。</p>}
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{TW_TAX_NOTE} 更新日期：{TW_TAX_AS_OF}。</p>
    </>
      )}
    </CurveShell>
  );
}
