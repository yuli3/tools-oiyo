// 여행 예산 (2026-11-17 가벼운 판: 가정 슬라이더·곡선, 한국어 페이지). 계산: lib/life-scenarios.ts travelResult.
import { TRAVEL_ASSUMPTIONS, TRAVEL_PLACES, travelPlain, travelResult, travelTotal, won, type Place, type TravelLite } from "../../lib/life-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import MoneyField from "./viz/MoneyField";
import NumberField from "./payroll/NumberField";
import CompareBars from "./viz/CompareBars";
import ScenarioLite from "./viz/ScenarioLite";

const KEYS = ["place", "nights", "people", "flight", "hotel", "daily"] as const;
const PLACES = (Object.keys(TRAVEL_PLACES) as Place[]).map((p) => ({ value: p, label: TRAVEL_PLACES[p].label }));
const EXAMPLE: TravelLite = { place: "japan", nights: 4, people: 2, ...pick("japan") };
function pick(p: Place) {
  const d = TRAVEL_PLACES[p];
  return { flight: d.flight, hotel: d.hotel, daily: d.daily };
}

export default function TravelBudgetScenario() {
  return (
    <ScenarioLite<TravelLite, (typeof KEYS)[number]>
      toolId="travel-budget-calculator"
      example={EXAMPLE}
      assumptions={TRAVEL_ASSUMPTIONS}
      keys={KEYS}
      evaluate={travelTotal}
      resultName="총 예산"
      formatResult={won}
      inputs={(input, edit) => (
        <div className="space-y-3">
          <ChoiceChips<Place> legend="어디로 가나요?" value={input.place} options={PLACES} onChange={(v) => edit({ place: v, ...pick(v) }, ["place", "flight", "hotel", "daily"])} />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="숙박" value={input.nights} onChange={(v) => edit({ nights: v }, ["nights"])} suffix="박" step={1} min={1} />
            <NumberField label="인원" value={input.people} onChange={(v) => edit({ people: v }, ["people"])} suffix="명" step={1} min={1} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MoneyField label="1인 왕복 항공권" value={input.flight} onChange={(v) => edit({ flight: v }, ["flight"])} />
            <MoneyField label="방 하나 1박" value={input.hotel} onChange={(v) => edit({ hotel: v }, ["hotel"])} />
            <MoneyField label="1인 하루 경비" value={input.daily} onChange={(v) => edit({ daily: v }, ["daily"])} />
          </div>
          <p className="text-xs text-muted-foreground">지역을 고르면 평균 기준값이 채워져요. 알아본 가격이 있으면 바꿔 넣으세요.</p>
        </div>
      )}
      summary={travelPlain}
      metrics={(i) => {
        const r = travelResult(i);
        return [
          { label: "총 예산", value: won(r.total), tone: "primary" },
          { label: "1인당", value: won(r.perPerson) },
          { label: "일정", value: `${i.nights}박 ${r.days}일` },
        ];
      }}
      sliders={["nights", "people", "hotel", "daily"]}
      charts={(i) => {
        const r = travelResult(i);
        return (
          <CompareBars
            title="어디에 돈이 드나요?"
            items={[
              { label: "항공권", value: r.flight },
              { label: `숙박 (방 ${Math.max(1, Math.ceil(i.people / 2))}개)`, value: r.hotel },
              { label: "현지 경비", value: r.daily },
            ]}
            format={won}
          />
        );
      }}
    />
  );
}
