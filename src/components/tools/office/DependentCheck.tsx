// 건강보험 피부양자 자격 점검(부양요건 + 소득·재산). 계산: lib/kr-office-checks-2026.ts
import { useState } from "react";
import { CHECKS_AS_OF, RELATIONS, dependentCheck, type Relation } from "../../../lib/kr-office-checks-2026";
import LaborResult from "../labor/LaborResult";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "health-insurance-dependent-checker";

export default function DependentCheck() {
  const [relation, setRelation] = useState<Relation>("parent");
  const [together, setTogether] = useState(false);
  const [income, setIncome] = useState(15_000_000);
  const [biz, setBiz] = useState(0);
  const [bizReg, setBizReg] = useState(false);
  const [prop, setProp] = useState(300_000_000);
  const [married, setMarried] = useState(false);
  const [spouseOk, setSpouseOk] = useState(true);
  const upd = (f: () => void) => { f(); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = dependentCheck({ relation, livingTogether: together, annualIncome: income, businessIncome: biz, bizRegistered: bizReg, propertyTaxBase: prop, married, spouseOk });
  const box = "flex min-h-11 items-center gap-2 text-sm";
  const headline = r.support === "no" ? "부양요건에 맞지 않아요" : !r.ok ? "소득·재산 요건에 걸려요" : r.support === "cond" ? "조건을 확인하면 피부양자가 될 수 있어요" : "피부양자 요건을 충족해요";
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-muted-foreground">직장가입자와의 관계
        <select className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-foreground" value={relation} onChange={(e) => upd(() => setRelation(e.target.value as Relation))}>
          {RELATIONS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
        </select>
      </label>
      <label className={box}><input type="checkbox" className="size-5" checked={together} onChange={(e) => upd(() => setTogether(e.target.checked))} />직장가입자와 같이 살아요</label>
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField label="연간 소득 합계(건강보험법 시행령 제41조①의 소득)" value={income} onChange={(v) => upd(() => setIncome(v))} suffix="원" step={1_000_000} />
        <NumberField label="그중 사업소득" value={biz} onChange={(v) => upd(() => setBiz(v))} suffix="원" step={500_000} />
        <NumberField label="재산세 과세표준 합계" value={prop} onChange={(v) => upd(() => setProp(v))} suffix="원" step={10_000_000} />
      </div>
      <label className={box}><input type="checkbox" className="size-5" checked={bizReg} onChange={(e) => upd(() => setBizReg(e.target.checked))} />사업자등록이 되어 있어요(또는 주택임대소득이 있어요)</label>
      <label className={box}><input type="checkbox" className="size-5" checked={married} onChange={(e) => upd(() => setMarried(e.target.checked))} />피부양자가 될 사람이 기혼이에요</label>
      {married && <label className={box}><input type="checkbox" className="size-5" checked={spouseOk} onChange={(e) => upd(() => setSpouseOk(e.target.checked))} />그 배우자도 소득요건(연 2천만원 이하 등)을 충족해요</label>}
      <LaborResult headline={headline} items={r.items} dates={[]} datesTitle="날짜" note={`일반 정보예요. 자격은 국민건강보험공단이 확인해요. 시행규칙 별표 1·1의2 원문 기준, 확인 ${CHECKS_AS_OF}. 입력은 브라우저 밖으로 나가지 않아요.`} />
    </div>
  );
}
