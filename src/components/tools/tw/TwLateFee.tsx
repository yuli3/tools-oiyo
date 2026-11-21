// 臺灣滯納金、罰鍰範圍與復查、訴願、行政訴訟期限。計算：lib/tw-tax-pack-2026.ts
import { useState } from "react";
import { TW_TAX_AS_OF, TW_TAX_NOTE, twAppealDeadlines, twLateFee } from "../../../lib/tw-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell, { TW_VIZ_TEXT, plusDays } from "../viz/CurveShell";

const TOOL_ID = "taiwan-late-tax-penalty-appeal";
type K = "income" | "business";

export default function TwLateFee() {
  const [x, setX] = useState({ tax: 50_000, due: "2026-06-01", paid: "2026-06-15", kind: "income" as K, period: "", review: "", petition: "" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = twLateFee({ tax: x.tax, due: x.due, paid: x.paid || x.due, kind: x.kind });
  const a = twAppealDeadlines({ paymentPeriodEnd: x.period || undefined, reviewDecision: x.review || undefined, petitionDecision: x.petition || undefined, paid: x.paid || undefined });
  const lateDays = Math.max(0, Math.round((Date.parse(x.paid || x.due) - Date.parse(x.due)) / 86_400_000));
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="zh"
      currency="TWD"
      text={TW_VIZ_TEXT}
      curve={{
        title: "逾期天數與滯納金", caption: "每逾3日加徵1%，30日後移送強制執行。",
        xLabel: "逾期天數", yLabel: "滯納金", min: 0, max: 30, step: 1, current: lateDays,
        f: (d) => twLateFee({ tax: x.tax, due: x.due, paid: plusDays(x.due, d), kind: x.kind }).fee, formatX: (d) => `${d}日`, formatY: (n: number) => `${Math.round(n).toLocaleString("zh-TW")}元`,
        onPick: (d) => upd({ paid: plusDays(x.due, d) }), marks: [],
      }}
    >
      {() => (
    <>
      <ChoiceChips<K> legend="稅目" value={x.kind} options={[{ value: "income", label: "所得稅" }, { value: "business", label: "營業稅" }]} onChange={(v) => upd({ kind: v })} />
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="應納稅額" value={x.tax} onChange={(v) => upd({ tax: v })} suffix="元" step={1000} />
        <DateField label="繳納期限" value={x.due} onChange={(v) => upd({ due: v })} />
        <DateField label="實際繳納日" value={x.paid} onChange={(v) => upd({ paid: v })} />
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">滯納金約{r.fee.toLocaleString("zh-TW")}元（{Math.round(r.feeRate * 100)}%）</p>
        <progress className="mt-2 h-2 w-full accent-(--primary)" max={10} value={Math.round(r.feeRate * 100)} aria-label="滯納金比例（逾30日為10%）" />
        <Items items={r.items} />
      </div>
      <section className="space-y-3 rounded-md border border-border bg-card px-4 py-4 text-sm">
        <h3 className="font-semibold">不服核定：救濟期限</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <DateField label="繳款期間屆滿日" value={x.period} onChange={(v) => upd({ period: v })} />
          <DateField label="復查決定送達日" value={x.review} onChange={(v) => upd({ review: v })} />
          <DateField label="訴願決定書送達日" value={x.petition} onChange={(v) => upd({ petition: v })} />
        </div>
        <ul className="space-y-2">
          {a.deadlines.map((d) => <li key={d.id}><span className="font-mono font-semibold">{d.date}</span> {d.label} <span className="text-xs text-muted-foreground">（{d.cite}）</span></li>)}
        </ul>
        <Items items={a.items} />
      </section>
      <p className="text-xs leading-5 text-muted-foreground">{TW_TAX_NOTE} 更新日期：{TW_TAX_AS_OF}。</p>
    </>
      )}
    </CurveShell>
  );
}
