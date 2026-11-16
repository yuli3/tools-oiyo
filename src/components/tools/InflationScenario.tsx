// 물가 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/world-money-scenarios.ts inflationResult.
import { INFLATION_ASSUMPTIONS, inflationPlain, inflationReal, inflationResult, type InflationLite } from "../../lib/world-money-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["amount", "rate", "years"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: InflationLite = { amount: 1_000_000, rate: 0.03, years: 10 };
const pctField = (v: number) => Number((v * 100).toFixed(2));

export default function InflationScenario() {
  const all = (input: InflationLite, edit: (p: Partial<InflationLite>, k: Key[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <MoneyField label="지금 돈" value={input.amount} onChange={(v) => edit({ amount: v }, ["amount"])} />
      <NumberField label="연 물가상승률" value={pctField(input.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />
      <NumberField label="기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={0} />
    </div>
  );
  return (
    <ScenarioTool<InflationLite, Key>
      toolId="inflation-calculator"
      example={EXAMPLE}
      assumptions={INFLATION_ASSUMPTIONS}
      keys={KEYS}
      evaluate={inflationReal}
      resultName="그때 돈의 가치"
      questions={({ input, edit }) => [
        { title: "얼마가, 몇 년 뒤에 어떻게 될지 볼까요?", keys: ["amount", "years"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="지금 돈" value={input.amount} onChange={(v) => edit({ amount: v }, ["amount"])} />
            <NumberField label="몇 년 뒤" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={0} />
          </div>
        ) },
        { title: "물가는 해마다 얼마나 오를까요?", keys: ["rate"], body: (
          <>
            <NumberField label="연 물가상승률" value={pctField(input.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />
            <p className="mt-2 text-xs text-muted-foreground">한국은행 목표는 2%예요. 최근 몇 년은 2~3%대였어요. 모르면 예시 3%로 두세요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => all(input, edit)}
      summary={inflationPlain}
      metrics={(i, s) => {
        const r = inflationResult(i);
        return [
          { label: "지금 돈으로 친 가치", value: s.money(r.real), tone: "primary" },
          { label: "같은 물건에 필요한 돈", value: s.money(r.needed) },
          { label: "가치 감소", value: `${Math.round(r.loss * 100)}%` },
        ];
      }}
      sliders={["rate", "years"]}
      charts={(i, s) => (
        <CompareBars
          title="물가상승률별 그때 돈의 가치"
          caption={`${i.years}년 뒤 ${s.money(i.amount)}의 가치예요.`}
          items={[0.02, 0.03, 0.05].map((r) => ({ label: `연 ${r * 100}%`, value: inflationReal({ ...i, rate: r }), current: Math.abs(r - i.rate) < 1e-9 }))}
          format={s.money}
        />
      )}
      askTitle="미리 알아 둘 점"
      ask={["물가상승률이 해마다 같다고 봤어요.", "소비자물가 평균이라 개인이 느끼는 물가와 다를 수 있어요."]}
      expertFooter={(i) => {
        const r = inflationResult(i);
        return (
          <ResultSteps
            steps={[`실질 가치 = ${exactWon(i.amount)} ÷ (1 + ${(i.rate * 100).toFixed(2)}%)^${i.years} = ${exactWon(r.real)}`, `필요 금액 = ${exactWon(i.amount)} × (1 + ${(i.rate * 100).toFixed(2)}%)^${i.years} = ${exactWon(r.needed)}`]}
            next={[{ href: "/ko/compound-interest-calculator/", label: "복리" }, { href: "/ko/deposit-calculator/", label: "예금·적금 이자" }]}
          />
        );
      }}
    />
  );
}
