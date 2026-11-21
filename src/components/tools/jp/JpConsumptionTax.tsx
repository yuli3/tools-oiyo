// 消費税の納税義務と計算方法の比較 (2026-11-21)。計算: lib/jp-tax-pack-2026.ts
import { useState } from "react";
import { DEEMED_RATES, JP_TAX_AS_OF, JP_TAX_NOTE, jpConsumptionTax } from "../../../lib/jp-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell from "../viz/CurveShell";

const TOOL_ID = "jp-consumption-tax-check";
const yen = (n: number) => `${Math.round(n).toLocaleString("ja-JP")}円`;
type YN = "y" | "n";
type T = "1" | "2" | "3" | "4" | "5" | "6";
const yn = [{ value: "y", label: "はい" }, { value: "n", label: "いいえ" }] as const;
const TYPES: { value: T; label: string }[] = [
  { value: "1", label: "第1種 卸売" }, { value: "2", label: "第2種 小売" }, { value: "3", label: "第3種 製造・建設" },
  { value: "4", label: "第4種 飲食店など" }, { value: "5", label: "第5種 サービス業" }, { value: "6", label: "第6種 不動産業" },
];

export default function JpConsumptionTax() {
  const [x, setX] = useState({ year: 2026, base: 8_000_000, spec: 0, wages: 0, invoice: "y" as YN, wasExempt: "y" as YN, sales: 8_000_000, purchases: 1_500_000, type: "5" as T, filed: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = jpConsumptionTax({ year: x.year, baseSales: x.base, specSales: x.spec, specWages: x.wages, invoice: x.invoice === "y", wasExempt: x.wasExempt === "y", sales: x.sales, purchases: x.purchases, type: Number(x.type) as keyof typeof DEEMED_RATES, simpleFiled: x.filed === "y" });
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="ja"
      currency="JPY"
      curve={{
        title: "今年の課税売上による納付税額（選べる方法のうち最も少ない額）", caption: "仕入れなどの額はそのまま。選択届出などの条件を満たさない方法は除いています。",
        xLabel: "課税売上（税抜）", yLabel: "納付税額", min: 0, max: 50000000, step: 500000, current: x.sales,
        f: (v) => { const m = jpConsumptionTax({ year: x.year, baseSales: x.base, specSales: x.spec, specWages: x.wages, invoice: x.invoice === "y", wasExempt: x.wasExempt === "y", sales: v, purchases: x.purchases, type: Number(x.type) as keyof typeof DEEMED_RATES, simpleFiled: x.filed === "y" }); return m.exempt ? 0 : Math.min(...m.methods.filter((k) => k.ok).map((k) => k.tax)); }, formatX: (v) => `${Math.round(v / 10_000)}万円`, formatY: (n: number) => `${Math.round(n).toLocaleString("ja-JP")}円`,
        onPick: (v) => upd({ sales: v }), marks: [],
      }}
    >
      {() => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="課税期間（年）" value={x.year} onChange={(v) => upd({ year: Math.min(2030, Math.max(2025, Math.round(v) || 2026)) })} suffix="年" />
        <NumberField label="基準期間（前々年）の課税売上高（税抜）" value={x.base} onChange={(v) => upd({ base: v })} suffix="円" step={100000} />
        <NumberField label="特定期間（前年1〜6月）の課税売上高" value={x.spec} onChange={(v) => upd({ spec: v })} suffix="円" step={100000} />
        <NumberField label="特定期間の給与等支払額" value={x.wages} onChange={(v) => upd({ wages: v })} suffix="円" step={100000} />
        <NumberField label="今年の課税売上（税抜、10%分）" value={x.sales} onChange={(v) => upd({ sales: v })} suffix="円" step={100000} />
        <NumberField label="今年の課税仕入れ（税抜、10%分）" value={x.purchases} onChange={(v) => upd({ purchases: v })} suffix="円" step={100000} />
      </div>
      <ChoiceChips<YN> legend="インボイス（適格請求書発行事業者）に登録していますか？" value={x.invoice} options={yn} onChange={(v) => upd({ invoice: v })} />
      <ChoiceChips<YN> legend="登録しなければ免税事業者でしたか？" value={x.wasExempt} options={yn} onChange={(v) => upd({ wasExempt: v })} />
      <ChoiceChips<T> legend="簡易課税の事業区分" value={x.type} options={TYPES} onChange={(v) => upd({ type: v })} />
      <ChoiceChips<YN> legend="簡易課税制度選択届出書を出していますか？" value={x.filed} options={yn} onChange={(v) => upd({ filed: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{r.exempt ? "免税事業者です（消費税の申告は不要）" : `課税事業者です。売上税額 約${yen(r.outTax)}`}</p>
        {!r.exempt && (
          <ul className="mt-3 space-y-2">
            {r.methods.map((m) => (
              <li key={m.id} className={m.id === r.best ? "font-semibold text-success" : m.ok ? "text-foreground" : "text-muted-foreground"}>
                {m.label}: <span className="font-mono">{yen(m.tax)}</span> <span className="text-xs">（{m.ok ? "使える" : "使えない"}・{m.why}）</span>
              </li>
            ))}
          </ul>
        )}
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{JP_TAX_NOTE} 基準日 {JP_TAX_AS_OF}。</p>
    </>
      )}
    </CurveShell>
  );
}
