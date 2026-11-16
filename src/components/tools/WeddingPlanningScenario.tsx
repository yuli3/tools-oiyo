// 결혼 예산 (2026-11-17 가벼운 판: 가정 슬라이더·곡선, 한국어 페이지). 계산: lib/life-scenarios.ts weddingResult.
import { WEDDING_ASSUMPTIONS, weddingBalance, weddingPlain, weddingResult, won, type WeddingLite } from "../../lib/life-scenarios";
import NumberField from "./payroll/NumberField";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioLite from "./viz/ScenarioLite";

const KEYS = ["guests", "gift", "meal", "venue", "sdm", "honeymoon"] as const;
const EXAMPLE: WeddingLite = { guests: 200, gift: 100000, meal: 60000, venue: 3000000, sdm: 3000000, honeymoon: 5000000 };
const signed = (n: number) => `${n < 0 ? "−" : ""}${won(Math.abs(n))}`;

export default function WeddingPlanningScenario() {
  return (
    <ScenarioLite<WeddingLite, (typeof KEYS)[number]>
      toolId="wedding-planning-calculator"
      example={EXAMPLE}
      assumptions={WEDDING_ASSUMPTIONS}
      keys={KEYS}
      evaluate={weddingBalance}
      resultName="남는 돈"
      formatResult={signed}
      inputs={(input, edit) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="하객 수" value={input.guests} onChange={(v) => edit({ guests: v }, ["guests"])} suffix="명" step={10} min={0} />
          <MoneyField label="1인 평균 축의금" value={input.gift} onChange={(v) => edit({ gift: v }, ["gift"])} />
          <MoneyField label="1인 식대" value={input.meal} onChange={(v) => edit({ meal: v }, ["meal"])} />
          <MoneyField label="웨딩홀 대관료" value={input.venue} onChange={(v) => edit({ venue: v }, ["venue"])} />
          <MoneyField label="스드메" value={input.sdm} onChange={(v) => edit({ sdm: v }, ["sdm"])} />
          <MoneyField label="신혼여행" value={input.honeymoon} onChange={(v) => edit({ honeymoon: v }, ["honeymoon"])} />
        </div>
      )}
      summary={weddingPlain}
      metrics={(i) => {
        const r = weddingResult(i);
        return [
          { label: "남는 돈", value: signed(r.balance), tone: "primary" },
          { label: "총비용", value: won(r.cost) },
          { label: "본전 하객 수", value: Number.isFinite(r.breakEven) ? `${r.breakEven.toLocaleString("ko-KR")}명` : "없음" },
        ];
      }}
      sliders={["guests", "gift", "meal", "honeymoon"]}
      sweepCaption={(a) => (a.key === "guests" ? "축의금이 식대보다 많으면 하객이 늘수록 남는 돈이 늘어요." : undefined)}
      charts={(i) => {
        const r = weddingResult(i);
        return (
          <BridgeChart
            title="축의금에서 비용을 빼면"
            steps={[
              { label: "축의금", value: r.gifts, kind: "total" },
              { label: "식대", value: -r.food, kind: "add" },
              { label: "대관료", value: -i.venue, kind: "add" },
              { label: "스드메", value: -i.sdm, kind: "add" },
              { label: "신혼여행", value: -i.honeymoon, kind: "add" },
              { label: "남는 돈", value: r.balance, kind: "total" },
            ]}
            format={won}
          />
        );
      }}
    />
  );
}
