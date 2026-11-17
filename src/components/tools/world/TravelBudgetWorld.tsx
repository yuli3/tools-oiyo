// 여행 예산 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 TravelBudgetScenario. 출발지가 나라마다 달라 지역 기준값 대신 예시 금액만 채워요. 문구: lib/life-i18n.ts
import { useMemo } from "react";
import { TRAVEL_EXAMPLE, TRAVEL_PARTS, moneyL, travelAssumptionsL, travelPlainL, tripLength } from "../../../lib/life-i18n";
import { rooms, travelResult, travelTotal, type TravelLite } from "../../../lib/life-scenarios";
import { WL_CURRENCY, type WL } from "../../../lib/world-money-i18n";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ScenarioLite from "../viz/ScenarioLite";

const KEYS = ["place", "nights", "people", "flight", "hotel", "daily"] as const;
const T = {
  en: { nights: "Nights", nU: "nights", people: "Travellers", pU: "people", flight: "Return flight per person", hotel: "Room per night", daily: "Daily spend per person", hint: "The example is a typical mid-range trip. Swap in the prices you've found.", result: "the total", total: "Total", per: "Per person", len: "Trip", chart: "Where the money goes", rooms: (n: number) => `${n} room${n > 1 ? "s" : ""}` },
  ja: { nights: "泊数", nU: "泊", people: "人数", pU: "人", flight: "1人の往復航空券", hotel: "1室1泊", daily: "1人1日の現地費用", hint: "例は国内の一般的な旅行です。調べた価格があれば入れ替えてください。", result: "合計予算", total: "合計予算", per: "1人あたり", len: "日程", chart: "何にお金がかかるか", rooms: (n: number) => `${n}室` },
  zh: { nights: "晚数", nU: "晚", people: "人数", pU: "人", flight: "每人往返机票", hotel: "每间每晚", daily: "每人每天当地花费", hint: "示例是一般的中等档次旅行，查到实际价格后替换即可。", result: "总预算", total: "总预算", per: "人均", len: "行程", chart: "钱花在哪里", rooms: (n: number) => `${n}间` },
  fr: { nights: "Nuits", nU: "nuits", people: "Voyageurs", pU: "pers.", flight: "Vol A/R par personne", hotel: "Chambre par nuit", daily: "Dépenses par jour et par personne", hint: "L'exemple correspond à un séjour moyen en Europe. Remplacez par les prix trouvés.", result: "le budget total", total: "Budget total", per: "Par personne", len: "Durée", chart: "Où part l'argent", rooms: (n: number) => `${n} chambre${n > 1 ? "s" : ""}` },
  es: { nights: "Noches", nU: "noches", people: "Viajeros", pU: "pers.", flight: "Vuelo i/v por persona", hotel: "Habitación por noche", daily: "Gasto diario por persona", hint: "El ejemplo es un viaje medio por Europa. Cambia los precios por los que hayas encontrado.", result: "el presupuesto total", total: "Presupuesto total", per: "Por persona", len: "Viaje", chart: "En qué se va el dinero", rooms: (n: number) => `${n} habitación${n > 1 ? "es" : ""}` },
};

export default function TravelBudgetWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const cur = WL_CURRENCY[lang];
  const m = (n: number) => moneyL(n, lang, cur);
  const step = cur === "JPY" ? 1000 : cur === "CNY" ? 50 : 10;
  const assumptions = useMemo(() => travelAssumptionsL(lang), [lang]);
  const summary = useMemo(() => travelPlainL(lang, cur), [lang, cur]);
  const parts = TRAVEL_PARTS[lang];
  return (
    <ScenarioLite<TravelLite, (typeof KEYS)[number]>
      lang={lang}
      currency={cur}
      toolId="travel-budget-calculator"
      example={TRAVEL_EXAMPLE[lang]}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={travelTotal}
      resultName={t.result}
      formatResult={m}
      inputs={(input, edit) => (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label={t.nights} value={input.nights} onChange={(v) => edit({ nights: v }, ["nights"])} suffix={t.nU} step={1} min={1} />
            <NumberField label={t.people} value={input.people} onChange={(v) => edit({ people: v }, ["people"])} suffix={t.pU} step={1} min={1} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField label={t.flight} value={input.flight} onChange={(v) => edit({ flight: v }, ["flight"])} suffix={cur} step={step} min={0} />
            <NumberField label={t.hotel} value={input.hotel} onChange={(v) => edit({ hotel: v }, ["hotel"])} suffix={cur} step={step} min={0} />
            <NumberField label={t.daily} value={input.daily} onChange={(v) => edit({ daily: v }, ["daily"])} suffix={cur} step={step} min={0} />
          </div>
          <p className="text-xs text-muted-foreground">{t.hint}</p>
        </div>
      )}
      summary={summary}
      metrics={(i) => {
        const r = travelResult(i);
        return [
          { label: t.total, value: m(r.total), tone: "primary" },
          { label: t.per, value: m(r.perPerson) },
          { label: t.len, value: tripLength(i, lang) },
        ];
      }}
      sliders={["nights", "people", "hotel", "daily"]}
      charts={(i) => {
        const r = travelResult(i);
        return (
          <CompareBars
            title={t.chart}
            items={[
              { label: parts[0], value: r.flight },
              { label: `${parts[1]} (${t.rooms(rooms(i.people))})`, value: r.hotel },
              { label: parts[2], value: r.daily },
            ]}
            format={m}
          />
        );
      }}
    />
  );
}
