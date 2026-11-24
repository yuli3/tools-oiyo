// 근로계약서 필수 기재·교부 점검. 계산: lib/kr-office-checks-2026.ts
import { useState } from "react";
import { CHECKS_AS_OF, CLAUSES, contractCheck, requiredClauses, type ClauseId, type WorkerKind } from "../../../lib/kr-office-checks-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "employment-contract-checker";

export default function ContractCheck() {
  const [kind, setKind] = useState<WorkerKind>("regular");
  const [small, setSmall] = useState(false);
  const [hours, setHours] = useState(20);
  const [written, setWritten] = useState<ClauseId[]>(["wage", "hours", "place"]);
  const [handed, setHanded] = useState(false);
  const mark = () => track("tool_calculate", { tool_id: TOOL_ID }, true);
  const need = requiredClauses(kind);
  const r = contractCheck({ kind, small, weeklyHours: hours, written, handedOver: handed });
  const box = "flex min-h-11 items-center gap-2 text-sm";
  return (
    <div className="space-y-4">
      <ChoiceChips<WorkerKind> legend="근로자 유형" value={kind} options={[{ value: "regular", label: "기간 정함 없음(정규)" }, { value: "fixedTerm", label: "기간제(계약직)" }, { value: "partTime", label: "단시간(파트타임·알바)" }]} onChange={(v) => { setKind(v); mark(); }} />
      {kind === "partTime" && <NumberField label="4주 평균 주 소정근로시간" value={hours} onChange={(v) => { setHours(v); mark(); }} suffix="시간" />}
      <label className={box}><input type="checkbox" className="size-5" checked={small} onChange={(e) => { setSmall(e.target.checked); mark(); }} />상시 근로자 4명 이하 사업장이에요</label>
      <fieldset className="rounded-md border border-border p-4">
        <legend className="px-1 text-sm font-medium text-muted-foreground">계약서에 적힌 항목을 골라요</legend>
        <div className="grid gap-1 sm:grid-cols-2">
          {CLAUSES.filter((c) => need.includes(c.id)).map((c) => (
            <label key={c.id} className={box}><input type="checkbox" className="size-5" checked={written.includes(c.id)} onChange={() => { setWritten((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id])); mark(); }} />{c.label}</label>
          ))}
        </div>
      </fieldset>
      <label className={box}><input type="checkbox" className="size-5" checked={handed} onChange={(e) => { setHanded(e.target.checked); mark(); }} />계약서(전자문서 포함)를 근로자에게 내줬어요</label>
      <LaborResult headline={r.missing.length === 0 && handed ? "필수 항목과 교부를 모두 갖췄어요" : `빠진 것 ${r.missing.length + (handed ? 0 : 1)}가지`} items={r.items} dates={[]} datesTitle="날짜" note={`일반 정보예요. 계약서를 대신 써 주거나 검토 의견을 내지 않아요. 근로기준법·기간제법 원문 기준, 확인 ${CHECKS_AS_OF}. 입력은 브라우저 밖으로 나가지 않아요.`} />
    </div>
  );
}
