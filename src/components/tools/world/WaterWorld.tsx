// 물 섭취량 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 WaterIntakeScenario. 문구: lib/health-i18n.ts
import { useMemo } from "react";
import { WATER_ACT_L, WATER_KEYS, WATER_TEMP_L, mlL, waterAssumptionsL, waterPlainL } from "../../../lib/health-i18n";
import { waterOf, waterResult, type WaterActivity, type WaterLite, type WaterTemp } from "../../../lib/health2-scenarios";
import type { WL } from "../../../lib/world-money-i18n";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool from "../viz/ScenarioTool";
import { BODY } from "./health-text";
import { nextLinks } from "./names";

const KEYS = ["weight", "activity", "temp", "alcohol"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<WaterLite>, k: Key[]) => void;
const EXAMPLE: WaterLite = { weight: 70, activity: "moderate", temp: "normal", alcohol: 0 };

const T = {
  en: { q1: "How much do you weigh?", q2: "How was your day?", act: "Exercise today", temp: "Weather", alcohol: "Alcoholic drinks", drinks: "drinks", result: "water to drink", total: "Water per day", cups: "250 ml glasses", base: "Base (30 ml/kg)", chart: "How your water target adds up", L: ["Body weight base", "Exercise", "Weather", "Alcohol", "Total"], ask: ["If a doctor limits your fluids for kidney or heart disease, follow that first.", "Don't drink more than a litre within an hour or two."], s1: "Base", s2: (a: string, t: string, n: number) => `+ exercise ${a} + weather ${t} + ${n} drinks × 200 ml` },
  ja: { q1: "体重はどのくらいですか？", q2: "今日はどんな一日でしたか？", act: "今日の運動量", temp: "気温", alcohol: "飲んだお酒", drinks: "杯", result: "1日に飲む水", total: "1日に飲む水", cups: "250mlのコップ", base: "基本（30ml/kg）", chart: "飲む水の内訳", L: ["体重の基本", "運動", "気温", "お酒", "合計"], ask: ["腎臓・心臓の病気で水分制限がある場合は医師の指示を優先してください。", "1〜2時間で1リットル以上まとめて飲まないでください。"], s1: "基本", s2: (a: string, t: string, n: number) => `+ 運動 ${a} + 気温 ${t} + お酒 ${n}杯 × 200ml` },
  zh: { q1: "体重是多少？", q2: "今天过得怎么样？", act: "今天的运动量", temp: "天气", alcohol: "喝的酒", drinks: "杯", result: "每天饮水量", total: "每天饮水量", cups: "250ml杯数", base: "基础（30ml/kg）", chart: "饮水量的构成", L: ["体重基础", "运动", "天气", "饮酒", "合计"], ask: ["因肾脏、心脏疾病需要限水的人，请先遵医嘱。", "不要在一两个小时内喝超过1升。"], s1: "基础", s2: (a: string, t: string, n: number) => `+ 运动 ${a} + 天气 ${t} + 饮酒 ${n}杯 × 200ml` },
  fr: { q1: "Combien pesez-vous ?", q2: "Comment s'est passée votre journée ?", act: "Sport aujourd'hui", temp: "Météo", alcohol: "Verres d'alcool", drinks: "verres", result: "l'eau à boire", total: "Eau par jour", cups: "Verres de 250 ml", base: "Base (30 ml/kg)", chart: "Comment se compose votre besoin", L: ["Base selon le poids", "Sport", "Météo", "Alcool", "Total"], ask: ["Si un médecin limite vos apports pour une maladie rénale ou cardiaque, suivez d'abord ses consignes.", "Ne buvez pas plus d'un litre en une ou deux heures."], s1: "Base", s2: (a: string, t: string, n: number) => `+ sport ${a} + météo ${t} + ${n} verres × 200 ml` },
  es: { q1: "¿Cuánto pesas?", q2: "¿Cómo ha sido tu día?", act: "Ejercicio hoy", temp: "Clima", alcohol: "Copas de alcohol", drinks: "copas", result: "el agua a beber", total: "Agua al día", cups: "Vasos de 250 ml", base: "Base (30 ml/kg)", chart: "Cómo se suma tu necesidad de agua", L: ["Base por peso", "Ejercicio", "Clima", "Alcohol", "Total"], ask: ["Si tu médico te limita los líquidos por enfermedad renal o cardiaca, sigue primero sus indicaciones.", "No bebas más de un litro en una o dos horas."], s1: "Base", s2: (a: string, t: string, n: number) => `+ ejercicio ${a} + clima ${t} + ${n} copas × 200 ml` },
};

export default function WaterWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const b = BODY[lang];
  const m = (n: number) => mlL(n, lang);
  const assumptions = useMemo(() => waterAssumptionsL(lang), [lang]);
  const summary = useMemo(() => waterPlainL(lang), [lang]);
  const acts = WATER_KEYS.act.map((a) => ({ value: a, label: WATER_ACT_L[lang][a] }));
  const temps = WATER_KEYS.temp.map((a) => ({ value: a, label: WATER_TEMP_L[lang][a] }));
  const day = (i: WaterLite, edit: Edit) => (
    <div className="space-y-3">
      <ChoiceChips<WaterActivity> legend={t.act} value={i.activity} options={acts} onChange={(v) => edit({ activity: v }, ["activity"])} />
      <ChoiceChips<WaterTemp> legend={t.temp} value={i.temp} options={temps} onChange={(v) => edit({ temp: v }, ["temp"])} />
      <NumberField label={t.alcohol} value={i.alcohol} onChange={(v) => edit({ alcohol: v }, ["alcohol"])} suffix={t.drinks} step={1} min={0} />
    </div>
  );
  const weight = (i: WaterLite, edit: Edit) => <NumberField label={b.weight} value={i.weight} onChange={(v) => edit({ weight: v }, ["weight"])} suffix="kg" step={0.5} min={20} />;
  return (
    <ScenarioTool<WaterLite, Key>
      lang={lang}
      currency="USD"
      toolId="water-intake-calculator"
      example={EXAMPLE}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={waterOf}
      resultName={t.result}
      formatResult={m}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["weight"], body: weight(input, edit) },
        { title: t.q2, keys: ["activity", "temp", "alcohol"], body: day(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {weight(input, edit)}
          {day(input, edit)}
        </div>
      )}
      summary={summary}
      metrics={(i) => {
        const r = waterResult(i);
        return [
          { label: t.total, value: m(r.total), tone: "primary" },
          { label: t.cups, value: String(r.cups) },
          { label: t.base, value: m(r.base) },
        ];
      }}
      sliders={["weight", "alcohol"]}
      charts={(i) => {
        const r = waterResult(i);
        return (
          <BridgeChart
            title={t.chart}
            steps={[
              { label: t.L[0], value: r.base, kind: "total" },
              { label: t.L[1], value: r.act, kind: "add" },
              { label: t.L[2], value: r.temp, kind: "add" },
              { label: t.L[3], value: r.alcohol, kind: "add" },
              { label: t.L[4], value: r.total, kind: "total" },
            ]}
            format={m}
          />
        );
      }}
      askTitle={b.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = waterResult(i);
        return (
          <ResultSteps
            steps={[`${t.s1} = ${i.weight} kg × 30 ml = ${m(r.base)}`, t.s2(m(r.act), m(r.temp), i.alcohol), `= ${m(r.total)} (250 ml × ${r.cups})`]}
            next={nextLinks(lang, ["caffeine-calculator", "tdee-calculator"])}
          />
        );
      }}
    />
  );
}
