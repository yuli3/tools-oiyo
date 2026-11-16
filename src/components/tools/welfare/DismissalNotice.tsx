// 해고예고수당 (2026-11-16, Gemini 이전 A). 계산: lib/kr-welfare-2026.ts dismissalNoticePay.
import { WELFARE_AS_OF, dismissalNoticePay, type DismissalNoticeInput, type NoticeException } from "../../../lib/kr-welfare-2026";
import { NOTICE_ASSUMPTIONS, noticePayAmount, noticePlain } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "dismissal-notice-pay-calculator";
const EXAMPLE: DismissalNoticeInput = { monthlyOrdinaryWage: 3_000_000, weeklyHours: 40, noticeDays: 7, tenureMonths: 14, exception: "none", fivePlus: true };
const EXCEPTIONS: { value: NoticeException; label: string }[] = [
  { value: "none", label: "해당 없음" },
  { value: "disaster", label: "천재지변 등으로 사업 중단" },
  { value: "misconduct", label: "고의로 큰 손해(회사 주장)" },
];
const SIZE = [
  { value: "5plus", label: "5명 이상" },
  { value: "under5", label: "5명 미만" },
] as const;

export default function DismissalNotice() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<DismissalNoticeInput>("labor-dismissal-notice", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<DismissalNoticeInput>) => setInput({ ...input, ...p });
  const r = dismissalNoticePay(input);
  const plain = noticePlain(input);
  const reasons = [...plain.reasons];
  reasons.push(input.fivePlus ? "5명 이상 사업장은 해고 사유와 날짜를 서면으로 알려야 하고(제27조), 부당하면 3개월 안에 노동위원회에 구제신청할 수 있어요(제28조)." : "5명 미만 사업장도 해고예고(제26조)는 적용돼요. 서면통지·부당해고 구제신청은 적용되지 않아요.");

  const memo = () =>
    [
      `[해고예고수당 추정] 기준일 ${WELFARE_AS_OF}`,
      `월 통상임금 ${exactWon(input.monthlyOrdinaryWage)}, 주 ${input.weeklyHours}시간, 근무 ${input.tenureMonths}개월, 예고 ${input.noticeDays}일 전`,
      `1일 통상임금 ${exactWon(r.daily)} × 30일 = ${exactWon(r.full)} → 받을 돈 ${exactWon(r.amount)}`,
      "근거: 근로기준법 제26조(해고의 예고), 제27조(서면통지), 제28조(구제신청 3개월), 제49조(임금 시효 3년).",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <MoneyField label={easy ? "한 달 월급(기본급 + 매달 고정 수당, 세금 떼기 전)" : "월 통상임금"} value={input.monthlyOrdinaryWage} onChange={(v) => edit({ monthlyOrdinaryWage: v })} hint="예: 300만" />
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label={easy ? "해고일 며칠 전에 들었나요" : "예고 일수(당일 0)"} value={input.noticeDays} onChange={(v) => edit({ noticeDays: v })} suffix="일" />
          <NumberField label={easy ? "입사하고 일한 기간" : "계속 근로기간"} value={input.tenureMonths} onChange={(v) => edit({ tenureMonths: v })} suffix="개월" />
          <NumberField label="주 소정근로시간" value={input.weeklyHours} onChange={(v) => edit({ weeklyHours: v })} suffix="시간" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ChoiceChips<"5plus" | "under5"> legend="회사 직원 수" value={input.fivePlus ? "5plus" : "under5"} options={SIZE} onChange={(v) => edit({ fivePlus: v === "5plus" })} />
          <ChoiceChips<NoticeException> legend={easy ? "회사가 예외라고 하나요?" : "제26조 단서 예외"} value={input.exception} options={EXCEPTIONS} onChange={(v) => edit({ exception: v })} />
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={plain.headline}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "받을 해고예고수당", value: money(r.amount) },
            { label: "30일분 통상임금", value: money(r.full) },
            { label: "모자란 예고 일수", value: `${r.missingDays}일` },
          ]}
        />
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={NOTICE_ASSUMPTIONS}
          evaluate={noticePayAmount}
          sliders={["noticeDays", "monthlyOrdinaryWage"]}
          sweeps={["noticeDays", "tenureMonths", "monthlyOrdinaryWage"]}
          yLabel="해고예고수당"
          formatY={roughWon}
          caption={(k) => (k === "noticeDays" ? "29일 전에 알려도 30일분 전액이에요. 30일이 되는 순간 0원으로 떨어져요." : k === "tenureMonths" ? "3개월 미만이면 0원, 3개월부터 30일분이에요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 받아요"
            items={[
              "해고 통보 문자·메일·서면과 마지막 출근일을 캡처해 두어요.",
              "회사에 해고예고수당을 달라고 요청하고, 안 주면 고용노동부 노동포털(labor.moel.go.kr)에 임금체불 진정을 내요.",
              "임금이라 3년 안에 청구해야 해요(제49조).",
              input.fivePlus ? "해고 자체가 부당하다고 생각하면 해고일부터 3개월 안에 지방노동위원회에 구제신청해요." : "5명 미만 사업장은 노동위원회 구제신청이 안 돼 민사소송으로 다퉈요.",
            ]}
            note="1350(고용노동부)과 132(대한법률구조공단)에서 무료 상담을 받을 수 있어요."
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
