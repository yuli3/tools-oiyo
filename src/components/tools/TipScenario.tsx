// 팁 (2026-11-17 가벼운 판: 가정 슬라이더·곡선, 한국어 페이지). 계산: lib/life-scenarios.ts tipResult.
import { TIP_ASSUMPTIONS, amt, tipPer, tipPlain, tipRates, tipResult, type TipLite } from "../../lib/life-scenarios";
import NumberField from "./payroll/NumberField";
import CompareBars from "./viz/CompareBars";
import ScenarioLite from "./viz/ScenarioLite";

const KEYS = ["bill", "rate", "split"] as const;
const EXAMPLE: TipLite = { bill: 80, rate: 0.18, split: 2 };

export default function TipScenario() {
  return (
    <ScenarioLite<TipLite, (typeof KEYS)[number]>
      toolId="tip-calculator"
      example={EXAMPLE}
      assumptions={TIP_ASSUMPTIONS}
      keys={KEYS}
      evaluate={tipPer}
      resultName="1인 부담"
      formatResult={amt}
      inputs={(input, edit) => (
        <div className="space-y-2">
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField label="음식값(세전)" value={input.bill} onChange={(v) => edit({ bill: v }, ["bill"])} step={1} min={0} />
            <NumberField label="팁 비율" value={Math.round(input.rate * 100)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={1} min={0} />
            <NumberField label="나눌 사람" value={input.split} onChange={(v) => edit({ split: v }, ["split"])} suffix="명" step={1} min={1} />
          </div>
          <p className="text-xs text-muted-foreground">계산서 통화 그대로 넣으세요. 예: 80달러면 80.</p>
        </div>
      )}
      summary={tipPlain}
      metrics={(i) => {
        const r = tipResult(i);
        return [
          { label: "1인당", value: amt(r.per), tone: "primary" },
          { label: "팁", value: amt(r.tip) },
          { label: "합계", value: amt(r.total) },
        ];
      }}
      sliders={["rate", "bill", "split"]}
      charts={(i) => <CompareBars title="팁 비율별 1인 부담" items={tipRates(i)} format={amt} />}
    />
  );
}
