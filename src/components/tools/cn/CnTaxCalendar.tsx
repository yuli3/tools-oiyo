// 中国申报纳税日历（2026-11-21，按国家本地化：中国）。计算：lib/cn-tax-pack-2026.ts
import { useState } from "react";
import { CN_TAX_AS_OF, CN_TAX_NOTE, cnTaxCalendar } from "../../../lib/cn-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import CalendarShell, { forMode } from "../viz/CalendarShell";
import { Items, useToday } from "../nts/Items";

const TOOL_ID = "china-tax-filing-calendar-2026";
type P = "month" | "quarter" | "none";
const periods = [{ value: "month", label: "按月" }, { value: "quarter", label: "按季" }, { value: "none", label: "不涉及" }] as const;

export default function CnTaxCalendar() {
  const today = useToday();
  const [x, setX] = useState({ year: 2026, vat: "quarter" as P, biz: "quarter" as P });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = cnTaxCalendar({ year: x.year, vat: x.vat, business: x.biz, today });
  return (
    <CalendarShell toolId={TOOL_ID} lang="zh" events={r.events}>
      {(mode) => (
    <>
      <NumberField label="年份" value={x.year} onChange={(v) => upd({ year: Math.min(2030, Math.max(2025, Math.round(v) || 2026)) })} />
      <ChoiceChips<P> legend="增值税申报" value={x.vat} options={[...periods]} onChange={(v) => upd({ vat: v })} />
      <ChoiceChips<P> legend="个人所得税经营所得预缴（个体工商户等）" value={x.biz} options={[...periods]} onChange={(v) => upd({ biz: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <ol className="space-y-3">
          {forMode(r.events, mode).map((e) => (
            <li key={e.id}>
              <p className="font-semibold text-foreground"><span className="font-mono">{e.from ? `${e.from} → ` : ""}{e.date ?? e.month}</span>{e.daysLeft != null && <span className="ml-2 font-normal text-muted-foreground">{e.daysLeft >= 0 ? `还有${e.daysLeft}天` : `已过${-e.daysLeft}天`}</span>}</p>
              <p>{e.label} <span className="text-xs text-muted-foreground">（{e.cite}）</span></p>
            </li>
          ))}
        </ol>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{CN_TAX_NOTE} 更新日期：{CN_TAX_AS_OF}。输入内容只保存在你的浏览器中。</p>
    </>
      )}
    </CalendarShell>
  );
}
