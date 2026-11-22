// 消費者債務清理條例 更生・清算 check. Logic: lib/world-fresh-start-2026.ts
import { useState } from "react";
import { FRESH_START_AS_OF, twDebtClearance } from "../../../lib/world-fresh-start-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell, { TW_VIZ_TEXT } from "../viz/CurveShell";
import { track } from "../viz/track";

type YN = "no" | "yes";
const TOOL_ID = "taiwan-debt-clearance-checker";
const fmt = (n: number) => Math.round(n).toLocaleString("zh-TW");
const ROUTE: Record<string, string> = { restructure_or_liquidation: "可以選擇更生或清算", liquidation_only: "只能聲請清算", none: "不適用消債條例" };

export default function TwDebtClearance() {
  const [x, setX] = useState({ debt: 3_000_000, biz: "no" as YN, revenue: 0, bank: "yes" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = twDebtClearance({ totalDebt: x.debt, hadBusiness5y: x.biz === "yes", avgMonthlyRevenue5y: x.revenue, hasBankDebt: x.bank === "yes" });
  return (
    <CurveShell toolId={TOOL_ID} lang="zh" text={TW_VIZ_TEXT} currency="TWD"
      curve={{ title: "距離1,200萬元更生上限還有多少", caption: "債務超過1,200萬元就只能清算。", xLabel: "債務總額（元）", yLabel: "距更生上限", min: 0, max: 20_000_000, step: 100_000, current: x.debt, f: (v) => Math.max(0, 12_000_000 - v), formatX: fmt, formatY: fmt, onPick: (v) => upd({ debt: Math.round(v) }), marks: [] }}
    >
      {(mode) => (
        <>
          <NumberField label="債務總額（元）" value={x.debt} onChange={(v) => upd({ debt: v })} step={100_000} />
          <ChoiceChips<YN> legend="有銀行或信用合作社的債務（信用卡、現金卡、信貸、房貸）" value={x.bank} options={[{ value: "no", label: "沒有" }, { value: "yes", label: "有" }]} onChange={(v) => upd({ bank: v })} />
          <ChoiceChips<YN> legend="五年內有沒有做生意（營業活動）" value={x.biz} options={[{ value: "no", label: "沒有" }, { value: "yes", label: "有" }]} onChange={(v) => upd({ biz: v })} />
          {x.biz === "yes" && <NumberField label="五年內平均每月營業額（元）" value={x.revenue} onChange={(v) => upd({ revenue: v })} step={10_000} />}
          <LaborResult mode={mode} headline={ROUTE[r.route]} sub={r.needsBankNegotiation ? "第一步：向最大債權銀行申請前置協商" : r.consumer ? "可以直接向法院聲請" : "請洽法律扶助基金會"} items={r.items as never} dates={[]} datesTitle="" note={`依法院須知整理，非法律意見。更新 ${FRESH_START_AS_OF}。輸入內容只留在你的瀏覽器。`} />
        </>
      )}
    </CurveShell>
  );
}
