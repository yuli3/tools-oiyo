// 연금 최적화(노후 월 소득) (2026-11-16 쉬운 설명·가정 변화 적용). 계산: lib/kr-pension-scenarios.ts pensionPlanResult.
import { PENSION_PLAN_ASSUMPTIONS, pensionPlanBridge, pensionPlanMonthly, pensionPlanPlain, pensionPlanResult, type PensionPlanLite } from "../../lib/kr-pension-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["age", "retireAge", "lifeAge", "balance", "savingsMonthly", "irpMonthly", "income", "national", "ret"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: PensionPlanLite = { age: 35, retireAge: 65, lifeAge: 85, balance: 10_000_000, savingsMonthly: 400_000, irpMonthly: 200_000, income: 50_000_000, national: 1_000_000, ret: 0.05 };
const pctField = (v: number) => Number((v * 100).toFixed(2));

export default function KrPensionPlanScenario() {
  return (
    <ScenarioTool<PensionPlanLite, Key>
      toolId="pension-optimizer-calculator"
      example={EXAMPLE}
      assumptions={PENSION_PLAN_ASSUMPTIONS}
      keys={KEYS}
      evaluate={pensionPlanMonthly}
      resultName="노후 월 소득"
      questions={({ input, edit }) => [
        { title: "지금 몇 살이고, 언제부터 연금을 받을 건가요?", keys: ["age", "retireAge", "lifeAge"], body: (
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField label="지금 나이" value={input.age} onChange={(v) => edit({ age: v }, ["age"])} suffix="세" step={1} min={19} />
            <NumberField label="받기 시작할 나이(55세 이상)" value={input.retireAge} onChange={(v) => edit({ retireAge: v }, ["retireAge"])} suffix="세" step={1} min={55} />
            <NumberField label="몇 살까지 받을지" value={input.lifeAge} onChange={(v) => edit({ lifeAge: v }, ["lifeAge"])} suffix="세" step={1} min={60} />
          </div>
        ) },
        { title: "매달 연금 계좌에 얼마씩 넣나요?", keys: ["savingsMonthly", "irpMonthly", "balance"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="연금저축(월)" value={input.savingsMonthly} onChange={(v) => edit({ savingsMonthly: v }, ["savingsMonthly"])} />
            <MoneyField label="IRP(월)" value={input.irpMonthly} onChange={(v) => edit({ irpMonthly: v }, ["irpMonthly"])} />
            <MoneyField label="지금까지 쌓인 돈(두 계좌 합)" value={input.balance} onChange={(v) => edit({ balance: v }, ["balance"])} />
          </div>
        ) },
        { title: "연봉과 국민연금 예상액은요?", keys: ["income", "national"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="총급여(1년)" value={input.income} onChange={(v) => edit({ income: v }, ["income"])} />
            <MoneyField label="국민연금 예상 월액" value={input.national} onChange={(v) => edit({ national: v }, ["national"])} hint="국민연금공단 '내 연금 알아보기'에서 확인해요" />
          </div>
        ) },
        { title: "1년에 몇 % 벌 것 같나요?", keys: ["ret"], body: (
          <>
            <NumberField label="연 기대수익률" value={pctField(input.ret)} onChange={(v) => edit({ ret: v / 100 }, ["ret"])} suffix="%" step={0.5} />
            <p className="mt-2 text-xs text-muted-foreground">모르면 예시 5%로 두세요. 예금형 위주면 3%, 주식형 ETF 위주면 6~7%를 넣어 보세요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label="현재 나이" value={input.age} onChange={(v) => edit({ age: v }, ["age"])} suffix="세" step={1} min={19} />
          <NumberField label="수령 시작 나이" value={input.retireAge} onChange={(v) => edit({ retireAge: v }, ["retireAge"])} suffix="세" step={1} min={55} />
          <NumberField label="기대수명" value={input.lifeAge} onChange={(v) => edit({ lifeAge: v }, ["lifeAge"])} suffix="세" step={1} min={60} />
          <MoneyField label="연금저축 월 납입" value={input.savingsMonthly} onChange={(v) => edit({ savingsMonthly: v }, ["savingsMonthly"])} />
          <MoneyField label="IRP 월 납입" value={input.irpMonthly} onChange={(v) => edit({ irpMonthly: v }, ["irpMonthly"])} />
          <MoneyField label="현재 적립금" value={input.balance} onChange={(v) => edit({ balance: v }, ["balance"])} />
          <MoneyField label="총급여" value={input.income} onChange={(v) => edit({ income: v }, ["income"])} />
          <MoneyField label="국민연금 월액" value={input.national} onChange={(v) => edit({ national: v }, ["national"])} />
          <NumberField label="연 수익률" value={pctField(input.ret)} onChange={(v) => edit({ ret: v / 100 }, ["ret"])} suffix="%" step={0.1} />
        </div>
      )}
      summary={pensionPlanPlain}
      metrics={(i, s) => {
        const r = pensionPlanResult(i);
        return [
          { label: "노후 월 소득", value: s.money(r.monthly), tone: "primary" },
          { label: `${i.retireAge}세 연금 계좌`, value: s.money(r.asset) },
          { label: "올해 세액공제", value: s.money(r.credit.refund) },
        ];
      }}
      sliders={["irpMonthly", "ret", "retireAge", "lifeAge"]}
      sweepCaption={(a) => (a.key === "retireAge" ? "늦게 받을수록 굴리는 기간은 길어지고 나눠 받는 기간은 짧아져 월 소득이 빠르게 늘어요." : a.key === "ret" ? "수익률 1%p 차이가 30년 뒤 계좌를 크게 바꿔요." : undefined)}
      charts={(i, s) => <BridgeChart title="노후 월 소득 구성" steps={pensionPlanBridge(i)} format={s.money} />}
      ask={["국민연금은 지금 예상액 그대로(물가 반영 없음) 더했어요.", "연금 계좌 돈은 받는 동안 수익 없이 똑같이 나눴고 연금소득세는 빼지 않았어요(세전)."]}
      expertFooter={(i) => {
        const r = pensionPlanResult(i);
        return (
          <ResultSteps
            steps={[
              `적립 ${r.years}년: 현재 ${exactWon(i.balance)} × (1+${(i.ret * 100).toFixed(1)}%)^${r.years} + 연 ${exactWon((i.savingsMonthly + i.irpMonthly) * 12)} 적립 = ${exactWon(r.asset)}`,
              `수령 ${r.months}개월: ${exactWon(r.asset)} ÷ ${r.months} = 월 ${exactWon(r.fromAccount)}`,
              `노후 월 소득 = 국민연금 ${exactWon(i.national)} + ${exactWon(r.fromAccount)} = ${exactWon(r.monthly)}`,
              `세액공제: 인정 ${exactWon(r.credit.base)} × ${(r.credit.rate * 100).toFixed(1)}% = ${exactWon(r.credit.refund)}`,
            ]}
            next={[{ href: "/ko/pension-tax-calculator/", label: "연금저축 세액공제" }, { href: "/ko/isa-vs-pension-calculator/", label: "ISA vs 연금저축" }]}
          />
        );
      }}
    />
  );
}
