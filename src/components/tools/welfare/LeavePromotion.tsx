// 연차 사용촉진 날짜 계산 (2026-11-16, Gemini 이전 A). 계산: lib/kr-welfare-2026.ts leavePromotionSchedule.
import { useState } from "react";
import { WELFARE_AS_OF, leavePromotionSchedule, type LeavePromotionKind } from "../../../lib/kr-welfare-2026";
import { daysBetween } from "../../../lib/kr-expert-guide-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DeadlineChart from "../viz/DeadlineChart";
import ModeToggle from "../viz/ModeToggle";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, useSaved } from "./common";

const TOOL_ID = "annual-leave-promotion-planner";
const KINDS: { value: LeavePromotionKind; label: string }[] = [
  { value: "annual", label: "1년 넘게 일한 연차(15일~)" },
  { value: "firstYear", label: "입사 첫해 월차(1년 미만)" },
];
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const STAT_LABEL: Record<string, string> = { notify: "1차 서면 촉구 마감", assign: "회사 지정 통보 마감", assignLate: "추가분 지정 통보 마감" };
const CITE = { annual: "근로기준법 제61조①", firstYear: "근로기준법 제61조②" } as const;

export default function LeavePromotion() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [state, setState, reset] = useSaved<{ kind: LeavePromotionKind; end: string; role: "worker" | "company" }>("labor-leave-promotion", { kind: "annual", end: "2027-12-31", role: "worker" });
  const [delay, setDelay] = useState(0);
  const easy = mode === "easy";
  const today = todayIso();
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(state.end);
  const steps = valid ? leavePromotionSchedule(state.kind, state.end) : [];
  const rows = steps.map((s) => ({ id: s.id, label: s.label, due: s.due, daysLeft: daysBetween(today, s.due), cite: CITE[state.kind], note: s.from ? `${s.from}부터` : undefined }));
  const assign = steps.find((s) => s.id === "assign");
  const headline = state.role === "worker"
    ? `회사가 ${assign?.due ?? "-"}까지 이 절차를 모두 서면으로 지켰을 때만 남은 연차수당을 안 줘도 돼요. 하나라도 빠지면 수당을 청구할 수 있어요.`
    : `수당 의무를 없애려면 표의 회사 단계를 모두 서면으로, 날짜 안에 해야 해요. 마지막 회사 기한은 ${assign?.due ?? "-"}이에요.`;
  const reasons = [
    "촉구와 지정 통보는 서면(전자결재·이메일 포함, 개별 통보)이어야 해요. 단체 문자·게시판 공지는 인정되지 않을 수 있어요.",
    "회사가 날짜를 정해 줬는데도 근로자가 출근해 일하면, 회사가 노무 수령을 거부한다는 뜻을 분명히 밝혀야 수당 의무가 없어져요.",
    "5명 미만 사업장은 연차휴가 자체가 적용되지 않아요(시행령 별표 1).",
  ];
  const memo = () =>
    [
      `[연차 사용촉진 일정] 기준일 ${WELFARE_AS_OF}, ${KINDS.find((k) => k.value === state.kind)?.label}, 사용기간 끝 ${state.end}`,
      ...steps.map((s) => `- ${s.label}: ${s.from ? `${s.from} ~ ` : ""}${s.due}`),
      `근거: ${CITE[state.kind]}. 절차를 지키면 미사용 연차수당 의무 면제.`,
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <ChoiceChips<LeavePromotionKind> legend="어떤 연차인가요?" value={state.kind} options={KINDS} onChange={(v) => setState({ ...state, kind: v })} />
          <ChoiceChips<"worker" | "company"> legend="누가 보나요?" value={state.role} options={[{ value: "worker", label: "근로자" }, { value: "company", label: "회사·인사 담당" }]} onChange={(v) => setState({ ...state, role: v })} />
        </div>
        <label className="block">
          <span className="text-sm font-medium text-muted-foreground">{state.kind === "annual" ? (easy ? "연차를 쓸 수 있는 마지막 날(회계연도면 12-31)" : "연차 사용기간 종료일") : easy ? "입사 1년이 되기 전날(예: 1월 2일 입사면 다음 해 1월 1일)" : "최초 1년 근로기간 종료일"}</span>
          <input type="date" value={state.end} onChange={(e) => setState({ ...state, end: e.target.value })} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-base" />
        </label>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard headline={headline} reasons={reasons} easy={easy} stats={steps.filter((s) => STAT_LABEL[s.id]).map((s) => ({ label: STAT_LABEL[s.id], value: s.due }))} />
        {valid && <DeadlineChart title="촉진 절차 날짜" caption="오늘부터 남은 날이에요. 슬라이더로 '며칠 뒤에 시작하면' 놓치는 단계를 봐요." rows={rows} delay={delay} />}
        <label className="block">
          <span className="text-sm text-muted-foreground">며칠 뒤에 시작하면? {delay}일</span>
          <input type="range" min={0} max={180} value={delay} onChange={(e) => setDelay(Number(e.target.value))} className="mt-1 w-full" aria-label="며칠 뒤에 시작하면" />
        </label>
        {easy ? (
          <HowToApply
            title={state.role === "worker" ? "근로자가 챙길 것" : "회사가 챙길 것"}
            items={
              state.role === "worker"
                ? ["촉구 서면을 받았는지, 받은 날짜를 기록해요.", "받았다면 10일 안에 쓸 날을 정해 회사에 알려요.", "절차가 빠졌다면 남은 연차는 수당으로 청구할 수 있어요(3년 안)."]
                : ["근로자별로 남은 일수를 적은 촉구서를 개별 서면으로 보내요.", "10일 안에 답이 없으면 기한 안에 날짜를 지정해 서면 통보해요.", "지정한 날 출근하면 노무 수령 거부 의사를 서면으로 남겨요."]
            }
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <CopyMemo text={memo} />
            <button type="button" onClick={reset} className="min-h-11 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-muted">
              예시로 되돌리기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
