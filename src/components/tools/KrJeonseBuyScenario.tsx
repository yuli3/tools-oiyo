// 전세 vs 매매 (2026-11-16 쉬운 설명·가정 변화 적용). 계산은 lib/kr-home-scenarios.ts의 buyResult예요.
import { BUY_ASSUMPTIONS, buyAdvantage, buyBreakEvenGrowth, buyBridge, buyPlain, buyResult, type BuyLite } from "../../lib/kr-home-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["price", "jeonse", "ltv", "mortgageRate", "savingsRate", "growth", "years", "holding", "over85"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: BuyLite = { price: 500_000_000, jeonse: 350_000_000, ltv: 0.6, mortgageRate: 0.04, savingsRate: 0.03, growth: 0.02, years: 5, holding: 0.002, over85: false };
type Growth = "-0.02" | "0" | "0.02" | "0.04";
const GROWTH = [
  { value: "-0.02", label: "떨어진다(-2%)" },
  { value: "0", label: "그대로" },
  { value: "0.02", label: "조금 오른다(2%)" },
  { value: "0.04", label: "많이 오른다(4%)" },
] as const satisfies readonly { value: Growth; label: string }[];
const nearestGrowth = (g: number): Growth => (["-0.02", "0", "0.02", "0.04"] as const).reduce((a, b) => (Math.abs(Number(b) - g) < Math.abs(Number(a) - g) ? b : a));
const pctField = (v: number) => Number((v * 100).toFixed(2));

export default function KrJeonseBuyScenario() {
  return (
    <ScenarioTool<BuyLite, Key>
      toolId="jeonse-vs-buy-calculator"
      example={EXAMPLE}
      assumptions={BUY_ASSUMPTIONS}
      keys={KEYS}
      evaluate={buyAdvantage}
      resultName="매매가 전세보다 아끼는 돈"
      questions={({ input, edit }) => [
        { title: "같은 집의 매매가와 전세가는요?", keys: ["price", "jeonse"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="매매가" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} />
            <MoneyField label="전세 보증금" value={input.jeonse} onChange={(v) => edit({ jeonse: v }, ["jeonse"])} />
          </div>
        ) },
        { title: "몇 년 살 건가요?", keys: ["years"], body: <NumberField label="살 기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={1} /> },
        { title: "집값은 어떻게 될 것 같나요?", keys: ["growth"], body: (
          <>
            <ChoiceChips<Growth> legend="1년에 평균 몇 % 오를지 골라요. 아무도 정확히 몰라서 결과를 가장 크게 흔들어요" value={nearestGrowth(input.growth)} options={GROWTH} onChange={(v) => edit({ growth: Number(v) }, ["growth"])} />
          </>
        ) },
        { title: "금리는 어떻게 볼까요?", keys: ["mortgageRate", "savingsRate"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="주담대 금리" value={pctField(input.mortgageRate)} onChange={(v) => edit({ mortgageRate: v / 100 }, ["mortgageRate"])} suffix="%" step={0.1} />
            <NumberField label="예금 이자율(내 돈의 기회비용)" value={pctField(input.savingsRate)} onChange={(v) => edit({ savingsRate: v / 100 }, ["savingsRate"])} suffix="%" step={0.1} />
          </div>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="매매가" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} />
          <MoneyField label="전세 보증금" value={input.jeonse} onChange={(v) => edit({ jeonse: v }, ["jeonse"])} />
          <NumberField label="대출 비율(LTV)" value={Math.round(input.ltv * 100)} onChange={(v) => edit({ ltv: Math.min(100, v) / 100 }, ["ltv"])} suffix="%" step={5} />
          <NumberField label="주담대 금리" value={pctField(input.mortgageRate)} onChange={(v) => edit({ mortgageRate: v / 100 }, ["mortgageRate"])} suffix="%" step={0.1} />
          <NumberField label="예금 이자율" value={pctField(input.savingsRate)} onChange={(v) => edit({ savingsRate: v / 100 }, ["savingsRate"])} suffix="%" step={0.1} />
          <NumberField label="연 집값 상승률(음수 가능)" value={pctField(input.growth)} onChange={(v) => edit({ growth: v / 100 }, ["growth"])} suffix="%" step={0.5} min={-20} />
          <NumberField label="살 기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={1} />
          <NumberField label="연 보유 비용(재산세·수선비, 집값 대비)" value={pctField(input.holding)} onChange={(v) => edit({ holding: v / 100 }, ["holding"])} suffix="%" step={0.05} />
        </div>
      )}
      summary={buyPlain}
      metrics={(i, s) => {
        const r = buyResult(i);
        const even = buyBreakEvenGrowth(i);
        return [
          { label: "매매 실제 비용", value: s.money(r.buyCost), tone: r.buyCost <= r.jeonseCost ? "primary" : undefined },
          { label: "전세 실제 비용", value: s.money(r.jeonseCost), tone: r.jeonseCost < r.buyCost ? "primary" : undefined },
          { label: "갈림길 집값 상승률", value: even === null ? "—" : `연 ${(even * 100).toFixed(1)}%` },
        ];
      }}
      sliders={["growth", "mortgageRate", "years"]}
      sweepCaption={() => "선이 0 위면 매매가, 아래면 전세가 유리해요. 집값 상승률 하나로 결론이 뒤집히는 경우가 많아요."}
      charts={(i, s) => <BridgeChart title={`매매하면 ${Math.max(1, Math.round(i.years))}년간 실제로 사라지는 돈`} steps={buyBridge(i)} format={s.money} />}
      ask={["대출 원금 상환은 비용이 아니라 내 돈으로 바뀌는 것이라 넣지 않았어요.", "취득세는 1주택 기준, 양도세·중개보수·이사비는 넣지 않았어요.", "전세는 보증금을 못 돌려받을 위험이 있고, 매매는 집값이 떨어질 위험이 있어요."]}
      expertFooter={(i) => {
        const r = buyResult(i);
        return (
          <ResultSteps
            steps={[
              `매매 = 대출 이자 ${exactWon(r.interest)} + 내 돈 ${exactWon(Math.round(r.equity))}의 기회비용 ${exactWon(r.equityCost)} + 취득세 ${exactWon(r.acq)} + 보유 비용 ${exactWon(r.holdingCost)} − 집값 변화 ${exactWon(r.appreciation)} = ${exactWon(r.buyCost)}`,
              `전세 = 보증금 ${exactWon(i.jeonse)} × 예금 이자율 × ${r.years}년 = ${exactWon(r.jeonseCost)}`,
              `차이 = ${exactWon(r.jeonseCost - r.buyCost)}(양수면 매매가 유리)`,
            ]}
            next={[{ href: "/ko/dsr-calculator/", label: "대출 한도(DSR)" }, { href: "/ko/jeonse-vs-rent-calculator/", label: "전세 vs 월세" }]}
          />
        );
      }}
    />
  );
}
