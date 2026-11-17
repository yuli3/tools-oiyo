// 5묶음 생활 계산기(여행 예산·기름값·팁·할인) 다른 언어 판 문구 (2026-11-17).
// 계산은 life-scenarios.ts 그대로. 여행은 한국 출발 지역 기준값 대신 나라별 예시 금액만 채워요. 결혼 예산은 한국 축의금 구조라 옮기지 않아요.
import { discountResult, fuelCost, fuelResult, rooms, tipPer, tipResult, travelResult, type DiscountLite, type FuelLite, type TipLite, type TravelLite } from "./life-scenarios.ts";
import { fixedRange, type Assumption, type TornadoBar } from "./scenario.ts";
import { driverOf, pctOf, type Names, type WL } from "./world-money-i18n.ts";

const INTL: Record<WL, string> = { en: "en-US", ja: "ja-JP", zh: "zh-CN", fr: "fr-FR", es: "es-ES" };
const around = (lo: number, hi: number, floor = 0) => (a: number): [number, number] => [Math.max(floor, a * lo), Math.max(a * hi, floor + 1)];
const A = <I>(lang: WL, key: string, n: Names, unit: Assumption<I>["unit"], get: (i: I) => number, set: (i: I, v: number) => I, range: (a: number) => [number, number], marks?: Assumption<I>["marks"]): Assumption<I> => ({ key, label: n[lang][0], plain: n[lang][1], unit, kind: "assumption", get, set, range, ...(marks ? { marks } : {}) });

/** 금액. 100 미만이면 소수 둘째 자리까지(기름 1L 값, 팁 등) */
export const moneyL = (n: number, lang: WL, cur: string) => {
  if (!Number.isFinite(n)) return "—";
  const small = Math.abs(n) < 100 && cur !== "JPY";
  return new Intl.NumberFormat(INTL[lang], { style: "currency", currency: cur, maximumFractionDigits: small ? 2 : 0, minimumFractionDigits: small && n % 1 !== 0 ? 2 : 0 }).format(n);
};
/** 통화 없는 금액(팁: 계산서 통화 그대로) */
export const amtL = (n: number, lang: WL) => (Number.isFinite(n) ? new Intl.NumberFormat(INTL[lang], { maximumFractionDigits: 2, minimumFractionDigits: n % 1 === 0 ? 0 : 2 }).format(Math.round(n * 100) / 100) : "—");
export const numL = (n: number, lang: WL, d = 1) => new Intl.NumberFormat(INTL[lang], { maximumFractionDigits: d, minimumFractionDigits: 0 }).format(n);

// ───────────────────────── 여행 예산 ─────────────────────────

export const TRAVEL_EXAMPLE: Record<WL, TravelLite> = {
  en: { place: "usa", nights: 4, people: 2, flight: 650, hotel: 160, daily: 110 },
  ja: { place: "japan", nights: 3, people: 2, flight: 60000, hotel: 15000, daily: 12000 },
  zh: { place: "china", nights: 4, people: 2, flight: 2500, hotel: 500, daily: 400 },
  fr: { place: "europe", nights: 4, people: 2, flight: 250, hotel: 120, daily: 90 },
  es: { place: "europe", nights: 4, people: 2, flight: 200, hotel: 110, daily: 80 },
};

export const travelAssumptionsL = (lang: WL): Assumption<TravelLite>[] => [
  A<TravelLite>(lang, "nights", { en: ["Nights", "the number of nights"], ja: ["泊数", "泊数"], zh: ["晚数", "住宿晚数"], fr: ["Nuits", "le nombre de nuits"], es: ["Noches", "el número de noches"] }, "nights", (i) => i.nights, (i, v) => ({ ...i, nights: Math.max(1, Math.round(v)) }), fixedRange(1, 14)),
  A<TravelLite>(lang, "people", { en: ["Travellers", "the number of travellers"], ja: ["人数", "人数"], zh: ["人数", "人数"], fr: ["Voyageurs", "le nombre de voyageurs"], es: ["Viajeros", "el número de viajeros"] }, "people", (i) => i.people, (i, v) => ({ ...i, people: Math.max(1, Math.round(v)) }), fixedRange(1, 8)),
  A<TravelLite>(lang, "flight", { en: ["Return flight per person", "the flight price"], ja: ["1人の往復航空券", "航空券代"], zh: ["每人往返机票", "机票价格"], fr: ["Vol aller-retour par personne", "le prix du vol"], es: ["Vuelo de ida y vuelta por persona", "el precio del vuelo"] }, "won", (i) => i.flight, (i, v) => ({ ...i, flight: Math.max(0, v) }), around(0.5, 2)),
  A<TravelLite>(lang, "hotel", { en: ["Room per night", "the room price"], ja: ["1室1泊の宿泊費", "宿泊費"], zh: ["每间每晚房费", "房费"], fr: ["Chambre par nuit", "le prix de la chambre"], es: ["Habitación por noche", "el precio de la habitación"] }, "won", (i) => i.hotel, (i, v) => ({ ...i, hotel: Math.max(0, v) }), around(0.4, 3)),
  A<TravelLite>(lang, "daily", { en: ["Daily spend per person", "daily spending"], ja: ["1人1日の現地費用", "現地費用"], zh: ["每人每天当地花费", "当地花费"], fr: ["Dépenses par jour et par personne", "les dépenses sur place"], es: ["Gasto diario por persona", "el gasto diario"] }, "won", (i) => i.daily, (i, v) => ({ ...i, daily: Math.max(0, v) }), around(0.5, 2)),
];

export const TRAVEL_PARTS: Record<WL, [string, string, string]> = {
  en: ["Flights", "Hotel", "Spending on the ground"],
  ja: ["航空券", "宿泊", "現地費用"],
  zh: ["机票", "住宿", "当地花费"],
  fr: ["Vols", "Hébergement", "Dépenses sur place"],
  es: ["Vuelos", "Alojamiento", "Gastos en destino"],
};
export const tripLength = (i: TravelLite, lang: WL) => {
  const d = i.nights + 1;
  return { en: `${i.nights} nights, ${d} days`, ja: `${i.nights}泊${d}日`, zh: `${i.nights}晚${d}天`, fr: `${i.nights} nuits, ${d} jours`, es: `${i.nights} noches, ${d} días` }[lang];
};

export const travelPlainL = (lang: WL, cur: string) => (i: TravelLite, top?: TornadoBar) => {
  const r = travelResult(i);
  const m = (n: number) => moneyL(n, lang, cur);
  const parts = TRAVEL_PARTS[lang];
  const k = [r.flight, r.hotel, r.daily].indexOf(Math.max(r.flight, r.hotel, r.daily));
  const len = tripLength(i, lang);
  const T = {
    en: { head: `${len} for ${i.people} ${i.people === 1 ? "person" : "people"} comes to about ${m(r.total)}, or ${m(r.perPerson)} each.`, big: ["Book 2–3 months ahead or fly midweek to cut it the most.", "Two people share a room here; going one category down saves a lot.", "Food, local transport and sightseeing per person per day. Add shopping separately."], r2: `Rooms: one per two people (${rooms(i.people)}). Single rooms cost more.`, r3: "Peak season and exchange rates can move prices 20–30%. Keep a buffer.", top: "The biggest share is", what: "the total" },
    ja: { head: `${len}・${i.people}人で合計約${m(r.total)}、1人あたり約${m(r.perPerson)}です。`, big: ["出発の2〜3か月前の予約や平日出発でいちばん大きく減らせます。", "2人で1室として計算しています。ランクを1つ下げると大きく減ります。", "食費・交通・観光を1人1日単位で見ています。買い物は別に足してください。"], r2: `部屋は2人で1室（${rooms(i.people)}室）として計算しています。1人1室なら宿泊費が増えます。`, r3: "繁忙期や為替で20〜30%変わることがあります。余裕を見ておきましょう。", top: "いちばん大きいのは", what: "合計予算" },
    zh: { head: `${len}、${i.people}人，总共约${m(r.total)}，人均约${m(r.perPerson)}。`, big: ["提前2~3个月订票或选工作日出发，省得最多。", "按两人一间计算；住宿降一档能省不少。", "按每人每天算餐饮、交通和景点，购物另算。"], r2: `按两人一间（${rooms(i.people)}间）计算，一人一间房费会更高。`, r3: "旺季和汇率可能让价格浮动20%~30%，请留出余量。", top: "占比最大的是", what: "总预算" },
    fr: { head: `${len} à ${i.people} : environ ${m(r.total)} au total, soit ${m(r.perPerson)} par personne.`, big: ["Réserver 2 à 3 mois à l'avance ou partir en semaine fait le plus baisser la note.", "On compte une chambre pour deux ; descendre d'une catégorie économise beaucoup.", "Repas, transports locaux et visites par personne et par jour. Ajoutez le shopping à part."], r2: `Une chambre pour deux personnes (${rooms(i.people)}). En chambre individuelle, c'est plus cher.`, r3: "Haute saison et taux de change peuvent faire varier les prix de 20 à 30 %. Gardez une marge.", top: "Le plus gros poste :", what: "le budget total" },
    es: { head: `${len} para ${i.people}: unos ${m(r.total)} en total, ${m(r.perPerson)} por persona.`, big: ["Reservar con 2-3 meses de antelación o volar entre semana es lo que más ahorra.", "Contamos una habitación por cada dos; bajar una categoría ahorra mucho.", "Comida, transporte local y visitas por persona y día. Suma las compras aparte."], r2: `Una habitación por cada dos personas (${rooms(i.people)}). Con habitaciones individuales sube.`, r3: "La temporada alta y el tipo de cambio pueden mover los precios un 20-30 %. Deja margen.", top: "La partida más grande:", what: "el presupuesto total" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, m), reasons: [`${T.top} ${parts[k].toLowerCase()} (${m([r.flight, r.hotel, r.daily][k])}). ${T.big[k]}`, T.r2, T.r3] };
};

// ───────────────────────── 기름값 ─────────────────────────

export const FUEL_EXAMPLE: Record<WL, FuelLite> = {
  en: { distance: 400, efficiency: 12, price: 0.95, people: 1, roundTrip: false },
  ja: { distance: 500, efficiency: 15, price: 175, people: 1, roundTrip: false },
  zh: { distance: 300, efficiency: 12, price: 7.8, people: 1, roundTrip: false },
  fr: { distance: 465, efficiency: 15, price: 1.8, people: 1, roundTrip: false },
  es: { distance: 620, efficiency: 15, price: 1.55, people: 1, roundTrip: false },
};

export const fuelAssumptionsL = (lang: WL): Assumption<FuelLite>[] => [
  A<FuelLite>(lang, "distance", { en: ["Distance", "the distance"], ja: ["距離", "距離"], zh: ["距离", "距离"], fr: ["Distance", "la distance"], es: ["Distancia", "la distancia"] }, "km", (i) => i.distance, (i, v) => ({ ...i, distance: Math.max(1, v) }), around(0.3, 2, 10)),
  A<FuelLite>(lang, "efficiency", { en: ["Fuel economy", "fuel economy"], ja: ["燃費", "燃費"], zh: ["油耗（公里/升）", "油耗"], fr: ["Consommation (km/L)", "la consommation"], es: ["Consumo (km/L)", "el consumo"] }, "kmpl", (i) => i.efficiency, (i, v) => ({ ...i, efficiency: Math.max(1, v) }), fixedRange(5, 25)),
  A<FuelLite>(lang, "price", { en: ["Fuel price per litre", "the fuel price"], ja: ["ガソリン1L", "ガソリン代"], zh: ["每升油价", "油价"], fr: ["Prix du litre", "le prix du carburant"], es: ["Precio por litro", "el precio del combustible"] }, "won", (i) => i.price, (i, v) => ({ ...i, price: Math.max(0, v) }), around(0.7, 1.4)),
];

export const fuelByEfficiencyL = (i: FuelLite, lang: WL) => [8, 12, 16, 20].map((e) => ({ label: `${numL(e, lang)} km/L (${numL(100 / e, lang)} L/100 km)`, value: fuelCost({ ...i, efficiency: e }), current: Math.round(i.efficiency) === e }));

export const fuelPlainL = (lang: WL, cur: string) => (i: FuelLite, top?: TornadoBar) => {
  const r = fuelResult(i);
  const m = (n: number) => moneyL(n, lang, cur);
  const km = numL(r.km, lang, 0);
  const L = numL(r.liters, lang);
  const share = i.people > 1;
  const T = {
    en: { head: `${i.roundTrip ? "Round trip, " : ""}${km} km costs about ${m(r.cost)} in fuel.${share ? ` Split ${i.people} ways, that's ${m(r.perPerson)} each.` : ""}`, r1: `${L} L at ${m(i.price)} per litre. (1 US gallon = 3.785 L; 30 mpg ≈ 12.8 km/L.)`, r2: "Steady highway driving beats the rated economy by 10–20%; city traffic is that much worse.", r3: "Tolls and parking aren't included.", what: "the fuel cost" },
    ja: { head: `${i.roundTrip ? "往復" : ""}${km}kmのガソリン代は約${m(r.cost)}です。${share ? `${i.people}人で割ると1人${m(r.perPerson)}です。` : ""}`, r1: `ガソリン${L}Lを1L ${m(i.price)}で計算しています。`, r2: "高速道路の一定速度走行はカタログ燃費より10〜20%よく、街中の渋滞はその分悪くなります。", r3: "高速料金と駐車場代は含んでいません。遠出では高速料金がガソリン代と同じくらいになることもあります。", what: "ガソリン代" },
    zh: { head: `${i.roundTrip ? "往返" : ""}${km}公里油费约${m(r.cost)}。${share ? `${i.people}人分摊，每人${m(r.perPerson)}。` : ""}`, r1: `按${L}升、每升${m(i.price)}计算。`, r2: "高速匀速行驶比标称油耗好10%~20%，市区拥堵则差不多同样程度变差。", r3: "不含高速过路费和停车费。", what: "油费" },
    fr: { head: `${i.roundTrip ? "Aller-retour, " : ""}${km} km coûtent environ ${m(r.cost)} de carburant.${share ? ` À ${i.people}, cela fait ${m(r.perPerson)} chacun.` : ""}`, r1: `${L} L à ${m(i.price)} le litre. Une consommation de ${numL(100 / i.efficiency, lang)} L/100 km correspond à ${numL(i.efficiency, lang)} km/L.`, r2: "Sur autoroute à vitesse stable, on fait 10 à 20 % mieux que la consommation annoncée ; en ville, d'autant moins bien.", r3: "Péages et stationnement non compris : sur un long trajet, les péages peuvent approcher le prix du carburant.", what: "le coût du carburant" },
    es: { head: `${i.roundTrip ? "Ida y vuelta, " : ""}${km} km cuestan unos ${m(r.cost)} de combustible.${share ? ` Entre ${i.people}, son ${m(r.perPerson)} por persona.` : ""}`, r1: `${L} L a ${m(i.price)} el litro. Un consumo de ${numL(100 / i.efficiency, lang)} L/100 km equivale a ${numL(i.efficiency, lang)} km/L.`, r2: "En autopista a ritmo constante se mejora el consumo homologado un 10-20 %; en ciudad empeora otro tanto.", r3: "No incluye peajes ni aparcamiento.", what: "el coste del combustible" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, m), reasons: [T.r1, T.r2, T.r3] };
};

// ───────────────────────── 팁 ─────────────────────────

export const TIP_EXAMPLE: Record<WL, TipLite> = {
  en: { bill: 80, rate: 0.18, split: 2 },
  ja: { bill: 80, rate: 0.18, split: 2 },
  zh: { bill: 80, rate: 0.18, split: 2 },
  fr: { bill: 60, rate: 0.05, split: 2 },
  es: { bill: 50, rate: 0.07, split: 2 },
};

export const tipAssumptionsL = (lang: WL): Assumption<TipLite>[] => [
  A<TipLite>(lang, "bill", { en: ["Bill before tax", "the bill"], ja: ["飲食代（税抜）", "飲食代"], zh: ["账单（税前）", "账单"], fr: ["Addition", "l'addition"], es: ["Cuenta", "la cuenta"] }, "amount", (i) => i.bill, (i, v) => ({ ...i, bill: Math.max(0, v) }), around(0.5, 2)),
  A<TipLite>(lang, "rate", { en: ["Tip rate", "the tip rate"], ja: ["チップ率", "チップ率"], zh: ["小费比例", "小费比例"], fr: ["Pourboire", "le pourboire"], es: ["Propina", "la propina"] }, "pct", (i) => i.rate, (i, v) => ({ ...i, rate: Math.min(0.4, Math.max(0, v)) }), fixedRange(0, 0.3), [{ at: 0.15, label: "15%" }, { at: 0.2, label: "20%" }]),
  A<TipLite>(lang, "split", { en: ["Split between", "the number of people"], ja: ["割る人数", "人数"], zh: ["分摊人数", "人数"], fr: ["Partagé entre", "le nombre de personnes"], es: ["Dividir entre", "el número de personas"] }, "people", (i) => i.split, (i, v) => ({ ...i, split: Math.max(1, Math.round(v)) }), fixedRange(1, 8)),
];

export const tipRatesL = (i: TipLite, lang: WL) => [0.05, 0.1, 0.15, 0.18, 0.2, 0.25].map((r) => ({ label: pctOf(r, lang), value: tipPer({ ...i, rate: r }), current: Math.abs(r - i.rate) < 0.001 }));

export const tipPlainL = (lang: WL) => (i: TipLite, top?: TornadoBar) => {
  const r = tipResult(i);
  const a = (n: number) => amtL(n, lang);
  const p = pctOf(i.rate, lang);
  const T = {
    en: { head: `With the tip at ${p}, the total is ${a(r.total)}; split ${i.split} ways, that's ${a(r.per)} each.`, r1: `The tip alone is ${a(r.tip)} (${a(r.tipPer)} each). Amounts stay in the bill's currency.`, r2: "In the US, 15–20% at sit-down restaurants is normal; 18–20% for good service. Canada is similar.", r3: "Tip on the pre-tax subtotal. If a service charge is already on the bill, you don't need to add more.", what: "each share" },
    ja: { head: `チップ${p}を足すと合計${a(r.total)}、${i.split}人で割ると1人${a(r.per)}です。`, r1: `チップだけで${a(r.tip)}、1人${a(r.tipPer)}です。金額は伝票の通貨のままです。`, r2: "日本にはチップの習慣がほぼありません。アメリカのレストランでは15〜20%が一般的です。", r3: "チップは税抜きの小計（Subtotal）にかけるのが基本です。サービス料が含まれていれば追加は不要です。", what: "1人の負担" },
    zh: { head: `加${p}小费后共${a(r.total)}，${i.split}人分摊每人${a(r.per)}。`, r1: `小费${a(r.tip)}，每人${a(r.tipPer)}。金额按账单币种计算。`, r2: "中国大陆一般没有小费习惯；美国餐厅通常给15%~20%。", r3: "小费按税前小计（Subtotal）计算；账单已含服务费就不必再给。", what: "每人分摊" },
    fr: { head: `Avec ${p} de pourboire, le total est de ${a(r.total)} ; à ${i.split}, cela fait ${a(r.per)} chacun.`, r1: `Le pourboire seul fait ${a(r.tip)} (${a(r.tipPer)} chacun). Les montants restent dans la devise de l'addition.`, r2: "En France le service est compris : on laisse souvent quelques euros ou 5 à 10 % si le service était bon. Aux États-Unis, 15 à 20 % est la norme.", r3: "À l'étranger, calculez le pourboire sur le montant hors taxes.", what: "la part de chacun" },
    es: { head: `Con un ${p} de propina el total es ${a(r.total)}; entre ${i.split}, ${a(r.per)} cada uno.`, r1: `Solo la propina son ${a(r.tip)} (${a(r.tipPer)} por persona). Los importes van en la moneda de la cuenta.`, r2: "En España la propina es voluntaria: es habitual redondear o dejar un 5-10 %. En EE. UU. lo normal es un 15-20 %.", r3: "Fuera de España, calcula la propina sobre el importe antes de impuestos.", what: "la parte de cada uno" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, a), reasons: [T.r1, T.r2, T.r3] };
};

// ───────────────────────── 할인 ─────────────────────────

export const DISCOUNT_EXAMPLE: Record<WL, DiscountLite> = {
  en: { price: 120, rate: 0.2, extra: 0.1 },
  ja: { price: 12000, rate: 0.2, extra: 0.1 },
  zh: { price: 599, rate: 0.2, extra: 0.1 },
  fr: { price: 99, rate: 0.2, extra: 0.1 },
  es: { price: 99, rate: 0.2, extra: 0.1 },
};

export const discountAssumptionsL = (lang: WL): Assumption<DiscountLite>[] => [
  A<DiscountLite>(lang, "price", { en: ["List price", "the list price"], ja: ["定価", "定価"], zh: ["原价", "原价"], fr: ["Prix affiché", "le prix affiché"], es: ["Precio original", "el precio original"] }, "won", (i) => i.price, (i, v) => ({ ...i, price: Math.max(0, v) }), around(0.5, 2)),
  A<DiscountLite>(lang, "rate", { en: ["Discount", "the discount"], ja: ["割引率", "割引率"], zh: ["折扣率", "折扣"], fr: ["Remise", "la remise"], es: ["Descuento", "el descuento"] }, "pct", (i) => i.rate, (i, v) => ({ ...i, rate: Math.min(0.95, Math.max(0, v)) }), fixedRange(0, 0.7)),
  A<DiscountLite>(lang, "extra", { en: ["Extra discount", "the extra discount (coupon, card)"], ja: ["追加割引", "追加割引（クーポン・カード）"], zh: ["额外折扣", "额外折扣（优惠券、银行卡）"], fr: ["Remise supplémentaire", "la remise supplémentaire (code, carte)"], es: ["Descuento adicional", "el descuento adicional (cupón, tarjeta)"] }, "pct", (i) => i.extra, (i, v) => ({ ...i, extra: Math.min(0.9, Math.max(0, v)) }), fixedRange(0, 0.5)),
];

export const stackVsSingleL = (i: DiscountLite, lang: WL) => {
  const r = discountResult(i);
  const p = (n: number) => pctOf(n, lang);
  const T = { en: ["one after the other", "at once"], ja: ["順番に", "まとめて"], zh: ["先后叠加", "一次扣"], fr: ["l'une après l'autre", "en une fois"], es: ["uno tras otro", "de una vez"] }[lang];
  return [
    { label: `${p(i.rate)} → ${p(i.extra)} ${T[0]}`, value: r.final, current: true },
    { label: `${p(i.rate + i.extra)} ${T[1]}`, value: i.price * Math.max(0, 1 - i.rate - i.extra) },
  ];
};

export const discountPlainL = (lang: WL, cur: string) => (i: DiscountLite, top?: TornadoBar) => {
  const r = discountResult(i);
  const m = (n: number) => moneyL(n, lang, cur);
  const p = (n: number) => pctOf(n, lang);
  const eff = pctOf(Math.round(r.effective * 1000) / 1000, lang);
  const stacked = i.extra > 0;
  const T = {
    en: { head: `You pay ${m(r.final)} instead of ${m(i.price)} and save ${m(r.saved)}.`, s: `${p(i.rate)} off and then ${p(i.extra)} off is really ${eff} off, not ${p(i.rate + i.extra)}, because the second discount applies to the already reduced price.`, n: "Have a coupon or card offer too? Put it in the extra discount.", r2: "A big percentage means little if the list price was inflated. Compare with the actual price elsewhere.", r3: "Sales tax is added at the register in the US; prices here are before tax.", what: "what you pay" },
    ja: { head: `${m(i.price)}の品を${m(r.final)}で買えます。${m(r.saved)}お得です。`, s: `${p(i.rate)}引きのあとにさらに${p(i.extra)}引くと、実際は${eff}引きです。${p(i.rate + i.extra)}引きではありません。割り引いた後の値段にもう一度割引がかかるからです。`, n: "クーポンやカード割引があれば追加割引に入れてみてください。", r2: "割引率が同じでも、定価が高めに設定されていれば意味がありません。ほかの店の実売価格と比べましょう。", r3: "ポイント還元は値引きではなく、次の買い物で使える分です。", what: "支払う金額" },
    zh: { head: `原价${m(i.price)}，实付${m(r.final)}，省${m(r.saved)}。`, s: `先减${p(i.rate)}再减${p(i.extra)}，实际只便宜了${eff}，不是${p(i.rate + i.extra)}。因为第二次折扣是在已打折的价格上算的。`, n: "还有优惠券或银行卡优惠的话，填到额外折扣里。", r2: "折扣率一样，原价被抬高也没意义。和别家的实际售价比一比。", r3: "“满减”换算成折扣率时，要用实际付款除以原价来算。", what: "实付金额" },
    fr: { head: `Vous payez ${m(r.final)} au lieu de ${m(i.price)} : ${m(r.saved)} d'économie.`, s: `${p(i.rate)} puis ${p(i.extra)} de remise, cela fait en réalité ${eff}, pas ${p(i.rate + i.extra)} : la seconde remise s'applique au prix déjà réduit.`, n: "Un code promo ou une offre carte en plus ? Ajoutez-le en remise supplémentaire.", r2: "Un gros pourcentage ne vaut rien si le prix de référence était gonflé. Comparez avec le prix réel ailleurs.", r3: "En France, le prix de référence d'une promotion doit être le plus bas des 30 derniers jours.", what: "le prix payé" },
    es: { head: `Pagas ${m(r.final)} en vez de ${m(i.price)} y ahorras ${m(r.saved)}.`, s: `Un ${p(i.rate)} y luego otro ${p(i.extra)} es en realidad un ${eff}, no un ${p(i.rate + i.extra)}: el segundo descuento se aplica sobre el precio ya rebajado.`, n: "¿Tienes además un cupón u oferta con tarjeta? Ponlo como descuento adicional.", r2: "Un gran porcentaje no sirve si el precio original estaba inflado. Compara con el precio real en otras tiendas.", r3: "En la UE, el precio de referencia de una rebaja debe ser el más bajo de los últimos 30 días.", what: "lo que pagas" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, m), reasons: [stacked ? T.s : T.n, T.r2, T.r3] };
};
