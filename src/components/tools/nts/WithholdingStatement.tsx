// 지급명세서 기한·가산세 점검 (2026-11-21, 국세청 주제 5종). 계산: lib/kr-nts-pack-2026.ts (kr-tax-advisor 스킬 calc withholding-statement와 같은 코드)
import { useState } from "react";
import { NTS_PACK_AS_OF, NTS_PACK_NOTE, STATEMENT_KINDS, withholdingStatement, type StatementKind } from "../../../lib/kr-nts-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items, useToday, won } from "./Items";

const TOOL_ID = "withholding-statement-penalty-calculator";

export default function WithholdingStatement() {
  const today = useToday();
  const [x, setX] = useState({ kind: "simple-business" as StatementKind, year: 2026, month: 10, amount: 2000, submitted: "", semi: false });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = withholdingStatement({ kind: x.kind, year: x.year, month: x.month, amount: x.amount * 10_000, submitted: x.submitted || undefined, semiAnnualPayer: x.semi, today });
  const annual = x.kind === "annual-other" || x.kind === "annual-wage";
  return (
    <div className="space-y-5">
      <ChoiceChips<StatementKind> legend="어떤 지급명세서인가요?" value={x.kind} options={(Object.keys(STATEMENT_KINDS) as StatementKind[]).map((k) => ({ value: k, label: STATEMENT_KINDS[k].label }))} onChange={(v) => upd({ kind: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="지급한 해" value={x.year} onChange={(v) => upd({ year: Math.min(2030, Math.max(2024, Math.round(v))) })} />
        {!annual && <NumberField label="지급한 달" suffix="월" value={x.month} onChange={(v) => upd({ month: Math.min(12, Math.max(1, Math.round(v))) })} />}
        <NumberField label="안 냈거나 늦게 낸 지급금액" suffix="만 원" value={x.amount} onChange={(v) => upd({ amount: Math.max(0, v) })} />
        <DateField label="낸 날(아직이면 비워요)" value={x.submitted} onChange={(v) => upd({ submitted: v })} />
      </div>
      {x.kind === "simple-wage" && x.year >= 2027 && (
        <ChoiceChips<"no" | "yes"> legend="원천세를 반기별로 내나요?" value={x.semi ? "yes" : "no"} options={[{ value: "no", label: "매월 내요" }, { value: "yes", label: "반기별 납부 승인을 받았어요" }]} onChange={(v) => upd({ semi: v === "yes" })} />
      )}
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">
          제출 기한 <span className="font-mono">{r.due}</span>
          {r.dday != null && !x.submitted && <span className="ml-2 text-base font-normal text-muted-foreground">{r.dday >= 0 ? `D-${r.dday}` : `${-r.dday}일 지남`}</span>}
        </p>
        <p className="mt-1 text-foreground">
          {r.penalty > 0 ? <>미제출 가산세 약 <strong>{won(r.penalty)}</strong> (지급금액 × {Math.round(r.rate * 100000) / 1000}%)</> : r.status === "not-yet" ? <>기한 안에 내면 가산세가 없어요. 늦으면 {r.graceMonths}개월 안 {Math.round(r.reducedRate * 100000) / 1000}%, 그 뒤 {Math.round(r.baseRate * 100000) / 1000}%예요.</> : <>미제출 가산세 없음</>}
        </p>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{NTS_PACK_NOTE} 기준일 {NTS_PACK_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </div>
  );
}
