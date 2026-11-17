// 3묶음 세계 공용 돈 2차(물가·ROI·임대 수익률·평단가·라떼 효과) 다른 언어 판 문구 (2026-11-17).
// 계산은 world-money-scenarios.ts 그대로. 현재가치(라이프니츠·호프만)는 한국 법원 실무라 번역하지 않아요.
import { cash, driverOf, money, num, pctOf, RATE, sc, type WL } from "./world-money-i18n.ts";
import { avgResult, inflationResult, latteResult, rentalResult, roiResult, type AvgLite, type InflationLite, type LatteFrequency, type LatteLite, type RentalLite, type RoiLite } from "./world-money-scenarios.ts";
import { fixedRange, type Assumption, type BridgeStep, type TornadoBar } from "./scenario.ts";

const PERIOD = { en: ["Period", "the period"], ja: ["期間", "期間"], zh: ["期限", "年数"], fr: ["Durée", "la durée"], es: ["Plazo", "el plazo"] } as const;
/** 주가 같은 작은 금액(소수 둘째 자리까지) */
export const price = (n: number, lang: WL, cur: string) =>
  Number.isFinite(n) ? new Intl.NumberFormat({ en: "en-US", ja: "ja-JP", zh: "zh-CN", fr: "fr-FR", es: "es-ES" }[lang], { style: "currency", currency: cur, maximumFractionDigits: cur === "JPY" ? 0 : 2, minimumFractionDigits: 0 }).format(n) : "—";

// ───────────────────────── 물가 ─────────────────────────

export const INFLATION_EXAMPLE: Record<WL, InflationLite> = {
  en: { amount: 1_000, rate: 0.03, years: 10 },
  ja: { amount: 100_000, rate: 0.02, years: 10 },
  zh: { amount: 10_000, rate: 0.02, years: 10 },
  fr: { amount: 1_000, rate: 0.02, years: 10 },
  es: { amount: 1_000, rate: 0.025, years: 10 },
};
const TARGET2: Record<WL, string> = { en: "Fed target 2%", ja: "日銀目標2%", zh: "2%目标", fr: "Cible BCE 2 %", es: "Objetivo BCE 2 %" };

export function inflationAssumptions(lang: WL, cur: string): Assumption<InflationLite>[] {
  const s = sc(cur);
  return [
    { key: "rate", label: { en: "Annual inflation", ja: "年間物価上昇率", zh: "年通胀率", fr: "Inflation annuelle", es: "Inflación anual" }[lang], plain: { en: "inflation", ja: "物価上昇率", zh: "通胀率", fr: "l'inflation", es: "la inflación" }[lang], unit: "rate", kind: "assumption", get: (i) => i.rate, set: (i, v) => ({ ...i, rate: v }), range: fixedRange(0, 0.1), marks: [{ at: 0.02, label: TARGET2[lang] }] },
    { key: "years", label: PERIOD[lang][0], plain: PERIOD[lang][1], unit: "years", kind: "assumption", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(0, Math.round(v)) }), range: fixedRange(1, 50) },
    money<InflationLite>(lang, "amount", { en: ["Amount", "today's money"], ja: ["金額", "今のお金"], zh: ["金额", "现在的钱"], fr: ["Montant", "la somme"], es: ["Importe", "el importe"] }, (i) => i.amount, (i, v) => ({ ...i, amount: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 10_000 * s)]),
  ];
}

export const inflationPlainI = (lang: WL, cur: string) => (i: InflationLite, top?: TornadoBar) => {
  const r = inflationResult(i);
  const m = (n: number) => cash(n, lang, cur);
  const p = pctOf(i.rate, lang);
  const loss = Math.round(r.loss * 100);
  const half = Number.isFinite(r.half) ? num(r.half, lang, 0) : "";
  const T = {
    en: { head: `If prices rise ${p} a year, ${m(i.amount)} in ${i.years} years buys what about ${m(r.real)} buys today. To buy the same things you'd need about ${m(r.needed)}.`, r1: `Money loses ${loss}% of its value.${half ? ` At this pace it halves about every ${half} years.` : ""}`, r2: "If your savings rate is below inflation, money in the bank is really shrinking. The rate minus inflation is the real interest rate.", r3: "Consumer prices are an average: housing, education and eating out often rise faster.", what: "the future value" },
    ja: { head: `物価が毎年${p}上がると、${i.years}年後の${m(i.amount)}は今のお金で約${m(r.real)}分の価値です。同じものを買うには約${m(r.needed)}が必要です。`, r1: `お金の価値が${loss}%減ります。${half ? `このペースなら約${half}年ごとに価値が半分になります。` : ""}`, r2: "預金金利が物価上昇率より低いと、口座のお金は実質的に減っています。金利から物価上昇率を引いたものが実質金利です。", r3: "消費者物価は平均なので、住居費・教育費・外食費のように速く上がる項目は別に考えましょう。", what: "将来の価値" },
    zh: { head: `物价每年上涨${p}，${i.years}年后的${m(i.amount)}只相当于现在的约${m(r.real)}。买同样的东西需要约${m(r.needed)}。`, r1: `钱的价值减少${loss}%。${half ? `按这个速度，约每${half}年贬值一半。` : ""}`, r2: "存款利率低于通胀时，存在银行的钱实际在缩水。利率减去通胀率就是实际利率。", r3: "CPI是平均值，房租、教育、外出就餐等往往涨得更快。", what: "未来的价值" },
    fr: { head: `Avec ${p} d'inflation par an, ${m(i.amount)} dans ${i.years} ans vaudront environ ${m(r.real)} d'aujourd'hui. Pour acheter la même chose, il faudra environ ${m(r.needed)}.`, r1: `La monnaie perd ${loss} % de sa valeur.${half ? ` À ce rythme, elle est divisée par deux environ tous les ${half} ans.` : ""}`, r2: "Si votre livret rapporte moins que l'inflation, votre épargne baisse en réalité. Taux moins inflation = taux réel.", r3: "L'indice des prix est une moyenne : logement, études ou restaurants augmentent souvent plus vite.", what: "la valeur future" },
    es: { head: `Si los precios suben un ${p} al año, ${m(i.amount)} dentro de ${i.years} años valdrán unos ${m(r.real)} de hoy. Para comprar lo mismo harán falta unos ${m(r.needed)}.`, r1: `El dinero pierde un ${loss} % de su valor.${half ? ` A este ritmo, se reduce a la mitad cada ${half} años aproximadamente.` : ""}`, r2: "Si tu cuenta paga menos que la inflación, tu dinero en realidad mengua. El tipo menos la inflación es el tipo real.", r3: "El IPC es una media: vivienda, estudios o restaurantes suelen subir más deprisa.", what: "el valor futuro" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, m), reasons: [T.r1, T.r2, T.r3] };
};

// ───────────────────────── ROI ─────────────────────────

export const ROI_EXAMPLE: Record<WL, RoiLite> = {
  en: { cost: 10_000, value: 15_000, years: 3 },
  ja: { cost: 1_000_000, value: 1_500_000, years: 3 },
  zh: { cost: 100_000, value: 150_000, years: 3 },
  fr: { cost: 10_000, value: 15_000, years: 3 },
  es: { cost: 10_000, value: 15_000, years: 3 },
};

export function roiAssumptions(lang: WL, cur: string): Assumption<RoiLite>[] {
  const s = sc(cur);
  return [
    money<RoiLite>(lang, "value", { en: ["Final value", "what you got back"], ja: ["回収額（現在価値）", "戻ってきたお金"], zh: ["回收金额（现值）", "拿回来的钱"], fr: ["Valeur finale", "la valeur finale"], es: ["Valor final", "lo recuperado"] }, (i) => i.value, (i, v) => ({ ...i, value: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 15_000 * s)]),
    money<RoiLite>(lang, "cost", { en: ["Amount invested", "what you put in"], ja: ["投資額", "入れたお金"], zh: ["投资本金", "投入的钱"], fr: ["Montant investi", "la mise"], es: ["Importe invertido", "lo invertido"] }, (i) => i.cost, (i, v) => ({ ...i, cost: Math.max(1, v) }), (a) => [1, Math.max(a * 2, 15_000 * s)]),
    { key: "years", label: { en: "Holding period", ja: "保有期間", zh: "持有期限", fr: "Durée de détention", es: "Periodo de tenencia" }[lang], plain: PERIOD[lang][1], unit: "years", kind: "fact", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(1, Math.round(v)) }), range: fixedRange(1, 30) },
  ];
}

export const roiPlainI = (lang: WL, cur: string) => (i: RoiLite, top?: TornadoBar) => {
  const r = roiResult(i);
  const m = (n: number) => cash(n, lang, cur);
  const roi = pctOf(r.roi, lang);
  const cagr = pctOf(r.cagr, lang);
  const mult = num(r.multiple, lang, 2);
  const dep = m(i.cost * Math.pow(1.03, i.years));
  const gain = r.profit >= 0;
  const P = m(Math.abs(r.profit));
  const T = {
    en: { head: `You put in ${m(i.cost)} and got ${m(i.value)}: a ${roi} return (${gain ? "gain" : "loss"} of ${P}).`, r1: `Over ${i.years} years that's ${cagr} a year (compound annual growth). Use this yearly figure to compare investments held for different lengths of time.`, r2: `Your money grew ${mult}×. A 3% savings account would have turned it into about ${dep}.`, r3: "Before taxes, fees and inflation. Add any dividends or interest you received to the final value.", what: "the profit" },
    ja: { head: `${m(i.cost)}を入れて${m(i.value)}になったので、利回りは${roi}（${gain ? "利益" : "損失"}${P}）です。`, r1: `${i.years}年かかったなら年平均（年複利）${cagr}です。期間が違う投資どうしは、この年平均で比べるのが公平です。`, r2: `元本の${mult}倍になりました。同じ期間、年3%の預金なら約${dep}です。`, r3: "税金・手数料・物価上昇を引く前の利回りです。途中で受け取った配当・利息は回収額に足して入れてください。", what: "損益" },
    zh: { head: `投入${m(i.cost)}，变成${m(i.value)}，收益率${roi}（${gain ? "盈利" : "亏损"}${P}）。`, r1: `用了${i.years}年，年化（复利）${cagr}。期限不同的投资要用年化收益率比较才公平。`, r2: `本金变成了${mult}倍。同期年利3%的存款约为${dep}。`, r3: "这是扣除税费、手续费和通胀前的收益率。期间收到的分红、利息请加到回收金额里。", what: "盈亏" },
    fr: { head: `Vous avez investi ${m(i.cost)} et obtenu ${m(i.value)} : un rendement de ${roi} (${gain ? "gain" : "perte"} de ${P}).`, r1: `Sur ${i.years} ans, cela fait ${cagr} par an (taux annuel composé). Comparez des placements de durées différentes avec ce taux annuel.`, r2: `Votre argent a été multiplié par ${mult}. Un livret à 3 % aurait donné environ ${dep}.`, r3: "Avant impôts, frais et inflation. Ajoutez à la valeur finale les dividendes ou intérêts reçus.", what: "le gain" },
    es: { head: `Invertiste ${m(i.cost)} y obtuviste ${m(i.value)}: una rentabilidad del ${roi} (${gain ? "ganancia" : "pérdida"} de ${P}).`, r1: `En ${i.years} años son un ${cagr} anual (tasa anual compuesta). Compara inversiones de distinta duración con esta tasa anual.`, r2: `Tu dinero se multiplicó por ${mult}. Un depósito al 3 % habría dado unos ${dep}.`, r3: "Antes de impuestos, comisiones e inflación. Suma al valor final los dividendos o intereses cobrados.", what: "la ganancia" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, m), reasons: [T.r1, T.r2, T.r3] };
};

// ───────────────────────── 임대 수익률 ─────────────────────────
// 다른 나라에는 한국식 큰 보증금이 없어서 deposit은 0으로 두고 입력을 보여 주지 않아요.

export const RENTAL_EXAMPLE: Record<WL, RentalLite> = {
  en: { price: 300_000, deposit: 0, rent: 2_000, loan: 225_000, loanRate: 0.065, vacancy: 0.05, costs: 6_000 },
  ja: { price: 20_000_000, deposit: 0, rent: 80_000, loan: 16_000_000, loanRate: 0.025, vacancy: 0.05, costs: 200_000 },
  zh: { price: 2_000_000, deposit: 0, rent: 5_000, loan: 1_000_000, loanRate: 0.035, vacancy: 0.05, costs: 6_000 },
  fr: { price: 200_000, deposit: 0, rent: 800, loan: 160_000, loanRate: 0.035, vacancy: 0.05, costs: 2_000 },
  es: { price: 180_000, deposit: 0, rent: 850, loan: 144_000, loanRate: 0.03, vacancy: 0.05, costs: 1_500 },
};

export function rentalAssumptions(lang: WL, cur: string): Assumption<RentalLite>[] {
  const s = sc(cur);
  return [
    money<RentalLite>(lang, "rent", { en: ["Monthly rent", "the rent"], ja: ["月額家賃", "家賃"], zh: ["月租金", "租金"], fr: ["Loyer mensuel", "le loyer"], es: ["Alquiler mensual", "el alquiler"] }, (i) => i.rent, (i, v) => ({ ...i, rent: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 2_500 * s)]),
    { key: "loanRate", label: { en: "Mortgage rate", ja: "ローン金利", zh: "贷款利率", fr: "Taux du prêt", es: "Tipo de la hipoteca" }[lang], plain: RATE[lang][1], unit: "rate", kind: "assumption", get: (i) => i.loanRate, set: (i, v) => ({ ...i, loanRate: Math.max(0, v) }), range: fixedRange(0, 0.09) },
    { key: "vacancy", label: { en: "Vacancy rate", ja: "空室率", zh: "空置率", fr: "Taux de vacance", es: "Tasa de desocupación" }[lang], plain: { en: "vacancy", ja: "空室期間", zh: "空置期", fr: "la vacance", es: "el tiempo vacío" }[lang], unit: "pct", kind: "assumption", get: (i) => i.vacancy, set: (i, v) => ({ ...i, vacancy: Math.min(1, Math.max(0, v)) }), range: fixedRange(0, 0.3) },
    money<RentalLite>(lang, "loan", { en: ["Loan", "the loan"], ja: ["借入額", "借入額"], zh: ["贷款", "贷款"], fr: ["Prêt", "le prêt"], es: ["Préstamo", "el préstamo"] }, (i) => i.loan, (i, v) => ({ ...i, loan: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 250_000 * s)]),
    money<RentalLite>(lang, "costs", { en: ["Yearly costs", "yearly costs"], ja: ["年間の保有コスト", "1年の費用"], zh: ["年持有成本", "一年费用"], fr: ["Charges annuelles", "les charges"], es: ["Gastos anuales", "los gastos"] }, (i) => i.costs, (i, v) => ({ ...i, costs: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 6_000 * s)]),
    money<RentalLite>(lang, "price", { en: ["Purchase price", "the price"], ja: ["購入価格", "物件価格"], zh: ["购买价格", "房价"], fr: ["Prix d'achat", "le prix"], es: ["Precio de compra", "el precio"] }, (i) => i.price, (i, v) => ({ ...i, price: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 400_000 * s)]),
  ];
}

export function rentalBridgeI(i: RentalLite, lang: WL): BridgeStep[] {
  const r = rentalResult(i);
  const L = {
    en: ["Yearly rent (after vacancy)", "Loan interest", "Holding costs", "Net per year"],
    ja: ["年間家賃（空室反映）", "ローン利息", "保有コスト", "年間の手取り"],
    zh: ["年租金（扣空置）", "贷款利息", "持有成本", "年净收益"],
    fr: ["Loyers annuels (vacance déduite)", "Intérêts du prêt", "Charges", "Net annuel"],
    es: ["Alquiler anual (con vacío)", "Intereses del préstamo", "Gastos", "Neto anual"],
  }[lang];
  return [
    { label: L[0], value: r.rentYear, kind: "total" },
    { label: L[1], value: -r.interest, kind: "add" },
    { label: L[2], value: -Math.max(0, i.costs), kind: "add" },
    { label: L[3], value: r.net, kind: "total" },
  ];
}

export const rentalPlainI = (lang: WL, cur: string) => (i: RentalLite, top?: TornadoBar) => {
  const r = rentalResult(i);
  const m = (n: number) => cash(n, lang, cur);
  const be = i.loan > 0 ? pctOf(Math.max(0, (r.rentYear - Math.max(0, i.costs)) / i.loan), lang) : null;
  const ok = Number.isFinite(r.cashYield);
  const cy = ok ? pctOf(r.cashYield, lang) : "";
  const g = pctOf(r.gross, lang);
  const T = {
    en: { head: ok ? `You put in ${m(r.equity)} of your own money and keep about ${m(r.net)} a year (about ${m(r.monthly)} a month): a ${cy} cash-on-cash return.` : `The loan covers the whole price, so none of your own money is in it. You keep about ${m(r.net)} a year.`, r1: `Gross yield (yearly rent ÷ price) is ${g}. Borrowing only pays off when this yield beats the loan rate.`, r2: be ? `Above a ${be} loan rate, the property runs at a loss.` : "With no loan, rate changes don't affect you.", r3: "Income tax, purchase costs and changes in the property's value are left out; this is one year of cash flow.", what: "the yearly net" },
    ja: { head: ok ? `自己資金${m(r.equity)}を入れて、年に約${m(r.net)}（月に約${m(r.monthly)}）残ります。自己資金に対する利回りは${cy}です。` : `借入で物件価格をすべて賄い、自己資金は入っていません。年に約${m(r.net)}残ります。`, r1: `表面利回り（年間家賃÷物件価格）は${g}です。借入を使うなら、この利回りが金利より高いときだけ得になります。`, r2: be ? `ローン金利が${be}を超えると赤字になります。` : "借入がないので金利の変化に左右されません。", r3: "所得税・購入時の諸費用・物件価格の上下は含めず、1年の現金の流れだけを見ています。", what: "年間の手取り" },
    zh: { head: ok ? `投入自有资金${m(r.equity)}，每年约剩${m(r.net)}（每月约${m(r.monthly)}），自有资金回报率${cy}。` : `贷款覆盖了全部房价，没有投入自有资金。每年约剩${m(r.net)}。`, r1: `毛租金回报率（年租金÷房价）为${g}。只有它高于贷款利率时，贷款才划算。`, r2: be ? `贷款利率超过${be}就会亏损。` : "没有贷款，不受利率变化影响。", r3: "未计税费、购房费用和房价涨跌，只看一年的现金流。", what: "年净收益" },
    fr: { head: ok ? `Avec ${m(r.equity)} d'apport, il vous reste environ ${m(r.net)} par an (environ ${m(r.monthly)} par mois) : un rendement de ${cy} sur votre apport.` : `Le prêt couvre tout le prix : aucun apport. Il vous reste environ ${m(r.net)} par an.`, r1: `La rentabilité brute (loyers annuels ÷ prix) est de ${g}. Emprunter n'est intéressant que si elle dépasse le taux du prêt.`, r2: be ? `Au-delà d'un taux de ${be}, le bien est déficitaire.` : "Sans prêt, les variations de taux ne vous touchent pas.", r3: "Impôts (revenus fonciers, taxe foncière), frais de notaire et évolution du prix non inclus : un an de trésorerie seulement.", what: "le net annuel" },
    es: { head: ok ? `Pones ${m(r.equity)} de tu dinero y te quedan unos ${m(r.net)} al año (unos ${m(r.monthly)} al mes): un ${cy} sobre lo aportado.` : `El préstamo cubre todo el precio y no pones dinero propio. Te quedan unos ${m(r.net)} al año.`, r1: `La rentabilidad bruta (alquiler anual ÷ precio) es del ${g}. Endeudarse solo compensa si supera el tipo del préstamo.`, r2: be ? `Con un tipo por encima del ${be}, el piso da pérdidas.` : "Sin préstamo, los cambios de tipo no te afectan.", r3: "Sin IRPF, IBI, gastos de compra ni cambios de valor del piso: solo un año de flujo de caja.", what: "el neto anual" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, m), reasons: [T.r1, T.r2, T.r3] };
};

// ───────────────────────── 평단가 ─────────────────────────

export const AVG_EXAMPLE: Record<WL, AvgLite> = {
  en: { price: 50, qty: 100, addPrice: 40, addQty: 100, market: 40 },
  ja: { price: 3_000, qty: 100, addPrice: 2_400, addQty: 100, market: 2_400 },
  zh: { price: 20, qty: 1_000, addPrice: 16, addQty: 1_000, market: 16 },
  fr: { price: 50, qty: 100, addPrice: 40, addQty: 100, market: 40 },
  es: { price: 50, qty: 100, addPrice: 40, addQty: 100, market: 40 },
};
export const SHARES: Record<WL, (n: number) => string> = {
  en: (n) => `${n.toLocaleString("en-US")} sh`,
  ja: (n) => `${n.toLocaleString("ja-JP")}株`,
  zh: (n) => `${n.toLocaleString("zh-CN")}股`,
  fr: (n) => `${n.toLocaleString("fr-FR")} actions`,
  es: (n) => `${n.toLocaleString("es-ES")} acciones`,
};

export function avgAssumptions(lang: WL, cur: string): Assumption<AvgLite>[] {
  const s = sc(cur);
  return [
    money<AvgLite>(lang, "addPrice", { en: ["Buy price", "the new buy price"], ja: ["買い増し価格", "新しく買う値段"], zh: ["加仓价格", "新买入价"], fr: ["Prix d'achat", "le nouveau prix"], es: ["Precio de compra", "el nuevo precio"] }, (i) => i.addPrice, (i, v) => ({ ...i, addPrice: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 10 * s)]),
    { key: "addQty", label: { en: "Shares to buy", ja: "買い増し株数", zh: "加仓股数", fr: "Actions à acheter", es: "Acciones a comprar" }[lang], plain: { en: "the number of new shares", ja: "買い増す株数", zh: "新买的股数", fr: "le nombre d'actions achetées", es: "las acciones nuevas" }[lang], unit: "shares", kind: "assumption", get: (i) => i.addQty, set: (i, v) => ({ ...i, addQty: Math.max(0, Math.round(v)) }), range: (a) => [0, Math.max(a * 3, 100)] },
    { key: "qty", label: { en: "Shares held", ja: "保有株数", zh: "持有股数", fr: "Actions détenues", es: "Acciones en cartera" }[lang], plain: { en: "shares held", ja: "持っている株数", zh: "持有的股数", fr: "les actions détenues", es: "las acciones que tienes" }[lang], unit: "shares", kind: "fact", get: (i) => i.qty, set: (i, v) => ({ ...i, qty: Math.max(0, Math.round(v)) }), range: (a) => [0, Math.max(a * 3, 100)] },
  ];
}

export const avgPlainI = (lang: WL, cur: string) => (i: AvgLite, top?: TornadoBar) => {
  const r = avgResult(i);
  const x = (n: number) => price(n, lang, cur);
  const m = (n: number) => cash(n, lang, cur);
  const d = pctOf(Math.abs(r.drop), lang);
  const down = r.drop >= 0;
  const te = pctOf(r.toEven, lang);
  const T = {
    en: { head: `Your average cost ${down ? "falls" : "rises"} from ${x(i.price)} to ${x(r.avg)} (${d}).`, under: `From today's ${x(i.market)} the stock needs to rise ${te} to break even. Unrealized P/L is ${m(r.pl)}.`, over: `The price is above your average cost: an unrealized gain of about ${m(r.pl)}.`, none: "Enter today's price to see how far it is to break even.", r2: `${SHARES.en(r.qty)} in total, ${m(r.cost)} invested. Averaging down puts more money into a losing position, so check the company first.`, r3: "Trading fees and taxes are left out.", what: "the average cost" },
    ja: { head: `平均取得単価が${x(i.price)}から${x(r.avg)}へ${down ? "下がります" : "上がります"}（${d}）。`, under: `今の株価${x(i.market)}から${te}上がれば損益ゼロです。今の評価損益は${m(r.pl)}です。`, over: `株価が平均取得単価より高く、評価益は約${m(r.pl)}です。`, none: "今の株価を入れると、損益ゼロまでの上昇率がわかります。", r2: `合計${SHARES.ja(r.qty)}、投資額${m(r.cost)}です。ナンピンは含み損の銘柄にお金を寄せることなので、まず会社の状況を確認しましょう。`, r3: "売買手数料と税金は含めていません。", what: "平均取得単価" },
    zh: { head: `持仓均价从${x(i.price)}${down ? "降到" : "升到"}${x(r.avg)}（${d}）。`, under: `现价${x(i.market)}再涨${te}就回本。当前浮动盈亏${m(r.pl)}。`, over: `现价高于持仓均价，浮盈约${m(r.pl)}。`, none: "填入现价，就能看到回本还需涨多少。", r2: `共${SHARES.zh(r.qty)}，投入${m(r.cost)}。摊低成本是往亏损股票里加钱，先确认公司基本面。`, r3: "未计交易佣金和税费。", what: "持仓均价" },
    fr: { head: `Votre prix de revient moyen ${down ? "baisse" : "monte"} de ${x(i.price)} à ${x(r.avg)} (${d}).`, under: `Depuis le cours actuel de ${x(i.market)}, il faut une hausse de ${te} pour revenir à l'équilibre. Plus/moins-value latente : ${m(r.pl)}.`, over: `Le cours dépasse votre prix de revient : plus-value latente d'environ ${m(r.pl)}.`, none: "Saisissez le cours actuel pour voir la hausse nécessaire avant l'équilibre.", r2: `${SHARES.fr(r.qty)} au total, ${m(r.cost)} investis. Moyenner à la baisse renforce une position perdante : vérifiez d'abord l'entreprise.`, r3: "Frais de courtage et impôts non inclus.", what: "le prix de revient moyen" },
    es: { head: `Tu precio medio ${down ? "baja" : "sube"} de ${x(i.price)} a ${x(r.avg)} (${d}).`, under: `Desde la cotización actual de ${x(i.market)}, necesita subir un ${te} para quedar en tablas. Resultado latente: ${m(r.pl)}.`, over: `La cotización está por encima de tu precio medio: plusvalía latente de unos ${m(r.pl)}.`, none: "Introduce la cotización actual para ver cuánto falta para recuperar.", r2: `${SHARES.es(r.qty)} en total, ${m(r.cost)} invertidos. Promediar a la baja mete más dinero en una posición perdedora: revisa antes la empresa.`, r3: "Sin comisiones de compraventa ni impuestos.", what: "el precio medio" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, x), reasons: [i.market > 0 ? (r.toEven > 0 ? T.under : T.over) : T.none, T.r2, T.r3] };
};

// ───────────────────────── 라떼 효과 ─────────────────────────

export const LATTE_EXAMPLE: Record<WL, LatteLite> = {
  en: { cost: 5, freq: "weekdays", rate: 0.07, years: 20 },
  ja: { cost: 500, freq: "weekdays", rate: 0.05, years: 20 },
  zh: { cost: 30, freq: "weekdays", rate: 0.04, years: 20 },
  fr: { cost: 4, freq: "weekdays", rate: 0.05, years: 20 },
  es: { cost: 3, freq: "weekdays", rate: 0.05, years: 20 },
};
export const FREQ_NAME: Record<WL, Record<LatteFrequency, string>> = {
  en: { daily: "Every day", weekdays: "Weekdays", weekly: "Once a week" },
  ja: { daily: "毎日", weekdays: "平日だけ", weekly: "週1回" },
  zh: { daily: "每天", weekdays: "工作日", weekly: "每周一次" },
  fr: { daily: "Tous les jours", weekdays: "En semaine", weekly: "Une fois par semaine" },
  es: { daily: "Todos los días", weekdays: "Entre semana", weekly: "Una vez por semana" },
};

export function latteAssumptions(lang: WL, cur: string): Assumption<LatteLite>[] {
  const s = sc(cur);
  return [
    money<LatteLite>(lang, "cost", { en: ["Cost each time", "the price per time"], ja: ["1回の出費", "1杯の値段"], zh: ["每次花费", "每杯的价格"], fr: ["Coût par fois", "le prix unitaire"], es: ["Coste por vez", "el precio por vez"] }, (i) => i.cost, (i, v) => ({ ...i, cost: Math.max(0, v) }), (a) => [0, Math.max(a * 3, 12 * s)]),
    { key: "years", label: PERIOD[lang][0], plain: PERIOD[lang][1], unit: "years", kind: "assumption", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(1, Math.round(v)) }), range: fixedRange(1, 40) },
    { key: "rate", label: { en: "Annual return", ja: "年利回り", zh: "年化收益率", fr: "Rendement annuel", es: "Rentabilidad anual" }[lang], plain: { en: "the return", ja: "利回り", zh: "收益率", fr: "le rendement", es: "la rentabilidad" }[lang], unit: "rate", kind: "assumption", get: (i) => i.rate, set: (i, v) => ({ ...i, rate: Math.max(0, v) }), range: fixedRange(0, 0.1) },
  ];
}

export const lattePlainI = (lang: WL, cur: string) => (i: LatteLite, top?: TornadoBar) => {
  const r = latteResult(i);
  const m = (n: number) => cash(n, lang, cur);
  const p = pctOf(i.rate, lang);
  const T = {
    en: { head: `Saving about ${m(r.monthly)} a month instead and investing it at ${p} grows to about ${m(r.fv)} in ${i.years} years.`, r1: `You'd put in ${m(r.paid)}; the other ${m(r.gain)} comes from compounding.`, r2: "This isn't about cutting every treat. Keep what you love, and redirect one habit-spend to an automatic transfer.", r3: "Taxes and inflation are left out; money goes in at the end of each month.", what: "the amount saved" },
    ja: { head: `代わりに月約${m(r.monthly)}を積み立てて年${p}で運用すると、${i.years}年後に約${m(r.fv)}になります。`, r1: `積み立てた額は${m(r.paid)}で、残り${m(r.gain)}は複利で増えた分です。`, r2: "小さな出費を全部やめようという話ではありません。好きなものは残し、習慣になっている出費を一つだけ自動積立に回すだけでも差は大きくなります。", r3: "税金・物価上昇は含めず、毎月末に積み立てる前提です。", what: "貯まる金額" },
    zh: { head: `把这笔钱每月约${m(r.monthly)}存下来、按年化${p}投资，${i.years}年后约为${m(r.fv)}。`, r1: `投入${m(r.paid)}，其余${m(r.gain)}来自复利。`, r2: "不是让你戒掉所有小开销。保留真正喜欢的，把一项习惯性开销改成自动定投，差别就很大。", r3: "未计税费和通胀，按每月月末投入计算。", what: "攒下的钱" },
    fr: { head: `En épargnant plutôt environ ${m(r.monthly)} par mois placés à ${p}, vous auriez environ ${m(r.fv)} dans ${i.years} ans.`, r1: `Vous auriez versé ${m(r.paid)} ; les ${m(r.gain)} restants viennent des intérêts composés.`, r2: "Il ne s'agit pas de tout supprimer. Gardez ce qui compte pour vous et transformez une seule dépense d'habitude en virement automatique.", r3: "Impôts et inflation non inclus ; versement en fin de mois.", what: "la somme épargnée" },
    es: { head: `Si ahorras unos ${m(r.monthly)} al mes y los inviertes al ${p}, en ${i.years} años tendrías unos ${m(r.fv)}.`, r1: `Aportarías ${m(r.paid)}; los otros ${m(r.gain)} vienen del interés compuesto.`, r2: "No se trata de eliminar todos los caprichos. Quédate con lo que te gusta y convierte un solo gasto de costumbre en una transferencia automática.", r3: "Sin impuestos ni inflación; aportación a final de cada mes.", what: "lo ahorrado" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, m), reasons: [T.r1, T.r2, T.r3] };
};

