// 臺灣綜合所得稅試算（114、115年度）。計算：lib/tw-tax-pack-2026.ts
import { useState } from "react";
import { TW_TAX_AS_OF, TW_TAX_NOTE, twIncomeTax } from "../../../lib/tw-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "taiwan-income-tax-calculator";
type Y = "2025" | "2026";
type YN = "y" | "n";
const ntd = (n: number) => `${Math.round(n).toLocaleString("zh-TW")}元`;

export default function TwIncomeTax() {
  const [x, setX] = useState({ year: "2025" as Y, married: "n" as YN, salary: 900_000, spouse: 0, other: 0, persons: 1, elderly: 0, disabled: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = twIncomeTax({ year: Number(x.year) as 2025 | 2026, married: x.married === "y", salary: x.salary, spouseSalary: x.married === "y" ? x.spouse : 0, otherIncome: x.other, persons: Math.max(x.married === "y" ? 2 : 1, x.persons), elderly: x.elderly, disabled: x.disabled });
  const gross = x.salary + (x.married === "y" ? x.spouse : 0) + x.other;
  return (
    <div className="space-y-5">
      <ChoiceChips<Y> legend="所得年度" value={x.year} options={[{ value: "2025", label: "114年度（2026年5月申報）" }, { value: "2026", label: "115年度（2027年5月申報）" }]} onChange={(v) => upd({ year: v })} />
      <ChoiceChips<YN> legend="與配偶合併申報？" value={x.married} options={[{ value: "y", label: "是" }, { value: "n", label: "否" }]} onChange={(v) => upd({ married: v, persons: v === "y" ? Math.max(2, x.persons) : x.persons })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="本人薪資所得" value={x.salary} onChange={(v) => upd({ salary: v })} suffix="元" step={10000} />
        {x.married === "y" && <NumberField label="配偶薪資所得" value={x.spouse} onChange={(v) => upd({ spouse: v })} suffix="元" step={10000} />}
        <NumberField label="其他所得（執行業務、租賃、利息等淨額）" value={x.other} onChange={(v) => upd({ other: v })} suffix="元" step={10000} />
        <NumberField label="申報人數（本人、配偶、受扶養親屬）" value={x.persons} onChange={(v) => upd({ persons: Math.max(1, Math.round(v)) })} suffix="人" />
        <NumberField label="其中年滿70歲" value={x.elderly} onChange={(v) => upd({ elderly: Math.max(0, Math.round(v)) })} suffix="人" />
        <NumberField label="其中身心障礙" value={x.disabled} onChange={(v) => upd({ disabled: Math.max(0, Math.round(v)) })} suffix="人" />
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">應納稅額約{ntd(r.tax)}（最高稅率{Math.round(r.topRate * 100)}%）</p>
        <progress className="mt-2 h-2 w-full accent-(--primary)" max={Math.max(1, gross)} value={r.taxable} aria-label="綜合所得淨額占所得總額" />
        <p className="mt-1 text-muted-foreground">所得 {ntd(gross)} → 淨額 {ntd(r.taxable)}（免稅額 {ntd(r.exemptions)}、標準扣除額 {ntd(r.standard)}{r.disabled ? `、身心障礙 ${ntd(r.disabled)}` : ""}{r.basicLivingDiff ? `、基本生活費差額 ${ntd(r.basicLivingDiff)}` : ""}）</p>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{TW_TAX_NOTE} 更新日期：{TW_TAX_AS_OF}。</p>
    </div>
  );
}
