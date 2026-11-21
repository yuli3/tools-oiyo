// 중대재해 해당 판정 (2026-11-21, 산업안전 묶음). 계산: lib/kr-industrial-safety-2026.ts (법령 길잡이 스킬 calc serious와 같은 코드)
import { useState } from "react";
import { SAFETY_AS_OF, SAFETY_NOTE, seriousAccident } from "../../../lib/kr-industrial-safety-2026";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import ChoiceChips from "../payroll/ChoiceChips";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "serious-accident-checker";

export default function SeriousAccident() {
  const [x, setX] = useState({ deaths: 0, injured6m: 0, injured3m: 0, injuredTotal: 0, illness1y: 0, lostDays3: "yes" as "yes" | "no", headcount: 30, date: "" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = seriousAccident({ ...x, lostDays3: x.lostDays3 === "yes", date: x.date || undefined });
  const n = (v: number) => Math.max(0, Math.round(v));
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="사망자" suffix="명" value={x.deaths} onChange={(v) => upd({ deaths: n(v) })} />
        <NumberField label="같은 사고로 6개월 이상 치료가 필요한 부상자" suffix="명" value={x.injured6m} onChange={(v) => upd({ injured6m: n(v) })} />
        <NumberField label="3개월 이상 요양이 필요한 부상자(동시에)" suffix="명" value={x.injured3m} onChange={(v) => upd({ injured3m: n(v) })} />
        <NumberField label="부상자·직업성 질병자 합계(동시에)" suffix="명" value={x.injuredTotal} onChange={(v) => upd({ injuredTotal: n(v) })} />
        <NumberField label="같은 유해요인 직업성 질병자(1년 안)" suffix="명" value={x.illness1y} onChange={(v) => upd({ illness1y: n(v) })} />
        <NumberField label="상시근로자 수" suffix="명" value={x.headcount} onChange={(v) => upd({ headcount: n(v) })} />
        <DateField label="사고일(모르면 비워요)" value={x.date} onChange={(v) => upd({ date: v })} />
      </div>
      <ChoiceChips<"yes" | "no"> legend="3일 이상 쉬어야 하는 부상·질병자가 있나요?" value={x.lostDays3} options={[{ value: "yes", label: "있어요" }, { value: "no", label: "없어요" }]} onChange={(v) => upd({ lostDays3: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">
          {r.criSerious ? "중대산업재해에 해당해요" : r.oshSerious ? "산업안전보건법 중대재해예요" : r.mustReport ? "산업재해 보고 대상이에요" : "중대재해 기준에는 못 미쳐요"}
        </p>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{SAFETY_NOTE} 기준일 {SAFETY_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </div>
  );
}
