// 2026 귀속 연말정산 미리보기·간소화 시즌 안내. 계산: lib/kr-year-end-preview-2026.ts
import { useState } from "react";
import { tipsFor, yearEndTimeline, YE_PREVIEW_AS_OF, type Who } from "../../../lib/kr-year-end-preview-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import CalendarShell, { forMode } from "../viz/CalendarShell";
import { track } from "../viz/track";
import { useToday } from "./Items";

const TOOL_ID = "year-end-settlement-preview-2026";
const WHO: { value: Who | "all"; label: string }[] = [{ value: "all", label: "전부" }, { value: "single", label: "혼자 사는 직장인" }, { value: "parent", label: "자녀·부모를 부양" }, { value: "renter", label: "월세 사는 직장인" }];
const dday = (n: number | null) => (n == null ? "공지 확인" : n < 0 ? `${-n}일 지남` : n === 0 ? "오늘까지" : `D-${n}`);

export default function YearEndPreview2026() {
  const today = useToday() ?? YE_PREVIEW_AS_OF;
  const [who, setWho] = useState<Who | "all">("all");
  const events = yearEndTimeline(today);
  const tips = tipsFor(who);
  return (
    <CalendarShell toolId={TOOL_ID} lang="ko" events={events}>
      {(mode) => (
        <>
          <ol className="space-y-3 rounded-md border border-border bg-card px-4 py-4 text-sm">
            {(mode === "easy" ? forMode(events, mode).concat(events.filter((e) => e.date == null).slice(0, 1)) : events).map((e) => (
              <li key={e.id}>
                <p className="font-semibold"><span className="font-mono">{e.date ?? "날짜 공지 전"}</span><span className="ml-2 font-normal text-muted-foreground">{dday(e.daysLeft)}</span></p>
                <p>{e.label}{mode === "expert" && <span className="text-xs text-muted-foreground"> ({e.cite})</span>}</p>
                {e.note && <p className="text-xs text-muted-foreground">{e.note}</p>}
              </li>
            ))}
          </ol>
          <ChoiceChips<Who | "all"> legend="12월에 챙길 것, 내 상황은?" value={who} options={WHO} onChange={(v) => { setWho(v); track("tool_calculate", { tool_id: TOOL_ID }, true); }} />
          <ul className="grid gap-3 sm:grid-cols-2">
            {tips.map((t) => (
              <li key={t.id} className="rounded-md border border-border px-4 py-3 text-sm">
                <p className="font-semibold">{t.title}{t.change2026 && <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">2026 바뀜</span>}</p>
                <p className="mt-1">{t.body}</p>
                {mode === "expert" && <p className="mt-1 text-xs text-muted-foreground">근거: {t.cite}</p>}
                <a href={t.href} className="mt-2 inline-block py-1 text-primary underline underline-offset-4">{t.tool}로 계산하기</a>
              </li>
            ))}
          </ul>
          <p className="text-xs leading-5 text-muted-foreground">국세청 안내를 정리한 일반 정보예요. 세무 상담이나 신고 대행이 아니에요. 간소화 개통일과 회사 제출일은 공지가 나오면 확인해요. 기준일 {YE_PREVIEW_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
        </>
      )}
    </CalendarShell>
  );
}
