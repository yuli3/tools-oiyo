// 인건비(사업주 부담) (2026-11-16 쉬운 설명·가정 변화 적용). 계산: finance/salary-calculator.ts, 가정·문장: lib/kr-money-scenarios.ts.
import { PAYROLL_TAX_AS_OF, RATES, ratePct, EMPLOYER_EMPLOYMENT_STABILITY } from "../../lib/kr-payroll-2026";
import { LABOR_ASSUMPTIONS, laborBridge, laborCost, laborPlain, laborTotal, type CompanySize, type LaborLite } from "../../lib/kr-money-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["salary", "meal", "workComp", "size", "severance"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: LaborLite = { salary: 3_000_000, meal: 200_000, workComp: 0.015, size: "under150", severance: true };
const SIZE = [
  { value: "under150", label: "150인 미만" },
  { value: "priority150Plus", label: "150인 이상 우선지원" },
  { value: "from150to999", label: "150~999인" },
  { value: "from1000", label: "1,000인 이상" },
] as const satisfies readonly { value: CompanySize; label: string }[];
const SEV = [
  { value: "y", label: "퇴직금 적립 포함" },
  { value: "n", label: "빼고 보기" },
] as const;

export default function KrLaborCostScenario() {
  return (
    <ScenarioTool<LaborLite, Key>
      toolId="labor-cost-calculator"
      example={EXAMPLE}
      assumptions={LABOR_ASSUMPTIONS}
      keys={KEYS}
      evaluate={laborTotal}
      resultName="회사가 쓰는 돈(월)"
      questions={({ input, edit }) => [
        { title: "직원 월급은 세전 얼마인가요?", keys: ["salary", "meal"], body: (
          <div className="space-y-3">
            <MoneyField label="월급(세전)" value={input.salary} onChange={(v) => edit({ salary: v }, ["salary"])} />
            <MoneyField label="그중 식대(월 20만 원까지 보험료 없음)" value={input.meal} onChange={(v) => edit({ meal: v }, ["meal"])} />
          </div>
        ) },
        { title: "회사 규모와 퇴직금은요?", keys: ["size", "severance"], body: (
          <div className="space-y-3">
            <ChoiceChips<CompanySize> legend="직원 수" value={input.size} options={SIZE} onChange={(v) => edit({ size: v }, ["size"])} />
            <ChoiceChips legend="퇴직금(1년 넘게 일하면 생겨요)" value={input.severance ? "y" : "n"} options={SEV} onChange={(v) => edit({ severance: v === "y" }, ["severance"])} />
          </div>
        ) },
        { title: "산재보험 요율을 아나요?", keys: ["workComp"], body: (
          <>
            <NumberField label="산재보험료율(모르면 그대로)" value={Number((input.workComp * 100).toFixed(2))} onChange={(v) => edit({ workComp: v / 100 }, ["workComp"])} suffix="%" step={0.1} />
            <p className="mt-2 text-xs text-muted-foreground">사무직은 0.6%대, 음식점 0.8%대, 제조·건설은 더 높아요. 근로복지공단 고지서에 적혀 있어요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <MoneyField label="월 급여" value={input.salary} onChange={(v) => edit({ salary: v }, ["salary"])} />
            <MoneyField label="비과세 식대" value={input.meal} onChange={(v) => edit({ meal: v }, ["meal"])} />
            <NumberField label="산재보험료율" value={Number((input.workComp * 100).toFixed(2))} onChange={(v) => edit({ workComp: v / 100 }, ["workComp"])} suffix="%" step={0.1} />
          </div>
          <ChoiceChips<CompanySize> legend="상시근로자 수" value={input.size} options={SIZE} onChange={(v) => edit({ size: v }, ["size"])} />
          <ChoiceChips legend="퇴직금" value={input.severance ? "y" : "n"} options={SEV} onChange={(v) => edit({ severance: v === "y" }, ["severance"])} />
        </div>
      )}
      summary={laborPlain}
      metrics={(i, s) => {
        const r = laborCost(i);
        return [
          { label: "회사가 쓰는 돈(월)", value: s.money(r.total), tone: "primary" },
          { label: "4대 보험 회사 몫", value: s.money(r.ins.total) },
          { label: "1년이면", value: s.money(r.total * 12) },
        ];
      }}
      sliders={["salary", "meal", "workComp"]}
      sweepCaption={(a) => (a.key === "meal" ? "식대는 월 20만 원까지만 보험료가 빠져요. 그 위로는 다시 보험료가 붙어요." : undefined)}
      charts={(i, s) => <BridgeChart title="월급에 회사가 더 내는 돈" steps={laborBridge(i)} format={s.money} />}
      ask={[
        "두루누리 지원(10인 미만, 월 270만 원 미만)을 받으면 고용보험·국민연금 회사 몫의 80%를 돌려받을 수 있어요.",
        "주휴수당·연장근로수당은 월급에 이미 들어 있다고 봤어요.",
      ]}
      expertFooter={(i) => {
        const r = laborCost(i);
        return (
          <ResultSteps
            steps={[
              `보험료 기준 = ${exactWon(i.salary)} − 비과세 식대 ${exactWon(Math.min(i.meal, 200_000))} = ${exactWon(r.taxable)}`,
              `국민연금 ${exactWon(r.ins.pension)}, 건강 ${exactWon(r.ins.health)}, 장기요양 ${exactWon(r.ins.ltc)}(건보의 ${ratePct(RATES.longTermCareOfHealth)})`,
              `고용보험 ${exactWon(r.ins.employment)}(실업급여 ${ratePct(RATES.employmentEmployee)} + 고용안정 ${ratePct(EMPLOYER_EMPLOYMENT_STABILITY[i.size])}), 산재 ${exactWon(r.ins.workComp)}`,
              `퇴직금 적립 ${exactWon(r.sev)}(월 급여 ÷ 12). ${PAYROLL_TAX_AS_OF} 기준 2026년 요율이에요.`,
            ]}
            next={[
              { href: "/ko/weekly-holiday-pay-calculator/", label: "알바 주휴수당" },
              { href: "/ko/incorporation-calculator/", label: "개인 vs 법인 세금" },
            ]}
          />
        );
      }}
    />
  );
}
