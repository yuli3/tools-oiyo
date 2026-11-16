// 5묶음 생활 계산기(가벼운 판, 2026-11-17). 여행 예산·기름값·결혼 예산·팁·할인. 한국어 페이지용.
import { fixedRange, type Assumption, type TornadoBar } from "./scenario.ts";
import { unitDriver } from "./health-scenarios.ts";

export const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
/** 통화 없는 금액(팁처럼 외화로 계산할 때) */
export const amt = (n: number) => (Math.round(n * 100) / 100).toLocaleString("ko-KR");
const pct = (n: number) => `${Math.round(n * 100)}%`;
const wonKey = <I>(key: string, plain: string, get: (i: I) => number, set: (i: I, v: number) => I, range: (a: number) => [number, number], kind: "fact" | "assumption" = "assumption"): Assumption<I> => ({ key, label: plain, plain, unit: "won", kind, get, set, range });
const around = (lo: number, hi: number, floor = 0) => (a: number): [number, number] => [Math.max(floor, a * lo), Math.max(a * hi, floor + 1)];

// ───────────────────────── 여행 예산 ─────────────────────────

/** 기존 여행 예산 계산기의 지역별 기준값(1인 왕복 항공, 3성급 1실 1박, 1인 하루 식비+교통+관광) */
export const TRAVEL_PLACES = {
  japan: { label: "일본", flight: 350000, hotel: 80000, daily: 90000 },
  taiwan: { label: "대만", flight: 280000, hotel: 65000, daily: 52000 },
  china: { label: "중국", flight: 300000, hotel: 60000, daily: 62000 },
  vietnam: { label: "베트남", flight: 380000, hotel: 40000, daily: 40000 },
  thailand: { label: "태국", flight: 400000, hotel: 50000, daily: 55000 },
  southeast_asia: { label: "그 밖의 동남아", flight: 450000, hotel: 45000, daily: 46000 },
  australia: { label: "호주", flight: 750000, hotel: 110000, daily: 120000 },
  usa: { label: "미국", flight: 850000, hotel: 120000, daily: 140000 },
  europe: { label: "유럽", flight: 900000, hotel: 130000, daily: 135000 },
} as const;
export type Place = keyof typeof TRAVEL_PLACES;

export interface TravelLite {
  place: Place;
  nights: number;
  people: number;
  flight: number;
  hotel: number;
  daily: number;
}

export const rooms = (people: number) => Math.max(1, Math.ceil(people / 2));
export function travelResult(i: TravelLite) {
  const days = i.nights + 1;
  const flight = i.flight * i.people;
  const hotel = i.hotel * rooms(i.people) * i.nights;
  const daily = i.daily * i.people * days;
  const total = flight + hotel + daily;
  return { days, flight, hotel, daily, total, perPerson: total / Math.max(1, i.people) };
}
export const travelTotal = (i: TravelLite) => travelResult(i).total;

export const TRAVEL_ASSUMPTIONS: Assumption<TravelLite>[] = [
  { key: "nights", label: "숙박", plain: "숙박 일수", unit: "nights", kind: "assumption", get: (i) => i.nights, set: (i, v) => ({ ...i, nights: Math.max(1, Math.round(v)) }), range: fixedRange(1, 14) },
  { key: "people", label: "인원", plain: "인원", unit: "people", kind: "assumption", get: (i) => i.people, set: (i, v) => ({ ...i, people: Math.max(1, Math.round(v)) }), range: fixedRange(1, 8) },
  wonKey<TravelLite>("flight", "1인 왕복 항공권", (i) => i.flight, (i, v) => ({ ...i, flight: Math.max(0, v) }), around(0.5, 2)),
  wonKey<TravelLite>("hotel", "방 하나 1박 숙박비", (i) => i.hotel, (i, v) => ({ ...i, hotel: Math.max(0, v) }), around(0.4, 3)),
  wonKey<TravelLite>("daily", "1인 하루 경비", (i) => i.daily, (i, v) => ({ ...i, daily: Math.max(0, v) }), around(0.5, 2)),
];

export function travelPlain(i: TravelLite, top?: TornadoBar) {
  const r = travelResult(i);
  const biggest = [["항공권", r.flight], ["숙박", r.hotel], ["현지 경비", r.daily]].sort((a, b) => (b[1] as number) - (a[1] as number))[0];
  return {
    headline: `${TRAVEL_PLACES[i.place].label} ${i.nights}박 ${r.days}일, ${i.people}명이면 모두 약 ${won(r.total)}이 들어요. 1인당 약 ${won(r.perPerson)}이에요.`,
    driver: unitDriver(top, "총 예산", won),
    reasons: [
      `가장 큰 몫은 ${biggest[0]}(${won(biggest[1] as number)})이에요. ${biggest[0] === "항공권" ? "출발 2~3달 전에 사거나 평일 출발로 바꾸면 많이 줄어요." : biggest[0] === "숙박" ? "방 하나에 2명씩 묵는다고 보고, 숙박 등급을 한 단계 낮추면 크게 줄어요." : "식비·교통·관광을 1인 하루 단위로 잡았어요. 쇼핑은 따로 더하세요."}`,
      `방은 2명당 1개(${rooms(i.people)}개)로 계산했어요. 1인 1실이면 숙박비가 더 늘어요.`,
      "지역별 기준값은 평균적인 추정이에요. 성수기·환율에 따라 20~30% 달라질 수 있으니 여유분을 두세요.",
    ],
  };
}

// ───────────────────────── 기름값 ─────────────────────────

export interface FuelLite {
  distance: number;
  efficiency: number;
  price: number;
  people: number;
  roundTrip: boolean;
}

export function fuelResult(i: FuelLite) {
  const km = i.distance * (i.roundTrip ? 2 : 1);
  const liters = i.efficiency > 0 ? km / i.efficiency : 0;
  const cost = liters * i.price;
  return { km, liters, cost, perPerson: cost / Math.max(1, i.people) };
}
export const fuelCost = (i: FuelLite) => fuelResult(i).cost;

export const FUEL_ASSUMPTIONS: Assumption<FuelLite>[] = [
  { key: "distance", label: "거리", plain: "가는 거리", unit: "km", kind: "assumption", get: (i) => i.distance, set: (i, v) => ({ ...i, distance: Math.max(1, v) }), range: around(0.3, 2, 10) },
  { key: "efficiency", label: "연비", plain: "연비", unit: "kmpl", kind: "assumption", get: (i) => i.efficiency, set: (i, v) => ({ ...i, efficiency: Math.max(1, v) }), range: fixedRange(5, 25) },
  wonKey<FuelLite>("price", "기름값(1L)", (i) => i.price, (i, v) => ({ ...i, price: Math.max(0, v) }), fixedRange(1300, 2200)),
  { key: "people", label: "탄 사람", plain: "나눌 사람 수", unit: "people", kind: "assumption", get: (i) => i.people, set: (i, v) => ({ ...i, people: Math.max(1, Math.round(v)) }), range: fixedRange(1, 5) },
];

export const fuelByEfficiency = (i: FuelLite) => [8, 12, 16, 20].map((e) => ({ label: `연비 ${e}km/L`, value: fuelCost({ ...i, efficiency: e }), current: Math.round(i.efficiency) === e }));

export function fuelPlain(i: FuelLite, top?: TornadoBar) {
  const r = fuelResult(i);
  return {
    headline: `${i.roundTrip ? "왕복 " : ""}${Math.round(r.km).toLocaleString("ko-KR")}km에 기름값이 약 ${won(r.cost)} 들어요.${i.people > 1 ? ` ${i.people}명이 나누면 1인 ${won(r.perPerson)}이에요.` : ""}`,
    driver: unitDriver(top, "기름값", won),
    reasons: [
      `기름 ${(Math.round(r.liters * 10) / 10).toLocaleString("ko-KR")}L를 1L에 ${won(i.price)}으로 계산했어요.`,
      "고속도로 정속 주행은 표시 연비보다 10~20% 잘 나오고, 시내 정체는 그만큼 나빠요.",
      "통행료와 주차비는 빠져 있어요. 장거리면 통행료가 기름값의 절반 가까이 되기도 해요.",
    ],
  };
}

// ───────────────────────── 결혼 예산 ─────────────────────────

export interface WeddingLite {
  guests: number;
  gift: number;
  meal: number;
  venue: number;
  sdm: number;
  honeymoon: number;
}

export function weddingResult(i: WeddingLite) {
  const food = i.guests * i.meal;
  const cost = food + i.venue + i.sdm + i.honeymoon;
  const gifts = i.guests * i.gift;
  const fixed = i.venue + i.sdm + i.honeymoon;
  const margin = i.gift - i.meal;
  return { food, cost, gifts, balance: gifts - cost, fixed, breakEven: margin > 0 ? Math.ceil(fixed / margin) : Infinity };
}
export const weddingBalance = (i: WeddingLite) => weddingResult(i).balance;

export const WEDDING_ASSUMPTIONS: Assumption<WeddingLite>[] = [
  { key: "guests", label: "하객 수", plain: "하객 수", unit: "people", kind: "assumption", get: (i) => i.guests, set: (i, v) => ({ ...i, guests: Math.max(0, Math.round(v)) }), range: around(0.5, 1.6, 20) },
  wonKey<WeddingLite>("gift", "1인 평균 축의금", (i) => i.gift, (i, v) => ({ ...i, gift: Math.max(0, v) }), fixedRange(50000, 200000)),
  wonKey<WeddingLite>("meal", "1인 식대", (i) => i.meal, (i, v) => ({ ...i, meal: Math.max(0, v) }), fixedRange(40000, 120000)),
  wonKey<WeddingLite>("sdm", "스드메", (i) => i.sdm, (i, v) => ({ ...i, sdm: Math.max(0, v) }), around(0.5, 2)),
  wonKey<WeddingLite>("honeymoon", "신혼여행", (i) => i.honeymoon, (i, v) => ({ ...i, honeymoon: Math.max(0, v) }), around(0.3, 2)),
];

export function weddingPlain(i: WeddingLite, top?: TornadoBar) {
  const r = weddingResult(i);
  return {
    headline: r.balance >= 0 ? `축의금으로 비용을 다 내고 약 ${won(r.balance)}이 남아요.` : `축의금보다 비용이 약 ${won(-r.balance)} 많아요. 그만큼 모아 둔 돈에서 나가요.`,
    driver: unitDriver(top, "남는 돈", won),
    reasons: [
      Number.isFinite(r.breakEven) ? `하객이 ${r.breakEven.toLocaleString("ko-KR")}명을 넘으면 축의금이 비용을 넘어서요. 지금은 ${i.guests}명이에요.` : "1인 축의금이 식대보다 적어서 하객이 늘수록 손해가 커져요.",
      `1인당 축의금 ${won(i.gift)}에서 식대 ${won(i.meal)}를 빼면 하객 한 명당 ${won(i.gift - i.meal)}이 남아요. 이 차이가 하객 수만큼 쌓여요.`,
      "축의금은 양가가 나누는 경우가 많고, 받은 만큼 나중에 돌려줘야 하는 돈이에요. 남는 돈으로 미리 쓰지 마세요.",
    ],
  };
}

// ───────────────────────── 팁 ─────────────────────────

export interface TipLite {
  bill: number;
  rate: number;
  split: number;
}

export function tipResult(i: TipLite) {
  const tip = i.bill * i.rate;
  const total = i.bill + tip;
  const n = Math.max(1, i.split);
  return { tip, total, per: total / n, tipPer: tip / n };
}
export const tipPer = (i: TipLite) => tipResult(i).per;

export const TIP_ASSUMPTIONS: Assumption<TipLite>[] = [
  { key: "bill", label: "음식값", plain: "음식값", unit: "amount", kind: "assumption", get: (i) => i.bill, set: (i, v) => ({ ...i, bill: Math.max(0, v) }), range: around(0.5, 2) },
  { key: "rate", label: "팁 비율", plain: "팁 비율", unit: "pct", kind: "assumption", get: (i) => i.rate, set: (i, v) => ({ ...i, rate: Math.min(0.4, Math.max(0, v)) }), range: fixedRange(0, 0.3), marks: [{ at: 0.15, label: "15%" }, { at: 0.2, label: "20%" }] },
  { key: "split", label: "나눌 사람", plain: "나눌 사람 수", unit: "people", kind: "assumption", get: (i) => i.split, set: (i, v) => ({ ...i, split: Math.max(1, Math.round(v)) }), range: fixedRange(1, 8) },
];

export const tipRates = (i: TipLite) => [0.1, 0.15, 0.18, 0.2, 0.25].map((r) => ({ label: `팁 ${pct(r)}`, value: tipPer({ ...i, rate: r }), current: Math.abs(r - i.rate) < 0.001 }));

export function tipPlain(i: TipLite, top?: TornadoBar) {
  const r = tipResult(i);
  return {
    headline: `팁 ${pct(i.rate)}를 더하면 모두 ${amt(r.total)}, ${i.split}명이 나누면 1인당 ${amt(r.per)}씩 내요.`,
    driver: unitDriver(top, "1인 부담", won),
    reasons: [
      `팁만 ${amt(r.tip)}, 1인당 ${amt(r.tipPer)}씩이에요. 금액은 계산서 통화 그대로예요.`,
      "미국 식당은 15~20%가 보통이고, 일본·한국은 팁 문화가 거의 없어요. 유럽은 계산서에 봉사료가 들어 있으면 따로 안 내도 돼요.",
      "세금 전 금액에 팁을 매기는 게 원칙이에요. 영수증의 세전 금액(Subtotal)을 넣으세요.",
    ],
  };
}

// ───────────────────────── 할인 ─────────────────────────

export interface DiscountLite {
  price: number;
  rate: number;
  extra: number;
}

export function discountResult(i: DiscountLite) {
  const first = i.price * (1 - i.rate);
  const final = first * (1 - i.extra);
  const saved = i.price - final;
  return { first, final, saved, effective: i.price > 0 ? saved / i.price : 0 };
}
export const discountFinal = (i: DiscountLite) => discountResult(i).final;

export const DISCOUNT_ASSUMPTIONS: Assumption<DiscountLite>[] = [
  wonKey<DiscountLite>("price", "정가", (i) => i.price, (i, v) => ({ ...i, price: Math.max(0, v) }), around(0.5, 2)),
  { key: "rate", label: "할인율", plain: "할인율", unit: "pct", kind: "assumption", get: (i) => i.rate, set: (i, v) => ({ ...i, rate: Math.min(0.95, Math.max(0, v)) }), range: fixedRange(0, 0.7) },
  { key: "extra", label: "추가 할인율", plain: "추가 할인(쿠폰·카드)", unit: "pct", kind: "assumption", get: (i) => i.extra, set: (i, v) => ({ ...i, extra: Math.min(0.9, Math.max(0, v)) }), range: fixedRange(0, 0.5) },
];

export function discountPlain(i: DiscountLite, top?: TornadoBar) {
  const r = discountResult(i);
  const sum = i.rate + i.extra;
  return {
    headline: `${won(i.price)}짜리를 ${won(r.final)}에 사요. ${won(r.saved)} 아껴요.`,
    driver: unitDriver(top, "내는 돈", won),
    reasons: [
      i.extra > 0 ? `${pct(i.rate)} 할인 뒤 ${pct(i.extra)}를 또 빼면 실제로는 ${(Math.round(r.effective * 1000) / 10).toLocaleString("ko-KR")}% 할인이에요. ${pct(sum)}가 아니에요. 할인된 값에 다시 할인을 매기기 때문이에요.` : "쿠폰이나 카드 할인이 더 있으면 추가 할인에 넣어 보세요.",
      "할인율이 같아도 정가가 부풀려져 있으면 소용없어요. 다른 곳의 실제 판매가와 비교하세요.",
      "카드 청구 할인은 전월 실적 조건이 붙는 경우가 많아요.",
    ],
  };
}
export const stackVsSingle = (i: DiscountLite) => {
  const r = discountResult(i);
  return [
    { label: `${pct(i.rate)} → ${pct(i.extra)} 차례로`, value: r.final, current: true },
    { label: `${pct(i.rate + i.extra)} 한 번에`, value: i.price * Math.max(0, 1 - i.rate - i.extra) },
  ];
};
