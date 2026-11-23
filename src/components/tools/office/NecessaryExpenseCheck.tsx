// 양도소득세 필요경비 점검 (원문 목록 대조, 금액 판정 없음). 계산: lib/kr-free-expert-2026.ts
import { useState } from "react";
import { FREE_AS_OF, NECESSARY_EXPENSES, necessaryExpenseCheck, type ExpenseId } from "../../../lib/kr-free-expert-2026";
import LaborResult from "../labor/LaborResult";
import { track } from "../viz/track";

const TOOL_ID = "capital-gains-necessary-expenses-check";

export default function NecessaryExpenseCheck() {
  const [picked, setPicked] = useState<ExpenseId[]>(["acqTax", "saleBrokerage"]);
  const toggle = (id: ExpenseId) => { setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = necessaryExpenseCheck(picked);
  return (
    <div className="space-y-4">
      <fieldset className="rounded-md border border-border p-4">
        <legend className="px-1 text-sm font-medium text-muted-foreground">쓴 비용을 모두 골라요</legend>
        <div className="grid gap-1 sm:grid-cols-2">
          {NECESSARY_EXPENSES.map((e) => (
            <label key={e.id} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={picked.includes(e.id)} onChange={() => toggle(e.id)} />{e.label}</label>
          ))}
        </div>
      </fieldset>
      <LaborResult headline={`원문 목록에 있는 항목 ${r.listed}개 · 확인이 필요한 항목 ${r.check}개 · 목록에 없는 항목 ${r.not}개`} items={r.items} dates={[]} datesTitle="날짜" note={`일반 정보예요. 세액을 계산하거나 신고하지 않아요. 소득세법·시행령 원문 기준, 확인 ${FREE_AS_OF}. 입력은 브라우저 밖으로 나가지 않아요.`} />
    </div>
  );
}
