// Taiwan 居住者判定：31天／183天。Logic: lib/world-tax-residency-2026.ts
import { useState } from "react";
import { RESIDENCY_AS_OF, twResidency } from "../../../lib/world-tax-residency-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell, { TW_VIZ_TEXT } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "taiwan-tax-resident-183-31-days";
type YN = "y" | "n";

export default function TwResidency() {
  const [x, setX] = useState({ days: 100, hh: "n" as YN, centre: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const input = { householdRegistration: x.hh === "y", lifeCentre: x.centre === "y" };
  const r = twResidency({ days: x.days, ...input });
  return (
    <CurveShell toolId={TOOL_ID} lang="zh" currency="TWD" text={TW_VIZ_TEXT}
      curve={{ title: "境內天數與居住者判定", caption: "1 = 居住者，0 = 非居住者（依您的戶籍與生活重心選項）。", xLabel: "一課稅年度內在境內天數", yLabel: "居住者", min: 0, max: 366, step: 1, current: x.days, f: (v) => (twResidency({ days: v, ...input }).verdict === "resident" ? 1 : 0), formatX: (n) => `${Math.round(n)}天`, formatY: (n) => (n ? "是" : "否"), onPick: (v) => upd({ days: v }), marks: [{ at: 31, label: "31" }, { at: 183, label: "183" }] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<YN> legend="在臺灣設有戶籍嗎？" value={x.hh} options={[{ value: "y", label: "有" }, { value: "n", label: "沒有" }]} onChange={(v) => upd({ hh: v })} />
          <NumberField label="今年在境內居住（居留）天數" value={x.days} onChange={(v) => upd({ days: v })} step={1} />
          {x.hh === "y" && <ChoiceChips<YN> legend="生活及經濟重心在臺灣嗎？（健保、配偶子女、工作或事業）" value={x.centre} options={[{ value: "n", label: "否" }, { value: "y", label: "是" }]} onChange={(v) => upd({ centre: v })} />}
          <LaborResult mode={mode} headline={r.verdict === "resident" ? "本年度為中華民國境內居住之個人（居住者）" : "本年度為非居住者"} items={r.items} dates={[]} datesTitle="" note={`依財政部稅務入口網問答（所得稅法第7條）整理的一般資訊，非稅務建議。更新 ${RESIDENCY_AS_OF}。輸入內容不會離開您的瀏覽器。`} />
        </>
      )}
    </CurveShell>
  );
}
