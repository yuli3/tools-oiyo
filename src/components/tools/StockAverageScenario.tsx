// 주식 평단가 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/world-money-scenarios.ts avgResult.
import { AVG_ASSUMPTIONS, avgPlain, avgPrice, avgResult, type AvgLite } from "../../lib/world-money-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["price", "qty", "addPrice", "addQty", "market"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: AvgLite = { price: 10_000, qty: 100, addPrice: 8_000, addQty: 100, market: 8_000 };
const krw = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

export default function StockAverageScenario() {
  const all = (input: AvgLite, edit: (p: Partial<AvgLite>, k: Key[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <MoneyField label="지금 평균 단가" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} />
      <NumberField label="가진 주식 수" value={input.qty} onChange={(v) => edit({ qty: v }, ["qty"])} suffix="주" step={1} min={0} />
      <MoneyField label="새로 살 값" value={input.addPrice} onChange={(v) => edit({ addPrice: v }, ["addPrice"])} />
      <NumberField label="새로 살 수" value={input.addQty} onChange={(v) => edit({ addQty: v }, ["addQty"])} suffix="주" step={1} min={0} />
      <MoneyField label="지금 시세(선택)" value={input.market} onChange={(v) => edit({ market: v }, ["market"])} />
    </div>
  );
  return (
    <ScenarioTool<AvgLite, Key>
      toolId="stock-average-calculator"
      example={EXAMPLE}
      assumptions={AVG_ASSUMPTIONS}
      keys={KEYS}
      evaluate={avgPrice}
      resultName="평균 단가"
      formatResult={krw}
      questions={({ input, edit }) => [
        { title: "지금 몇 주를 얼마에 갖고 있나요?", keys: ["price", "qty"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="평균 단가(증권 앱의 매입가)" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} />
            <NumberField label="주식 수" value={input.qty} onChange={(v) => edit({ qty: v }, ["qty"])} suffix="주" step={1} min={0} />
          </div>
        ) },
        { title: "얼마에, 몇 주 더 살 건가요?", keys: ["addPrice", "addQty", "market"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="살 값" value={input.addPrice} onChange={(v) => edit({ addPrice: v, market: v }, ["addPrice", "market"])} />
            <NumberField label="살 주식 수" value={input.addQty} onChange={(v) => edit({ addQty: v }, ["addQty"])} suffix="주" step={1} min={0} />
          </div>
        ) },
      ]}
      expert={({ input, edit }) => all(input, edit)}
      summary={avgPlain}
      metrics={(i, s) => {
        const r = avgResult(i);
        return [
          { label: "새 평균 단가", value: krw(r.avg), tone: "primary" },
          { label: "총 주식 수", value: `${r.qty.toLocaleString("ko-KR")}주` },
          { label: "평가손익", value: s.money(r.pl) },
        ];
      }}
      sliders={["addQty", "addPrice"]}
      sweepCaption={(a) => (a.key === "addQty" ? "많이 살수록 평균 단가가 새로 사는 값에 가까워지지만, 내려가는 폭은 점점 줄어요." : undefined)}
      charts={(i) => (
        <CompareBars
          title="추가로 사는 수에 따른 평균 단가"
          items={[0.5, 1, 2].map((k) => ({ label: `${Math.round(i.addQty * k).toLocaleString("ko-KR")}주`, value: avgPrice({ ...i, addQty: Math.round(i.addQty * k) }), current: k === 1 }))}
          format={krw}
        />
      )}
      askTitle="미리 알아 둘 점"
      ask={["매매 수수료와 세금은 빼고 계산했어요.", "평균 단가를 낮추는 것보다 그 회사를 더 살 이유가 있는지가 먼저예요."]}
      expertFooter={(i) => {
        const r = avgResult(i);
        return (
          <ResultSteps
            steps={[`평균 단가 = (${krw(i.price)} × ${i.qty} + ${krw(i.addPrice)} × ${i.addQty}) ÷ ${r.qty} = ${krw(r.avg)}`, `평가손익 = (${krw(i.market)} − ${krw(r.avg)}) × ${r.qty} = ${exactWon(r.pl)}`]}
            next={[{ href: "/ko/roi-calculator/", label: "투자 수익률" }, { href: "/ko/overseas-stock-saver-calculator/", label: "해외주식 절세" }]}
          />
        );
      }}
    />
  );
}
