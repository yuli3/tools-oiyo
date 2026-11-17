// 라떼 효과 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 LatteScenario. 문구: lib/world-money-i18n-2.ts
import { useMemo } from "react";
import { FREQ_NAME, LATTE_EXAMPLE, latteAssumptions, lattePlainI, price } from "../../../lib/world-money-i18n-2";
import { UNIT, WL_CURRENCY, YEARS, cashExact, type WL } from "../../../lib/world-money-i18n";
import { LATTE_PER_MONTH, latteFv, latteResult, type LatteFrequency, type LatteLite } from "../../../lib/world-money-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { nextLinks } from "./names";

const KEYS = ["cost", "freq", "rate", "years"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<LatteLite>, k: Key[]) => void;
const pctField = (v: number) => Number((v * 100).toFixed(2));

const T = {
  en: { cost: "Cost each time (coffee, snacks, delivery…)", freq: "How often", rate: "Annual return", years: "Period", q1: "What's the habit, and what does it cost?", q2: "How long would you invest the savings?", h2: "Savings accounts pay around 3–4%; broad stock indexes have averaged around 7% over the long run.", result: "the amount saved", monthly: "Saved per month", after: (y: number) => `After ${y} years`, gain: "From compounding", chart: "What it grows to over time", askTitle: "Good to know", ask: [`Times per month: every day ${LATTE_PER_MONTH.daily}, weekdays ${LATTE_PER_MONTH.weekdays}, once a week ${LATTE_PER_MONTH.weekly}.`, "Taxes, inflation and price increases are left out."], s1: (c: string, n: number, m: string) => `Per month = ${c} × ${n} = ${m}`, s2: "FV = monthly × ((1+r)^n − 1) ÷ r" },
  ja: { cost: "1回の出費（コーヒー・おやつ・デリバリーなど）", freq: "頻度", rate: "年利回り", years: "期間", q1: "習慣になっている出費はいくらですか？", q2: "そのお金を何年運用しますか？", h2: "預金は1%未満、株式インデックスの長期平均は5〜7%程度です。", result: "貯まる金額", monthly: "月に貯まる額", after: (y: number) => `${y}年後`, gain: "複利で増えた分", chart: "期間ごとの貯まる金額", askTitle: "知っておきたいこと", ask: [`月の回数は毎日${LATTE_PER_MONTH.daily}回、平日${LATTE_PER_MONTH.weekdays}回、週1回${LATTE_PER_MONTH.weekly}回としています。`, "税金・物価上昇・値上げは含めていません。"], s1: (c: string, n: number, m: string) => `月額 = ${c} × ${n}回 = ${m}`, s2: "FV = 月額 × ((1+r)^n − 1) ÷ r" },
  zh: { cost: "每次花费（咖啡、零食、外卖等）", freq: "频率", rate: "年化收益率", years: "期限", q1: "习惯性的开销是多少？", q2: "这笔钱打算投资几年？", h2: "存款约1.5%~2%，股票指数长期平均约5%~7%。", result: "攒下的钱", monthly: "每月攒下", after: (y: number) => `${y}年后`, gain: "复利收益", chart: "不同期限攒下的钱", askTitle: "需要了解", ask: [`每月次数：每天${LATTE_PER_MONTH.daily}次，工作日${LATTE_PER_MONTH.weekdays}次，每周一次${LATTE_PER_MONTH.weekly}次。`, "未计税费、通胀和涨价。"], s1: (c: string, n: number, m: string) => `每月 = ${c} × ${n}次 = ${m}`, s2: "FV = 每月 × ((1+r)^n − 1) ÷ r" },
  fr: { cost: "Coût par fois (café, snack, livraison…)", freq: "Fréquence", rate: "Rendement annuel", years: "Durée", q1: "Quelle habitude, et combien coûte-t-elle ?", q2: "Combien de temps placeriez-vous cette épargne ?", h2: "Le Livret A rapporte environ 2-3 % ; les indices actions ont fait autour de 7 % sur le long terme.", result: "la somme épargnée", monthly: "Épargné par mois", after: (y: number) => `Après ${y} ans`, gain: "Intérêts composés", chart: "Ce que cela devient avec le temps", askTitle: "Bon à savoir", ask: [`Fois par mois : tous les jours ${LATTE_PER_MONTH.daily}, en semaine ${LATTE_PER_MONTH.weekdays}, une fois par semaine ${LATTE_PER_MONTH.weekly}.`, "Impôts, inflation et hausses de prix non inclus."], s1: (c: string, n: number, m: string) => `Par mois = ${c} × ${n} = ${m}`, s2: "VF = mensuel × ((1+r)^n − 1) ÷ r" },
  es: { cost: "Coste por vez (café, picoteo, comida a domicilio…)", freq: "Frecuencia", rate: "Rentabilidad anual", years: "Plazo", q1: "¿Qué gasto de costumbre y cuánto cuesta?", q2: "¿Cuánto tiempo invertirías ese ahorro?", h2: "Los depósitos dan en torno al 2-3 %; los índices de bolsa han rondado el 7 % a largo plazo.", result: "lo ahorrado", monthly: "Ahorro al mes", after: (y: number) => `Tras ${y} años`, gain: "Interés compuesto", chart: "Lo que se acumula con el tiempo", askTitle: "Conviene saber", ask: [`Veces al mes: todos los días ${LATTE_PER_MONTH.daily}, entre semana ${LATTE_PER_MONTH.weekdays}, una vez por semana ${LATTE_PER_MONTH.weekly}.`, "Sin impuestos, inflación ni subidas de precio."], s1: (c: string, n: number, m: string) => `Al mes = ${c} × ${n} = ${m}`, s2: "VF = mensual × ((1+r)^n − 1) ÷ r" },
};

export default function LatteWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const cur = WL_CURRENCY[lang];
  const assumptions = useMemo(() => latteAssumptions(lang, cur), [lang, cur]);
  const summary = useMemo(() => lattePlainI(lang, cur), [lang, cur]);
  const freqs = (Object.keys(FREQ_NAME[lang]) as LatteFrequency[]).map((f) => ({ value: f, label: FREQ_NAME[lang][f] }));
  const step = cur === "JPY" ? 50 : cur === "CNY" ? 5 : 0.5;
  const how = (i: LatteLite, edit: Edit) => (
    <div className="space-y-3">
      <NumberField label={t.cost} value={i.cost} onChange={(v) => edit({ cost: v }, ["cost"])} suffix={cur} step={step} />
      <ChoiceChips<LatteFrequency> legend={t.freq} value={i.freq} options={freqs} onChange={(v) => edit({ freq: v }, ["freq"])} />
    </div>
  );
  const grow = (i: LatteLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label={t.rate} value={pctField(i.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.5} />
      <NumberField label={t.years} value={i.years} onChange={(v) => edit({ years: v }, ["years"])} suffix={UNIT[lang].years} step={1} min={1} />
    </div>
  );
  return (
    <ScenarioTool<LatteLite, Key>
      lang={lang}
      currency={cur}
      toolId="latte-factor-calculator"
      example={LATTE_EXAMPLE[lang]}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={latteFv}
      resultName={t.result}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["cost", "freq"], body: how(input, edit) },
        { title: t.q2, keys: ["rate", "years"], body: (
          <>
            {grow(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">{t.h2}</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {how(input, edit)}
          {grow(input, edit)}
        </div>
      )}
      summary={summary}
      metrics={(i, s) => {
        const r = latteResult(i);
        return [
          { label: t.monthly, value: s.money(r.monthly) },
          { label: t.after(i.years), value: s.money(r.fv), tone: "primary" },
          { label: t.gain, value: s.money(r.gain) },
        ];
      }}
      sliders={["cost", "years", "rate"]}
      charts={(i, s) => (
        <CompareBars title={t.chart} items={[10, 20, 30].map((y) => ({ label: YEARS[lang](y), value: latteFv({ ...i, years: y }), current: y === i.years }))} format={s.money} />
      )}
      askTitle={t.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = latteResult(i);
        const x = (n: number) => cashExact(n, lang, cur);
        return (
          <ResultSteps
            steps={[t.s1(price(i.cost, lang, cur), LATTE_PER_MONTH[i.freq], x(r.monthly)), `${t.s2} = ${x(r.fv)}`]}
            next={nextLinks(lang, ["compound-interest-calculator", "fire-retirement-calculator"])}
          />
        );
      }}
    />
  );
}
