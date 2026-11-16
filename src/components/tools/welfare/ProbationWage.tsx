// 수습 최저임금 점검 (2026-11-16, Gemini 이전 A). 계산: lib/kr-welfare-2026.ts probationMinWage.
import { WELFARE_AS_OF, MIN_WAGE_2026, probationMinWage, type ProbationInput } from "../../../lib/kr-welfare-2026";
import { PROBATION_ASSUMPTIONS, probationShort } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "probation-minimum-wage-checker";
const EXAMPLE: ProbationInput = { hourlyWage: 9_300, contractMonths: 0, monthsIntoProbation: 1, simpleLabor: false };
const CONTRACT = [
  { value: "open", label: "기간 없음(정규직)" },
  { value: "year", label: "1년 이상" },
  { value: "short", label: "1년 미만" },
] as const;
type Contract = (typeof CONTRACT)[number]["value"];
const WHY = {
  reduced: "1년 이상 계약이고 수습 3개월 안이라 최저임금의 90%(시급 9,288원)까지 줄 수 있어요.",
  shortContract: "계약 기간이 1년 미만이면 수습이어도 최저임금 100%를 줘야 해요.",
  simpleLabor: "단순노무직(청소·경비·배달·주방 보조·매장 정리 등, 고용노동부 고시)은 수습이어도 감액할 수 없어요.",
  afterThreeMonths: "수습을 시작하고 3개월이 지나면 감액이 끝나 최저임금 100%예요.",
} as const;

export default function ProbationWage() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<ProbationInput>("labor-probation", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<ProbationInput>) => setInput({ ...input, ...p });
  const r = probationMinWage(input);
  const contract: Contract = input.contractMonths === 0 ? "open" : input.contractMonths >= 12 ? "year" : "short";
  const headline = r.ok ? `시급 ${input.hourlyWage.toLocaleString("ko-KR")}원은 지금 받아야 할 최저 ${r.minimum.toLocaleString("ko-KR")}원 이상이에요.` : `최저임금보다 시급 ${r.shortHourly.toLocaleString("ko-KR")}원, 한 달 약 ${roughWon(r.shortMonthly)} 적게 받고 있어요.`;
  const reasons = [WHY[r.why], "수습 기간에도 3개월 이상 일했다면 해고하려면 30일 전 예고나 해고예고수당이 필요해요(근로기준법 제26조). 3개월 미만이면 예고 의무가 없어요."];

  const memo = () =>
    [
      `[수습 최저임금 점검] 기준일 ${WELFARE_AS_OF}`,
      `시급 ${exactWon(input.hourlyWage)}, 계약 ${contract === "open" ? "기간 없음" : `${input.contractMonths}개월`}, 수습 ${input.monthsIntoProbation}개월째, 단순노무 ${input.simpleLabor ? "예" : "아니요"}`,
      `적용 최저 시급 ${exactWon(r.minimum)} → ${r.ok ? "충족" : `부족 시급 ${exactWon(r.shortHourly)}, 월 ${exactWon(r.shortMonthly)}`}`,
      "근거: 최저임금법 제5조②, 시행령 제3조, 고용노동부고시(단순노무직종), 2026 최저임금 10,320원.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "받는 시급(월급이면 ÷ 209)" : "시간급(통상 시급)"} value={input.hourlyWage} onChange={(v) => edit({ hourlyWage: v })} hint="예: 9,300" />
          <NumberField label={easy ? "수습 시작하고 몇 달째(첫 달 0)" : "수습 경과 개월"} value={input.monthsIntoProbation} onChange={(v) => edit({ monthsIntoProbation: v })} suffix="개월" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ChoiceChips<Contract> legend="근로계약 기간" value={contract} options={CONTRACT} onChange={(v) => edit({ contractMonths: v === "open" ? 0 : v === "year" ? 12 : 6 })} />
          <ChoiceChips<"yes" | "no"> legend={easy ? "청소·경비·배달·주방 보조 같은 단순 업무인가요?" : "단순노무직종 해당"} value={input.simpleLabor ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ simpleLabor: v === "yes" })} />
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={headline}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "지금 받아야 할 최저 시급", value: `${r.minimum.toLocaleString("ko-KR")}원` },
            { label: "월 최저(209시간)", value: money(r.monthlyMinimum) },
            { label: "한 달 부족액", value: money(r.shortMonthly) },
          ]}
        />
        <CompareBars
          title="시급 비교"
          items={[
            { label: "내 시급", value: input.hourlyWage, current: true },
            { label: "수습 90%", value: Math.round(MIN_WAGE_2026 * 0.9) },
            { label: "2026 최저임금", value: MIN_WAGE_2026 },
          ]}
          format={(n) => `${Math.round(n).toLocaleString("ko-KR")}원`}
        />
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={PROBATION_ASSUMPTIONS}
          evaluate={probationShort}
          sliders={["hourlyWage", "monthsIntoProbation"]}
          sweeps={["hourlyWage", "monthsIntoProbation"]}
          yLabel="한 달 부족액"
          formatY={roughWon}
          noTornado
          caption={(k) => (k === "monthsIntoProbation" ? "3개월째부터 기준이 100%로 올라 같은 시급이어도 부족액이 생길 수 있어요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="모자라면 이렇게 해요"
            items={["근로계약서와 급여명세서를 모아 두어요.", "회사에 차액을 요청하고, 안 주면 노동포털(labor.moel.go.kr)에 최저임금 위반 진정을 내요.", "차액은 3년 안에 청구할 수 있어요."]}
            note="최저임금 위반은 3년 이하 징역 또는 2천만 원 이하 벌금 대상이에요(최저임금법 제28조). 상담 1350."
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
