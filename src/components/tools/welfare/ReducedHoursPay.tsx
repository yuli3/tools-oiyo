// 육아기 근로시간 단축 급여 (2026-11-16, Gemini 이전 A). 계산: lib/kr-welfare-2026.ts reducedHoursPay.
import { WELFARE_AS_OF, REDUCED_HOURS_2026, reducedHoursPay, type ReducedHoursInput } from "../../../lib/kr-welfare-2026";
import { REDUCED_ASSUMPTIONS, reducedPlain, reducedTotal } from "../../../lib/kr-welfare-scenarios";
import NumberField from "../payroll/NumberField";
import BridgeChart from "../viz/BridgeChart";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "reduced-hours-childcare-pay-calculator";
const EXAMPLE: ReducedHoursInput = { monthlyOrdinaryWage: 3_000_000, beforeHours: 40, afterHours: 30 };

export default function ReducedHoursPay() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<ReducedHoursInput>("labor-reduced-hours", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<ReducedHoursInput>) => setInput({ ...input, ...p });
  const r = reducedHoursPay(input);
  const plain = reducedPlain(input);
  const reasons = [...plain.reasons, `원래 월급보다 한 달 약 ${roughWon(r.loss)} 적어요.`];

  const memo = () =>
    [
      `[육아기 근로시간 단축 급여 추정] 기준일 ${WELFARE_AS_OF}`,
      `월 통상임금 ${exactWon(input.monthlyOrdinaryWage)}, 주 ${r.before}시간 → ${r.after}시간`,
      `처음 ${r.firstCut}시간분 ${exactWon(r.first)} + 나머지 ${r.restCut}시간분 ${exactWon(r.rest)} = 단축급여 ${exactWon(r.benefit)}`,
      `회사 월급 ${exactWon(r.companyPay)} + 단축급여 = ${exactWon(r.total)}(원래보다 ${exactWon(r.loss)} 적음)`,
      `근거: 고용보험법 제73조의2, 시행령 제104조의2(2026 상한 ${REDUCED_HOURS_2026.capFirst.toLocaleString("ko-KR")}원·${REDUCED_HOURS_2026.capRest.toLocaleString("ko-KR")}원), 남녀고용평등법 제19조의2.`,
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <MoneyField label={easy ? "줄이기 전 한 달 월급(기본급 + 매달 고정 수당)" : "단축 개시일 기준 월 통상임금"} value={input.monthlyOrdinaryWage} onChange={(v) => edit({ monthlyOrdinaryWage: v })} hint="예: 300만" />
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label={easy ? "지금 한 주에 일하는 시간" : "단축 전 주 소정근로시간"} value={input.beforeHours} onChange={(v) => edit({ beforeHours: v })} suffix="시간" />
          <NumberField label={easy ? "줄인 뒤 한 주에 일할 시간(15~35)" : "단축 후 주 소정근로시간"} value={input.afterHours} onChange={(v) => edit({ afterHours: v })} suffix="시간" />
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={plain.headline}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "고용보험 단축급여(월)", value: money(r.benefit) },
            { label: "회사 월급(월)", value: money(r.companyPay) },
            { label: "합계(월)", value: money(r.total) },
          ]}
        />
        {r.valid && (
          <BridgeChart
            title="한 달에 받는 돈은 이렇게 쌓여요"
            steps={[
              { label: `회사 월급 (주 ${r.after}시간)`, value: r.companyPay, kind: "add" },
              { label: `처음 ${r.firstCut}시간분 100%`, value: r.first, kind: "add" },
              ...(r.restCut > 0 ? [{ label: `나머지 ${r.restCut}시간분 80%`, value: r.rest, kind: "add" as const }] : []),
              { label: "합계", value: r.total, kind: "total" },
            ]}
            format={money}
          />
        )}
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={REDUCED_ASSUMPTIONS(input)}
          evaluate={reducedTotal}
          sliders={["afterHours", "monthlyOrdinaryWage"]}
          sweeps={["afterHours", "monthlyOrdinaryWage"]}
          yLabel="한 달에 받는 돈(회사 + 단축급여)"
          formatY={roughWon}
          caption={(k) => (k === "afterHours" ? "처음 10시간까지는 줄여도 받는 돈이 거의 같고, 그보다 더 줄이면 80%만 채워져 조금씩 줄어요." : "월급이 250만 원을 넘으면 처음 10시간분이 상한에 걸려요.")}
        />
        {easy ? (
          <HowToApply
            items={[
              "만 12세 이하(초등 6학년 이하) 자녀가 있고, 고용보험 가입 기간(피보험 단위기간)이 180일 이상이어야 해요.",
              "회사에 단축 시작 30일 전까지 신청해요. 회사는 정해진 사유가 없으면 거절할 수 없어요.",
              "단축을 시작하고 1개월이 지나면 고용24(work24.go.kr)에서 매달 또는 한꺼번에 신청해요. 끝난 뒤 12개월 안에 해야 해요.",
              "기본 1년에 쓰지 않은 육아휴직 기간의 2배를 더 쓸 수 있어요(최대 3년). 1개월 단위로 나눠 써도 돼요.",
            ]}
            note="단축 기간은 퇴직금 평균임금 계산에서 빼요(남녀고용평등법 제19조의3). 상담 1350."
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
