// 안전보건 인력 선임 기준 (2026-11-21, 산업안전 묶음). 계산: lib/kr-industrial-safety-2026.ts (스킬 calc staffing과 같은 코드)
import { useState } from "react";
import { SAFETY_AS_OF, SAFETY_NOTE, SECTORS, safetyStaffing, type SectorId } from "../../../lib/kr-industrial-safety-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "safety-manager-staffing-checker";

export default function SafetyStaffing() {
  const [x, setX] = useState({ sector: "mfg-heavy" as SectorId, headcount: 120, amount: 100, civil: "no" as "yes" | "no" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const isCon = x.sector === "construction";
  const r = safetyStaffing({ sector: x.sector, headcount: x.headcount, amount: x.amount * 100_000_000, civil: x.civil === "yes" });
  return (
    <div className="space-y-5">
      <ChoiceChips<SectorId> legend="어떤 업종인가요?" value={x.sector} options={(Object.keys(SECTORS) as SectorId[]).map((k) => ({ value: k, label: SECTORS[k].label }))} onChange={(v) => upd({ sector: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="상시근로자 수" suffix="명" value={x.headcount} onChange={(v) => upd({ headcount: Math.max(0, Math.round(v)) })} />
        {isCon && <NumberField label="공사금액" suffix="억 원" step={10} value={x.amount} onChange={(v) => upd({ amount: Math.max(0, v) })} />}
      </div>
      {isCon && <ChoiceChips<"yes" | "no"> legend="토목공사업인가요?" value={x.civil} options={[{ value: "no", label: "아니에요" }, { value: "yes", label: "토목공사업" }]} onChange={(v) => upd({ civil: v })} />}
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">안전관리자 <span className="font-mono">{r.safety < 0 ? "별표 확인" : `${r.safety}명`}</span> · 보건관리자 <span className="font-mono">{r.health}</span>명{r.chief ? " · 책임자 필요" : ""}</p>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">대표 업종만 골라 볼 수 있어요. 목록에 없는 업종은 시행령 별표 2·3·5 원문을 봐요. {SAFETY_NOTE} 기준일 {SAFETY_AS_OF}.</p>
    </div>
  );
}
