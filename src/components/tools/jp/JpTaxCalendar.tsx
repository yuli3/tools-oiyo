// 日本の申告・納付カレンダー (2026-11-21, 各国現地化・日本)。計算: lib/jp-tax-pack-2026.ts（スキル calc calendar と同じコード）
import { useState } from "react";
import { JP_TAX_AS_OF, JP_TAX_NOTE, jpTaxCalendar } from "../../../lib/jp-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import CalendarShell, { forMode } from "../viz/CalendarShell";
import { useToday } from "../nts/Items";

const TOOL_ID = "jp-tax-calendar";
type YN = "y" | "n";
const yn = [{ value: "y", label: "はい" }, { value: "n", label: "いいえ" }] as const;

export default function JpTaxCalendar() {
  const today = useToday();
  const [x, setX] = useState({ year: 2027, started: "", ct: "n" as YN, pre: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = jpTaxCalendar({ year: x.year, started: x.started || undefined, consumptionTax: x.ct === "y", prepaid: x.pre === "y", today });
  return (
    <CalendarShell toolId={TOOL_ID} lang="ja" events={r.events}>
      {(mode) => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="確認する年" value={x.year} onChange={(v) => upd({ year: Math.min(2030, Math.max(2025, Math.round(v) || 2027)) })} suffix="年" />
        <DateField label="開業日（その年に開業した場合だけ）" value={x.started} onChange={(v) => upd({ started: v })} />
      </div>
      <ChoiceChips<YN> legend="消費税の課税事業者ですか？" value={x.ct} options={yn} onChange={(v) => upd({ ct: v })} />
      <ChoiceChips<YN> legend="前年の所得税が15万円以上でしたか？（予定納税）" value={x.pre} options={yn} onChange={(v) => upd({ pre: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <ol className="space-y-3">
          {forMode(r.events, mode).map((e) => (
            <li key={e.id}>
              <p className="font-semibold text-foreground"><span className="font-mono">{e.date}</span>{e.daysLeft != null && <span className="ml-2 font-normal text-muted-foreground">{e.daysLeft >= 0 ? `あと${e.daysLeft}日` : `${-e.daysLeft}日経過`}</span>}</p>
              <p>{e.label}{e.date !== e.nominal && <span className="text-muted-foreground">（本来 {e.nominal}、土日のため翌平日）</span>} <span className="text-xs text-muted-foreground">({e.cite})</span></p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-muted-foreground">{r.note}</p>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{JP_TAX_NOTE} 基準日 {JP_TAX_AS_OF}。入力値はサーバーに送りません。</p>
    </>
      )}
    </CalendarShell>
  );
}
