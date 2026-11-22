// 臺灣報稅行事曆（2026-11-21，各國在地化：臺灣）。計算：lib/tw-tax-pack-2026.ts
import { useState } from "react";
import { TW_TAX_AS_OF, TW_TAX_NOTE, twTaxCalendar } from "../../../lib/tw-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import CalendarShell, { forMode } from "../viz/CalendarShell";
import { TW_VIZ_TEXT } from "../viz/CurveShell";
import { Items, useToday } from "../nts/Items";

const TOOL_ID = "taiwan-tax-filing-calendar-2026";
type BT = "bimonthly" | "monthly" | "none";
type YN = "y" | "n";

export default function TwTaxCalendar() {
  const today = useToday();
  const [x, setX] = useState({ year: 2026, bt: "bimonthly" as BT, company: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = twTaxCalendar({ year: x.year, businessTax: x.bt, company: x.company === "y", today });
  return (
    <CalendarShell toolId={TOOL_ID} lang="zh" tw text={TW_VIZ_TEXT} events={r.events}>
      {(mode) => (
    <>
      <NumberField label="西元年" value={x.year} onChange={(v) => upd({ year: Math.min(2030, Math.max(2025, Math.round(v) || 2026)) })} />
      <ChoiceChips<BT> legend="營業稅申報" value={x.bt} options={[{ value: "bimonthly", label: "每兩個月" }, { value: "monthly", label: "每月（零稅率申請）" }, { value: "none", label: "不適用" }]} onChange={(v) => upd({ bt: v })} />
      <ChoiceChips<YN> legend="公司或行號（營利事業所得稅）？" value={x.company} options={[{ value: "y", label: "是" }, { value: "n", label: "否" }]} onChange={(v) => upd({ company: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="mb-3 text-muted-foreground">民國{r.rocYear}年</p>
        <ol className="space-y-3">
          {forMode(r.events, mode).map((e) => (
            <li key={e.id}>
              <p className="font-semibold text-foreground"><span className="font-mono">{e.from ? `${e.from} → ` : ""}{e.date}</span>{e.daysLeft != null && <span className="ml-2 font-normal text-muted-foreground">{e.daysLeft >= 0 ? `還有${e.daysLeft}天` : `已過${-e.daysLeft}天`}</span>}</p>
              <p>{e.label} <span className="text-xs text-muted-foreground">（{e.cite}{e.computed ? "，依週末推算" : ""}）</span></p>
            </li>
          ))}
        </ol>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{TW_TAX_NOTE} 更新日期：{TW_TAX_AS_OF}。輸入內容只保存在你的瀏覽器中。</p>
    </>
      )}
    </CalendarShell>
  );
}
