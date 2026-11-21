// 減価償却（定額法）と少額資産の扱い (2026-11-21)。計算: lib/jp-tax-pack-2026.ts
import { useState } from "react";
import { JP_TAX_AS_OF, JP_TAX_NOTE, USEFUL_LIFE, jpDepreciation } from "../../../lib/jp-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "jp-depreciation-calculator";
const yen = (n: number) => `${Math.round(n).toLocaleString("ja-JP")}円`;
type A = keyof typeof USEFUL_LIFE | "other";
type YN = "y" | "n";
const TREAT = { expense: "全額をその年の経費", sme: "少額減価償却資産の特例で全額を経費", lump3: "一括償却資産（3年均等）も選べます", depreciate: "耐用年数で減価償却" };

export default function JpDepreciation() {
  const [x, setX] = useState({ asset: "pc" as A, life: 4, cost: 350_000, acquired: "2026-10-01", blue: "y" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const life = x.asset === "other" ? Math.max(2, Math.round(x.life) || 2) : USEFUL_LIFE[x.asset];
  const r = jpDepreciation({ cost: Math.max(0, x.cost), life, acquired: x.acquired || "2026-10-01", blue: x.blue === "y", sme: x.blue === "y" });
  return (
    <div className="space-y-5">
      <ChoiceChips<A> legend="資産" value={x.asset} options={[{ value: "pc", label: "パソコン（4年）" }, { value: "car", label: "普通自動車（6年）" }, { value: "kei", label: "軽自動車（4年）" }, { value: "woodHouse", label: "木造住宅・事業用（22年）" }, { value: "other", label: "その他" }]} onChange={(v) => upd({ asset: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="取得価額（税込・税抜は経理方式に合わせて）" value={x.cost} onChange={(v) => upd({ cost: v })} suffix="円" step={10000} />
        <DateField label="事業に使い始めた日" value={x.acquired} onChange={(v) => upd({ acquired: v })} />
        {x.asset === "other" && <NumberField label="法定耐用年数" value={x.life} onChange={(v) => upd({ life: v })} suffix="年" />}
      </div>
      <ChoiceChips<YN> legend="青色申告の中小事業者ですか？" value={x.blue} options={[{ value: "y", label: "はい" }, { value: "n", label: "いいえ" }]} onChange={(v) => upd({ blue: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{TREAT[r.treatment]}{r.treatment === "depreciate" || r.treatment === "lump3" ? `。定額法なら初年 約${yen(r.firstYear)}` : ""}</p>
        <Items items={r.items} />
        {(r.treatment === "depreciate" || r.treatment === "lump3") && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-64 text-sm">
              <thead><tr className="text-left"><th className="py-1 pr-2">年</th><th className="py-1 pr-2">償却費</th><th className="py-1">未償却残高</th></tr></thead>
              <tbody>{r.schedule.map((s) => <tr key={s.year} className="border-t border-border"><td className="py-1 pr-2">{s.year}</td><td className="py-1 pr-2 font-mono">{yen(s.amount)}</td><td className="py-1 font-mono">{yen(s.book)}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{JP_TAX_NOTE} 事業専用割合（家事按分）は含めていません。基準日 {JP_TAX_AS_OF}。</p>
    </div>
  );
}
