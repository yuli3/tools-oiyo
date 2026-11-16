// 퇴직금 한국어판 (2026-11-16 쉬운 설명·가정 변화 적용). 월급·햇수로 먼저 어림하고, 날짜·자격 확인 계산은 아래 정밀 계산기에서 해요.
import { SEVERANCE_ASSUMPTIONS, severanceBridge, severanceEstimate, severanceGross, severancePlain, type SeveranceLite } from "../../lib/kr-tax-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";
import SeveranceCalculator from "./SeveranceCalculator";

const KEYS = ["monthly", "years", "bonus", "leavePay"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: SeveranceLite = { monthly: 3_000_000, years: 5, bonus: 0, leavePay: 0 };

export default function KrSeveranceScenario() {
  return (
    <ScenarioTool<SeveranceLite, Key>
      toolId="severance-calculator"
      example={EXAMPLE}
      assumptions={SEVERANCE_ASSUMPTIONS}
      keys={KEYS}
      evaluate={severanceGross}
      resultName="퇴직금(세전)"
      questions={({ input, edit }) => [
        {
          title: "그만두기 전 3개월 동안 월급은 얼마였나요?",
          keys: ["monthly"],
          body: (
            <>
              <MoneyField label="세전 월급(야근·주휴수당 포함)" value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} />
              <p className="mt-2 text-xs text-muted-foreground">달마다 다르면 3개월 합계를 3으로 나눠 넣어 주세요.</p>
            </>
          ),
        },
        {
          title: "이 회사에서 얼마나 일했나요?",
          keys: ["years"],
          body: <NumberField label="일한 기간(6개월이면 0.5)" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={0.5} min={0} />,
        },
        {
          title: "상여금이나 연차수당을 받았나요?",
          keys: ["bonus", "leavePay"],
          body: (
            <div className="grid gap-3 sm:grid-cols-2">
              <MoneyField label="1년 상여금(정기적으로 받은 것)" value={input.bonus} onChange={(v) => edit({ bonus: v }, ["bonus"])} />
              <MoneyField label="1년 연차수당" value={input.leavePay} onChange={(v) => edit({ leavePay: v }, ["leavePay"])} />
            </div>
          ),
        },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-4">
          <MoneyField label="3개월 월평균 임금" value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} />
          <NumberField label="계속근로기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={0.5} min={0} />
          <MoneyField label="연간 상여금" value={input.bonus} onChange={(v) => edit({ bonus: v }, ["bonus"])} />
          <MoneyField label="연차수당" value={input.leavePay} onChange={(v) => edit({ leavePay: v }, ["leavePay"])} />
        </div>
      )}
      summary={severancePlain}
      metrics={(i, s) => {
        const r = severanceEstimate(i);
        return [
          { label: "퇴직금(세전)", value: s.money(r.gross), tone: "primary" },
          { label: "세금 떼고 받는 돈", value: s.money(r.net) },
          { label: "1일 평균임금", value: s.money(r.daily) },
        ];
      }}
      sliders={["monthly", "years", "bonus"]}
      sweepCaption={(a) => (a.key === "years" ? "1년이 안 되면 퇴직금이 없어요. 그 뒤로는 일한 기간에 거의 정비례해요." : undefined)}
      charts={(i, s) => <BridgeChart title="퇴직금에서 세금을 떼면" steps={severanceBridge(i)} format={s.money} />}
      ask={[
        "4주 평균으로 주 15시간 미만 일한 기간은 퇴직금 계산에서 빠져요.",
        "퇴직연금(DC형)이면 회사가 적립한 금액과 운용 수익으로 받아서 이 어림과 다를 수 있어요.",
        "퇴직 후 14일 안에 받아야 해요. 못 받으면 고용노동부에 진정할 수 있어요.",
      ]}
      expertFooter={(i) => {
        const r = severanceEstimate(i);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `3개월 임금총액 ≈ ${exactWon(i.monthly)} × 3 + (상여 ${exactWon(i.bonus)} + 연차수당 ${exactWon(i.leavePay)}) × 3/12`,
                `1일 평균임금 ≈ 3개월 임금총액 ÷ 91일 = ${exactWon(r.daily)}(달력 일수에 따라 89~92일)`,
                `퇴직금 = ${exactWon(r.daily)} × 30 × ${i.years}년 = ${exactWon(r.gross)}(근로자퇴직급여 보장법 제8조)`,
                `퇴직소득세(근속 ${r.serviceYears}년) ${exactWon(r.tax)} → 실수령 ${exactWon(r.net)}`,
                "통상임금이 평균임금보다 크면 통상임금으로 계산해요. 날짜로 정확히 따지려면 아래 정밀 계산기를 쓰세요.",
              ]}
              next={[
                { href: "/ko/retirement-tax-calculator/", label: "퇴직소득세 계산기" },
                { href: "/ko/ordinary-wage-calculator/", label: "통상임금 계산기" },
              ]}
            />
            <details className="rounded-md border border-border bg-background px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">날짜로 정확히 계산하기(입사일·퇴직일·자격 확인)</summary>
              <div className="mt-3">
                <SeveranceCalculator locale="ko" />
              </div>
            </details>
          </div>
        );
      }}
    />
  );
}
