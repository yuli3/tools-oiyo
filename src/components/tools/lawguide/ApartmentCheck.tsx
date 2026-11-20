// 공동주택 관리 점검 (2026-11-20, 전수조사 12번 새 직업). 계산: lib/kr-franchise-housing-2026.ts (법령 길잡이 스킬 guide.mjs calc apartment와 같은 코드)
import { useState } from "react";
import { FH_AS_OF, FH_NOTE, apartmentSchedule, type ApartmentInput } from "../../../lib/kr-franchise-housing-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "apartment-management-check";
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function ApartmentCheck() {
  const [x, setX] = useState<ApartmentInput>({ households: 240, elevator: true, centralHeating: false, mixedUse: false, useApproval: "2024-03-15", handover: "2024-04-01" });
  const upd = (p: Partial<ApartmentInput>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = apartmentSchedule(x, todayIso());
  const yn = (legend: string, key: "elevator" | "centralHeating" | "mixedUse") => <ChoiceChips<"no" | "yes"> legend={legend} value={x[key] ? "yes" : "no"} options={[{ value: "no", label: "아니요" }, { value: "yes", label: "예" }]} onChange={(v) => upd({ [key]: v === "yes" })} />;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="세대 수" suffix="세대" value={x.households} onChange={(v) => upd({ households: Math.max(0, Math.round(v)) })} />
        <DateField label="사용검사(승인)일" value={x.useApproval ?? ""} onChange={(v) => upd({ useApproval: v || undefined })} />
        <DateField label="우리 집 인도(입주)일" value={x.handover ?? ""} onChange={(v) => upd({ handover: v || undefined })} />
      </div>
      <div className="flex flex-wrap gap-3">
        {yn("승강기가 있나요?", "elevator")}
        {yn("중앙집중식·지역난방인가요?", "centralHeating")}
        {yn("주상복합인가요?", "mixedUse")}
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">의무관리대상 {r.mandatory.mandatory ? `이에요(${r.mandatory.reasons.join(", ")})` : "이 아니에요"}</p>
        <p className="mt-1 text-muted-foreground">{r.mandatory.note}</p>
        <ul className="mt-3 space-y-2">
          {r.items.map((i) => <li key={i.id} className={i.passed ? "text-muted-foreground line-through" : "text-foreground"}><span className="font-mono">{i.date}</span> {i.label} <span className="text-xs text-muted-foreground">({i.cite})</span></li>)}
        </ul>
        <p className="mt-2 text-muted-foreground">하자를 발견하면 기간이 끝나기 전에 관리주체·사업주체에 서면으로 보수를 청구하세요. 청구를 받은 쪽은 15일 안에 보수하거나 계획을 알려야 해요(제37조).</p>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{FH_NOTE} 기준일 {FH_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </div>
  );
}
