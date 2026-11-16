// 할인 (2026-11-17 가벼운 판: 가정 슬라이더·곡선, 한국어 페이지). 계산: lib/life-scenarios.ts discountResult.
import { DISCOUNT_ASSUMPTIONS, discountFinal, discountPlain, discountResult, stackVsSingle, won, type DiscountLite } from "../../lib/life-scenarios";
import NumberField from "./payroll/NumberField";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioLite from "./viz/ScenarioLite";

const KEYS = ["price", "rate", "extra"] as const;
const EXAMPLE: DiscountLite = { price: 59000, rate: 0.2, extra: 0.1 };

export default function DiscountScenario() {
  return (
    <ScenarioLite<DiscountLite, (typeof KEYS)[number]>
      toolId="discount-calculator"
      example={EXAMPLE}
      assumptions={DISCOUNT_ASSUMPTIONS}
      keys={KEYS}
      evaluate={discountFinal}
      resultName="내는 돈"
      formatResult={won}
      inputs={(input, edit) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <MoneyField label="정가" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} />
          <NumberField label="할인율" value={Math.round(input.rate * 100)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={1} min={0} />
          <NumberField label="추가 할인(쿠폰·카드)" value={Math.round(input.extra * 100)} onChange={(v) => edit({ extra: v / 100 }, ["extra"])} suffix="%" step={1} min={0} />
        </div>
      )}
      summary={discountPlain}
      metrics={(i) => {
        const r = discountResult(i);
        return [
          { label: "내는 돈", value: won(r.final), tone: "primary" },
          { label: "아낀 돈", value: won(r.saved) },
          { label: "실제 할인율", value: `${(Math.round(r.effective * 1000) / 10).toLocaleString("ko-KR")}%` },
        ];
      }}
      sliders={["rate", "extra", "price"]}
      charts={(i) => (i.extra > 0 ? <CompareBars title="겹친 할인 vs 합친 할인" caption="차례로 깎으면 합친 비율보다 덜 깎여요." items={stackVsSingle(i)} format={won} /> : null)}
    />
  );
}
