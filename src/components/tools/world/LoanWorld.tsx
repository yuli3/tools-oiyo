// 대출 상환 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 LoanScenario. 계산: lib/world-money-scenarios.ts repay, 문구: lib/world-money-i18n.ts
import { useMemo } from "react";
import { LOAN_EXAMPLE, REPAY_NAME, UNIT, WL_CURRENCY, cashExact, loanAssumptions, loanCompareI, loanPlainI, type WL } from "../../../lib/world-money-i18n";
import { loanInterest, loanResult, type LoanLite, type RepayMethod } from "../../../lib/world-money-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { nextLinks } from "./names";

const KEYS = ["amount", "rate", "months", "method"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<LoanLite>, k: Key[]) => void;
const pctField = (v: number) => Number((v * 100).toFixed(2));

const T = {
  en: { amount: "Loan amount", rate: "Annual interest rate", months: "Term", method: "Repayment method", q1: "How much, at what rate, for how long?", h1: "30 years is 360 months, 10 years is 120. Use the annual rate (APR) from your lender.", q2: "How will you repay?", h2: "Most mortgages and car loans use equal payments. Some business or bridge loans are interest-only.", result: "total interest", monthly: "Monthly payment", first: "First payment", interest: "Total interest", total: "Total repaid", sweep: "A longer term lowers the payment, but total interest climbs almost in a straight line.", chart: "Total interest by repayment method", cap: "Same amount, rate and term.", askTitle: "Good to know", ask: ["Fees, insurance and early-repayment penalties are not included.", "Fixed-rate basis. A variable rate is recalculated whenever the rate changes."], s1: "Monthly rate", s2a: "Payment = P × r(1+r)^n ÷ ((1+r)^n − 1)", s2p: (a: string, f: string, l: string) => `Principal ${a} a month + interest on the balance → first ${f}, last ${l}`, s2b: (f: string, a: string) => `Interest ${f} a month, principal ${a} at maturity`, s3: (i: string, t: string) => `Total interest ${i}, total repaid ${t}` },
  ja: { amount: "借入額", rate: "年利", months: "返済期間", method: "返済方法", q1: "いくらを、何%で、何年借りますか？", h1: "35年は420か月、10年は120か月です。金利は金融機関の年利を入れてください。", q2: "どう返済しますか？", h2: "住宅ローンの多くは元利均等（毎月同じ額）です。", result: "利息の合計", monthly: "毎月の返済額", first: "初月の返済額", interest: "利息の合計", total: "返済総額", sweep: "期間を延ばすと毎月の負担は減りますが、利息の合計はほぼ直線的に増えます。", chart: "返済方法ごとの利息の合計", cap: "借入額・金利・期間は同じです。", askTitle: "知っておきたいこと", ask: ["手数料・保証料・団信・繰上返済手数料は含めていません。", "固定金利で計算しています。変動金利は金利が変わるたびに再計算されます。"], s1: "月利", s2a: "毎月の返済額 = P × r(1+r)^n ÷ ((1+r)^n − 1)", s2p: (a: string, f: string, l: string) => `毎月の元金 ${a} ＋ 残高の利息 → 初月 ${f}、最終月 ${l}`, s2b: (f: string, a: string) => `毎月の利息 ${f}、満期に元金 ${a}`, s3: (i: string, t: string) => `利息の合計 ${i}、返済総額 ${t}` },
  zh: { amount: "贷款本金", rate: "年利率", months: "还款期限", method: "还款方式", q1: "借多少、利率多少、借多久？", h1: "30年是360个月，10年是120个月。利率填银行给出的年利率。", q2: "怎么还？", h2: "房贷多为等额本息（每月相同）。经营贷等常见先息后本。", result: "利息合计", monthly: "每月还款", first: "首月还款", interest: "利息合计", total: "还款总额", sweep: "期限越长月供越低，但利息合计几乎直线上升。", chart: "不同还款方式的利息合计", cap: "本金、利率、期限相同。", askTitle: "需要了解", ask: ["未计手续费、保险和提前还款违约金。", "按固定利率计算。LPR浮动利率在调整时会重新计算。"], s1: "月利率", s2a: "月供 = P × r(1+r)^n ÷ ((1+r)^n − 1)", s2p: (a: string, f: string, l: string) => `每月本金 ${a} + 剩余本金利息 → 首月 ${f}，末月 ${l}`, s2b: (f: string, a: string) => `每月利息 ${f}，到期还本 ${a}`, s3: (i: string, t: string) => `利息合计 ${i}，还款总额 ${t}` },
  fr: { amount: "Montant emprunté", rate: "Taux annuel", months: "Durée", method: "Mode de remboursement", q1: "Combien, à quel taux, sur combien de temps ?", h1: "25 ans = 300 mois, 10 ans = 120 mois. Indiquez le taux nominal annuel de la banque.", q2: "Comment remboursez-vous ?", h2: "La plupart des prêts immobiliers sont à mensualités constantes. Le prêt in fine sert surtout à l'investissement locatif.", result: "les intérêts totaux", monthly: "Mensualité", first: "Première échéance", interest: "Intérêts totaux", total: "Total remboursé", sweep: "Allonger la durée baisse la mensualité, mais les intérêts totaux montent presque en ligne droite.", chart: "Intérêts totaux selon le mode de remboursement", cap: "Même montant, même taux, même durée.", askTitle: "Bon à savoir", ask: ["Assurance emprunteur, frais de dossier, garantie et indemnités de remboursement anticipé non inclus.", "Taux fixe. À taux variable, l'échéance est recalculée à chaque révision."], s1: "Taux mensuel", s2a: "Mensualité = P × r(1+r)^n ÷ ((1+r)^n − 1)", s2p: (a: string, f: string, l: string) => `Capital ${a} par mois + intérêts sur le restant dû → première ${f}, dernière ${l}`, s2b: (f: string, a: string) => `Intérêts ${f} par mois, capital ${a} à l'échéance`, s3: (i: string, t: string) => `Intérêts totaux ${i}, total remboursé ${t}` },
  es: { amount: "Importe del préstamo", rate: "Tipo de interés anual", months: "Plazo", method: "Sistema de amortización", q1: "¿Cuánto, a qué tipo y a qué plazo?", h1: "30 años son 360 meses; 10 años, 120. Usa el tipo nominal anual (TIN) del banco.", q2: "¿Cómo lo devuelves?", h2: "Casi todas las hipotecas en España usan cuota constante (sistema francés).", result: "los intereses totales", monthly: "Cuota mensual", first: "Primera cuota", interest: "Intereses totales", total: "Total devuelto", sweep: "Alargar el plazo baja la cuota, pero los intereses totales suben casi en línea recta.", chart: "Intereses totales según el sistema", cap: "Mismo importe, tipo y plazo.", askTitle: "Conviene saber", ask: ["No incluye comisiones, seguros vinculados ni compensación por amortización anticipada.", "Tipo fijo. Con tipo variable (Euríbor + diferencial) la cuota se recalcula en cada revisión."], s1: "Tipo mensual", s2a: "Cuota = P × r(1+r)^n ÷ ((1+r)^n − 1)", s2p: (a: string, f: string, l: string) => `Capital ${a} al mes + intereses del pendiente → primera ${f}, última ${l}`, s2b: (f: string, a: string) => `Intereses ${f} al mes, capital ${a} al vencimiento`, s3: (i: string, t: string) => `Intereses totales ${i}, total devuelto ${t}` },
};

export default function LoanWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const cur = WL_CURRENCY[lang];
  const assumptions = useMemo(() => loanAssumptions(lang, cur), [lang, cur]);
  const summary = useMemo(() => loanPlainI(lang, cur), [lang, cur]);
  const methods = (Object.keys(REPAY_NAME[lang]) as RepayMethod[]).map((m) => ({ value: m, label: REPAY_NAME[lang][m] }));
  const step = cur === "JPY" ? 1_000_000 : cur === "CNY" ? 10_000 : 5_000;
  const fields = (i: LoanLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <NumberField label={t.amount} value={i.amount} onChange={(v) => edit({ amount: v }, ["amount"])} suffix={cur} step={step} />
      <NumberField label={t.rate} value={pctField(i.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />
      <NumberField label={t.months} value={i.months} onChange={(v) => edit({ months: v }, ["months"])} suffix={UNIT[lang].months} step={12} min={1} />
    </div>
  );
  const method = (i: LoanLite, edit: Edit) => <ChoiceChips<RepayMethod> legend={t.method} value={i.method} options={methods} onChange={(v) => edit({ method: v }, ["method"])} />;
  return (
    <ScenarioTool<LoanLite, Key>
      lang={lang}
      currency={cur}
      toolId="loan-calculator"
      example={LOAN_EXAMPLE[lang]}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={loanInterest}
      resultName={t.result}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["amount", "rate", "months"], body: (
          <>
            {fields(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">{t.h1}</p>
          </>
        ) },
        { title: t.q2, keys: ["method"], body: (
          <>
            {method(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">{t.h2}</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {fields(input, edit)}
          {method(input, edit)}
        </div>
      )}
      summary={summary}
      metrics={(i, s) => {
        const r = loanResult(i);
        return [
          { label: i.method === "annuity" ? t.monthly : t.first, value: s.money(r.first) },
          { label: t.interest, value: s.money(r.interest), tone: "primary" },
          { label: t.total, value: s.money(r.total) },
        ];
      }}
      sliders={["rate", "months", "amount"]}
      sweepCaption={(a) => (a.key === "months" ? t.sweep : undefined)}
      charts={(i, s) => <CompareBars title={t.chart} caption={t.cap} items={loanCompareI(i, lang)} format={s.money} />}
      askTitle={t.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = loanResult(i);
        const x = (n: number) => cashExact(n, lang, cur);
        return (
          <ResultSteps
            steps={[
              `${t.s1} = ${(i.rate * 100).toFixed(2)}% ÷ 12 = ${((i.rate / 12) * 100).toFixed(4)}%`,
              i.method === "annuity" ? `${t.s2a} = ${x(r.first)}` : i.method === "principal" ? t.s2p(x(i.amount / Math.max(1, i.months)), x(r.first), x(r.last)) : t.s2b(x(r.first), x(i.amount)),
              t.s3(x(r.interest), x(r.total)),
            ]}
            next={nextLinks(lang, ["mortgage-calculator", "compound-interest-calculator"])}
          />
        );
      }}
    />
  );
}
