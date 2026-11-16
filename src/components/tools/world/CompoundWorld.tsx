// 복리 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 CompoundScenario. 계산: lib/world-money-scenarios.ts, 문구: lib/world-money-i18n.ts
import { useMemo } from "react";
import { COMPOUND_EXAMPLE, UNIT, WL_CURRENCY, cashExact, compoundAssumptions, compoundBridgeI, compoundPlainI, type WL } from "../../../lib/world-money-i18n";
import { compoundFv, compoundResult, type CompoundLite } from "../../../lib/world-money-scenarios";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool from "../viz/ScenarioTool";
import { nextLinks } from "./names";

const KEYS = ["principal", "monthly", "rate", "years"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<CompoundLite>, k: Key[]) => void;
const pctField = (v: number) => Number((v * 100).toFixed(2));

const T = {
  en: { principal: "Starting amount", principalQ: "Starting amount (0 if none)", monthly: "Monthly contribution", rate: "Annual return", years: "Period", q1: "How much to start, and how much each month?", q2: "For how long, and at what return?", hint: "Savings accounts pay around 2–4%; broad stock indexes have averaged around 7% over the long run. If unsure, keep the example.", result: "the final amount", after: (y: number) => `After ${y} years`, paid: "Paid in", gain: "Growth", sweep: "The longer the period, the steeper the curve. That's compounding.", chart: "How the final amount builds up", askTitle: "Good to know", ask: ["Taxes, fees and inflation are left out; interest compounds monthly.", "Real returns go up and down each year. The same average return can end in a different result."], steps: (fv: string, paid: string, gain: string) => `= ${fv} (paid in ${paid}, growth ${gain})` },
  ja: { principal: "最初の元手", principalQ: "最初の元手（なければ0）", monthly: "毎月の積立額", rate: "年利回り", years: "期間", q1: "最初にいくら、毎月いくら積み立てますか？", q2: "何年、何%で運用しますか？", hint: "預金は1%未満、株式インデックスの長期平均は5〜7%程度です。わからなければ例のままで大丈夫です。", result: "最終金額", after: (y: number) => `${y}年後`, paid: "積み立てた額", gain: "運用益", sweep: "期間が長くなるほど曲線が急になります。これが複利です。", chart: "最終金額ができるまで", askTitle: "知っておきたいこと", ask: ["税金・手数料・物価上昇は含めず、毎月複利で計算しています。", "実際の利回りは毎年上下します。平均が同じでも結果は変わることがあります。"], steps: (fv: string, paid: string, gain: string) => `= ${fv}（積立 ${paid}、運用益 ${gain}）` },
  zh: { principal: "初始本金", principalQ: "初始本金（没有填0）", monthly: "每月定投", rate: "年化收益率", years: "期限", q1: "一开始投多少，每月投多少？", q2: "投多少年，年化多少？", hint: "存款约1.5%~2%，股票指数长期平均约5%~7%。不确定就保留示例。", result: "最终金额", after: (y: number) => `${y}年后`, paid: "投入本金", gain: "收益", sweep: "期限越长，曲线越陡。这就是复利。", chart: "最终金额的构成", askTitle: "需要了解", ask: ["未计税费、手续费和通胀，按月复利计算。", "实际收益每年起伏，平均收益相同，结果也可能不同。"], steps: (fv: string, paid: string, gain: string) => `= ${fv}（本金 ${paid}，收益 ${gain}）` },
  fr: { principal: "Capital de départ", principalQ: "Capital de départ (0 si aucun)", monthly: "Versement mensuel", rate: "Rendement annuel", years: "Durée", q1: "Combien au départ, et combien chaque mois ?", q2: "Pendant combien de temps, à quel rendement ?", hint: "Le Livret A rapporte environ 2-3 % ; les indices actions ont fait autour de 7 % sur le long terme. Dans le doute, gardez l'exemple.", result: "le montant final", after: (y: number) => `Après ${y} ans`, paid: "Versé", gain: "Gains", sweep: "Plus la durée s'allonge, plus la courbe se redresse : ce sont les intérêts composés.", chart: "Comment se forme le montant final", askTitle: "Bon à savoir", ask: ["Impôts, frais et inflation non inclus ; capitalisation mensuelle.", "Les rendements réels varient chaque année : un même rendement moyen peut donner un résultat différent."], steps: (fv: string, paid: string, gain: string) => `= ${fv} (versé ${paid}, gains ${gain})` },
  es: { principal: "Capital inicial", principalQ: "Capital inicial (0 si no hay)", monthly: "Aportación mensual", rate: "Rentabilidad anual", years: "Plazo", q1: "¿Cuánto al principio y cuánto cada mes?", q2: "¿Durante cuánto tiempo y a qué rentabilidad?", hint: "Los depósitos dan en torno al 2-3 %; los índices de bolsa han rondado el 7 % a largo plazo. Si dudas, deja el ejemplo.", result: "el importe final", after: (y: number) => `Tras ${y} años`, paid: "Aportado", gain: "Rentabilidad", sweep: "Cuanto más largo el plazo, más empinada la curva. Eso es el interés compuesto.", chart: "Cómo se forma el importe final", askTitle: "Conviene saber", ask: ["Sin impuestos, comisiones ni inflación; capitalización mensual.", "La rentabilidad real sube y baja cada año: la misma media puede dar otro resultado."], steps: (fv: string, paid: string, gain: string) => `= ${fv} (aportado ${paid}, rentabilidad ${gain})` },
};

export default function CompoundWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const cur = WL_CURRENCY[lang];
  const u = UNIT[lang];
  const assumptions = useMemo(() => compoundAssumptions(lang, cur), [lang, cur]);
  const summary = useMemo(() => compoundPlainI(lang, cur), [lang, cur]);
  const step = cur === "JPY" ? 10_000 : cur === "CNY" ? 1_000 : 100;
  const money = (label: string, key: "principal" | "monthly", i: CompoundLite, edit: Edit) => <NumberField label={label} value={i[key]} onChange={(v) => edit({ [key]: v } as Partial<CompoundLite>, [key])} suffix={cur} step={step} />;
  const rateYears = (i: CompoundLite, edit: Edit) => (
    <>
      <NumberField label={t.years} value={i.years} onChange={(v) => edit({ years: v }, ["years"])} suffix={u.years} step={1} min={1} />
      <NumberField label={t.rate} value={pctField(i.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.5} />
    </>
  );
  return (
    <ScenarioTool<CompoundLite, Key>
      lang={lang}
      currency={cur}
      toolId="compound-interest-calculator"
      example={COMPOUND_EXAMPLE[lang]}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={compoundFv}
      resultName={t.result}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["principal", "monthly"], body: <div className="grid gap-3 sm:grid-cols-2">{money(t.principalQ, "principal", input, edit)}{money(t.monthly, "monthly", input, edit)}</div> },
        { title: t.q2, keys: ["years", "rate"], body: (
          <>
            <div className="grid gap-3 sm:grid-cols-2">{rateYears(input, edit)}</div>
            <p className="mt-2 text-xs text-muted-foreground">{t.hint}</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => <div className="grid gap-3 sm:grid-cols-2">{money(t.principal, "principal", input, edit)}{money(t.monthly, "monthly", input, edit)}{rateYears(input, edit)}</div>}
      summary={summary}
      metrics={(i, s) => {
        const r = compoundResult(i);
        return [
          { label: t.after(i.years), value: s.money(r.fv), tone: "primary" },
          { label: t.paid, value: s.money(r.paid) },
          { label: t.gain, value: s.money(r.gain) },
        ];
      }}
      sliders={["rate", "years", "monthly"]}
      sweepCaption={(a) => (a.key === "years" ? t.sweep : undefined)}
      charts={(i, s) => <BridgeChart title={t.chart} steps={compoundBridgeI(i, lang)} format={s.money} />}
      askTitle={t.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = compoundResult(i);
        const x = (n: number) => cashExact(n, lang, cur);
        return (
          <ResultSteps
            steps={[`FV = P(1+r)^n + PMT × ((1+r)^n − 1) ÷ r, r = ${((i.rate / 12) * 100).toFixed(4)}%, n = ${Math.round(i.years * 12)}`, t.steps(x(r.fv), x(r.paid), x(r.gain))]}
            next={nextLinks(lang, ["fire-retirement-calculator", "loan-calculator"])}
          />
        );
      }}
    />
  );
}
