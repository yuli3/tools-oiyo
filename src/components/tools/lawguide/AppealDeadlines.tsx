// 불복·이의·청구 기한 한곳에 (2026-11-20, 전수조사 1번). 계산: lib/kr-appeal-deadlines-2026.ts (법령 길잡이 분야별 기한 규칙을 그대로 모음)
import { useState } from "react";
import { APPEAL_AS_OF, APPEAL_NOTE, APPEAL_RULES, appealsFrom } from "../../../lib/kr-appeal-deadlines-2026";
import type { DomainId } from "../../../lib/kr-expert-guide-2026";
import DateField from "../payroll/DateField";
import { track } from "../viz/track";

const TOOL_ID = "appeal-deadline-calculator";
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const AREAS = [...new Map(APPEAL_RULES.map((a) => [a.domain, a.area])).entries()];
const left = (n?: number) => (n === undefined ? "" : n < 0 ? `${-n}일 지남` : n === 0 ? "오늘까지" : `${n}일 남음`);

export default function AppealDeadlines() {
  const today = todayIso();
  const [from, setFrom] = useState(today);
  const [domain, setDomain] = useState<DomainId | "">("");
  const list = from ? appealsFrom(from, today, domain || undefined) : [];
  return (
    <div className="space-y-5">
      <DateField label="처분·결정·통지를 받은 날(안 날)" value={from} onChange={(v) => { setFrom(v); track("tool_calculate", { tool_id: TOOL_ID }, true); }} />
      <fieldset>
        <legend className="text-sm font-medium text-muted-foreground">분야</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[["", "전체"] as const, ...AREAS].map(([id, area]) => (
            <button
              key={id || "all"}
              type="button"
              aria-pressed={domain === id}
              onClick={() => { setDomain(id as DomainId | ""); track("appeal_domain", { tool_id: TOOL_ID, domain: id || "all" }); }}
              className={"min-h-11 rounded-md border px-3 text-sm font-semibold " + (domain === id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted")}
            >
              {area}
            </button>
          ))}
        </div>
      </fieldset>
      <ul className="space-y-2" aria-live="polite">
        {list.map((a) => (
          <li key={a.key} className="rounded-md border border-border bg-background p-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="font-semibold text-foreground">{a.label}</span>
              <span className={"font-mono text-xs " + ((a.daysLeft ?? 0) < 0 ? "text-destructive" : "text-muted-foreground")}>
                {a.due}까지 · {left(a.daysLeft)}{a.shifted ? " · 휴일이라 다음 날로" : ""}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{a.area} · {a.topic} · {a.period} · {a.cite}</p>
          </li>
        ))}
      </ul>
      <p className="text-xs leading-5 text-muted-foreground">{APPEAL_NOTE} 기준일 {APPEAL_AS_OF}. 입력한 날짜는 서버로 보내지 않아요.</p>
    </div>
  );
}
