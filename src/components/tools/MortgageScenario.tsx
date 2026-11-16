// 주택담보대출 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/world-money-scenarios.ts mortgageResult.
import { MORTGAGE_ASSUMPTIONS, mortgageBridge, mortgageMonthly, mortgagePlain, mortgageResult, mortgageTerms, type MortgageLite } from "../../lib/world-money-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["price", "down", "rate", "years"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: MortgageLite = { price: 500_000_000, down: 150_000_000, rate: 0.04, years: 30 };
const pctField = (v: number) => Number((v * 100).toFixed(2));

export default function MortgageScenario() {
  return (
    <ScenarioTool<MortgageLite, Key>
      toolId="mortgage-calculator"
      example={EXAMPLE}
      assumptions={MORTGAGE_ASSUMPTIONS}
      keys={KEYS}
      evaluate={mortgageMonthly}
      resultName="월 상환액"
      questions={({ input, edit }) => [
        { title: "집값과 내 돈은 얼마인가요?", keys: ["price", "down"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="집값(매매가)" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} />
            <MoneyField label="내 돈(대출 없이 내는 돈)" value={input.down} onChange={(v) => edit({ down: v }, ["down"])} />
          </div>
        ) },
        { title: "금리와 기간은요?", keys: ["rate", "years"], body: (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="연 금리" value={pctField(input.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />
              <NumberField label="만기" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={5} min={1} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">모르면 예시(연 4%, 30년)로 두세요. 은행·보금자리론 금리를 넣으면 더 정확해요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="주택 가격" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} />
          <MoneyField label="자기자본" value={input.down} onChange={(v) => edit({ down: v }, ["down"])} />
          <NumberField label="연 이자율" value={pctField(input.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.05} />
          <NumberField label="만기" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={1} />
        </div>
      )}
      summary={mortgagePlain}
      metrics={(i, s) => {
        const r = mortgageResult(i);
        return [
          { label: "대출액", value: s.money(r.loan) },
          { label: "월 상환액", value: s.money(r.monthly), tone: "primary" },
          { label: "LTV", value: `${Math.round(r.ltv * 100)}%` },
        ];
      }}
      sliders={["rate", "down", "years"]}
      sweepCaption={(a) => (a.key === "years" ? "30년을 넘기면 월 상환액은 조금밖에 안 줄고 이자만 크게 늘어요." : undefined)}
      charts={(i, s) => (
        <div className="space-y-4">
          <BridgeChart title="집값에서 은행에 갚는 돈까지" steps={mortgageBridge(i)} format={s.money} />
          <CompareBars title="만기별 이자 합계" items={mortgageTerms(i)} format={s.money} />
        </div>
      )}
      askTitle="미리 알아 둘 점"
      ask={["실제 한도는 LTV(지역·주택 수)와 DSR 40% 중 작은 쪽이에요. DSR 계산기로 함께 확인하세요.", "원리금균등·고정금리 기준이고 중도상환수수료·보증료는 뺐어요."]}
      expertFooter={(i) => {
        const r = mortgageResult(i);
        return (
          <ResultSteps
            steps={[
              `대출 = ${exactWon(i.price)} − ${exactWon(i.down)} = ${exactWon(r.loan)} (LTV ${(r.ltv * 100).toFixed(1)}%)`,
              `월 상환액(원리금균등, ${r.months}개월) = ${exactWon(r.monthly)}`,
              `이자 합계 ${exactWon(r.interest)}, 총 상환 ${exactWon(r.total)}`,
            ]}
            next={[{ href: "/ko/dsr-calculator/", label: "DSR 한도" }, { href: "/ko/loan-calculator/", label: "상환 방식 비교" }]}
          />
        );
      }}
    />
  );
}
