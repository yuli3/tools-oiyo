// 기름값 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 FuelCostScenario. km·L 기준(영어 판은 갤런 환산 안내). 문구: lib/life-i18n.ts
import { useMemo } from "react";
import { FUEL_EXAMPLE, fuelAssumptionsL, fuelByEfficiencyL, fuelPlainL, moneyL, numL } from "../../../lib/life-i18n";
import { fuelCost, fuelResult, type FuelLite } from "../../../lib/life-scenarios";
import { WL_CURRENCY, type WL } from "../../../lib/world-money-i18n";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ScenarioLite from "../viz/ScenarioLite";

const KEYS = ["distance", "efficiency", "price", "people", "roundTrip"] as const;
const T = {
  en: { dist: "Distance", eff: "Fuel economy", price: "Fuel price per litre", ppl: "Split between", pplU: "people", trip: "One way or return", one: "One way", round: "Return", hint: "30 mpg ≈ 12.8 km/L; $3.60 a gallon ≈ $0.95 a litre.", result: "the fuel cost", cost: "Fuel cost", per: "Each", litres: "Fuel needed", chart: "Fuel cost by fuel economy", cap: "The same trip in different cars." },
  ja: { dist: "距離", eff: "燃費", price: "ガソリン1L", ppl: "割る人数", pplU: "人", trip: "片道・往復", one: "片道", round: "往復", hint: "東京→大阪は約500kmです。", result: "ガソリン代", cost: "ガソリン代", per: "1人あたり", litres: "必要なガソリン", chart: "燃費ごとのガソリン代", cap: "同じ距離を別の車で走った場合の比較です。" },
  zh: { dist: "距离", eff: "油耗（公里/升）", price: "每升油价", ppl: "分摊人数", pplU: "人", trip: "单程·往返", one: "单程", round: "往返", hint: "百公里油耗8升≈12.5公里/升。", result: "油费", cost: "油费", per: "每人", litres: "需要的油", chart: "不同油耗的油费", cap: "同样的路程换不同的车比较。" },
  fr: { dist: "Distance", eff: "Consommation", price: "Prix du litre", ppl: "Partagé entre", pplU: "pers.", trip: "Aller simple ou aller-retour", one: "Aller simple", round: "Aller-retour", hint: "Paris→Lyon fait environ 465 km. 6,5 L/100 km ≈ 15 km/L.", result: "le coût du carburant", cost: "Carburant", per: "Par personne", litres: "Carburant nécessaire", chart: "Coût selon la consommation", cap: "Le même trajet avec différentes voitures." },
  es: { dist: "Distancia", eff: "Consumo", price: "Precio por litro", ppl: "Dividir entre", pplU: "pers.", trip: "Ida o ida y vuelta", one: "Solo ida", round: "Ida y vuelta", hint: "Madrid→Barcelona son unos 620 km. 6,5 L/100 km ≈ 15 km/L.", result: "el coste del combustible", cost: "Combustible", per: "Por persona", litres: "Combustible necesario", chart: "Coste según el consumo", cap: "El mismo trayecto con distintos coches." },
};

export default function FuelCostWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const cur = WL_CURRENCY[lang];
  const m = (n: number) => moneyL(n, lang, cur);
  const assumptions = useMemo(() => fuelAssumptionsL(lang), [lang]);
  const summary = useMemo(() => fuelPlainL(lang, cur), [lang, cur]);
  const trip = [{ value: "one", label: t.one }, { value: "round", label: t.round }];
  return (
    <ScenarioLite<FuelLite, (typeof KEYS)[number]>
      lang={lang}
      currency={cur}
      toolId="fuel-cost-calculator"
      example={FUEL_EXAMPLE[lang]}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={fuelCost}
      resultName={t.result}
      formatResult={m}
      inputs={(input, edit) => (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label={t.dist} value={input.distance} onChange={(v) => edit({ distance: v }, ["distance"])} suffix="km" step={5} min={1} />
            <NumberField label={t.eff} value={input.efficiency} onChange={(v) => edit({ efficiency: v }, ["efficiency"])} suffix="km/L" step={0.5} min={1} />
            <NumberField label={t.price} value={input.price} onChange={(v) => edit({ price: v }, ["price"])} suffix={cur} step={cur === "JPY" ? 1 : 0.01} min={0} />
            <NumberField label={t.ppl} value={input.people} onChange={(v) => edit({ people: v }, ["people"])} suffix={t.pplU} step={1} min={1} />
          </div>
          <ChoiceChips<string> legend={t.trip} value={input.roundTrip ? "round" : "one"} options={trip} onChange={(v) => edit({ roundTrip: v === "round" }, ["roundTrip"])} />
          <p className="text-xs text-muted-foreground">{t.hint}</p>
        </div>
      )}
      summary={summary}
      metrics={(i) => {
        const r = fuelResult(i);
        return [
          { label: t.cost, value: m(r.cost), tone: "primary" },
          { label: t.per, value: m(r.perPerson) },
          { label: t.litres, value: `${numL(r.liters, lang)} L` },
        ];
      }}
      sliders={["distance", "efficiency", "price"]}
      charts={(i) => <CompareBars title={t.chart} caption={t.cap} items={fuelByEfficiencyL(i, lang)} format={m} />}
    />
  );
}
