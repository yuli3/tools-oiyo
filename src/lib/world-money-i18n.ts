// 3묶음 세계 공용 돈 계산기의 다른 언어 판(en·ja·zh·fr·es) 가정 목록·결과 문장 (2026-11-17).
// 계산은 world-money-scenarios.ts 그대로 쓰고, 문구와 통화 단위만 언어별로 바꿔요. 금액 범위는 USD 기준 × SCALE.
import { compoundResult, fireResult, mortgageResult, repay, type CompoundLite, type FireLite, type LoanLite, type MortgageLite, type RepayMethod } from "./world-money-scenarios.ts";
import { fixedRange, type Assumption, type BridgeStep, type TornadoBar } from "./scenario.ts";

export type WL = "en" | "ja" | "zh" | "fr" | "es";
export const WL_CURRENCY: Record<WL, string> = { en: "USD", ja: "JPY", zh: "CNY", fr: "EUR", es: "EUR" };
const INTL: Record<WL, string> = { en: "en-US", ja: "ja-JP", zh: "zh-CN", fr: "fr-FR", es: "es-ES" };
/** USD 1에 해당하는 대략의 금액(범위·예시용, 환율 계산 아님) */
const SCALE: Record<string, number> = { USD: 1, EUR: 1, JPY: 150, CNY: 7, TWD: 32 };
const sc = (cur: string) => SCALE[cur] ?? 1;

/** 짧은 금액(1.2M, 120万). Node·브라우저 ICU 차이를 막으려고 minimumFractionDigits 0을 꼭 넣어요. */
export function cash(n: number, lang: WL, cur: string): string {
  if (!Number.isFinite(n)) return "—";
  const big = Math.abs(n) >= 10_000;
  return new Intl.NumberFormat(INTL[lang], { style: "currency", currency: cur, maximumFractionDigits: big ? 1 : 0, minimumFractionDigits: 0, ...(big ? { notation: "compact" as const } : {}) }).format(n);
}
/** 끝자리까지 */
export const cashExact = (n: number, lang: WL, cur: string) =>
  Number.isFinite(n) ? new Intl.NumberFormat(INTL[lang], { style: "currency", currency: cur, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(n) : "—";
export const pctOf = (r: number, lang: WL) => new Intl.NumberFormat(INTL[lang], { style: "percent", maximumFractionDigits: 1, minimumFractionDigits: 0 }).format(r);
const num = (n: number, lang: WL, d = 1) => new Intl.NumberFormat(INTL[lang], { maximumFractionDigits: d, minimumFractionDigits: 0 }).format(n);

export const YEARS: Record<WL, (n: number) => string> = {
  en: (n) => `${n} yr`,
  ja: (n) => `${n}年`,
  zh: (n) => `${n}年`,
  fr: (n) => `${n} ans`,
  es: (n) => `${n} años`,
};
export const UNIT: Record<WL, { years: string; months: string; age: string }> = {
  en: { years: "years", months: "months", age: "years old" },
  ja: { years: "年", months: "か月", age: "歳" },
  zh: { years: "年", months: "个月", age: "岁" },
  fr: { years: "ans", months: "mois", age: "ans" },
  es: { years: "años", months: "meses", age: "años" },
};

/** "결과를 가장 크게 움직이는 가정" 한 줄 */
export function driverOf(lang: WL, top: TornadoBar | undefined, what: string, fmt: (n: number) => string): string | null {
  if (!top || !(top.span > 0)) return null;
  const a = fmt(Math.min(top.low, top.high));
  const b = fmt(Math.max(top.low, top.high));
  return {
    en: `The biggest driver is ${top.plain}. Moving it 20% up or down puts ${what} between ${a} and ${b}.`,
    ja: `結果をいちばん大きく動かすのは${top.plain}です。この値が20%増減すると、${what}は${a}〜${b}の間で変わります。`,
    zh: `对结果影响最大的是${top.plain}。它上下变动20%时，${what}在${a}到${b}之间。`,
    fr: `Le facteur le plus influent : ${top.plain}. S'il varie de 20 %, ${what} va de ${a} à ${b}.`,
    es: `Lo que más mueve el resultado: ${top.plain}. Si cambia un 20 %, ${what} queda entre ${a} y ${b}.`,
  }[lang];
}

type Names = Record<WL, [label: string, plain: string]>;
const money = <I>(lang: WL, key: string, n: Names, get: (i: I) => number, set: (i: I, v: number) => I, range: (a: number) => [number, number]): Assumption<I> => ({
  key, label: n[lang][0], plain: n[lang][1], unit: "won", kind: "assumption", get, set, range,
});
const RATE: Names = { en: ["Annual interest rate", "the interest rate"], ja: ["年利", "金利"], zh: ["年利率", "利率"], fr: ["Taux annuel", "le taux"], es: ["Tipo de interés anual", "el tipo de interés"] };

// ───────────────────────── 복리 ─────────────────────────

export const COMPOUND_EXAMPLE: Record<WL, CompoundLite> = {
  en: { principal: 10_000, monthly: 500, rate: 0.07, years: 20 },
  ja: { principal: 1_000_000, monthly: 50_000, rate: 0.05, years: 20 },
  zh: { principal: 50_000, monthly: 3_000, rate: 0.04, years: 20 },
  fr: { principal: 10_000, monthly: 300, rate: 0.05, years: 20 },
  es: { principal: 10_000, monthly: 300, rate: 0.05, years: 20 },
};

export function compoundAssumptions(lang: WL, cur: string): Assumption<CompoundLite>[] {
  const s = sc(cur);
  return [
    { key: "rate", label: { en: "Annual return", ja: "年利回り", zh: "年化收益率", fr: "Rendement annuel", es: "Rentabilidad anual" }[lang], plain: { en: "the return", ja: "利回り", zh: "收益率", fr: "le rendement", es: "la rentabilidad" }[lang], unit: "rate", kind: "assumption", get: (i) => i.rate, set: (i, v) => ({ ...i, rate: v }), range: fixedRange(0, 0.15) },
    { key: "years", label: { en: "Investment period", ja: "運用期間", zh: "投资期限", fr: "Durée", es: "Plazo" }[lang], plain: { en: "the period", ja: "期間", zh: "年数", fr: "la durée", es: "el plazo" }[lang], unit: "years", kind: "assumption", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(1, Math.round(v)) }), range: fixedRange(1, 50) },
    money<CompoundLite>(lang, "monthly", { en: ["Monthly contribution", "the monthly saving"], ja: ["毎月の積立額", "毎月の積立"], zh: ["每月定投", "每月投入"], fr: ["Versement mensuel", "le versement mensuel"], es: ["Aportación mensual", "la aportación mensual"] }, (i) => i.monthly, (i, v) => ({ ...i, monthly: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 1_500 * s)]),
    money<CompoundLite>(lang, "principal", { en: ["Initial investment", "the starting amount"], ja: ["初期投資額", "最初の元手"], zh: ["初始本金", "一开始的钱"], fr: ["Capital initial", "le capital de départ"], es: ["Capital inicial", "el capital inicial"] }, (i) => i.principal, (i, v) => ({ ...i, principal: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 40_000 * s)]),
  ];
}

export function compoundBridgeI(i: CompoundLite, lang: WL): BridgeStep[] {
  const r = compoundResult(i);
  const n = Math.round(i.years * 12);
  const L = {
    en: ["Starting amount", "Monthly contributions", "Compound growth", `After ${i.years} years`],
    ja: ["最初の元手", "毎月の積立合計", "複利で増えた分", `${i.years}年後`],
    zh: ["初始本金", "每月投入合计", "复利收益", `${i.years}年后`],
    fr: ["Capital de départ", "Versements cumulés", "Gains composés", `Après ${i.years} ans`],
    es: ["Capital inicial", "Aportaciones acumuladas", "Rentabilidad compuesta", `Tras ${i.years} años`],
  }[lang];
  return [
    { label: L[0], value: Math.max(0, i.principal), kind: "add" },
    { label: L[1], value: Math.max(0, i.monthly) * n, kind: "add" },
    { label: L[2], value: r.gain, kind: "add" },
    { label: L[3], value: r.fv, kind: "total" },
  ];
}

export const compoundPlainI = (lang: WL, cur: string) => (i: CompoundLite, top?: TornadoBar) => {
  const r = compoundResult(i);
  const late = compoundResult({ ...i, years: Math.max(1, i.years - 5) });
  const m = (n: number) => cash(n, lang, cur);
  const p = pctOf(i.rate, lang);
  const d = Number.isFinite(r.doubling) ? num(r.doubling, lang) : "";
  const y5 = i.years - 5;
  const T = {
    en: {
      head: `In ${i.years} years you'd have about ${m(r.fv)}: ${m(r.paid)} paid in plus about ${m(r.gain)} of growth.`,
      dbl: d ? `At ${p} a year, money doubles in about ${d} years (close to the rule of 72).` : "At 0% you only get back what you put in.",
      late: i.years > 5 ? `Start 5 years later and invest for only ${y5} years, and you end with about ${m(late.fv)}, ${m(r.fv - late.fv)} less. Time is compounding's biggest lever.` : "The longer the period, the more growth earns growth, so the curve gets steeper.",
      tax: "Taxes, fees and inflation are left out; interest compounds monthly. Tax-advantaged accounts let you keep more of the growth.",
      what: "the final amount",
    },
    ja: {
      head: `${i.years}年後に約${m(r.fv)}になります。積み立てた${m(r.paid)}に、約${m(r.gain)}の運用益が上乗せされます。`,
      dbl: d ? `年${p}なら、お金が2倍になるまで約${d}年です（72の法則とほぼ同じ）。` : "利回り0%なら積み立てた額のままです。",
      late: i.years > 5 ? `5年遅れて${y5}年だけ運用すると約${m(late.fv)}で、${m(r.fv - late.fv)}の差がつきます。複利でいちばん効くのは期間です。` : "期間が長いほど運用益がさらに利益を生み、曲線が急になります。",
      tax: "税金・手数料・物価上昇は含めず、毎月複利で計算しています。NISAやiDeCoを使うと税金を抑えられます。",
      what: "最終金額",
    },
    zh: {
      head: `${i.years}年后约为${m(r.fv)}。投入${m(r.paid)}，收益约${m(r.gain)}。`,
      dbl: d ? `年化${p}时，资金翻倍约需${d}年（接近72法则）。` : "收益率为0时，只有投入的本金。",
      late: i.years > 5 ? `晚5年开始、只投资${y5}年，约为${m(late.fv)}，相差${m(r.fv - late.fv)}。复利最大的力量是时间。` : "期限越长，收益再生收益，曲线越陡。",
      tax: "未计税费、手续费和通胀，按月复利计算。",
      what: "最终金额",
    },
    fr: {
      head: `Dans ${i.years} ans, vous auriez environ ${m(r.fv)} : ${m(r.paid)} versés et environ ${m(r.gain)} de gains.`,
      dbl: d ? `À ${p} par an, l'argent double en environ ${d} ans (proche de la règle de 72).` : "À 0 %, vous récupérez seulement ce que vous avez versé.",
      late: i.years > 5 ? `En commençant 5 ans plus tard (${y5} ans de placement), vous auriez environ ${m(late.fv)}, soit ${m(r.fv - late.fv)} de moins. La durée est le plus grand levier.` : "Plus la durée est longue, plus les gains produisent des gains : la courbe s'accentue.",
      tax: "Impôts, frais et inflation non inclus ; capitalisation mensuelle. Un PEA ou une assurance-vie réduit l'impôt sur les gains.",
      what: "le montant final",
    },
    es: {
      head: `Dentro de ${i.years} años tendrías unos ${m(r.fv)}: ${m(r.paid)} aportados y unos ${m(r.gain)} de rentabilidad.`,
      dbl: d ? `Al ${p} anual, el dinero se duplica en unos ${d} años (parecido a la regla del 72).` : "Al 0 % solo recuperas lo aportado.",
      late: i.years > 5 ? `Si empiezas 5 años más tarde e inviertes solo ${y5} años, tendrías unos ${m(late.fv)}: ${m(r.fv - late.fv)} menos. El tiempo es la mayor palanca del interés compuesto.` : "Cuanto más largo el plazo, más rentabilidad genera la rentabilidad y más se empina la curva.",
      tax: "Sin impuestos, comisiones ni inflación; capitalización mensual. Los planes de pensiones o fondos traspasables pueden diferir impuestos.",
      what: "el importe final",
    },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, m), reasons: [T.dbl, T.late, T.tax] };
};

// ───────────────────────── 대출 상환 방식 ─────────────────────────

export const REPAY_NAME: Record<WL, Record<RepayMethod, string>> = {
  en: { annuity: "Equal payments", principal: "Equal principal", bullet: "Interest-only (balloon)" },
  ja: { annuity: "元利均等", principal: "元金均等", bullet: "期日一括" },
  zh: { annuity: "等额本息", principal: "等额本金", bullet: "先息后本" },
  fr: { annuity: "Mensualités constantes", principal: "Amortissement constant", bullet: "In fine" },
  es: { annuity: "Cuota constante", principal: "Amortización constante", bullet: "Al vencimiento" },
};

export const LOAN_EXAMPLE: Record<WL, LoanLite> = {
  en: { amount: 250_000, rate: 0.065, months: 360, method: "annuity" },
  ja: { amount: 30_000_000, rate: 0.015, months: 420, method: "annuity" },
  zh: { amount: 1_000_000, rate: 0.035, months: 360, method: "annuity" },
  fr: { amount: 200_000, rate: 0.035, months: 300, method: "annuity" },
  es: { amount: 200_000, rate: 0.03, months: 360, method: "annuity" },
};

export function loanAssumptions(lang: WL, cur: string): Assumption<LoanLite>[] {
  const s = sc(cur);
  return [
    money<LoanLite>(lang, "amount", { en: ["Loan amount", "the amount borrowed"], ja: ["借入額", "借りる金額"], zh: ["贷款本金", "借款金额"], fr: ["Montant emprunté", "le montant emprunté"], es: ["Importe del préstamo", "el importe prestado"] }, (i) => i.amount, (i, v) => ({ ...i, amount: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 80_000 * s)]),
    { key: "rate", label: RATE[lang][0], plain: RATE[lang][1], unit: "rate", kind: "assumption", get: (i) => i.rate, set: (i, v) => ({ ...i, rate: Math.max(0, v) }), range: fixedRange(0, 0.1) },
    { key: "months", label: { en: "Term", ja: "返済期間", zh: "还款期限", fr: "Durée", es: "Plazo" }[lang], plain: { en: "the term", ja: "返済期間", zh: "还款期限", fr: "la durée", es: "el plazo" }[lang], unit: "months", kind: "assumption", get: (i) => i.months, set: (i, v) => ({ ...i, months: Math.max(1, Math.round(v)) }), range: fixedRange(12, 480), marks: [{ at: 120, label: YEARS[lang](10) }, { at: 360, label: YEARS[lang](30) }] },
  ];
}

export function loanCompareI(i: LoanLite, lang: WL) {
  return (Object.keys(REPAY_NAME[lang]) as RepayMethod[]).map((m) => ({ label: REPAY_NAME[lang][m], value: repay(i.amount, i.rate, i.months, m).interest, current: m === i.method }));
}

export const loanPlainI = (lang: WL, cur: string) => (i: LoanLite, top?: TornadoBar) => {
  const r = repay(i.amount, i.rate, i.months, i.method);
  const ann = repay(i.amount, i.rate, i.months, "annuity");
  const prin = repay(i.amount, i.rate, i.months, "principal");
  const m = (n: number) => cash(n, lang, cur);
  const p = pctOf(i.rate, lang);
  const y = num(i.months / 12, lang);
  const A = m(i.amount);
  const T = {
    en: {
      head: { annuity: `Borrowing ${A} at ${p} for ${y} years costs about ${m(r.first)} a month, with about ${m(r.interest)} of interest in total.`, principal: `Borrowing ${A} at ${p} for ${y} years, payments start at about ${m(r.first)} and fall to about ${m(r.last)}. Total interest is about ${m(r.interest)}.`, bullet: `Borrowing ${A} at ${p} for ${y} years, you pay only about ${m(r.first)} of interest a month and repay the principal at the end. Total interest is about ${m(r.interest)}.` },
      r1: `Equal principal costs about ${m(ann.interest - prin.interest)} less interest than equal payments, but early payments are higher (first month ${m(prin.first)} vs ${m(ann.first)}).`,
      r2: "A longer term lowers the monthly payment but sharply raises total interest. Extra payments toward principal are the easiest way to save interest.",
      r3: "With a variable rate the payment is recalculated whenever the rate changes. Move the rate card to see what a rise would do.",
      what: "total interest",
    },
    ja: {
      head: { annuity: `${A}を年${p}で${y}年借りると、毎月約${m(r.first)}を返済し、利息の合計は約${m(r.interest)}です。`, principal: `${A}を年${p}で${y}年借りると、返済額は初月約${m(r.first)}から最終月約${m(r.last)}へ減り、利息の合計は約${m(r.interest)}です。`, bullet: `${A}を年${p}で${y}年借りると、毎月は利息約${m(r.first)}だけを払い、満期に元金を一括返済します。利息の合計は約${m(r.interest)}です。` },
      r1: `元金均等は元利均等より利息が約${m(ann.interest - prin.interest)}少なくなります。ただし最初の数年は返済額が多めです（初月${m(prin.first)}対${m(ann.first)}）。`,
      r2: "期間を延ばすと毎月の負担は減りますが、利息の合計は大きく増えます。余裕ができたら繰上返済で元金を減らすのがいちばん簡単な節約です。",
      r3: "変動金利なら金利が変わるたびに返済額が再計算されます。金利カードを動かして、上がったときの返済額を確かめてください。",
      what: "利息の合計",
    },
    zh: {
      head: { annuity: `以年利率${p}借${A}、期限${y}年，每月约还${m(r.first)}，利息合计约${m(r.interest)}。`, principal: `以年利率${p}借${A}、期限${y}年，月供从首月约${m(r.first)}递减到末月约${m(r.last)}，利息合计约${m(r.interest)}。`, bullet: `以年利率${p}借${A}、期限${y}年，每月只付利息约${m(r.first)}，到期一次还本。利息合计约${m(r.interest)}。` },
      r1: `等额本金比等额本息少付利息约${m(ann.interest - prin.interest)}，但前几年月供更高（首月${m(prin.first)}对${m(ann.first)}）。`,
      r2: "期限越长月供越低，但利息合计大幅增加。有余钱时提前还本金是最简单的省息方法。",
      r3: "浮动利率在利率调整时会重新计算月供。拖动利率卡片，看看加息时的变化。",
      what: "利息合计",
    },
    fr: {
      head: { annuity: `Pour ${A} empruntés à ${p} sur ${y} ans, la mensualité est d'environ ${m(r.first)} et les intérêts totaux d'environ ${m(r.interest)}.`, principal: `Pour ${A} empruntés à ${p} sur ${y} ans, la mensualité passe d'environ ${m(r.first)} à environ ${m(r.last)}. Intérêts totaux : environ ${m(r.interest)}.`, bullet: `Pour ${A} empruntés à ${p} sur ${y} ans, vous ne payez que les intérêts (environ ${m(r.first)} par mois) et remboursez le capital à la fin. Intérêts totaux : environ ${m(r.interest)}.` },
      r1: `L'amortissement constant coûte environ ${m(ann.interest - prin.interest)} d'intérêts de moins que les mensualités constantes, mais les premières échéances sont plus lourdes (${m(prin.first)} contre ${m(ann.first)}).`,
      r2: "Allonger la durée baisse la mensualité mais fait fortement grimper les intérêts. Rembourser par anticipation est le moyen le plus simple d'économiser.",
      r3: "À taux variable, la mensualité est recalculée à chaque changement de taux. Déplacez la carte du taux pour voir l'effet d'une hausse.",
      what: "les intérêts totaux",
    },
    es: {
      head: { annuity: `Si pides ${A} al ${p} a ${y} años, pagarás unos ${m(r.first)} al mes y unos ${m(r.interest)} de intereses en total.`, principal: `Si pides ${A} al ${p} a ${y} años, la cuota empieza en unos ${m(r.first)} y baja hasta unos ${m(r.last)}. Intereses totales: unos ${m(r.interest)}.`, bullet: `Si pides ${A} al ${p} a ${y} años, solo pagas intereses (unos ${m(r.first)} al mes) y devuelves el capital al final. Intereses totales: unos ${m(r.interest)}.` },
      r1: `La amortización constante cuesta unos ${m(ann.interest - prin.interest)} menos de intereses que la cuota constante, pero las primeras cuotas son más altas (${m(prin.first)} frente a ${m(ann.first)}).`,
      r2: "Alargar el plazo baja la cuota pero dispara los intereses totales. Amortizar anticipadamente es la forma más fácil de ahorrar intereses.",
      r3: "Con tipo variable, la cuota se recalcula cada vez que cambia el tipo. Mueve la tarjeta del tipo para ver qué pasa si sube.",
      what: "los intereses totales",
    },
  }[lang];
  return { headline: T.head[i.method], driver: driverOf(lang, top, T.what, m), reasons: [T.r1, T.r2, T.r3] };
};

// ───────────────────────── 주택담보대출 ─────────────────────────

export const MORTGAGE_EXAMPLE: Record<WL, MortgageLite> = {
  en: { price: 400_000, down: 80_000, rate: 0.065, years: 30 },
  ja: { price: 40_000_000, down: 5_000_000, rate: 0.015, years: 35 },
  zh: { price: 3_000_000, down: 900_000, rate: 0.035, years: 30 },
  fr: { price: 300_000, down: 60_000, rate: 0.035, years: 25 },
  es: { price: 250_000, down: 50_000, rate: 0.03, years: 30 },
};

export function mortgageAssumptions(lang: WL, cur: string): Assumption<MortgageLite>[] {
  const s = sc(cur);
  return [
    money<MortgageLite>(lang, "down", { en: ["Down payment", "your down payment"], ja: ["頭金", "頭金"], zh: ["首付", "首付"], fr: ["Apport personnel", "l'apport"], es: ["Entrada", "la entrada"] }, (i) => i.down, (i, v) => ({ ...i, down: Math.min(i.price, Math.max(0, v)) }), (a) => [0, Math.max(a * 2, 200_000 * s)]),
    money<MortgageLite>(lang, "price", { en: ["Home price", "the home price"], ja: ["物件価格", "物件価格"], zh: ["房价", "房价"], fr: ["Prix du logement", "le prix"], es: ["Precio de la vivienda", "el precio"] }, (i) => i.price, (i, v) => ({ ...i, price: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 800_000 * s)]),
    { key: "rate", label: RATE[lang][0], plain: RATE[lang][1], unit: "rate", kind: "assumption", get: (i) => i.rate, set: (i, v) => ({ ...i, rate: Math.max(0, v) }), range: fixedRange(0.005, 0.09) },
    { key: "years", label: { en: "Term", ja: "返済期間", zh: "贷款年限", fr: "Durée", es: "Plazo" }[lang], plain: { en: "the term", ja: "返済期間", zh: "贷款年限", fr: "la durée", es: "el plazo" }[lang], unit: "years", kind: "assumption", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(1, Math.round(v)) }), range: fixedRange(5, 50), marks: [{ at: 30, label: YEARS[lang](30) }] },
  ];
}

export function mortgageTermsI(i: MortgageLite, lang: WL) {
  return [10, 20, 30, 40].map((y) => ({ label: YEARS[lang](y), value: mortgageResult({ ...i, years: y }).interest, current: y === Math.round(i.years) }));
}

export function mortgageBridgeI(i: MortgageLite, lang: WL): BridgeStep[] {
  const r = mortgageResult(i);
  const L = {
    en: ["Home price", "Down payment", "Loan", "Total interest", "Repaid to lender"],
    ja: ["物件価格", "頭金", "借入額", "利息の合計", "返済総額"],
    zh: ["房价", "首付", "贷款", "利息合计", "还款总额"],
    fr: ["Prix", "Apport", "Prêt", "Intérêts totaux", "Total remboursé"],
    es: ["Precio", "Entrada", "Préstamo", "Intereses totales", "Total devuelto"],
  }[lang];
  return [
    { label: L[0], value: i.price, kind: "total" },
    { label: L[1], value: -Math.min(i.down, i.price), kind: "add" },
    { label: L[2], value: r.loan, kind: "total" },
    { label: L[3], value: r.interest, kind: "add" },
    { label: L[4], value: r.total, kind: "total" },
  ];
}

export const mortgagePlainI = (lang: WL, cur: string) => (i: MortgageLite, top?: TornadoBar) => {
  const r = mortgageResult(i);
  const up = mortgageResult({ ...i, rate: i.rate + 0.01 });
  const m = (n: number) => cash(n, lang, cur);
  const ltv = Math.round(r.ltv * 100);
  const T = {
    en: {
      head: `You borrow ${m(r.loan)} and repay about ${m(r.monthly)} a month for ${i.years} years. Total interest is about ${m(r.interest)}.`,
      r1: `You're borrowing ${ltv}% of the price (loan-to-value). Lenders cap this ratio and also check your payment against your income.`,
      r2: `If the rate rises by 1 point, the payment goes up about ${m(up.monthly - r.monthly)} a month and total interest about ${m(up.interest - r.interest)}.`,
      r3: "Fixed-rate, equal-payment basis. Property tax, insurance and closing costs are extra.",
      what: "the monthly payment",
    },
    ja: {
      head: `${m(r.loan)}を借りて${i.years}年間、毎月約${m(r.monthly)}を返済します。利息の合計は約${m(r.interest)}です。`,
      r1: `物件価格の${ltv}%を借りる計算です。金融機関は借入比率のほか、年収に対する返済負担率も審査します。`,
      r2: `金利が1%上がると、毎月約${m(up.monthly - r.monthly)}、利息の合計は約${m(up.interest - r.interest)}増えます。`,
      r3: "固定金利・元利均等で計算しています。諸費用・固定資産税・保険料は別にかかります。",
      what: "毎月の返済額",
    },
    zh: {
      head: `贷款${m(r.loan)}，${i.years}年内每月约还${m(r.monthly)}，利息合计约${m(r.interest)}。`,
      r1: `贷款占房价的${ltv}%。银行会限制贷款成数，并审核月供占收入的比例。`,
      r2: `利率上升1个百分点，月供约增加${m(up.monthly - r.monthly)}，利息合计约增加${m(up.interest - r.interest)}。`,
      r3: "按固定利率、等额本息计算。契税、中介费等另计。",
      what: "月供",
    },
    fr: {
      head: `Vous empruntez ${m(r.loan)} et remboursez environ ${m(r.monthly)} par mois pendant ${i.years} ans. Intérêts totaux : environ ${m(r.interest)}.`,
      r1: `Vous financez ${ltv} % du prix. Les banques regardent aussi le taux d'endettement (35 % des revenus au maximum en France).`,
      r2: `Si le taux monte d'un point, la mensualité augmente d'environ ${m(up.monthly - r.monthly)} et les intérêts totaux d'environ ${m(up.interest - r.interest)}.`,
      r3: "Taux fixe, mensualités constantes. Assurance emprunteur, frais de notaire et garantie non inclus.",
      what: "la mensualité",
    },
    es: {
      head: `Pides ${m(r.loan)} y pagas unos ${m(r.monthly)} al mes durante ${i.years} años. Intereses totales: unos ${m(r.interest)}.`,
      r1: `Financias el ${ltv} % del precio. Los bancos suelen prestar hasta el 80 % y miran que la cuota no supere un 30-35 % de tus ingresos.`,
      r2: `Si el tipo sube un punto, la cuota aumenta unos ${m(up.monthly - r.monthly)} al mes y los intereses totales unos ${m(up.interest - r.interest)}.`,
      r3: "Tipo fijo y cuota constante. Impuestos de compra, notaría y seguros van aparte.",
      what: "la cuota mensual",
    },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, m), reasons: [T.r1, T.r2, T.r3] };
};

// ───────────────────────── FIRE 조기 은퇴 ─────────────────────────

export const FIRE_EXAMPLE: Record<WL, FireLite> = {
  en: { age: 30, assets: 50_000, monthlySave: 2_000, ret: 0.05, spending: 40_000, withdraw: 0.04 },
  ja: { age: 30, assets: 5_000_000, monthlySave: 150_000, ret: 0.05, spending: 3_600_000, withdraw: 0.04 },
  zh: { age: 30, assets: 300_000, monthlySave: 8_000, ret: 0.04, spending: 150_000, withdraw: 0.04 },
  fr: { age: 30, assets: 40_000, monthlySave: 1_200, ret: 0.05, spending: 30_000, withdraw: 0.04 },
  es: { age: 30, assets: 30_000, monthlySave: 1_000, ret: 0.05, spending: 24_000, withdraw: 0.04 },
};

export function fireAssumptions(lang: WL, cur: string): Assumption<FireLite>[] {
  const s = sc(cur);
  return [
    money<FireLite>(lang, "monthlySave", { en: ["Monthly savings", "monthly saving"], ja: ["毎月の貯蓄額", "毎月の貯金"], zh: ["每月储蓄", "每月存的钱"], fr: ["Épargne mensuelle", "l'épargne mensuelle"], es: ["Ahorro mensual", "el ahorro mensual"] }, (i) => i.monthlySave, (i, v) => ({ ...i, monthlySave: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 4_000 * s)]),
    money<FireLite>(lang, "spending", { en: ["Annual spending in retirement", "yearly spending"], ja: ["引退後の年間生活費", "1年の生活費"], zh: ["退休后年支出", "一年生活费"], fr: ["Dépenses annuelles à la retraite", "les dépenses annuelles"], es: ["Gasto anual en la jubilación", "el gasto anual"] }, (i) => i.spending, (i, v) => ({ ...i, spending: Math.max(1, v) }), (a) => [10_000 * s, Math.max(a * 2, 50_000 * s)]),
    { key: "ret", label: { en: "Real annual return", ja: "実質年利回り", zh: "实际年化收益率", fr: "Rendement réel annuel", es: "Rentabilidad real anual" }[lang], plain: { en: "the return", ja: "利回り", zh: "收益率", fr: "le rendement", es: "la rentabilidad" }[lang], unit: "rate", kind: "assumption", get: (i) => i.ret, set: (i, v) => ({ ...i, ret: v }), range: fixedRange(0, 0.1) },
    { key: "withdraw", label: { en: "Safe withdrawal rate", ja: "安全な取り崩し率", zh: "安全提取率", fr: "Taux de retrait sûr", es: "Tasa de retirada segura" }[lang], plain: { en: "the share withdrawn each year", ja: "毎年取り崩す割合", zh: "每年取出的比例", fr: "la part retirée chaque année", es: "lo que retiras cada año" }[lang], unit: "rate", kind: "assumption", get: (i) => i.withdraw, set: (i, v) => ({ ...i, withdraw: Math.max(0.01, v) }), range: fixedRange(0.025, 0.06), marks: [{ at: 0.04, label: { en: "4% rule", ja: "4%ルール", zh: "4%法则", fr: "règle des 4 %", es: "regla del 4 %" }[lang] }] },
    money<FireLite>(lang, "assets", { en: ["Current assets", "savings so far"], ja: ["現在の資産", "今ある資産"], zh: ["现有资产", "已有的钱"], fr: ["Patrimoine actuel", "le patrimoine actuel"], es: ["Patrimonio actual", "lo ahorrado"] }, (i) => i.assets, (i, v) => ({ ...i, assets: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 400_000 * s)]),
  ];
}

export const fireYearsText = (lang: WL) => (n: number) =>
  n >= 70 ? { en: "70+ years", ja: "70年以上", zh: "70年以上", fr: "plus de 70 ans", es: "más de 70 años" }[lang] : YEARS[lang](Math.round(n)).replace(" yr", n === 1 ? " year" : " years");

/** 매달 더 모으는 금액(비교 문장용) */
export const fireExtra = (cur: string) => 500 * sc(cur);

export const firePlainI = (lang: WL, cur: string) => (i: FireLite, top?: TornadoBar) => {
  const r = fireResult(i);
  const extra = fireExtra(cur);
  const more = fireResult({ ...i, monthlySave: i.monthlySave + extra });
  const m = (n: number) => cash(n, lang, cur);
  const yt = fireYearsText(lang);
  const tg = m(r.target);
  const sooner = r.reached && more.reached && r.years > more.years;
  const T = {
    en: {
      head: r.years === 0 ? `You're already past the ${tg} target. At this spending you could retire now.` : r.reached ? `You'd reach the ${tg} target in ${r.years} years, at age ${r.fireAge}.` : `Under these conditions you won't reach ${tg} within 70 years. Try saving more or spending less.`,
      r1: `Target = yearly spending ${m(i.spending)} ÷ withdrawal rate ${pctOf(i.withdraw, lang)}. Under the 4% rule that's 25 times your spending.`,
      r2: sooner ? `Saving ${m(extra)} more a month gets you there ${r.years - more.years} years sooner (age ${more.fireAge}).` : "Cutting spending lowers both the target and the time it takes, so it works twice.",
      r3: "Enter the return after inflation. The 4% rule comes from 30-year US stock and bond data; for a longer retirement 3–3.5% is safer. Taxes and public pensions are not included.",
      what: "the years to retirement",
    },
    ja: {
      head: r.years === 0 ? `すでに目標資産${tg}を超えています。今の生活費なら引退できます。` : r.reached ? `${r.years}年後、${r.fireAge}歳で目標資産${tg}に届きます。` : `今の条件では70年以内に目標${tg}に届きません。貯蓄か生活費を見直してみてください。`,
      r1: `目標資産は1年の生活費${m(i.spending)}÷取り崩し率${pctOf(i.withdraw, lang)}です。4%ルールなら生活費の25倍です。`,
      r2: sooner ? `毎月${m(extra)}多く貯めると${r.years - more.years}年早まります（${more.fireAge}歳）。` : "生活費を減らすと、目標資産とかかる年数が同時に減るので効果は2倍です。",
      r3: "利回りは物価上昇を引いた実質利回りで入れます。4%ルールは米国の株式・債券30年のデータが元なので、長く引退するなら3〜3.5%が安全です。税金・公的年金は含めていません。",
      what: "引退までの年数",
    },
    zh: {
      head: r.years === 0 ? `已超过目标资产${tg}。按现在的生活费可以退休了。` : r.reached ? `${r.years}年后、${r.fireAge}岁时达到目标资产${tg}。` : `按现在的条件，70年内达不到目标${tg}。试着多存一些或少花一些。`,
      r1: `目标资产 = 一年生活费${m(i.spending)} ÷ 提取率${pctOf(i.withdraw, lang)}。按4%法则就是生活费的25倍。`,
      r2: sooner ? `每月多存${m(extra)}，可提前${r.years - more.years}年（${more.fireAge}岁）。` : "减少生活费会同时降低目标资产和所需年数，效果加倍。",
      r3: "收益率请填扣除通胀后的实际收益率。4%法则来自美国股债30年数据，退休期更长时3%~3.5%更稳妥。未计税费和养老金。",
      what: "退休所需年数",
    },
    fr: {
      head: r.years === 0 ? `Vous dépassez déjà l'objectif de ${tg}. Avec ces dépenses, vous pourriez arrêter maintenant.` : r.reached ? `Vous atteindriez l'objectif de ${tg} dans ${r.years} ans, à ${r.fireAge} ans.` : `Dans ces conditions, vous n'atteindrez pas ${tg} en 70 ans. Essayez d'épargner plus ou de dépenser moins.`,
      r1: `Objectif = dépenses annuelles ${m(i.spending)} ÷ taux de retrait ${pctOf(i.withdraw, lang)}. Avec la règle des 4 %, c'est 25 fois vos dépenses.`,
      r2: sooner ? `Épargner ${m(extra)} de plus par mois vous fait gagner ${r.years - more.years} ans (${more.fireAge} ans).` : "Réduire les dépenses baisse à la fois l'objectif et la durée : l'effet est double.",
      r3: "Saisissez un rendement hors inflation. La règle des 4 % vient de données américaines sur 30 ans ; pour une retraite plus longue, 3 à 3,5 % est plus prudent. Impôts et retraite publique non inclus.",
      what: "le nombre d'années",
    },
    es: {
      head: r.years === 0 ? `Ya superas el objetivo de ${tg}. Con este gasto podrías jubilarte ya.` : r.reached ? `Alcanzarías el objetivo de ${tg} en ${r.years} años, a los ${r.fireAge}.` : `Con estas condiciones no llegarás a ${tg} en 70 años. Prueba a ahorrar más o gastar menos.`,
      r1: `Objetivo = gasto anual ${m(i.spending)} ÷ tasa de retirada ${pctOf(i.withdraw, lang)}. Con la regla del 4 % son 25 veces tu gasto.`,
      r2: sooner ? `Ahorrar ${m(extra)} más al mes te adelanta ${r.years - more.years} años (a los ${more.fireAge}).` : "Reducir el gasto baja a la vez el objetivo y el tiempo necesario: el efecto es doble.",
      r3: "Introduce la rentabilidad descontando la inflación. La regla del 4 % viene de datos de EE. UU. a 30 años; para una jubilación más larga, un 3-3,5 % es más prudente. No incluye impuestos ni pensión pública.",
      what: "los años hasta jubilarte",
    },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, yt), reasons: [T.r1, T.r2, T.r3] };
};
