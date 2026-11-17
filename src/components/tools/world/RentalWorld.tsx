// 임대 수익률 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 RentalScenario. 문구: lib/world-money-i18n-2.ts
// 한국식 큰 보증금이 없는 나라 기준이라 보증금 입력은 빼고 0으로 둬요.
import { useMemo } from "react";
import { RENTAL_EXAMPLE, rentalAssumptions, rentalBridgeI, rentalPlainI } from "../../../lib/world-money-i18n-2";
import { WL_CURRENCY, cashExact, type WL } from "../../../lib/world-money-i18n";
import { rentalNet, rentalResult, type RentalLite } from "../../../lib/world-money-scenarios";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool from "../viz/ScenarioTool";
import { nextLinks } from "./names";

const KEYS = ["price", "deposit", "rent", "loan", "loanRate", "vacancy", "costs"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<RentalLite>, k: Key[]) => void;
const pctField = (v: number) => Number((v * 100).toFixed(2));

const T = {
  en: { price: "Purchase price", rent: "Monthly rent", loan: "Loan", loanRate: "Loan rate", vacancy: "Vacancy", costs: "Yearly costs (tax, insurance, repairs)", q1: "Price, rent and loan?", q2: "Loan rate and costs?", h2: "5% vacancy is about 18 empty days a year. If unsure, keep the example.", result: "the yearly net", equity: "Your money", monthly: "Net per month", cy: "Cash-on-cash return", sweep: "Where the curve drops below zero, the property loses money.", chart: "From rent to yearly net", askTitle: "Good to know", ask: ["Income tax, purchase costs and property management fees are not included.", "Changes in the property's value are left out: this is one year of cash flow."], s1: "Your money", s2: "Net = rent × 12 × (1 − vacancy) − interest − costs", s3: "Gross yield", s4: "cash-on-cash" },
  ja: { price: "購入価格", rent: "月額家賃", loan: "借入額", loanRate: "ローン金利", vacancy: "空室率", costs: "年間費用（固定資産税・管理費・修繕）", q1: "物件価格・家賃・借入額は？", q2: "金利と費用は？", h2: "空室率5%は年に約18日空く程度です。わからなければ例のままで大丈夫です。", result: "年間の手取り", equity: "自己資金", monthly: "月の手取り", cy: "自己資金利回り", sweep: "曲線が0を下回る金利から赤字です。", chart: "家賃から年間の手取りまで", askTitle: "知っておきたいこと", ask: ["所得税・住民税、購入時の諸費用、管理委託料は含めていません。", "物件価格の上下は含めず、1年の現金の流れだけを見ています。"], s1: "自己資金", s2: "手取り = 家賃 × 12 ×（1 − 空室率）− 利息 − 費用", s3: "表面利回り", s4: "自己資金利回り" },
  zh: { price: "购买价格", rent: "月租金", loan: "贷款", loanRate: "贷款利率", vacancy: "空置率", costs: "年费用（物业费、维修等）", q1: "房价、租金和贷款？", q2: "贷款利率和费用？", h2: "空置率5%约等于一年空置18天。不确定就保留示例。", result: "年净收益", equity: "自有资金", monthly: "月净收益", cy: "自有资金回报率", sweep: "曲线跌破0的利率开始亏损。", chart: "从租金到年净收益", askTitle: "需要了解", ask: ["未计个人所得税、购房税费和中介管理费。", "未计房价涨跌，只看一年的现金流。"], s1: "自有资金", s2: "净收益 = 租金 × 12 ×（1 − 空置率）− 利息 − 费用", s3: "毛回报率", s4: "自有资金回报率" },
  fr: { price: "Prix d'achat", rent: "Loyer mensuel", loan: "Prêt", loanRate: "Taux du prêt", vacancy: "Vacance locative", costs: "Charges annuelles (taxe foncière, assurance, travaux)", q1: "Prix, loyer et prêt ?", q2: "Taux du prêt et charges ?", h2: "5 % de vacance, c'est environ 18 jours vides par an. Dans le doute, gardez l'exemple.", result: "le net annuel", equity: "Votre apport", monthly: "Net par mois", cy: "Rendement sur apport", sweep: "Là où la courbe passe sous zéro, le bien perd de l'argent.", chart: "Du loyer au net annuel", askTitle: "Bon à savoir", ask: ["Impôt sur les revenus fonciers, prélèvements sociaux, frais de notaire et gestion locative non inclus.", "Évolution du prix du bien non prise en compte : un an de trésorerie seulement."], s1: "Apport", s2: "Net = loyer × 12 × (1 − vacance) − intérêts − charges", s3: "Rentabilité brute", s4: "sur apport" },
  es: { price: "Precio de compra", rent: "Alquiler mensual", loan: "Préstamo", loanRate: "Tipo del préstamo", vacancy: "Desocupación", costs: "Gastos anuales (IBI, comunidad, seguro, reparaciones)", q1: "¿Precio, alquiler y préstamo?", q2: "¿Tipo del préstamo y gastos?", h2: "Un 5 % de desocupación son unos 18 días vacío al año. Si dudas, deja el ejemplo.", result: "el neto anual", equity: "Tu dinero", monthly: "Neto al mes", cy: "Rentabilidad sobre lo aportado", sweep: "Donde la curva baja de cero, el piso da pérdidas.", chart: "Del alquiler al neto anual", askTitle: "Conviene saber", ask: ["No incluye IRPF, impuestos de compra (ITP/IVA), notaría ni gestión del alquiler.", "No incluye cambios en el valor del piso: solo un año de flujo de caja."], s1: "Tu dinero", s2: "Neto = alquiler × 12 × (1 − desocupación) − intereses − gastos", s3: "Rentabilidad bruta", s4: "sobre lo aportado" },
};

export default function RentalWorld({ lang, toolId = "rental-yield-calculator" }: { lang: WL; toolId?: string }) {
  const t = T[lang];
  const cur = WL_CURRENCY[lang];
  const assumptions = useMemo(() => rentalAssumptions(lang, cur), [lang, cur]);
  const summary = useMemo(() => rentalPlainI(lang, cur), [lang, cur]);
  const step = cur === "JPY" ? 100_000 : cur === "CNY" ? 10_000 : 1_000;
  const small = cur === "JPY" ? 1_000 : cur === "CNY" ? 100 : 50;
  const big = (i: RentalLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <NumberField label={t.price} value={i.price} onChange={(v) => edit({ price: v }, ["price"])} suffix={cur} step={step} />
      <NumberField label={t.rent} value={i.rent} onChange={(v) => edit({ rent: v }, ["rent"])} suffix={cur} step={small} />
      <NumberField label={t.loan} value={i.loan} onChange={(v) => edit({ loan: v }, ["loan"])} suffix={cur} step={step} />
    </div>
  );
  const rest = (i: RentalLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <NumberField label={t.loanRate} value={pctField(i.loanRate)} onChange={(v) => edit({ loanRate: v / 100 }, ["loanRate"])} suffix="%" step={0.1} />
      <NumberField label={t.vacancy} value={Math.round(i.vacancy * 100)} onChange={(v) => edit({ vacancy: v / 100 }, ["vacancy"])} suffix="%" step={1} min={0} />
      <NumberField label={t.costs} value={i.costs} onChange={(v) => edit({ costs: v }, ["costs"])} suffix={cur} step={small * 10} />
    </div>
  );
  return (
    <ScenarioTool<RentalLite, Key>
      lang={lang}
      currency={cur}
      toolId={toolId}
      example={RENTAL_EXAMPLE[lang]}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={rentalNet}
      resultName={t.result}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["price", "rent", "loan"], body: big(input, edit) },
        { title: t.q2, keys: ["loanRate", "vacancy", "costs"], body: (
          <>
            {rest(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">{t.h2}</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {big(input, edit)}
          {rest(input, edit)}
        </div>
      )}
      summary={summary}
      metrics={(i, s) => {
        const r = rentalResult(i);
        return [
          { label: t.equity, value: s.money(r.equity) },
          { label: t.monthly, value: s.money(r.monthly), tone: "primary" },
          { label: t.cy, value: Number.isFinite(r.cashYield) ? `${(r.cashYield * 100).toFixed(1)}%` : "—" },
        ];
      }}
      sliders={["rent", "loanRate", "vacancy", "costs"]}
      sweepCaption={(a) => (a.key === "loanRate" ? t.sweep : undefined)}
      charts={(i, s) => <BridgeChart title={t.chart} steps={rentalBridgeI(i, lang)} format={s.money} />}
      askTitle={t.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = rentalResult(i);
        const x = (n: number) => cashExact(n, lang, cur);
        return (
          <ResultSteps
            steps={[
              `${t.s1} = ${x(i.price)} − ${x(i.loan)} = ${x(r.equity)}`,
              `${t.s2} = ${x(r.net)}`,
              `${t.s3} ${(r.gross * 100).toFixed(2)}%, ${t.s4} ${Number.isFinite(r.cashYield) ? (r.cashYield * 100).toFixed(2) + "%" : "—"}`,
            ]}
            next={nextLinks(lang, ["mortgage-calculator", "roi-calculator"])}
          />
        );
      }}
    />
  );
}
