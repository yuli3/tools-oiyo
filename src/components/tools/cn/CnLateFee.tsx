// 滞纳金、罚款与行政复议、诉讼期限。计算：lib/cn-tax-pack-2026.ts
import { useState } from "react";
import { CN_TAX_AS_OF, CN_TAX_NOTE, cnAppealDeadlines, cnLateFee } from "../../../lib/cn-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "china-late-payment-surcharge-appeal";
type K = "dispute" | "penalty";

export default function CnLateFee() {
  const [x, setX] = useState({ tax: 10_000, due: "2026-05-22", paid: "2026-06-21", known: "2026-11-21", kind: "dispute" as K });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = cnLateFee({ tax: x.tax, due: x.due, paid: x.paid });
  const a = cnAppealDeadlines({ known: x.known || undefined, kind: x.kind, paid: x.paid || undefined });
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="未按期缴纳的税款" value={x.tax} onChange={(v) => upd({ tax: v })} suffix="元" step={1000} />
        <DateField label="缴款期限" value={x.due} onChange={(v) => upd({ due: v })} />
        <DateField label="实际缴纳日" value={x.paid} onChange={(v) => upd({ paid: v })} />
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">滞纳金约{Math.round(r.fee).toLocaleString("zh-CN")}元</p>
        <Items items={r.items} />
      </div>
      <section className="space-y-3 rounded-md border border-border bg-card px-4 py-4 text-sm">
        <h3 className="font-semibold">不服税务机关的决定：期限</h3>
        <ChoiceChips<K> legend="争议类型" value={x.kind} options={[{ value: "dispute", label: "纳税争议（税款、滞纳金）" }, { value: "penalty", label: "处罚、强制执行" }]} onChange={(v) => upd({ kind: v })} />
        <DateField label="知道该行政行为之日" value={x.known} onChange={(v) => upd({ known: v })} />
        <ul className="space-y-2">{a.deadlines.map((d) => <li key={d.id}><span className="font-mono font-semibold">{d.date} </span>{d.label} <span className="text-xs text-muted-foreground">（{d.cite}）</span></li>)}</ul>
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">{a.notes.map((n) => <li key={n}>{n}</li>)}</ul>
      </section>
      <p className="text-xs leading-5 text-muted-foreground">{CN_TAX_NOTE} 更新日期：{CN_TAX_AS_OF}。</p>
    </div>
  );
}
