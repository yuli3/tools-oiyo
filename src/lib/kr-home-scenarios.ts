// 2묶음 3차(집·대출·ISA) 계산기의 가정 목록·다리 단계·쉬운 결과 문장 (2026-11-16).
// 계산은 각 엔진 파일이 하고, 여기는 "무엇을 바꿔 볼 수 있고 어떻게 설명할지"만 정해요.
import { compareIsaTax } from "./finance/isa-tax-comparison.ts";
import { computeStressDsrMortgage, type RateType } from "./finance/stress-dsr.ts";
import { housingCost, RENT_CREDIT_ANNUAL_CAP } from "./jeonse-cost.ts";
import { presaleSchedule, type InterestMode } from "./kr-presale-2026.ts";
import { acquisitionTax } from "./kr-real-estate-tax.ts";
import { driverLine } from "./kr-money-scenarios.ts";
import { fixedRange, josa, roughWon, type Assumption, type BridgeStep, type TornadoBar } from "./scenario.ts";

const money = <I>(key: string, label: string, plain: string, get: (i: I) => number, set: (i: I, v: number) => I, range: (a: number) => [number, number], marks?: { at: number; label: string }[]): Assumption<I> => ({
  key, label, plain, unit: "won", kind: "assumption", get, set, range, ...(marks ? { marks } : {}),
});
const rate = <I>(key: string, label: string, plain: string, get: (i: I) => number, set: (i: I, v: number) => I, min: number, max: number): Assumption<I> => ({
  key, label, plain, unit: "rate", kind: "assumption", get, set: (i, v) => set(i, Math.max(0, v)), range: fixedRange(min, max),
});
const pct = (r: number) => `${(r * 100).toFixed(1).replace(/\.0$/, "")}%`;

// ───────────────────────── 스트레스 DSR 주담대 한도 ─────────────────────────

export type DsrArea = "metro" | "regulated" | "other";

export interface DsrLite {
  income: number;
  housePrice: number;
  /** 다른 대출의 1년 원리금 */
  existing: number;
  /** 연 금리(0.04 = 4%) */
  rate: number;
  years: number;
  area: DsrArea;
  rateType: RateType;
  fixedYears: number;
}

export const dsrResult = (i: DsrLite) =>
  computeStressDsrMortgage({
    housePrice: Math.max(0, i.housePrice),
    annualIncome: Math.max(0, i.income),
    existingAnnualPayment: Math.max(0, i.existing),
    interestRate: Math.max(0, i.rate) * 100,
    maturityYears: Math.max(1, Math.round(i.years)),
    capitalArea: i.area !== "other",
    regulatedArea: i.area === "regulated",
    rateType: i.rateType,
    fixedYears: i.rateType === "variable" ? 0 : Math.max(0, i.fixedYears),
  });
export const dsrMaxLoan = (i: DsrLite) => dsrResult(i).finalMaxLoan;

export const DSR_ASSUMPTIONS: Assumption<DsrLite>[] = [
  money<DsrLite>("income", "연 소득", "연 소득", (i) => i.income, (i, v) => ({ ...i, income: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 100_000_000)]),
  money<DsrLite>("housePrice", "집값(시가)", "집값", (i) => i.housePrice, (i, v) => ({ ...i, housePrice: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 1_000_000_000)], [{ at: 1_500_000_000, label: "15억" }, { at: 2_500_000_000, label: "25억" }]),
  rate<DsrLite>("rate", "대출 금리", "대출 금리", (i) => i.rate, (i, v) => ({ ...i, rate: v }), 0.02, 0.07),
  { key: "years", label: "만기", plain: "만기", unit: "years", kind: "assumption", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(5, Math.round(v)) }), range: fixedRange(10, 50), marks: [{ at: 30, label: "30년" }] },
  money<DsrLite>("existing", "다른 대출 1년 원리금", "다른 대출 상환액", (i) => i.existing, (i, v) => ({ ...i, existing: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 20_000_000)]),
];

const BINDING = { ltv: "집값 대비 한도(LTV)", cap: "수도권·규제지역 대출 상한", dsr: "소득 대비 상환 한도(스트레스 DSR)" } as const;

export function dsrLimits(i: DsrLite) {
  const r = dsrResult(i);
  return [
    { label: `LTV ${r.ltvPercent}%`, value: r.ltvAmount, current: r.binding === "ltv" },
    ...(r.cap !== null ? [{ label: "대출 상한", value: r.cap, current: r.binding === "cap" }] : []),
    { label: "스트레스 DSR", value: r.stressedDsrPrincipal, current: r.binding === "dsr" },
    { label: "스트레스 없을 때 DSR", value: r.normalDsrPrincipal },
  ];
}

export function dsrPlain(i: DsrLite, top?: TornadoBar) {
  const r = dsrResult(i);
  return {
    headline: `최대 약 ${roughWon(r.finalMaxLoan)}까지 빌릴 수 있을 것 같아요. 매달 약 ${roughWon(r.finalMonthlyPayment)}씩 갚게 돼요.`,
    driver: driverLine(top, "대출 한도"),
    reasons: [
      `세 가지 한도 가운데 가장 작은 '${BINDING[r.binding]}'에 걸렸어요.`,
      r.stress.addon > 0
        ? `은행은 금리가 오를 때를 대비해 실제 금리 ${pct(i.rate)}에 ${r.stress.addon.toFixed(2)}%p를 더한 ${r.stressedRate.toFixed(2)}%로 상환액을 따져요(${r.stress.stage}). 그래서 소득 기준 한도가 약 ${roughWon(r.dsrReduction)} 줄었어요.`
        : "고정금리 기간이 길어 가산 금리(스트레스 금리)가 붙지 않았어요.",
      `은행권은 1년 원리금이 연 소득의 40%를 넘지 못해요. 이 대출을 다 받으면 DSR은 약 ${r.finalDsrPercent.toFixed(1)}%예요.`,
    ],
  };
}

// ───────────────────────── 전세 vs 월세 ─────────────────────────

export interface JeonseLite {
  jeonse: number;
  /** 전세 보증금 가운데 대출 비율(0~1) */
  loanRatio: number;
  loanRate: number;
  /** 내 돈을 예금에 넣었을 때 받을 이자율(기회비용) */
  savingsRate: number;
  rentDeposit: number;
  monthlyRent: number;
  /** 월세 세액공제율 0/0.15/0.17(요건 확인한 경우만) */
  creditRate: 0 | 0.15 | 0.17;
}

export const jeonseResult = (i: JeonseLite) =>
  housingCost({
    jeonse: Math.max(1, i.jeonse),
    rentDeposit: Math.max(0, i.rentDeposit),
    monthlyRent: Math.max(0, i.monthlyRent),
    loanRatio: Math.min(1, Math.max(0, i.loanRatio)),
    loanRate: Math.min(100, Math.max(0, i.loanRate * 100)),
    savingsRate: Math.min(100, Math.max(0, i.savingsRate * 100)),
    creditRate: i.creditRate,
    confirmed: i.creditRate > 0,
  });
/** 월세가 전세보다 한 달에 더 드는 돈(음수면 월세가 더 싸요) */
export const jeonseGap = (i: JeonseLite) => {
  const r = jeonseResult(i);
  return Math.round(r.rentCost - r.jeonseCost);
};

export const JEONSE_ASSUMPTIONS: Assumption<JeonseLite>[] = [
  money<JeonseLite>("jeonse", "전세 보증금", "전세 보증금", (i) => i.jeonse, (i, v) => ({ ...i, jeonse: Math.max(1, v) }), (a) => [0, Math.max(a * 2, 300_000_000)]),
  money<JeonseLite>("monthlyRent", "월세", "월세", (i) => i.monthlyRent, (i, v) => ({ ...i, monthlyRent: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 1_000_000)]),
  rate<JeonseLite>("loanRate", "전세대출 금리", "전세대출 금리", (i) => i.loanRate, (i, v) => ({ ...i, loanRate: v }), 0.015, 0.07),
  rate<JeonseLite>("savingsRate", "예금 이자율(기회비용)", "예금 이자율", (i) => i.savingsRate, (i, v) => ({ ...i, savingsRate: v }), 0, 0.06),
  { key: "loanRatio", label: "전세대출 비율", plain: "전세대출 비율", unit: "pct", kind: "assumption", get: (i) => i.loanRatio, set: (i, v) => ({ ...i, loanRatio: Math.min(1, Math.max(0, v)) }), range: fixedRange(0, 0.8), marks: [{ at: 0.8, label: "80%" }] },
];

/** 두 집의 한 달 비용이 같아지는 월세 */
export function jeonseBreakEvenRent(i: JeonseLite) {
  const r = jeonseResult(i);
  // 월세 1원이 늘면 세액공제가 creditRate원 늘어요. 다만 연 월세 1천만 원까지만 공제해요.
  const need = r.jeonseCost - r.rentEquityCost;
  const capMonthly = RENT_CREDIT_ANNUAL_CAP / 12;
  const even = need / (1 - i.creditRate);
  return Math.max(0, Math.round(even <= capMonthly ? even : need + capMonthly * i.creditRate));
}

export function jeonseCompare(i: JeonseLite) {
  const r = jeonseResult(i);
  return [
    { label: "전세 한 달 비용", value: Math.round(r.jeonseCost), current: r.jeonseCost <= r.rentCost },
    { label: "월세 한 달 비용", value: Math.round(r.rentCost), current: r.rentCost < r.jeonseCost },
  ];
}

export function jeonsePlain(i: JeonseLite, top?: TornadoBar) {
  const r = jeonseResult(i);
  const gap = Math.round(r.rentCost - r.jeonseCost);
  const even = jeonseBreakEvenRent(i);
  return {
    headline: gap >= 0
      ? `전세가 한 달에 약 ${roughWon(gap)}, 1년이면 약 ${roughWon(gap * 12)} 덜 들어요.`
      : `월세가 한 달에 약 ${roughWon(-gap)}, 1년이면 약 ${roughWon(-gap * 12)} 덜 들어요.`,
    driver: driverLine(top, "두 집의 한 달 비용 차이"),
    reasons: [
      `전세도 공짜가 아니에요. 대출 이자 ${roughWon(r.loanInterest)}에, 보증금으로 묶인 내 돈을 예금에 넣었으면 받았을 이자 ${josa(roughWon(r.equityCost), "을", "를")} 더하면 한 달 약 ${josa(roughWon(r.jeonseCost), "이", "가")} 들어요.`,
      `월세는 ${roughWon(i.monthlyRent)}에 보증금 이자 ${josa(roughWon(r.rentEquityCost), "을", "를")} ${r.credit > 0 ? `더하고 세액공제 ${josa(roughWon(r.credit), "을", "를")} 빼서` : "더해"} 약 ${josa(roughWon(r.rentCost), "이에요", "예요")}.`,
      `월세가 약 ${roughWon(even)}보다 낮으면 월세가, 높으면 전세가 유리해요. 전세는 보증금을 못 돌려받을 위험도 함께 따져야 해요.`,
    ],
  };
}

// ───────────────────────── ISA 절세 ─────────────────────────

export interface IsaLite {
  type: "normal" | "eligible";
  /** 계좌 안 과세 대상 수익(이자·배당·국내주식 외 매매익) */
  profit: number;
  /** 같은 계좌 안 손실 */
  loss: number;
}

export const isaResult = (i: IsaLite) => {
  const r = compareIsaTax({ type: i.type, taxableProfit: String(Math.max(0, Math.round(i.profit))), deductibleLoss: String(Math.max(0, Math.round(i.loss))) });
  if (!r.ok) throw new RangeError(r.error);
  return r;
};
export const isaSaved = (i: IsaLite) => isaResult(i).taxSaved;

export const ISA_ASSUMPTIONS: Assumption<IsaLite>[] = [
  money<IsaLite>("profit", "계좌 안 수익(만기까지)", "수익", (i) => i.profit, (i, v) => ({ ...i, profit: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 10_000_000)], [{ at: 2_000_000, label: "200만" }, { at: 4_000_000, label: "400만" }]),
  money<IsaLite>("loss", "계좌 안 손실", "손실", (i) => i.loss, (i, v) => ({ ...i, loss: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 3_000_000)]),
];

export function isaBridge(i: IsaLite): BridgeStep[] {
  const r = isaResult(i);
  const excessAtNormal = Math.round(r.taxableExcess * 0.154);
  return [
    { label: "일반 계좌 세금(15.4%)", value: r.normalAccountTax, kind: "total" },
    { label: "손실 상계·비과세 한도", value: -(r.normalAccountTax - excessAtNormal), kind: "add" },
    { label: "넘는 돈은 9.9%만", value: -(excessAtNormal - r.isaTax), kind: "add" },
    { label: "ISA 세금", value: r.isaTax, kind: "total" },
  ];
}

export function isaPlain(i: IsaLite, top?: TornadoBar) {
  const r = isaResult(i);
  return {
    headline: r.taxSaved > 0
      ? `ISA에 담으면 세금을 약 ${roughWon(r.taxSaved)} 아껴요(일반 계좌 ${roughWon(r.normalAccountTax)} → ISA ${roughWon(r.isaTax)}).`
      : "수익이 없어서 아낄 세금도 없어요.",
    driver: driverLine(top, "아끼는 세금"),
    reasons: [
      `${i.type === "eligible" ? "서민형·농어민형" : "일반형"}은 수익에서 손실을 뺀 뒤 ${roughWon(r.taxFreeLimit)}까지 세금이 없어요.`,
      r.taxableExcess > 0 ? `한도를 넘는 ${roughWon(r.taxableExcess)}에는 15.4% 대신 9.9%만 떼요(분리과세라 금융소득종합과세에도 안 들어가요).` : "모든 수익이 비과세 한도 안이에요.",
      `일반 계좌는 손실을 빼 주지 않아서 수익 전체 ${roughWon(i.profit)}에 세금이 붙어요. 의무 가입 3년을 채워야 이 혜택을 받아요.`,
    ],
  };
}

// ───────────────────────── 분양 대금 ─────────────────────────

export interface PresaleLite {
  price: number;
  depositRate: number;
  midRate: number;
  midCount: number;
  months: number;
  loanShare: number;
  loanRate: number;
  interestMode: InterestMode;
  options: number;
  over85: boolean;
}

export const presaleResult = (i: PresaleLite) => {
  const midCount = Math.min(12, Math.max(0, Math.round(i.midCount)));
  return presaleSchedule({
    ...i,
    price: Math.max(0, i.price),
    options: Math.max(0, i.options),
    loanRate: Math.max(0, i.loanRate),
    loanShare: Math.min(1, Math.max(0, i.loanShare)),
    midCount,
    months: Math.max(midCount + 1, Math.round(i.months)),
  });
};
/** 대출을 빼고 내 돈으로 내야 하는 돈(입주 전 + 입주 때) */
export const presaleCash = (i: PresaleLite) => {
  const r = presaleResult(i);
  return r.cashBeforeMoveIn + r.moveIn;
};

export const PRESALE_ASSUMPTIONS: Assumption<PresaleLite>[] = [
  money<PresaleLite>("price", "분양가", "분양가", (i) => i.price, (i, v) => ({ ...i, price: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 500_000_000)]),
  money<PresaleLite>("options", "발코니 확장·옵션", "옵션 비용", (i) => i.options, (i, v) => ({ ...i, options: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 30_000_000)]),
  { key: "loanShare", label: "중도금 대출 비율", plain: "중도금 대출 비율", unit: "pct", kind: "assumption", get: (i) => i.loanShare, set: (i, v) => ({ ...i, loanShare: Math.min(1, Math.max(0, v)) }), range: fixedRange(0, 1) },
  rate<PresaleLite>("loanRate", "중도금 대출 금리", "중도금 대출 금리", (i) => i.loanRate, (i, v) => ({ ...i, loanRate: v }), 0.02, 0.07),
];

export function presaleBridge(i: PresaleLite): BridgeStep[] {
  const r = presaleResult(i);
  return [
    { label: "분양가", value: Math.max(0, i.price), kind: "total" },
    { label: "중도금 대출(입주 때 갚아요)", value: -r.loanTotal, kind: "add" },
    { label: "옵션", value: Math.max(0, i.options), kind: "add" },
    { label: i.interestMode === "free" ? "중도금 이자 없음" : "중도금 이자", value: r.interestTotal, kind: "add" },
    { label: "취득세", value: r.acquisition, kind: "add" },
    { label: "내 돈으로 내는 돈", value: r.cashBeforeMoveIn + r.moveIn, kind: "total" },
  ];
}

const MODE = { free: "무이자", deferred: "이자 후불제", self: "유이자" } as const;

export function presalePlain(i: PresaleLite, top?: TornadoBar) {
  const r = presaleResult(i);
  return {
    headline: `대출을 빼고 내 돈으로 약 ${josa(roughWon(r.cashBeforeMoveIn + r.moveIn), "이", "가")} 필요해요. 그중 입주 전에 약 ${roughWon(r.cashBeforeMoveIn)}, 입주 때 약 ${josa(roughWon(r.moveIn), "을", "를")} 내요.`,
    driver: driverLine(top, "내 돈으로 내는 돈"),
    reasons: [
      `계약금 ${pct(i.depositRate)}(${roughWon(r.deposit)})는 계약할 때 바로 내요.`,
      `중도금 ${roughWon(r.midTotal)} 가운데 ${josa(roughWon(r.loanTotal), "은", "는")} 집단대출로 내요. ${josa(MODE[i.interestMode], "이라", "라")} ${i.interestMode === "free" ? "이자는 시행사가 내요." : `이자 약 ${josa(roughWon(r.interestTotal), "을", "를")} ${i.interestMode === "deferred" ? "입주 때 한 번에" : "매달"} 내요.`}`,
      `입주 때는 잔금·옵션·취득세 말고도 중도금 대출 ${josa(roughWon(r.loanToRefinance), "을", "를")} 갚거나 잔금대출로 바꿔야 해요.`,
    ],
  };
}

// ───────────────────────── 전세 vs 매매 ─────────────────────────
// 보유 기간 동안 실제로 사라지는 돈만 비교해요. 집값(원금)이나 보증금은 돌아오는 돈이라 비용이 아니에요.
// 매매 = 대출 이자 + 내 돈(계약금·취득세)의 기회비용 + 취득세 + 보유세 등 − 집값 상승분
// 전세 = 보증금의 기회비용(전세대출이 있으면 그 이자)

export interface BuyLite {
  price: number;
  jeonse: number;
  /** 매매 때 대출 비율(LTV) */
  ltv: number;
  mortgageRate: number;
  /** 예금 이자율(기회비용) */
  savingsRate: number;
  /** 연 집값 상승률(음수 가능) */
  growth: number;
  years: number;
  /** 연 보유 비용(재산세·종부세·수선비 등)을 집값 대비 비율로 */
  holding: number;
  over85: boolean;
}

export function buyResult(i: BuyLite) {
  const years = Math.max(1, Math.round(i.years));
  const price = Math.max(0, i.price);
  const loan = price * Math.min(1, Math.max(0, i.ltv));
  const acq = acquisitionTax({ price, houses: 1, regulated: false, temporaryTwo: false, over85: i.over85 }).total;
  const equity = price - loan + acq;
  const interest = Math.round(loan * i.mortgageRate * years);
  const equityCost = Math.round(equity * i.savingsRate * years);
  const holdingCost = Math.round(price * i.holding * years);
  const appreciation = Math.round(price * ((1 + i.growth) ** years - 1));
  const buyCost = interest + equityCost + acq + holdingCost - appreciation;
  const jeonseCost = Math.round(Math.max(0, i.jeonse) * i.savingsRate * years);
  return { years, loan, equity, acq, interest, equityCost, holdingCost, appreciation, buyCost, jeonseCost };
}
/** 전세가 매매보다 보유 기간 동안 더 드는 돈(양수면 매매가 유리해요) */
export const buyAdvantage = (i: BuyLite) => {
  const r = buyResult(i);
  return r.jeonseCost - r.buyCost;
};

export const BUY_ASSUMPTIONS: Assumption<BuyLite>[] = [
  { key: "growth", label: "연 집값 상승률", plain: "집값 상승률", unit: "rate", kind: "assumption", get: (i) => i.growth, set: (i, v) => ({ ...i, growth: v }), range: fixedRange(-0.05, 0.08), marks: [{ at: 0, label: "그대로" }] },
  money<BuyLite>("price", "집값", "집값", (i) => i.price, (i, v) => ({ ...i, price: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 1_000_000_000)]),
  money<BuyLite>("jeonse", "전세 보증금", "전세 보증금", (i) => i.jeonse, (i, v) => ({ ...i, jeonse: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 600_000_000)]),
  rate<BuyLite>("mortgageRate", "주담대 금리", "주담대 금리", (i) => i.mortgageRate, (i, v) => ({ ...i, mortgageRate: v }), 0.02, 0.07),
  rate<BuyLite>("savingsRate", "예금 이자율(기회비용)", "예금 이자율", (i) => i.savingsRate, (i, v) => ({ ...i, savingsRate: v }), 0, 0.06),
  { key: "years", label: "살 기간", plain: "살 기간", unit: "years", kind: "assumption", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(1, Math.round(v)) }), range: fixedRange(1, 20) },
];

/** 두 선택이 같아지는 연 집값 상승률(이분법) */
export function buyBreakEvenGrowth(i: BuyLite): number | null {
  let lo = -0.2, hi = 0.3;
  const f = (g: number) => buyAdvantage({ ...i, growth: g });
  if (f(lo) > 0 || f(hi) < 0) return null;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

export function buyBridge(i: BuyLite): BridgeStep[] {
  const r = buyResult(i);
  return [
    { label: "대출 이자", value: r.interest, kind: "add" },
    { label: "내 돈 기회비용", value: r.equityCost, kind: "add" },
    { label: "취득세", value: r.acq, kind: "add" },
    { label: "보유세·수선비", value: r.holdingCost, kind: "add" },
    { label: r.appreciation >= 0 ? "집값 상승" : "집값 하락", value: -r.appreciation, kind: "add" },
    { label: "매매 실제 비용", value: r.buyCost, kind: "total" },
  ];
}

export function buyPlain(i: BuyLite, top?: TornadoBar) {
  const r = buyResult(i);
  const adv = r.jeonseCost - r.buyCost;
  const even = buyBreakEvenGrowth(i);
  return {
    headline: adv >= 0
      ? `${r.years}년 산다면 매매가 약 ${roughWon(adv)} 덜 들어요.`
      : `${r.years}년 산다면 전세가 약 ${roughWon(-adv)} 덜 들어요.`,
    driver: driverLine(top, "두 선택의 차이"),
    reasons: [
      `전세는 보증금 ${roughWon(i.jeonse)}을 예금에 넣었으면 받았을 이자 약 ${josa(roughWon(r.jeonseCost), "이", "가")} 비용이에요.`,
      `매매는 이자·기회비용·취득세·보유세로 약 ${roughWon(r.interest + r.equityCost + r.acq + r.holdingCost)}이 들고, 집값이 연 ${pct(i.growth)} 움직이면 ${roughWon(Math.abs(r.appreciation))}${r.appreciation >= 0 ? "을 돌려받아요" : "을 더 잃어요"}.`,
      even !== null ? `집값이 1년에 약 ${pct(even)}보다 더 오르면 매매가, 덜 오르면 전세가 유리해요.` : "집값 상승률을 어떻게 잡아도 결과가 뒤집히지 않아요.",
    ],
  };
}

// ───────────────────────── 전월세 전환 ─────────────────────────

export interface ConvertLite {
  jeonse: number;
  deposit: number;
  /** 적용 전환율(연) */
  rate: number;
  /** 한국은행 기준금리(법정 상한 계산용) */
  baseRate: number;
}

/** 주택임대차보호법 시행령 제9조: 연 10%와 기준금리 + 2%p 중 낮은 값 */
export const legalConversionCap = (baseRate: number) => Math.min(0.1, Math.max(0, baseRate) + 0.02);
export const convertRent = (i: ConvertLite) => Math.max(0, Math.round(((Math.max(0, i.jeonse) - Math.max(0, i.deposit)) * Math.max(0, i.rate)) / 12));

export const CONVERT_ASSUMPTIONS: Assumption<ConvertLite>[] = [
  money<ConvertLite>("jeonse", "지금 전세금", "전세금", (i) => i.jeonse, (i, v) => ({ ...i, jeonse: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 300_000_000)]),
  money<ConvertLite>("deposit", "바꾼 뒤 보증금", "남길 보증금", (i) => i.deposit, (i, v) => ({ ...i, deposit: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 100_000_000)]),
  rate<ConvertLite>("rate", "전환율", "전환율", (i) => i.rate, (i, v) => ({ ...i, rate: v }), 0.02, 0.1),
];

export function convertPlain(i: ConvertLite, top?: TornadoBar) {
  const rent = convertRent(i);
  const cap = legalConversionCap(i.baseRate);
  const capRent = convertRent({ ...i, rate: cap });
  return {
    headline: `보증금을 ${roughWon(i.deposit)}으로 낮추면 월세는 약 ${josa(roughWon(rent), "이에요", "예요")}.`,
    driver: driverLine(top, "월세"),
    reasons: [
      `줄어든 보증금 ${roughWon(Math.max(0, i.jeonse - i.deposit))}에 전환율 ${pct(i.rate)}를 곱해 12로 나눴어요.`,
      i.rate > cap + 1e-9
        ? `계약 기간 중 전환이면 법정 상한 ${pct(cap)}(기준금리 + 2%p)를 넘을 수 없어요. 상한으로 계산하면 월 ${roughWon(capRent)}이에요.`
        : `법정 상한 ${pct(cap)}(기준금리 ${pct(i.baseRate)} + 2%p) 안이에요. 상한으로 계산하면 월 ${roughWon(capRent)}까지 올라갈 수 있어요.`,
      "새 계약(재계약 아닌 신규)에는 상한이 없어요. 동네 시세 전환율과도 비교해 보세요.",
    ],
  };
}
