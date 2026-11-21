// 산업재해 보고 기한·과태료 (2026-11-21, 산업안전 묶음). 계산: lib/kr-industrial-safety-2026.ts (스킬 calc report와 같은 코드)
import { useState } from "react";
import { SAFETY_AS_OF, SAFETY_NOTE, accidentReport } from "../../../lib/kr-industrial-safety-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import { track } from "../viz/track";
import { Items, useToday } from "../nts/Items";

const TOOL_ID = "industrial-accident-report-deadline";
type Kind = "death" | "serious" | "lost3" | "minor";

export default function AccidentReport() {
  const today = useToday();
  const [x, setX] = useState({ date: "", kind: "lost3" as Kind, reported: "", nth: 1 as 1 | 2 | 3 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const date = x.date || today || "2026-11-21";
  const r = accidentReport({ date, deaths: x.kind === "death" ? 1 : 0, serious: x.kind === "death" || x.kind === "serious", lostDays3: x.kind !== "minor", reported: x.reported || undefined, nth: x.nth, today });
  return (
    <div className="space-y-5">
      <ChoiceChips<Kind> legend="어떤 재해인가요?" value={x.kind} options={[{ value: "death", label: "사망" }, { value: "serious", label: "중대재해(3개월 요양 2명 이상 등)" }, { value: "lost3", label: "3일 이상 휴업" }, { value: "minor", label: "3일 미만" }]} onChange={(v) => upd({ kind: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <DateField label="재해 발생일" value={x.date} onChange={(v) => upd({ date: v })} />
        <DateField label="조사표를 낸 날(아직이면 비워요)" value={x.reported} onChange={(v) => upd({ reported: v })} />
      </div>
      <ChoiceChips<"1" | "2" | "3"> legend="최근 5년 안에 같은 위반으로 과태료를 받은 적은요?" value={String(x.nth) as "1" | "2" | "3"} options={[{ value: "1", label: "없어요" }, { value: "2", label: "1번" }, { value: "3", label: "2번 이상" }]} onChange={(v) => upd({ nth: Number(v) as 1 | 2 | 3 })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">
          {r.due ? <>제출 마감 <span className="font-mono">{r.due}</span>{r.dday != null && <span className="ml-2 text-base font-normal text-muted-foreground">{r.dday >= 0 ? `D-${r.dday}` : `${-r.dday}일 지남`}</span>}</> : "산업재해조사표 제출 대상이 아니에요"}
        </p>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{SAFETY_NOTE} 기준일 {SAFETY_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </div>
  );
}
