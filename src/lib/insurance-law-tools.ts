// 보험 법령 길잡이 곁 도구 2종 (2026-11-17). 세운 요청 "보험계리사·보험설계사 등 직업 추가, 종사자·비전문가 모두 쓰기 좋은 도구".
// 1) 모집 준수 점검(종사자): 사은품 한도(보험업법 제98조, 시행령 제46조)와 승환계약 간주(제97조 제3항).
// 2) 보험료 계산 원리(일반인·계리 입문): 수지상등 원칙으로 정기보험 영업보험료를 위험률·예정이율·사업비로 나눠 보여 줘요.
//    사망률은 곰퍼츠 모형(설명용 근사)이에요. 실제 경험생명표·보험사 견적이 아니에요.
import { fixedRange, roughWon, type Assumption, type BridgeStep, type TornadoBar } from "./scenario.ts";
import { giftLimit, twistingTest } from "./kr-expert-guide-2026.ts";
import { driverLine } from "./kr-money-scenarios.ts";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const pct1 = (r: number) => `${(Math.round(r * 1000) / 10).toLocaleString("ko-KR")}%`;

// ───────────────────────── 1) 모집 준수 점검 ─────────────────────────

export interface SalesLite {
  /** 월 보험료 */
  monthly: number;
  /** 첫해 납입 개월 수(월납 12, 연납이면 12로 두고 monthly에 연보험료/12) */
  months: number;
  gift: number;
  replace: boolean;
  oldEnd: string;
  newApply: string;
  compared: boolean;
}

export function salesResult(i: SalesLite) {
  const firstYear = Math.max(0, i.monthly) * Math.max(1, Math.min(12, Math.round(i.months)));
  const limit = giftLimit(firstYear);
  const twist = i.replace && i.oldEnd && i.newApply ? twistingTest(i.oldEnd, i.newApply, i.compared) : null;
  return { firstYear, limit, headroom: limit - i.gift, over: i.gift > limit, capped: firstYear * 0.1 > 200_000, twist };
}
export const salesHeadroom = (i: SalesLite) => salesResult(i).headroom;

export const SALES_ASSUMPTIONS: Assumption<SalesLite>[] = [
  { key: "monthly", label: "월 보험료", plain: "월 보험료", unit: "won", kind: "fact", get: (i) => i.monthly, set: (i, v) => ({ ...i, monthly: Math.max(0, v) }), range: fixedRange(10_000, 400_000), marks: [{ at: 166_667, label: "한도 20만 원 도달" }] },
  { key: "gift", label: "사은품 가액", plain: "사은품 가액", unit: "won", kind: "assumption", get: (i) => i.gift, set: (i, v) => ({ ...i, gift: Math.max(0, v) }), range: fixedRange(0, 300_000), marks: [{ at: 200_000, label: "20만 원" }] },
];

export const giftCurve = (i: SalesLite) =>
  [30_000, 50_000, 100_000, 150_000, 200_000, 300_000].map((m) => ({ label: `월 ${(m / 10_000).toLocaleString("ko-KR")}만 원`, value: giftLimit(m * 12), current: Math.abs(m - i.monthly) < 1 }));

export function salesPlain(i: SalesLite, top?: TornadoBar) {
  const r = salesResult(i);
  const reasons = [
    `한도는 최초 1년 보험료 ${won(r.firstYear)}의 10%(${won(r.firstYear * 0.1)})와 20만 원 중 적은 금액이에요.${r.capped ? " 월 보험료가 약 16.7만 원을 넘으면 한도는 20만 원에서 멈춰요." : ""}`,
    r.twist ? r.twist.text : i.replace ? "기존 계약 소멸일과 새 청약일을 넣으면 승환 간주(1개월·6개월) 여부를 따져요." : "기존 보험을 깨고 갈아타는 계약이 아니면 승환 점검은 필요 없어요.",
    "금품 말고도 기초서류에 없는 보험료 할인, 보험료 대납, 대출 이자 대납은 금액과 상관없이 특별이익이에요.",
  ];
  return {
    headline: r.over ? `사은품 ${won(i.gift)}은 한도 ${won(r.limit)}보다 ${won(-r.headroom)} 많아요. 줄이지 않으면 특별이익 제공이에요.` : `사은품 한도는 ${won(r.limit)}이고, ${won(i.gift)}은 한도 안이에요(여유 ${won(r.headroom)}).`,
    driver: driverLine(top, "한도 여유"),
    reasons,
  };
}

// ───────────────────────── 2) 보험료 계산 원리 ─────────────────────────

export interface PremiumLite {
  sex: "m" | "f";
  age: number;
  term: number;
  sum: number;
  /** 예정이율 */
  rate: number;
  /** 영업보험료 중 사업비 비율 */
  expense: number;
  /** 위험률 배수(1 = 표준체) */
  risk: number;
}

/** 설명용 곰퍼츠 사망률. 40세 남성 약 0.12%, 나이 8살마다 약 2배, 여성은 남성의 55%. */
export function qx(age: number, sex: "m" | "f", risk = 1): number {
  const base = 0.0012 * Math.exp(0.087 * (age - 40));
  return Math.min(1, base * (sex === "f" ? 0.55 : 1) * risk);
}

/** 수지상등: 연납 영업보험료 G = 순보험료 P / (1 − 사업비율), P = Σ vᵗ⁺¹·ₜpₓ·qₓ₊ₜ·S / Σ vᵗ·ₜpₓ */
export function premiumResult(i: PremiumLite) {
  const n = Math.max(1, Math.min(40, Math.round(i.term)));
  const v = 1 / (1 + Math.max(-0.5, i.rate));
  let alive = 1;
  let benefit = 0;
  let annuity = 0;
  let deaths = 0;
  for (let t = 0; t < n; t++) {
    const q = qx(i.age + t, i.sex, i.risk);
    annuity += alive * v ** t;
    benefit += alive * q * v ** (t + 1) * i.sum;
    deaths += alive * q;
    alive *= 1 - q;
  }
  const net = annuity > 0 ? benefit / annuity : 0;
  // 이자가 없다면(예정이율 0) 같은 보장의 순보험료
  let a0 = 0;
  let b0 = 0;
  alive = 1;
  for (let t = 0; t < n; t++) {
    const q = qx(i.age + t, i.sex, i.risk);
    a0 += alive;
    b0 += alive * q * i.sum;
    alive *= 1 - q;
  }
  const noInterest = a0 > 0 ? b0 / a0 : 0;
  const gross = net / Math.max(0.05, 1 - Math.min(0.9, i.expense));
  return { n, net, noInterest, gross, monthly: gross / 12, loading: gross - net, interestEffect: noInterest - net, deathProb: deaths, q0: qx(i.age, i.sex, i.risk) };
}
export const grossOf = (i: PremiumLite) => premiumResult(i).gross;

export const PREMIUM_ASSUMPTIONS: Assumption<PremiumLite>[] = [
  { key: "age", label: "가입 나이", plain: "가입 나이", unit: "age", kind: "fact", get: (i) => i.age, set: (i, v) => ({ ...i, age: Math.min(75, Math.max(15, Math.round(v))) }), range: fixedRange(20, 65) },
  { key: "term", label: "보험기간", plain: "보험기간", unit: "years", kind: "fact", get: (i) => i.term, set: (i, v) => ({ ...i, term: Math.min(40, Math.max(1, Math.round(v))) }), range: fixedRange(5, 30) },
  { key: "sum", label: "사망보험금", plain: "사망보험금", unit: "won", kind: "fact", get: (i) => i.sum, set: (i, v) => ({ ...i, sum: Math.max(1_000_000, v) }), range: (a) => [a * 0.5, a * 2] },
  { key: "rate", label: "예정이율", plain: "예정이율", unit: "rate", kind: "assumption", get: (i) => i.rate, set: (i, v) => ({ ...i, rate: Math.min(0.08, Math.max(0, v)) }), range: fixedRange(0.01, 0.045) },
  { key: "expense", label: "사업비 비율", plain: "사업비 비율", unit: "pct", kind: "assumption", get: (i) => i.expense, set: (i, v) => ({ ...i, expense: Math.min(0.6, Math.max(0, v)) }), range: fixedRange(0.05, 0.35) },
  { key: "risk", label: "위험률 배수", plain: "위험률(건강 상태)", unit: "times", kind: "assumption", get: (i) => i.risk, set: (i, v) => ({ ...i, risk: Math.min(5, Math.max(0.3, Math.round(v * 100) / 100)) }), range: fixedRange(0.6, 2) },
];

export function premiumBridge(i: PremiumLite): BridgeStep[] {
  const r = premiumResult(i);
  return [
    { label: "이자 없을 때 위험보험료", value: r.noInterest, kind: "total" },
    { label: `예정이율 ${pct1(i.rate)} 할인`, value: -r.interestEffect, kind: "add" },
    { label: "순보험료", value: r.net, kind: "total" },
    { label: `사업비 ${pct1(i.expense)}`, value: r.loading, kind: "add" },
    { label: "영업보험료(연)", value: r.gross, kind: "total" },
  ];
}

export const rateCompare = (i: PremiumLite) =>
  [0.015, 0.02, 0.025, 0.03, 0.035].map((rate) => ({ label: `예정이율 ${pct1(rate)}`, value: premiumResult({ ...i, rate }).monthly, current: Math.abs(rate - i.rate) < 0.0001 }));

export function premiumPlain(i: PremiumLite, top?: TornadoBar) {
  const r = premiumResult(i);
  const down = premiumResult({ ...i, rate: Math.max(0, i.rate - 0.0025) }).gross / r.gross - 1;
  return {
    headline: `${i.age}세 ${i.sex === "m" ? "남성" : "여성"}이 ${r.n}년 동안 사망보험금 ${roughWon(i.sum)}을 보장받으려면 월 약 ${won(r.monthly)}(연 ${won(r.gross)})이에요.`,
    driver: driverLine(top, "연 보험료"),
    reasons: [
      `보험료는 세 덩어리예요. 사망 위험만큼 내는 위험보험료, 미리 받은 돈을 굴려 깎아 주는 예정이율 할인, 판매·관리에 쓰는 사업비(${pct1(i.expense)})예요.`,
      `${r.n}년 안에 사망할 확률은 약 ${pct1(r.deathProb)}이에요. 나이가 많을수록, 보험기간이 길수록 이 확률이 커져 보험료가 올라요.`,
      `예정이율이 0.25%p 내리면 보험료가 약 ${pct1(down)} 올라요. 금리가 내려갈 때 보험사가 보험료를 올리는 이유예요. 정기보험은 저축 부분이 작아 종신보험보다 덜 민감해요.`,
    ],
  };
}

export const premiumSteps = (i: PremiumLite) => {
  const r = premiumResult(i);
  return [
    `qₓ(${i.age}세) = ${(Math.round(r.q0 * 100_000) / 100).toLocaleString("ko-KR")}‰ (곰퍼츠 근사, 위험률 배수 ${i.risk} 반영)`,
    `순보험료 P = Σ vᵗ⁺¹·ₜpₓ·qₓ₊ₜ·S ÷ Σ vᵗ·ₜpₓ = ${won(r.net)} (v = 1/(1+${i.rate}))`,
    `영업보험료 G = P ÷ (1 − ${i.expense}) = ${won(r.gross)} / 월 ${won(r.monthly)}`,
  ];
};
