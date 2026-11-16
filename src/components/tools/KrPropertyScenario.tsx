// 재산세 한국어판 (2026-11-16 쉬운 설명·가정 변화 적용). 영어판은 KrPropertyTaxCalculator 그대로.
import { propertyTax } from "../../lib/kr-real-estate-tax";
import { PROPERTY_ASSUMPTIONS, propertyBridge, propertyPlain, propertyTotal, type PropertyInput } from "../../lib/kr-tax-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["official", "oneHouse", "urban"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: PropertyInput = { official: 500_000_000, oneHouse: true, urban: true };
const OWNER = [
  { value: "one", label: "1세대 1주택" },
  { value: "multi", label: "다주택·법인" },
] as const;
const YN = [
  { value: "y", label: "예" },
  { value: "n", label: "아니요" },
] as const;

export default function KrPropertyScenario() {
  return (
    <ScenarioTool<PropertyInput, Key>
      toolId="property-tax-calculator"
      example={EXAMPLE}
      assumptions={PROPERTY_ASSUMPTIONS}
      keys={KEYS}
      evaluate={propertyTotal}
      resultName="올해 재산세"
      questions={({ input, edit }) => [
        {
          title: "집의 공시가격은 얼마인가요?",
          keys: ["official"],
          body: (
            <>
              <p className="mb-3 text-sm leading-6 text-muted-foreground">
                시세가 아니라 나라가 정한 값이에요. <a className="underline" href="https://www.realtyprice.kr" rel="noopener" target="_blank">부동산 공시가격 알리미</a>에서 찾을 수 있어요. 보통 시세의 60~70% 정도예요.
              </p>
              <MoneyField label="공시가격" value={input.official} onChange={(v) => edit({ official: v }, ["official"])} />
            </>
          ),
        },
        {
          title: "집이 이 한 채뿐인가요?",
          keys: ["oneHouse", "urban"],
          body: (
            <div className="space-y-4">
              <ChoiceChips legend="우리 집(세대) 기준" value={input.oneHouse ? "one" : "multi"} options={OWNER} onChange={(v) => edit({ oneHouse: v === "one" }, ["oneHouse"])} />
              <ChoiceChips legend="도시(아파트 단지 등)에 있나요? 대부분 예예요" value={input.urban ? "y" : "n"} options={YN} onChange={(v) => edit({ urban: v === "y" }, ["urban"])} />
            </div>
          ),
        },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          <MoneyField label="주택 공시가격" value={input.official} onChange={(v) => edit({ official: v }, ["official"])} />
          <ChoiceChips legend="보유 형태" value={input.oneHouse ? "one" : "multi"} options={OWNER} onChange={(v) => edit({ oneHouse: v === "one" }, ["oneHouse"])} />
          <ChoiceChips legend="도시지역(도시계획구역)" value={input.urban ? "y" : "n"} options={YN} onChange={(v) => edit({ urban: v === "y" }, ["urban"])} />
        </div>
      )}
      summary={(i) => propertyPlain(i)}
      metrics={(i, s) => {
        const r = propertyTax(i.official, i.oneHouse, i.urban);
        return [
          { label: "올해 낼 돈", value: s.money(r.total), tone: "primary" },
          { label: "세금 매기는 금액(과세표준)", value: s.money(r.base) },
          { label: r.tax > 200_000 ? "7월·9월에 각각" : "7월에 한 번", value: s.money(r.tax > 200_000 ? Math.round(r.total / 2) : r.total) },
        ];
      }}
      sliders={["official"]}
      sweepCaption={() => "점선 9억 원은 1주택 낮은 세율(특례)을 받는 한도예요. 공시가격이 높을수록 세율 구간이 올라가서 세금이 더 빨리 늘어요."}
      charts={(i, s) => <BridgeChart title="재산세 고지서에 찍히는 것" steps={propertyBridge(i)} format={s.money} />}
      ask={[
        "공시가격 합계가 1주택 12억 원(다주택 9억 원)을 넘으면 12월에 종합부동산세가 따로 나와요.",
        "작년보다 너무 많이 오르지 않게 세부담 상한이 있어서 실제 고지액은 더 적을 수 있어요.",
      ]}
      expertFooter={(i) => {
        const r = propertyTax(i.official, i.oneHouse, i.urban);
        return (
          <ResultSteps
            steps={[
              `과세표준 = 공시가격 ${exactWon(i.official)} × 공정시장가액비율 ${Math.round(r.ratio * 100)}% = ${exactWon(r.base)}`,
              `재산세(지방세법 제111조${r.special ? ", 제111조의2 1주택 특례" : ""}) ${exactWon(r.tax)}`,
              `도시지역분 ${exactWon(r.urban)}, 지방교육세(20%) ${exactWon(r.education)}`,
              "세부담 상한(제122조), 감면, 종합부동산세는 넣지 않았어요.",
            ]}
            next={[{ href: "/ko/acquisition-tax-calculator/", label: "취득세 계산기" }, { href: "/ko/capital-gains-tax-calculator/", label: "양도소득세 계산기" }]}
          />
        );
      }}
    />
  );
}
