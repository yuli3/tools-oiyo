// 물가 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 InflationScenario. 문구: lib/world-money-i18n-2.ts
import { useMemo } from "react";
import { INFLATION_EXAMPLE, inflationAssumptions, inflationPlainI } from "../../../lib/world-money-i18n-2";
import { UNIT, WL_CURRENCY, cashExact, pctOf, type WL } from "../../../lib/world-money-i18n";
import { inflationReal, inflationResult, type InflationLite } from "../../../lib/world-money-scenarios";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { nextLinks } from "./names";

const KEYS = ["amount", "rate", "years"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<InflationLite>, k: Key[]) => void;
const pctField = (v: number) => Number((v * 100).toFixed(2));

const T = {
  en: { amount: "Amount today", rate: "Annual inflation", years: "Years from now", q1: "Which amount, and how many years ahead?", q2: "How fast will prices rise each year?", h2: "The Fed targets 2%; US inflation has run around 3% recently. If unsure, keep the example.", result: "the future value", real: "Worth in today's money", needed: "Needed for the same things", loss: "Value lost", chart: "Future value by inflation rate", cap: (y: number, a: string) => `What ${a} is worth after ${y} years.`, askTitle: "Good to know", ask: ["Inflation is assumed the same every year.", "The price index is an average; your own basket may differ."], s1: "Real value", s2: "Amount needed" },
  ja: { amount: "今のお金", rate: "年間物価上昇率", years: "何年後", q1: "いくらが、何年後にどうなるか見ましょうか？", q2: "物価は毎年どのくらい上がりそうですか？", h2: "日銀の目標は2%です。わからなければ例の値のままで大丈夫です。", result: "将来の価値", real: "今のお金に直した価値", needed: "同じものに必要なお金", loss: "価値の目減り", chart: "物価上昇率ごとの将来の価値", cap: (y: number, a: string) => `${y}年後の${a}の価値です。`, askTitle: "知っておきたいこと", ask: ["物価上昇率は毎年同じと仮定しています。", "消費者物価は平均なので、自分が感じる物価とは違うことがあります。"], s1: "実質価値", s2: "必要な金額" },
  zh: { amount: "现在的钱", rate: "年通胀率", years: "几年后", q1: "多少钱，几年后会怎样？", q2: "物价每年涨多少？", h2: "中国近年CPI在0%~2%之间，长期目标约2%~3%。不确定就保留示例。", result: "未来的价值", real: "折合现在的价值", needed: "买同样东西需要", loss: "价值缩水", chart: "不同通胀率下的未来价值", cap: (y: number, a: string) => `${y}年后${a}的价值。`, askTitle: "需要了解", ask: ["假设每年通胀率相同。", "CPI是平均值，与个人感受到的物价可能不同。"], s1: "实际价值", s2: "所需金额" },
  fr: { amount: "Somme aujourd'hui", rate: "Inflation annuelle", years: "Dans combien d'années", q1: "Quelle somme, et dans combien d'années ?", q2: "De combien les prix augmenteront-ils chaque année ?", h2: "La BCE vise 2 %. Dans le doute, gardez l'exemple.", result: "la valeur future", real: "Valeur en euros d'aujourd'hui", needed: "Nécessaire pour les mêmes achats", loss: "Perte de valeur", chart: "Valeur future selon l'inflation", cap: (y: number, a: string) => `Valeur de ${a} dans ${y} ans.`, askTitle: "Bon à savoir", ask: ["L'inflation est supposée identique chaque année.", "L'indice des prix est une moyenne ; votre panier peut être différent."], s1: "Valeur réelle", s2: "Montant nécessaire" },
  es: { amount: "Importe hoy", rate: "Inflación anual", years: "Dentro de cuántos años", q1: "¿Qué importe y dentro de cuántos años?", q2: "¿Cuánto subirán los precios cada año?", h2: "El BCE apunta al 2 %. Si dudas, deja el ejemplo.", result: "el valor futuro", real: "Valor en euros de hoy", needed: "Necesario para lo mismo", loss: "Pérdida de valor", chart: "Valor futuro según la inflación", cap: (y: number, a: string) => `Lo que valdrán ${a} dentro de ${y} años.`, askTitle: "Conviene saber", ask: ["Se supone la misma inflación todos los años.", "El IPC es una media; tu cesta puede ser distinta."], s1: "Valor real", s2: "Importe necesario" },
};

export default function InflationWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const cur = WL_CURRENCY[lang];
  const assumptions = useMemo(() => inflationAssumptions(lang, cur), [lang, cur]);
  const summary = useMemo(() => inflationPlainI(lang, cur), [lang, cur]);
  const step = cur === "JPY" ? 10_000 : cur === "CNY" ? 1_000 : 100;
  const amount = (i: InflationLite, edit: Edit) => <NumberField label={t.amount} value={i.amount} onChange={(v) => edit({ amount: v }, ["amount"])} suffix={cur} step={step} />;
  const years = (i: InflationLite, edit: Edit) => <NumberField label={t.years} value={i.years} onChange={(v) => edit({ years: v }, ["years"])} suffix={UNIT[lang].years} step={1} min={0} />;
  const rate = (i: InflationLite, edit: Edit) => <NumberField label={t.rate} value={pctField(i.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />;
  return (
    <ScenarioTool<InflationLite, Key>
      lang={lang}
      currency={cur}
      toolId="inflation-calculator"
      example={INFLATION_EXAMPLE[lang]}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={inflationReal}
      resultName={t.result}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["amount", "years"], body: <div className="grid gap-3 sm:grid-cols-2">{amount(input, edit)}{years(input, edit)}</div> },
        { title: t.q2, keys: ["rate"], body: (
          <>
            {rate(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">{t.h2}</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => <div className="grid gap-3 sm:grid-cols-3">{amount(input, edit)}{rate(input, edit)}{years(input, edit)}</div>}
      summary={summary}
      metrics={(i, s) => {
        const r = inflationResult(i);
        return [
          { label: t.real, value: s.money(r.real), tone: "primary" },
          { label: t.needed, value: s.money(r.needed) },
          { label: t.loss, value: `${Math.round(r.loss * 100)}%` },
        ];
      }}
      sliders={["rate", "years"]}
      charts={(i, s) => (
        <CompareBars
          title={t.chart}
          caption={t.cap(i.years, s.money(i.amount))}
          items={[0.02, 0.03, 0.05].map((r) => ({ label: pctOf(r, lang), value: inflationReal({ ...i, rate: r }), current: Math.abs(r - i.rate) < 1e-9 }))}
          format={s.money}
        />
      )}
      askTitle={t.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = inflationResult(i);
        const x = (n: number) => cashExact(n, lang, cur);
        const g = `(1 + ${(i.rate * 100).toFixed(2)}%)^${i.years}`;
        return (
          <ResultSteps
            steps={[`${t.s1} = ${x(i.amount)} ÷ ${g} = ${x(r.real)}`, `${t.s2} = ${x(i.amount)} × ${g} = ${x(r.needed)}`]}
            next={nextLinks(lang, ["compound-interest-calculator", "roi-calculator"])}
          />
        );
      }}
    />
  );
}
