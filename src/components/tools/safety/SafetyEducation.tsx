// 안전보건교육 시간 (2026-11-21, 산업안전 묶음). 계산: lib/kr-industrial-safety-2026.ts (스킬 calc education과 같은 코드)
import { useState } from "react";
import { SAFETY_AS_OF, SAFETY_NOTE, safetyEducation, type Hire, type JobKind } from "../../../lib/kr-industrial-safety-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "safety-education-hours-calculator";

export default function SafetyEducation() {
  const [x, setX] = useState({ job: "other" as JobKind, hire: "regular" as Hire, workers: 10, supervisors: 1, half: "no" as "yes" | "no", construction: "no" as "yes" | "no" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = safetyEducation({ ...x, half: x.half === "yes", construction: x.construction === "yes" });
  return (
    <div className="space-y-5">
      <ChoiceChips<JobKind> legend="어떤 일을 하나요?" value={x.job} options={[{ value: "office", label: "사무직" }, { value: "sales", label: "판매 업무" }, { value: "other", label: "그 밖(생산·현장 등)" }]} onChange={(v) => upd({ job: v })} />
      <ChoiceChips<Hire> legend="고용 형태는요?" value={x.hire} options={[{ value: "regular", label: "1개월 넘게" }, { value: "month", label: "1주 넘고 1개월 이하" }, { value: "week", label: "1주 이하 기간제" }, { value: "daily", label: "일용" }]} onChange={(v) => upd({ hire: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="근로자 수" suffix="명" value={x.workers} onChange={(v) => upd({ workers: Math.max(0, Math.round(v)) })} />
        <NumberField label="관리감독자 수" suffix="명" value={x.supervisors} onChange={(v) => upd({ supervisors: Math.max(0, Math.round(v)) })} />
      </div>
      <ChoiceChips<"yes" | "no"> legend="상시 50명 미만 도매업·숙박 및 음식점업인가요?" value={x.half} options={[{ value: "no", label: "아니에요" }, { value: "yes", label: "맞아요(시간 절반)" }]} onChange={(v) => upd({ half: v })} />
      <ChoiceChips<"yes" | "no"> legend="건설 현장인가요?" value={x.construction} options={[{ value: "no", label: "아니에요" }, { value: "yes", label: "건설 현장이에요" }]} onChange={(v) => upd({ construction: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">한 해 정기교육 합계 <span className="font-mono">{r.yearlyTotal.toLocaleString("ko-KR")}시간</span></p>
        <p className="mt-1 text-muted-foreground">한 사람당 반기 {r.perWorker.periodicHalf}시간 · 채용 때 {r.perWorker.onHire}시간 · 작업 변경 때 {r.perWorker.change}시간</p>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{SAFETY_NOTE} 기준일 {SAFETY_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </div>
  );
}
