// 투자 수익률 ROI (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/world-money-scenarios.ts roiResult.
import { ROI_ASSUMPTIONS, roiPlain, roiProfit, roiResult, type RoiLite } from "../../lib/world-money-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["cost", "value", "years"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: RoiLite = { cost: 10_000_000, value: 15_000_000, years: 3 };

export default function RoiScenario() {
  const all = (input: RoiLite, edit: (p: Partial<RoiLite>, k: Key[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <MoneyField label="넣은 돈" value={input.cost} onChange={(v) => edit({ cost: v }, ["cost"])} />
      <MoneyField label="돌려받은 돈(지금 가치)" value={input.value} onChange={(v) => edit({ value: v }, ["value"])} />
      <NumberField label="걸린 기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={1} />
    </div>
  );
  return (
    <ScenarioTool<RoiLite, Key>
      toolId="roi-calculator"
      example={EXAMPLE}
      assumptions={ROI_ASSUMPTIONS}
      keys={KEYS}
      evaluate={roiProfit}
      resultName="손익"
      questions={({ input, edit }) => [
        { title: "얼마를 넣어서 얼마가 됐나요?", keys: ["cost", "value"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="넣은 돈" value={input.cost} onChange={(v) => edit({ cost: v }, ["cost"])} />
            <MoneyField label="돌려받은 돈(또는 지금 가치)" value={input.value} onChange={(v) => edit({ value: v }, ["value"])} />
          </div>
        ) },
        { title: "몇 년 걸렸나요?", keys: ["years"], body: <NumberField label="걸린 기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={1} /> },
      ]}
      expert={({ input, edit }) => all(input, edit)}
      summary={roiPlain}
      metrics={(i) => {
        const r = roiResult(i);
        return [
          { label: "수익률", value: `${(r.roi * 100).toFixed(1)}%`, tone: "primary" },
          { label: "연평균(복리)", value: `${(r.cagr * 100).toFixed(1)}%` },
          { label: "배수", value: `${r.multiple.toFixed(2)}배` },
        ];
      }}
      sliders={["value", "cost"]}
      charts={(i, s) => (
        <CompareBars
          title="같은 기간 다른 선택과 비교"
          items={[
            { label: "이 투자", value: i.value, current: true },
            { label: "예금 연 3%", value: i.cost * Math.pow(1.03, i.years) },
            { label: "물가만큼(연 2.5%)", value: i.cost * Math.pow(1.025, i.years) },
          ]}
          format={s.money}
        />
      )}
      askTitle="미리 알아 둘 점"
      ask={["세금·수수료를 빼기 전 수익률이에요.", "중간에 돈을 더 넣거나 뺐다면 단순 ROI보다 내부수익률(IRR)이 정확해요."]}
      expertFooter={(i) => {
        const r = roiResult(i);
        return (
          <ResultSteps
            steps={[`ROI = (${exactWon(i.value)} − ${exactWon(i.cost)}) ÷ ${exactWon(i.cost)} = ${(r.roi * 100).toFixed(2)}%`, `CAGR = (${r.multiple.toFixed(4)})^(1/${i.years}) − 1 = ${(r.cagr * 100).toFixed(2)}%`]}
            next={[{ href: "/ko/compound-interest-calculator/", label: "복리" }, { href: "/ko/inflation-calculator/", label: "물가" }]}
          />
        );
      }}
    />
  );
}
