// 특허·상표 기한 한 장 (2026-11-20, 전수조사 10번). 계산: lib/kr-ip-deadlines-2026.ts (법령 길잡이 스킬 guide.mjs calc ip와 같은 코드)
import { useState } from "react";
import { IP_AS_OF, IP_NOTE, ipDeadlines, type IpInput, type IpKind } from "../../../lib/kr-ip-deadlines-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import { track } from "../viz/track";

const TOOL_ID = "ip-deadline-calculator";
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function IpDeadlines() {
  const today = todayIso();
  const [x, setX] = useState<IpInput>({ kind: "patent", disclosed: "2026-03-02", filed: "2026-05-15" });
  const upd = (p: Partial<IpInput>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const list = ipDeadlines(x, today);
  const date = (label: string, key: keyof IpInput) => <DateField label={label} value={(x[key] as string) ?? ""} onChange={(v) => upd({ [key]: v || undefined } as Partial<IpInput>)} />;
  return (
    <div className="space-y-5">
      <ChoiceChips<IpKind> legend="어떤 권리인가요?" value={x.kind} options={[{ value: "patent", label: "특허" }, { value: "utility", label: "실용신안" }, { value: "design", label: "디자인" }, { value: "trademark", label: "상표" }]} onChange={(v) => upd({ kind: v })} />
      <p className="text-sm text-muted-foreground">아는 날짜만 넣으세요. 비워 둔 항목은 건너뛰어요.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {x.kind !== "trademark" && date("발명·디자인을 처음 공개한 날", "disclosed")}
        {date("출원일", "filed")}
        {date("우선일(먼저 낸 출원일, 있으면)", "priority")}
        {date("의견제출통지서 받은 날", "noticeServed")}
        {date("거절결정 등본 받은 날", "rejectionServed")}
        {date(x.kind === "trademark" ? "등록결정 등본 받은 날" : "특허·등록결정 등본 받은 날", "decisionServed")}
        {date("설정등록일", "registered")}
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        {list.length === 0 ? <p className="text-foreground">날짜를 넣으면 기한이 나와요.</p> : (
          <>
            <p className="text-lg font-semibold text-foreground">{list.find((d) => (d.daysLeft ?? 0) >= 0) ? `가장 가까운 기한: ${list.find((d) => (d.daysLeft ?? 0) >= 0)!.label} ${list.find((d) => (d.daysLeft ?? 0) >= 0)!.due}` : "남은 기한이 없어요"}</p>
            <ul className="mt-2 space-y-2">
              {list.map((d) => (
                <li key={d.id} className={(d.daysLeft ?? 0) < 0 ? "text-muted-foreground line-through" : "text-foreground"}>
                  <span className="font-mono">{d.due}</span> {d.label} {(d.daysLeft ?? 0) >= 0 ? `(D-${d.daysLeft})` : "(지남)"}{d.shifted ? " · 휴일이라 미뤄짐" : ""}
                  <span className="block text-xs text-muted-foreground">{d.cite}{d.note ? ` · ${d.note}` : ""}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{IP_NOTE} 기준일 {IP_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </div>
  );
}
