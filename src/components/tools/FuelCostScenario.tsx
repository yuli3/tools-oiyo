// 기름값 (2026-11-17 가벼운 판: 가정 슬라이더·곡선, 한국어 페이지). 계산: lib/life-scenarios.ts fuelResult.
import { FUEL_ASSUMPTIONS, fuelByEfficiency, fuelCost, fuelPlain, fuelResult, won, type FuelLite } from "../../lib/life-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioLite from "./viz/ScenarioLite";

const KEYS = ["distance", "efficiency", "price", "people", "roundTrip"] as const;
const EXAMPLE: FuelLite = { distance: 325, efficiency: 12, price: 1650, people: 1, roundTrip: false };
const TRIP = [{ value: "one", label: "편도" }, { value: "round", label: "왕복" }];

export default function FuelCostScenario() {
  return (
    <ScenarioLite<FuelLite, (typeof KEYS)[number]>
      toolId="fuel-cost-calculator"
      example={EXAMPLE}
      assumptions={FUEL_ASSUMPTIONS}
      keys={KEYS}
      evaluate={fuelCost}
      resultName="기름값"
      formatResult={won}
      inputs={(input, edit) => (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="가는 거리" value={input.distance} onChange={(v) => edit({ distance: v }, ["distance"])} suffix="km" step={5} min={1} />
            <NumberField label="연비" value={input.efficiency} onChange={(v) => edit({ efficiency: v }, ["efficiency"])} suffix="km/L" step={0.5} min={1} />
            <MoneyField label="기름값(1L)" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} />
            <NumberField label="나눌 사람 수" value={input.people} onChange={(v) => edit({ people: v }, ["people"])} suffix="명" step={1} min={1} />
          </div>
          <ChoiceChips<string> legend="편도·왕복" value={input.roundTrip ? "round" : "one"} options={TRIP} onChange={(v) => edit({ roundTrip: v === "round" }, ["roundTrip"])} />
          <p className="text-xs text-muted-foreground">서울→부산이 약 325km예요. 기름값은 오피넷에서 오늘 평균을 확인하세요.</p>
        </div>
      )}
      summary={fuelPlain}
      metrics={(i) => {
        const r = fuelResult(i);
        return [
          { label: "기름값", value: won(r.cost), tone: "primary" },
          { label: "1인당", value: won(r.perPerson) },
          { label: "넣을 기름", value: `${(Math.round(r.liters * 10) / 10).toLocaleString("ko-KR")}L` },
        ];
      }}
      sliders={["distance", "efficiency", "price"]}
      charts={(i) => <CompareBars title="연비별 기름값" caption="같은 거리를 다른 차로 가면 얼마인지 비교했어요." items={fuelByEfficiency(i)} format={won} />}
    />
  );
}
