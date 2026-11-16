// 월급 실수령액 한국어판 (2026-11-16 쉬운 설명·가정 변화 적용). 다른 언어는 SalaryCalculator 그대로.
import { SALARY_ASSUMPTIONS, salaryBreakdown, salaryBridge, salaryNet, salaryPlain, type SalaryInput } from "../../lib/kr-tax-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["monthly", "dependents", "nonTaxable"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: SalaryInput = { monthly: 3_000_000, dependents: 1, nonTaxable: 200_000 };

export default function KrSalaryScenario() {
  return (
    <ScenarioTool<SalaryInput, Key>
      toolId="salary-calculator"
      example={EXAMPLE}
      assumptions={SALARY_ASSUMPTIONS}
      keys={KEYS}
      evaluate={salaryNet}
      resultName="월 실수령액"
      questions={({ input, edit }) => [
        {
          title: "한 달 월급은 세금 떼기 전 얼마인가요?",
          keys: ["monthly"],
          body: (
            <>
              <MoneyField label="월급(세전)" value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} />
              <p className="mt-2 text-xs text-muted-foreground">연봉만 알면 12로 나눠 넣어 주세요(연봉 {Math.round((input.monthly * 12) / 10_000).toLocaleString("ko-KR")}만 원).</p>
            </>
          ),
        },
        {
          title: "나를 포함해 부양가족은 몇 명인가요?",
          keys: ["dependents"],
          body: <NumberField label="나 + 소득이 거의 없는 배우자·자녀·부모님" value={input.dependents} onChange={(v) => edit({ dependents: v }, ["dependents"])} suffix="명" step={1} min={1} />,
        },
        {
          title: "식대처럼 세금이 안 붙는 수당이 있나요?",
          keys: ["nonTaxable"],
          body: (
            <>
              <MoneyField label="한 달 비과세 수당" value={input.nonTaxable} onChange={(v) => edit({ nonTaxable: v }, ["nonTaxable"])} />
              <p className="mt-2 text-xs text-muted-foreground">식대는 한 달 20만 원까지, 자가운전보조금도 20만 원까지 세금이 없어요. 급여명세서의 비과세 칸을 보세요.</p>
            </>
          ),
        },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <MoneyField label="월 총급여" value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} />
          <NumberField label="기본공제 인원(본인 포함)" value={input.dependents} onChange={(v) => edit({ dependents: v }, ["dependents"])} suffix="명" step={1} min={1} />
          <MoneyField label="월 비과세 급여" value={input.nonTaxable} onChange={(v) => edit({ nonTaxable: v }, ["nonTaxable"])} />
        </div>
      )}
      summary={salaryPlain}
      metrics={(i, s) => {
        const r = salaryBreakdown(i);
        return [
          { label: "한 달 실수령액", value: s.money(r.net), tone: "primary" },
          { label: "1년이면", value: s.money(r.net * 12) },
          { label: "떼는 비율", value: `${r.effectiveRate}%` },
        ];
      }}
      sliders={["monthly", "dependents", "nonTaxable"]}
      sweeps={["monthly", "nonTaxable", "dependents"]}
      sweepCaption={(a) => (a.key === "monthly" ? "국민연금은 월 637만 원 위로는 더 늘지 않아서, 월급이 아주 높으면 곡선이 조금 가팔라져요." : undefined)}
      charts={(i, s) => <BridgeChart title="월급에서 떼는 돈" steps={salaryBridge(i)} format={s.money} />}
      ask={[
        "회사 원천징수는 간이세액표(80%·100%·120% 선택)를 써서 이 추정과 다를 수 있어요. 차이는 연말정산 때 돌려받거나 더 내요.",
        "8~20세 자녀가 있으면 자녀 세액공제로 세금이 더 줄어요.",
      ]}
      expertFooter={(i) => {
        const r = salaryBreakdown(i);
        const a = r.annual;
        return (
          <ResultSteps
            steps={[
              `과세 급여 ${exactWon(r.taxablePay)}(비과세 ${exactWon(i.nonTaxable)} 제외), 연 ${exactWon(a.totalPay)}`,
              `국민연금 ${exactWon(r.pension)}, 건강보험 ${exactWon(r.health)}, 장기요양 ${exactWon(r.ltc)}, 고용보험 ${exactWon(r.employment)}`,
              `근로소득공제 ${exactWon(a.earnedIncomeDeduction)}, 인적공제 ${exactWon(a.personalDeduction)}, 보험료공제 ${exactWon(a.insuranceDeduction)} → 과세표준 ${exactWon(a.taxBase)}`,
              `산출세액 ${exactWon(a.calculatedTax)} − 근로소득세액공제 ${exactWon(a.taxCredit)} = 결정세액 ${exactWon(a.determinedTax)} ÷ 12 = 월 ${exactWon(r.incomeTax)}`,
              "간이세액표가 아니라 연간 추정액이에요. 자녀세액공제·특별공제는 넣지 않았어요.",
            ]}
            next={[
              { href: "/ko/year-end-settlement-calculator/", label: "연말정산 계산기" },
              { href: "/ko/severance-calculator/", label: "퇴직금 계산기" },
            ]}
          />
        );
      }}
    />
  );
}
