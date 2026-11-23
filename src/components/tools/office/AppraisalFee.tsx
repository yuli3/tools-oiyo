// 감정평가 수수료 계산기. 계산: lib/kr-expert-fees-2026.ts (보수에 관한 기준 별표, 2026. 2. 9.)
import { useState } from "react";
import { FEES_AS_OF, SURCHARGE_CASES, appraisalFee, type SurchargeId } from "../../../lib/kr-expert-fees-2026";
import LaborResult from "../labor/LaborResult";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "appraisal-fee-calculator";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export default function AppraisalFee() {
  const [value, setValue] = useState(500_000_000);
  const [buildings, setBuildings] = useState(1);
  const [apartments10, setApt] = useState(false);
  const [sur, setSur] = useState<SurchargeId[]>([]);
  const mark = () => track("tool_calculate", { tool_id: TOOL_ID }, true);
  const r = appraisalFee({ value, buildings, apartments10, surcharge: sur });
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="감정평가액(예정액)" value={value} onChange={(v) => { setValue(v); mark(); }} suffix="원" step={10_000_000} />
        <NumberField label="건물 동 수(물건조사비용)" value={buildings} onChange={(v) => { setBuildings(Math.max(0, Math.round(v))); mark(); }} suffix="동" />
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={apartments10} onChange={(e) => { setApt(e.target.checked); mark(); }} />가치형성요인이 비슷한 공동주택 10호 이상을 함께 평가해요</label>
      <fieldset className="rounded-md border border-border p-4">
        <legend className="px-1 text-sm font-medium text-muted-foreground">특수평가에 해당하면 골라요(할증 대상)</legend>
        <div className="grid gap-1 sm:grid-cols-2">
          {SURCHARGE_CASES.map((c) => (
            <label key={c.id} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={sur.includes(c.id)} onChange={() => { setSur((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id])); mark(); }} />{c.label}</label>
          ))}
        </div>
      </fieldset>
      <section className="grid gap-3 sm:grid-cols-3" aria-label="수수료 범위">
        <div className="rounded-xl border p-4"><p className="text-sm text-muted-foreground">하한(0.8배)</p><p className="mt-1 text-2xl font-bold">{won(r.low)}</p></div>
        <div className="rounded-xl border border-primary bg-primary/5 p-4"><p className="text-sm text-muted-foreground">기준 수수료</p><p className="mt-1 text-2xl font-bold text-primary">{won(r.base)}</p></div>
        <div className="rounded-xl border p-4"><p className="text-sm text-muted-foreground">상한(1.2배)</p><p className="mt-1 text-2xl font-bold">{won(r.high)}</p></div>
      </section>
      <LaborResult headline={r.surcharged ? "할증 전 별표 수수료예요" : "별표 수수료 범위예요"} items={r.items} dates={[]} datesTitle="날짜" note={`일반 정보예요. 감정평가를 의뢰받지 않아요. 국토교통부공고 제2026-145호 원문 기준, 확인 ${FEES_AS_OF}. 입력은 브라우저 밖으로 나가지 않아요.`} />
    </div>
  );
}
