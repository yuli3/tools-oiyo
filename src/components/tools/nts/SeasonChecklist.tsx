// 1~3월 세무 시즌 점검표 (2026-11-21). 계산: lib/kr-season-2027.ts. 체크 표시는 이 브라우저에만 남아요.
import { useEffect, useState } from "react";
import { ROLE_LABEL, SEASON_AS_OF, seasonPlan, type Role } from "../../../lib/kr-season-2027";
import ChoiceChips from "../payroll/ChoiceChips";
import DeadlineChart from "../viz/DeadlineChart";
import ModeToggle from "../viz/ModeToggle";
import { track } from "../viz/track";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { useToday } from "./Items";

const TOOL_ID = "tax-season-checklist-2027";
const KEY = "oiyo-season-2027";
const ROLES = Object.keys(ROLE_LABEL) as Role[];
const dday = (n: number | null) => (n == null ? "회사·기관 공지" : n < 0 ? `${-n}일 지남` : n === 0 ? "오늘까지" : `D-${n}`);

export default function SeasonChecklist() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [role, setRole] = useState<Role>("employee");
  const [done, setDone] = useState<Record<string, boolean>>({});
  const today = useToday() ?? SEASON_AS_OF;
  useEffect(() => { try { setDone(JSON.parse(localStorage.getItem(KEY) ?? "{}")); } catch { /* 저장소를 못 쓰면 빈 목록 */ } }, []);
  const toggle = (id: string) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* noop */ }
    track("tool_calculate", { tool_id: TOOL_ID }, true);
  };
  const rows = seasonPlan(role, today);
  const open = rows.filter((r) => !done[r.id]);
  const shown = mode === "easy" ? open.slice(0, 5) : rows;
  const dated = rows.filter((r) => r.due && !done[r.id]).map((r) => ({ id: r.id, label: r.label, due: r.due!, daysLeft: r.daysLeft!, cite: r.cite }));
  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <ChoiceChips<Role> legend="누구의 할 일을 볼까요?" value={role} options={ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} onChange={(v) => { setRole(v); track("tool_calculate", { tool_id: TOOL_ID }, true); }} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{open.length ? `남은 일 ${open.length}개${open[0]?.due ? ` · 가장 가까운 기한 ${open[0].due} (${dday(open[0].daysLeft)})` : ""}` : "모두 끝냈어요"}</p>
        <ul className="mt-3 space-y-3">
          {shown.map((r) => (
            <li key={r.id}>
              <label className="flex min-h-11 items-start gap-3">
                <input type="checkbox" className="mt-1 size-5 shrink-0 accent-(--primary)" checked={!!done[r.id]} onChange={() => toggle(r.id)} />
                <span className={done[r.id] ? "text-muted-foreground line-through" : "text-foreground"}>
                  <span className="font-semibold">{r.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {r.due ? `${r.due} (${dday(r.daysLeft)})${r.shifted ? ` · 법정 ${r.statutory}이 휴일이라 미뤄졌어요` : ""}` : r.note ?? "회사·기관 공지 확인"}
                    {mode === "expert" && ` · ${r.cite}`}
                  </span>
                  {r.tool && <a className="text-xs text-primary underline" href={r.tool.href}>{r.tool.name}</a>}
                </span>
              </label>
            </li>
          ))}
        </ul>
        {mode === "easy" && open.length > 5 && <p className="mt-2 text-xs text-muted-foreground">전문가 모드에서 나머지 {open.length - 5}개와 근거 조문을 볼 수 있어요.</p>}
      </div>
      {dated.length > 0 && <DeadlineChart title="기한까지 남은 날" caption="휴일이면 다음 영업일로 미룬 날짜예요. 체크한 일은 빠져요." rows={dated} />}
      <p className="text-xs leading-5 text-muted-foreground">법정 기한을 정리한 일반 정보예요. 회사 마감일과 국세청 서비스 개통일은 공지로 확인해요. 신고서 작성·제출은 직접 하거나 세무 전문가에게 맡겨요. 체크 표시는 이 브라우저에만 남아요. 기준일 {SEASON_AS_OF}.</p>
    </div>
  );
}
