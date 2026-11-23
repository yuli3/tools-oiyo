// 대한법률구조공단 소송지원 대상 확인. 계산: lib/kr-expert-fees-2026.ts
import { useState } from "react";
import { AID_GROUPS, FEES_AS_OF, legalAidCheck, type AidGroup } from "../../../lib/kr-expert-fees-2026";
import LaborResult from "../labor/LaborResult";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "legal-aid-eligibility-check";

export default function LegalAidCheck() {
  const [group, setGroup] = useState<AidGroup>("median125");
  const [household, setHousehold] = useState(1);
  const [income, setIncome] = useState(2_500_000);
  const [wage, setWage] = useState(3_000_000);
  const [sales, setSales] = useState(200_000_000);
  const upd = (f: () => void) => { f(); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = legalAidCheck({ group, household, monthlyIncome: income, avgWage3m: wage, sales });
  const headline = r.fits === null ? "대상 유형을 골라요" : r.fits ? "소득 기준으로는 지원 대상이에요" : "소득 기준을 넘어요";
  return (
    <div className="space-y-4">
      <fieldset className="rounded-md border border-border p-4">
        <legend className="px-1 text-sm font-medium text-muted-foreground">나에게 맞는 대상 유형</legend>
        <div className="space-y-2">
          {AID_GROUPS.map((g) => (
            <label key={g.id} className="flex min-h-11 items-start gap-2 text-sm">
              <input type="radio" name="aid-group" className="mt-1 size-5" checked={group === g.id} onChange={() => upd(() => setGroup(g.id))} />
              <span><span className="font-semibold">{g.label}</span><span className="block text-muted-foreground">{g.examples}</span></span>
            </label>
          ))}
        </div>
      </fieldset>
      {(group === "median125" || group === "median150") && (
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label="가구원 수" value={household} onChange={(v) => upd(() => setHousehold(Math.max(1, Math.round(v))))} suffix="명" min={1} />
          <NumberField label="가구 월소득" value={income} onChange={(v) => upd(() => setIncome(v))} suffix="원" step={100_000} />
        </div>
      )}
      {group === "wage400" && <NumberField label="최종 3개월 평균 임금(월)" value={wage} onChange={(v) => upd(() => setWage(v))} suffix="원" step={100_000} />}
      {group === "smallBiz" && <NumberField label="연매출" value={sales} onChange={(v) => upd(() => setSales(v))} suffix="원" step={10_000_000} />}
      <LaborResult headline={headline} items={r.items} dates={[]} datesTitle="날짜" note={`일반 정보예요. 지원 결정은 대한법률구조공단(132)이 해요. 공단 누리집·보건복지부고시 기준, 확인 ${FEES_AS_OF}. 입력은 브라우저 밖으로 나가지 않아요.`} />
    </div>
  );
}
