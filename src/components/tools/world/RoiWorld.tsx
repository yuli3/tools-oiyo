// 투자 수익률(ROI) 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 RoiScenario. 문구: lib/world-money-i18n-2.ts
import { useMemo } from "react";
import { ROI_EXAMPLE, roiAssumptions, roiPlainI } from "../../../lib/world-money-i18n-2";
import { UNIT, WL_CURRENCY, cashExact, type WL } from "../../../lib/world-money-i18n";
import { roiProfit, roiResult, type RoiLite } from "../../../lib/world-money-scenarios";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { nextLinks } from "./names";

const KEYS = ["cost", "value", "years"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<RoiLite>, k: Key[]) => void;

const T = {
  en: { cost: "Amount invested", value: "What you got back (or current value)", years: "Holding period", q1: "How much did you put in, and what is it worth now?", q2: "How many years did it take?", result: "the profit", roi: "Return", cagr: "Per year (compound)", mult: "Multiple", chart: "Compared with other choices over the same time", mine: "This investment", dep: "Savings at 3%/yr", infl: "Keeping up with 2.5% inflation", askTitle: "Good to know", ask: ["Return before taxes and fees.", "If you added or withdrew money along the way, IRR is more accurate than simple ROI."] },
  ja: { cost: "投資額", value: "戻ってきたお金（または今の価値）", years: "保有期間", q1: "いくら入れて、いくらになりましたか？", q2: "何年かかりましたか？", result: "損益", roi: "利回り", cagr: "年平均（複利）", mult: "倍率", chart: "同じ期間のほかの選択と比べると", mine: "この投資", dep: "年3%の預金", infl: "物価並み（年2.5%）", askTitle: "知っておきたいこと", ask: ["税金・手数料を引く前の利回りです。", "途中で入金・出金したなら、単純なROIより内部収益率（IRR）が正確です。"] },
  zh: { cost: "投资本金", value: "拿回来的钱（或现值）", years: "持有期限", q1: "投了多少，现在值多少？", q2: "用了几年？", result: "盈亏", roi: "收益率", cagr: "年化（复利）", mult: "倍数", chart: "与同期其他选择比较", mine: "这笔投资", dep: "年利3%存款", infl: "跟上通胀（年2.5%）", askTitle: "需要了解", ask: ["这是扣除税费和手续费前的收益率。", "中途追加或取出资金时，内部收益率（IRR）比简单ROI更准确。"] },
  fr: { cost: "Montant investi", value: "Montant récupéré (ou valeur actuelle)", years: "Durée de détention", q1: "Combien avez-vous investi, et combien cela vaut-il ?", q2: "Combien d'années cela a-t-il pris ?", result: "le gain", roi: "Rendement", cagr: "Par an (composé)", mult: "Multiple", chart: "Comparé à d'autres choix sur la même durée", mine: "Cet investissement", dep: "Livret à 3 %/an", infl: "Au rythme de l'inflation (2,5 %)", askTitle: "Bon à savoir", ask: ["Rendement avant impôts et frais.", "Si vous avez ajouté ou retiré de l'argent en cours de route, le TRI est plus juste que le ROI simple."] },
  es: { cost: "Importe invertido", value: "Lo recuperado (o valor actual)", years: "Periodo de tenencia", q1: "¿Cuánto invertiste y cuánto vale ahora?", q2: "¿Cuántos años pasaron?", result: "la ganancia", roi: "Rentabilidad", cagr: "Anual (compuesta)", mult: "Múltiplo", chart: "Frente a otras opciones en el mismo plazo", mine: "Esta inversión", dep: "Depósito al 3 % anual", infl: "Al ritmo de la inflación (2,5 %)", askTitle: "Conviene saber", ask: ["Rentabilidad antes de impuestos y comisiones.", "Si aportaste o retiraste dinero por el camino, la TIR es más precisa que el ROI simple."] },
};

export default function RoiWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const cur = WL_CURRENCY[lang];
  const assumptions = useMemo(() => roiAssumptions(lang, cur), [lang, cur]);
  const summary = useMemo(() => roiPlainI(lang, cur), [lang, cur]);
  const step = cur === "JPY" ? 10_000 : cur === "CNY" ? 1_000 : 100;
  const money = (i: RoiLite, edit: Edit) => (
    <>
      <NumberField label={t.cost} value={i.cost} onChange={(v) => edit({ cost: v }, ["cost"])} suffix={cur} step={step} />
      <NumberField label={t.value} value={i.value} onChange={(v) => edit({ value: v }, ["value"])} suffix={cur} step={step} />
    </>
  );
  const years = (i: RoiLite, edit: Edit) => <NumberField label={t.years} value={i.years} onChange={(v) => edit({ years: v }, ["years"])} suffix={UNIT[lang].years} step={1} min={1} />;
  return (
    <ScenarioTool<RoiLite, Key>
      lang={lang}
      currency={cur}
      toolId="roi-calculator"
      example={ROI_EXAMPLE[lang]}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={roiProfit}
      resultName={t.result}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["cost", "value"], body: <div className="grid gap-3 sm:grid-cols-2">{money(input, edit)}</div> },
        { title: t.q2, keys: ["years"], body: years(input, edit) },
      ]}
      expert={({ input, edit }) => <div className="grid gap-3 sm:grid-cols-3">{money(input, edit)}{years(input, edit)}</div>}
      summary={summary}
      metrics={(i) => {
        const r = roiResult(i);
        return [
          { label: t.roi, value: `${(r.roi * 100).toFixed(1)}%`, tone: "primary" },
          { label: t.cagr, value: `${(r.cagr * 100).toFixed(1)}%` },
          { label: t.mult, value: `×${r.multiple.toFixed(2)}` },
        ];
      }}
      sliders={["value", "cost"]}
      charts={(i, s) => (
        <CompareBars
          title={t.chart}
          items={[
            { label: t.mine, value: i.value, current: true },
            { label: t.dep, value: i.cost * Math.pow(1.03, i.years) },
            { label: t.infl, value: i.cost * Math.pow(1.025, i.years) },
          ]}
          format={s.money}
        />
      )}
      askTitle={t.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = roiResult(i);
        const x = (n: number) => cashExact(n, lang, cur);
        return (
          <ResultSteps
            steps={[`ROI = (${x(i.value)} − ${x(i.cost)}) ÷ ${x(i.cost)} = ${(r.roi * 100).toFixed(2)}%`, `CAGR = (${r.multiple.toFixed(4)})^(1/${i.years}) − 1 = ${(r.cagr * 100).toFixed(2)}%`]}
            next={nextLinks(lang, ["compound-interest-calculator", "inflation-calculator"])}
          />
        );
      }}
    />
  );
}
