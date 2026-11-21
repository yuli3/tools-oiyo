// 臺灣營業稅起徵點、小規模1%與統一發票5%。計算：lib/tw-tax-pack-2026.ts
import { useState } from "react";
import { TW_TAX_AS_OF, TW_TAX_NOTE, twBusinessTax } from "../../../lib/tw-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell, { TW_VIZ_TEXT } from "../viz/CurveShell";

const TOOL_ID = "taiwan-business-tax-threshold";
type YN = "y" | "n";
const head: Record<string, string> = { "below-threshold": "未達起徵點，免徵營業稅", "small-scale": "已達起徵點，小規模營業人1%", invoice: "使用統一發票，徵收率5%" };

export default function TwBusinessTax() {
  const [x, setX] = useState({ invoice: "n" as YN, goods: 70_000, service: 10_000, purchases: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = twBusinessTax({ goodsSales: x.goods, serviceSales: x.service, invoice: x.invoice === "y", purchases: x.purchases });
  const per = x.invoice === "y" ? "本期（兩個月）" : "每月";
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="zh"
      currency="TWD"
      text={TW_VIZ_TEXT}
      curve={{
        title: "每月銷售額與營業稅", caption: "服務類銷售額不變。小規模營業人達起徵點後按1%查定。",
        xLabel: "買賣業等每月銷售額", yLabel: "營業稅", min: 0, max: 200000, step: 2000, current: x.goods,
        f: (v) => twBusinessTax({ goodsSales: v, serviceSales: x.service, invoice: x.invoice === "y", purchases: x.purchases }).tax, formatX: (v) => `${Math.round(v / 1_000)}千`, formatY: (n: number) => `${Math.round(n).toLocaleString("zh-TW")}元`,
        onPick: (v) => upd({ goods: v }), marks: [{ at: 100_000, label: "10萬" }],
      }}
    >
      {() => (
    <>
      <ChoiceChips<YN> legend="已使用統一發票？" value={x.invoice} options={[{ value: "n", label: "否（小規模營業人）" }, { value: "y", label: "是" }]} onChange={(v) => upd({ invoice: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label={`${per}買賣、製造、飲食等銷售額`} value={x.goods} onChange={(v) => upd({ goods: v })} suffix="元" step={5000} />
        <NumberField label={`${per}裝潢、廣告、修理、旅宿、租賃、設計等銷售額`} value={x.service} onChange={(v) => upd({ service: v })} suffix="元" step={5000} />
        {x.invoice === "y" && <NumberField label="本期進貨與費用（未稅）" value={x.purchases} onChange={(v) => upd({ purchases: v })} suffix="元" step={5000} />}
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{head[r.status]}{r.status !== "below-threshold" && `：約${Math.round(r.tax).toLocaleString("zh-TW")}元`}</p>
        {x.invoice === "n" && <><progress className="mt-2 h-2 w-full accent-(--primary)" max={1} value={Math.min(1, r.ratio)} aria-label="起徵點比例" /><p className="mt-1 text-muted-foreground">起徵點比例 {Math.round(r.ratio * 100)}%（達100%即須課徵）</p></>}
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{TW_TAX_NOTE} 更新日期：{TW_TAX_AS_OF}。</p>
    </>
      )}
    </CurveShell>
  );
}
