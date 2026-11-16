// 주택담보대출 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 MortgageScenario. 계산: lib/world-money-scenarios.ts, 문구: lib/world-money-i18n.ts
import { useMemo } from "react";
import { MORTGAGE_EXAMPLE, UNIT, WL_CURRENCY, cashExact, mortgageAssumptions, mortgageBridgeI, mortgagePlainI, mortgageTermsI, type WL } from "../../../lib/world-money-i18n";
import { mortgageMonthly, mortgageResult, type MortgageLite } from "../../../lib/world-money-scenarios";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { nextLinks } from "./names";

const KEYS = ["price", "down", "rate", "years"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<MortgageLite>, k: Key[]) => void;
const pctField = (v: number) => Number((v * 100).toFixed(2));

const T = {
  en: { price: "Home price", down: "Down payment", rate: "Annual interest rate", years: "Term", q1: "What's the price, and how much do you put down?", q2: "What rate and term?", h2: "If unsure, keep the example. Your lender's quoted rate makes it more accurate.", result: "the monthly payment", loan: "Loan", monthly: "Monthly payment", ltv: "Loan-to-value", sweep: "Beyond 30 years the payment barely drops while total interest keeps growing.", bridge: "From home price to what you repay", terms: "Total interest by term", askTitle: "Good to know", ask: ["Principal and interest only: property tax, homeowner's insurance, PMI and HOA fees are extra.", "Fixed-rate, equal-payment basis. Closing costs are not included."], s1: (p: string, d: string, l: string, v: string) => `Loan = ${p} − ${d} = ${l} (LTV ${v})`, s2: (n: number, m: string) => `Monthly payment (equal payments, ${n} months) = ${m}`, s3: (i: string, t: string) => `Total interest ${i}, total repaid ${t}` },
  ja: { price: "物件価格", down: "頭金", rate: "年利", years: "返済期間", q1: "物件価格と頭金はいくらですか？", q2: "金利と返済期間は？", h2: "わからなければ例のままで大丈夫です。金融機関の金利を入れるとより正確です。", result: "毎月の返済額", loan: "借入額", monthly: "毎月の返済額", ltv: "借入比率", sweep: "35年を超えると、毎月の返済額はあまり減らず利息だけが増えます。", bridge: "物件価格から返済総額まで", terms: "返済期間ごとの利息の合計", askTitle: "知っておきたいこと", ask: ["諸費用（手数料・登記費用・保証料）、固定資産税、団信・火災保険は含めていません。", "固定金利・元利均等で計算しています。住宅ローン控除も含めていません。"], s1: (p: string, d: string, l: string, v: string) => `借入額 = ${p} − ${d} = ${l}（借入比率 ${v}）`, s2: (n: number, m: string) => `毎月の返済額（元利均等、${n}か月）= ${m}`, s3: (i: string, t: string) => `利息の合計 ${i}、返済総額 ${t}` },
  zh: { price: "房价", down: "首付", rate: "年利率", years: "贷款年限", q1: "房价多少，首付多少？", q2: "利率和年限？", h2: "不确定就保留示例。填银行给的利率更准确。", result: "月供", loan: "贷款", monthly: "月供", ltv: "贷款成数", sweep: "超过30年后月供下降很少，利息却继续增加。", bridge: "从房价到还款总额", terms: "不同年限的利息合计", askTitle: "需要了解", ask: ["未计契税、中介费、评估费和保险。", "按固定利率、等额本息计算。公积金贷款利率更低，可分开计算。"], s1: (p: string, d: string, l: string, v: string) => `贷款 = ${p} − ${d} = ${l}（成数 ${v}）`, s2: (n: number, m: string) => `月供（等额本息，${n}个月）= ${m}`, s3: (i: string, t: string) => `利息合计 ${i}，还款总额 ${t}` },
  fr: { price: "Prix du logement", down: "Apport personnel", rate: "Taux annuel", years: "Durée", q1: "Quel est le prix, et quel est votre apport ?", q2: "Quel taux et quelle durée ?", h2: "Dans le doute, gardez l'exemple. Le taux proposé par votre banque sera plus précis.", result: "la mensualité", loan: "Prêt", monthly: "Mensualité", ltv: "Part financée", sweep: "Au-delà de 25 ans, la mensualité baisse peu alors que les intérêts continuent de grimper.", bridge: "Du prix au total remboursé", terms: "Intérêts totaux selon la durée", askTitle: "Bon à savoir", ask: ["Assurance emprunteur, frais de notaire, garantie et frais de dossier non inclus.", "En France, la durée est en général limitée à 25 ans et le taux d'endettement à 35 %."], s1: (p: string, d: string, l: string, v: string) => `Prêt = ${p} − ${d} = ${l} (part financée ${v})`, s2: (n: number, m: string) => `Mensualité (constante, ${n} mois) = ${m}`, s3: (i: string, t: string) => `Intérêts totaux ${i}, total remboursé ${t}` },
  es: { price: "Precio de la vivienda", down: "Entrada", rate: "Tipo de interés anual", years: "Plazo", q1: "¿Cuánto cuesta la vivienda y cuánto pones de entrada?", q2: "¿Qué tipo y qué plazo?", h2: "Si dudas, deja el ejemplo. El tipo que te ofrezca el banco será más exacto.", result: "la cuota mensual", loan: "Préstamo", monthly: "Cuota mensual", ltv: "Porcentaje financiado", sweep: "Más allá de 30 años la cuota apenas baja y los intereses siguen subiendo.", bridge: "Del precio al total devuelto", terms: "Intereses totales según el plazo", askTitle: "Conviene saber", ask: ["No incluye ITP o IVA, notaría, registro, tasación ni seguros vinculados.", "Tipo fijo y cuota constante. Con Euríbor la cuota se revisa cada 6 o 12 meses."], s1: (p: string, d: string, l: string, v: string) => `Préstamo = ${p} − ${d} = ${l} (financiado ${v})`, s2: (n: number, m: string) => `Cuota (constante, ${n} meses) = ${m}`, s3: (i: string, t: string) => `Intereses totales ${i}, total devuelto ${t}` },
};

export default function MortgageWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const cur = WL_CURRENCY[lang];
  const assumptions = useMemo(() => mortgageAssumptions(lang, cur), [lang, cur]);
  const summary = useMemo(() => mortgagePlainI(lang, cur), [lang, cur]);
  const step = cur === "JPY" ? 1_000_000 : cur === "CNY" ? 50_000 : 5_000;
  const priceDown = (i: MortgageLite, edit: Edit) => (
    <>
      <NumberField label={t.price} value={i.price} onChange={(v) => edit({ price: v }, ["price"])} suffix={cur} step={step} />
      <NumberField label={t.down} value={i.down} onChange={(v) => edit({ down: v }, ["down"])} suffix={cur} step={step} />
    </>
  );
  const rateYears = (i: MortgageLite, edit: Edit) => (
    <>
      <NumberField label={t.rate} value={pctField(i.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.05} />
      <NumberField label={t.years} value={i.years} onChange={(v) => edit({ years: v }, ["years"])} suffix={UNIT[lang].years} step={5} min={1} />
    </>
  );
  return (
    <ScenarioTool<MortgageLite, Key>
      lang={lang}
      currency={cur}
      toolId="mortgage-calculator"
      example={MORTGAGE_EXAMPLE[lang]}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={mortgageMonthly}
      resultName={t.result}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["price", "down"], body: <div className="grid gap-3 sm:grid-cols-2">{priceDown(input, edit)}</div> },
        { title: t.q2, keys: ["rate", "years"], body: (
          <>
            <div className="grid gap-3 sm:grid-cols-2">{rateYears(input, edit)}</div>
            <p className="mt-2 text-xs text-muted-foreground">{t.h2}</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => <div className="grid gap-3 sm:grid-cols-2">{priceDown(input, edit)}{rateYears(input, edit)}</div>}
      summary={summary}
      metrics={(i, s) => {
        const r = mortgageResult(i);
        return [
          { label: t.loan, value: s.money(r.loan) },
          { label: t.monthly, value: s.money(r.monthly), tone: "primary" },
          { label: t.ltv, value: `${Math.round(r.ltv * 100)}%` },
        ];
      }}
      sliders={["rate", "down", "years"]}
      sweepCaption={(a) => (a.key === "years" ? t.sweep : undefined)}
      charts={(i, s) => (
        <div className="space-y-4">
          <BridgeChart title={t.bridge} steps={mortgageBridgeI(i, lang)} format={s.money} />
          <CompareBars title={t.terms} items={mortgageTermsI(i, lang)} format={s.money} />
        </div>
      )}
      askTitle={t.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = mortgageResult(i);
        const x = (n: number) => cashExact(n, lang, cur);
        return (
          <ResultSteps
            steps={[t.s1(x(i.price), x(i.down), x(r.loan), `${(r.ltv * 100).toFixed(1)}%`), t.s2(r.months, x(r.monthly)), t.s3(x(r.interest), x(r.total))]}
            next={nextLinks(lang, ["loan-calculator", "compound-interest-calculator"])}
          />
        );
      }}
    />
  );
}
