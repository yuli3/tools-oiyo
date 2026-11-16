// 3묶음(세계 공용 돈) 계산기의 가정 목록·쉬운 결과 문장 (2026-11-17). 한국어 페이지용이고 금액은 원 단위예요.
// 1차: 대출 상환, 주택담보대출, 복리, FIRE 조기 은퇴.
import { driverLine } from "./kr-money-scenarios.ts";
import { fixedRange, josa, roughWon, type Assumption, type BridgeStep, type TornadoBar } from "./scenario.ts";

const pct = (r: number) => `${(r * 100).toFixed(1).replace(/\.0$/, "")}%`;
const won = <I>(key: string, label: string, plain: string, get: (i: I) => number, set: (i: I, v: number) => I, range: (a: number) => [number, number], marks?: { at: number; label: string }[]): Assumption<I> => ({
  key, label, plain, unit: "won", kind: "assumption", get, set, range, ...(marks ? { marks } : {}),
});

// ───────────────────────── 대출 상환 방식 ─────────────────────────

export type RepayMethod = "annuity" | "principal" | "bullet";
export const REPAY_LABEL: Record<RepayMethod, string> = { annuity: "원리금균등", principal: "원금균등", bullet: "만기일시" };

/** 월 상환액(원리금균등) */
export function annuityPayment(amount: number, annualRate: number, months: number) {
  const n = Math.max(1, Math.round(months));
  const r = annualRate / 12;
  if (r === 0) return amount / n;
  return (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function repay(amount: number, annualRate: number, months: number, method: RepayMethod) {
  const P = Math.max(0, amount);
  const n = Math.max(1, Math.round(months));
  const r = Math.max(0, annualRate) / 12;
  if (method === "annuity") {
    const pay = annuityPayment(P, Math.max(0, annualRate), n);
    return { first: pay, last: pay, interest: pay * n - P, total: pay * n };
  }
  if (method === "principal") {
    const part = P / n;
    const interest = r * part * ((n * (n + 1)) / 2); // 남은 원금 합 × r
    return { first: part + P * r, last: part + part * r, interest, total: P + interest };
  }
  const interest = P * r * n;
  return { first: P * r, last: P * r + P, interest, total: P + interest };
}

export interface LoanLite {
  amount: number;
  rate: number;
  months: number;
  method: RepayMethod;
}

export const loanResult = (i: LoanLite) => repay(i.amount, i.rate, i.months, i.method);
export const loanInterest = (i: LoanLite) => loanResult(i).interest;

export const LOAN_ASSUMPTIONS: Assumption<LoanLite>[] = [
  won<LoanLite>("amount", "대출 원금", "빌리는 돈", (i) => i.amount, (i, v) => ({ ...i, amount: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 100_000_000)]),
  { key: "rate", label: "연 이자율", plain: "이자율", unit: "rate", kind: "assumption", get: (i) => i.rate, set: (i, v) => ({ ...i, rate: Math.max(0, v) }), range: fixedRange(0, 0.1) },
  { key: "months", label: "상환 기간", plain: "갚는 기간", unit: "months", kind: "assumption", get: (i) => i.months, set: (i, v) => ({ ...i, months: Math.max(1, Math.round(v)) }), range: fixedRange(12, 480), marks: [{ at: 120, label: "10년" }, { at: 360, label: "30년" }] },
];

export function loanCompare(i: LoanLite) {
  return (Object.keys(REPAY_LABEL) as RepayMethod[]).map((m) => ({ label: REPAY_LABEL[m], value: repay(i.amount, i.rate, i.months, m).interest, current: m === i.method }));
}

export function loanPlain(i: LoanLite, top?: TornadoBar) {
  const r = loanResult(i);
  const ann = repay(i.amount, i.rate, i.months, "annuity");
  const prin = repay(i.amount, i.rate, i.months, "principal");
  const years = (i.months / 12).toFixed(1).replace(/\.0$/, "");
  const head =
    i.method === "annuity"
      ? `${roughWon(i.amount)}을 연 ${pct(i.rate)}로 ${years}년 빌리면 매달 약 ${roughWon(r.first)}씩 갚고, 이자는 모두 약 ${roughWon(r.interest)}이에요.`
      : i.method === "principal"
        ? `${roughWon(i.amount)}을 연 ${pct(i.rate)}로 ${years}년 빌리면 첫 달 약 ${roughWon(r.first)}에서 마지막 달 약 ${roughWon(r.last)}로 줄고, 이자는 모두 약 ${roughWon(r.interest)}이에요.`
        : `${roughWon(i.amount)}을 연 ${pct(i.rate)}로 ${years}년 빌리면 매달 이자 약 ${roughWon(r.first)}만 내다가 만기에 원금을 한 번에 갚아요. 이자는 모두 약 ${roughWon(r.interest)}이에요.`;
  return {
    headline: head,
    driver: driverLine(top, "이자 합계"),
    reasons: [
      `원금균등은 원리금균등보다 이자가 약 ${roughWon(ann.interest - prin.interest)} 적어요. 대신 처음 몇 년은 매달 내는 돈이 더 많아요(첫 달 ${roughWon(prin.first)} vs ${roughWon(ann.first)}).`,
      "기간을 늘리면 매달 부담은 줄지만 이자 합계는 크게 늘어요. 여유가 생기면 중도상환으로 원금을 먼저 줄이는 게 이자를 아끼는 가장 쉬운 방법이에요.",
      "변동금리면 이자율이 바뀔 때마다 상환액이 다시 계산돼요. 위 이자율 카드를 움직여 금리가 오를 때를 미리 보세요.",
    ],
  };
}

// ───────────────────────── 주택담보대출 ─────────────────────────

export interface MortgageLite {
  price: number;
  down: number;
  rate: number;
  years: number;
}

export function mortgageResult(i: MortgageLite) {
  const loan = Math.max(0, i.price - i.down);
  const months = Math.max(1, Math.round(i.years * 12));
  const r = repay(loan, i.rate, months, "annuity");
  return { loan, monthly: r.first, interest: r.interest, total: r.total, ltv: i.price > 0 ? loan / i.price : 0, months };
}
export const mortgageMonthly = (i: MortgageLite) => mortgageResult(i).monthly;

export const MORTGAGE_ASSUMPTIONS: Assumption<MortgageLite>[] = [
  won<MortgageLite>("down", "자기자본(계약금·중도금 등)", "내 돈", (i) => i.down, (i, v) => ({ ...i, down: Math.min(i.price, Math.max(0, v)) }), (a) => [0, Math.max(a * 2, 300_000_000)]),
  won<MortgageLite>("price", "주택 가격", "집값", (i) => i.price, (i, v) => ({ ...i, price: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 1_000_000_000)]),
  { key: "rate", label: "연 이자율", plain: "이자율", unit: "rate", kind: "assumption", get: (i) => i.rate, set: (i, v) => ({ ...i, rate: Math.max(0, v) }), range: fixedRange(0.01, 0.08) },
  { key: "years", label: "만기", plain: "갚는 기간", unit: "years", kind: "assumption", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(1, Math.round(v)) }), range: fixedRange(5, 50), marks: [{ at: 30, label: "30년" }] },
];

export function mortgageTerms(i: MortgageLite) {
  return [10, 20, 30, 40].map((y) => ({ label: `${y}년`, value: mortgageResult({ ...i, years: y }).interest, current: y === Math.round(i.years) }));
}

export function mortgageBridge(i: MortgageLite): BridgeStep[] {
  const r = mortgageResult(i);
  return [
    { label: "집값", value: i.price, kind: "total" },
    { label: "내 돈", value: -Math.min(i.down, i.price), kind: "add" },
    { label: "대출", value: r.loan, kind: "total" },
    { label: "이자 합계", value: r.interest, kind: "add" },
    { label: "은행에 갚는 돈", value: r.total, kind: "total" },
  ];
}

export function mortgagePlain(i: MortgageLite, top?: TornadoBar) {
  const r = mortgageResult(i);
  const up = mortgageResult({ ...i, rate: i.rate + 0.01 });
  return {
    headline: `${roughWon(r.loan)}을 빌려 ${i.years}년 동안 매달 약 ${roughWon(r.monthly)}씩 갚아요. 이자는 모두 약 ${roughWon(r.interest)}이에요.`,
    driver: driverLine(top, "월 상환액"),
    reasons: [
      `집값의 ${Math.round(r.ltv * 100)}%를 빌리는 거예요(LTV). 은행 한도는 지역·주택 수에 따라 정해진 LTV와 연소득 대비 원리금 비율(DSR 40%) 중 작은 쪽이에요.`,
      `금리가 1%p 오르면 매달 약 ${roughWon(up.monthly - r.monthly)}, 전체 이자는 약 ${roughWon(up.interest - r.interest)} 늘어요.`,
      "원리금균등 기준이에요. 취득세·중개수수료·이사비는 따로 준비해야 해요.",
    ],
  };
}

// ───────────────────────── 복리 ─────────────────────────

export interface CompoundLite {
  principal: number;
  monthly: number;
  rate: number;
  years: number;
}

export function compoundResult(i: CompoundLite) {
  const n = Math.max(0, Math.round(i.years * 12));
  const r = i.rate / 12;
  const g = Math.pow(1 + r, n);
  const fromPrincipal = Math.max(0, i.principal) * g;
  const fromMonthly = r === 0 ? Math.max(0, i.monthly) * n : (Math.max(0, i.monthly) * (g - 1)) / r;
  const paid = Math.max(0, i.principal) + Math.max(0, i.monthly) * n;
  const fv = fromPrincipal + fromMonthly;
  return { fv, paid, gain: fv - paid, doubling: i.rate > 0 ? Math.log(2) / Math.log(1 + i.rate) : Infinity };
}
export const compoundFv = (i: CompoundLite) => compoundResult(i).fv;

export const COMPOUND_ASSUMPTIONS: Assumption<CompoundLite>[] = [
  { key: "rate", label: "연 수익률", plain: "수익률", unit: "rate", kind: "assumption", get: (i) => i.rate, set: (i, v) => ({ ...i, rate: v }), range: fixedRange(0, 0.15) },
  { key: "years", label: "투자 기간", plain: "기간", unit: "years", kind: "assumption", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(1, Math.round(v)) }), range: fixedRange(1, 50) },
  won<CompoundLite>("monthly", "매월 적립액", "매달 넣는 돈", (i) => i.monthly, (i, v) => ({ ...i, monthly: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 2_000_000)]),
  won<CompoundLite>("principal", "초기 투자금", "처음 넣는 돈", (i) => i.principal, (i, v) => ({ ...i, principal: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 50_000_000)]),
];

export function compoundBridge(i: CompoundLite): BridgeStep[] {
  const r = compoundResult(i);
  const n = Math.round(i.years * 12);
  return [
    { label: "처음 넣은 돈", value: Math.max(0, i.principal), kind: "add" },
    { label: "매달 넣은 돈 합계", value: Math.max(0, i.monthly) * n, kind: "add" },
    { label: "복리로 불어난 돈", value: r.gain, kind: "add" },
    { label: `${i.years}년 뒤`, value: r.fv, kind: "total" },
  ];
}

export function compoundPlain(i: CompoundLite, top?: TornadoBar) {
  const r = compoundResult(i);
  const late = compoundResult({ ...i, years: Math.max(1, i.years - 5) });
  return {
    headline: `${i.years}년 뒤 약 ${roughWon(r.fv)}이 돼요. 넣은 돈 ${roughWon(r.paid)}에 수익이 약 ${roughWon(r.gain)} 붙어요.`,
    driver: driverLine(top, "최종 금액"),
    reasons: [
      Number.isFinite(r.doubling) ? `연 ${pct(i.rate)}면 돈이 두 배가 되는 데 약 ${r.doubling.toFixed(1)}년 걸려요(72 ÷ 수익률 법칙과 비슷해요).` : "수익률이 0이면 넣은 돈 그대로예요.",
      i.years > 5 ? `5년 늦게 시작해 ${i.years - 5}년만 굴리면 약 ${roughWon(late.fv)}이라 ${roughWon(r.fv - late.fv)}이 차이 나요. 복리는 기간이 가장 큰 힘이에요.` : "기간이 길수록 수익이 수익을 낳아 곡선이 가팔라져요.",
      "세금(이자 15.4% 등)과 물가는 빼고 매달 복리로 계산했어요. ISA·연금 계좌를 쓰면 세금을 줄일 수 있어요.",
    ],
  };
}

// ───────────────────────── FIRE 조기 은퇴 ─────────────────────────

export interface FireLite {
  age: number;
  assets: number;
  monthlySave: number;
  ret: number;
  /** 은퇴 후 1년 생활비 */
  spending: number;
  /** 안전 인출률(4% 규칙) */
  withdraw: number;
}

export function fireResult(i: FireLite) {
  const target = i.withdraw > 0 ? i.spending / i.withdraw : Infinity;
  let cur = Math.max(0, i.assets);
  let years = 0;
  const save = Math.max(0, i.monthlySave) * 12;
  while (cur < target && years < 70) {
    cur = cur * (1 + i.ret) + save;
    years++;
  }
  const reached = cur >= target;
  return { target, years, fireAge: i.age + years, reached };
}
/** FIRE까지 걸리는 해(못 닿으면 70) */
export const fireYears = (i: FireLite) => fireResult(i).years;

export const FIRE_ASSUMPTIONS: Assumption<FireLite>[] = [
  won<FireLite>("monthlySave", "월 저축액", "매달 모으는 돈", (i) => i.monthlySave, (i, v) => ({ ...i, monthlySave: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 5_000_000)]),
  won<FireLite>("spending", "은퇴 후 연 생활비", "1년 생활비", (i) => i.spending, (i, v) => ({ ...i, spending: Math.max(1, v) }), (a) => [12_000_000, Math.max(a * 2, 60_000_000)]),
  { key: "ret", label: "연 실질 수익률", plain: "수익률", unit: "rate", kind: "assumption", get: (i) => i.ret, set: (i, v) => ({ ...i, ret: v }), range: fixedRange(0, 0.1) },
  { key: "withdraw", label: "안전 인출률", plain: "해마다 꺼내 쓰는 비율", unit: "rate", kind: "assumption", get: (i) => i.withdraw, set: (i, v) => ({ ...i, withdraw: Math.max(0.01, v) }), range: fixedRange(0.025, 0.06), marks: [{ at: 0.04, label: "4% 규칙" }] },
  won<FireLite>("assets", "현재 자산", "지금 모은 돈", (i) => i.assets, (i, v) => ({ ...i, assets: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 500_000_000)]),
];

export function firePlain(i: FireLite, top?: TornadoBar) {
  const r = fireResult(i);
  const more = fireResult({ ...i, monthlySave: i.monthlySave + 500_000 });
  return {
    headline: r.years === 0
      ? `이미 목표 ${roughWon(r.target)}을 넘었어요. 지금 생활비라면 은퇴해도 돼요.`
      : r.reached
        ? `${r.years}년 뒤 ${r.fireAge}세에 목표 자산 ${roughWon(r.target)}에 닿아요.`
        : `지금 조건으로는 70년 안에 목표 ${roughWon(r.target)}에 닿지 못해요. 저축이나 생활비를 바꿔 보세요.`,
    driver: top && top.span > 0 ? `결과를 가장 크게 움직이는 건 ${josa(top.plain, "이에요", "예요")}. 이 값이 20% 늘거나 줄면 ${Math.min(top.low, top.high)}년에서 ${Math.max(top.low, top.high)}년 사이로 바뀌어요.` : null,
    reasons: [
      `목표 자산은 1년 생활비 ${roughWon(i.spending)} ÷ 인출률 ${pct(i.withdraw)}예요. 4% 규칙이면 생활비의 25배예요.`,
      r.reached && more.reached ? `매달 50만 원을 더 모으면 ${r.years - more.years}년 빨라져요(${more.fireAge}세).` : "생활비를 줄이면 목표 자산과 걸리는 기간이 함께 줄어 효과가 두 배예요.",
      "수익률은 물가를 뺀 실질 수익률로 넣어요. 4% 규칙은 미국 주식·채권 30년 기준이라 더 오래 쉬려면 3~3.5%가 안전해요. 국민연금·건강보험료는 따로 보세요.",
    ],
  };
}

// ───────────────────────── 2차: 물가·ROI·임대 수익률·평단가 (2026-11-17) ─────────────────────────

export interface InflationLite {
  amount: number;
  rate: number;
  years: number;
}

export function inflationResult(i: InflationLite) {
  const g = Math.pow(1 + i.rate, Math.max(0, i.years));
  return { real: i.amount / g, needed: i.amount * g, loss: 1 - 1 / g, half: i.rate > 0 ? Math.log(2) / Math.log(1 + i.rate) : Infinity };
}
export const inflationReal = (i: InflationLite) => inflationResult(i).real;

export const INFLATION_ASSUMPTIONS: Assumption<InflationLite>[] = [
  { key: "rate", label: "연 물가상승률", plain: "물가 오름폭", unit: "rate", kind: "assumption", get: (i) => i.rate, set: (i, v) => ({ ...i, rate: v }), range: fixedRange(0, 0.1), marks: [{ at: 0.02, label: "한은 목표 2%" }] },
  { key: "years", label: "기간", plain: "기간", unit: "years", kind: "assumption", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(0, Math.round(v)) }), range: fixedRange(1, 50) },
  won<InflationLite>("amount", "금액", "지금 돈", (i) => i.amount, (i, v) => ({ ...i, amount: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 10_000_000)]),
];

export function inflationPlain(i: InflationLite, top?: TornadoBar) {
  const r = inflationResult(i);
  return {
    headline: `물가가 해마다 ${pct(i.rate)}씩 오르면 ${i.years}년 뒤 ${roughWon(i.amount)}은 지금 돈으로 약 ${roughWon(r.real)}어치예요. 같은 물건을 사려면 약 ${roughWon(r.needed)}이 필요해요.`,
    driver: driverLine(top, "그때 돈의 가치"),
    reasons: [
      `돈의 가치가 ${Math.round(r.loss * 100)}% 줄어요.${Number.isFinite(r.half) ? ` 이 속도면 약 ${r.half.toFixed(0)}년마다 돈의 가치가 반으로 줄어요.` : ""}`,
      "예금 이자가 물가보다 낮으면 통장에 둔 돈은 실제로 줄어드는 셈이에요. 이자율에서 물가를 뺀 값이 실질 금리예요.",
      "소비자물가는 평균이라 집값·교육비·외식비처럼 더 빨리 오르는 항목은 따로 생각해야 해요.",
    ],
  };
}

export interface RoiLite {
  cost: number;
  value: number;
  years: number;
}

export function roiResult(i: RoiLite) {
  const profit = i.value - i.cost;
  const roi = i.cost > 0 ? profit / i.cost : 0;
  const cagr = i.cost > 0 && i.value > 0 && i.years > 0 ? Math.pow(i.value / i.cost, 1 / i.years) - 1 : 0;
  return { profit, roi, cagr, multiple: i.cost > 0 ? i.value / i.cost : 0 };
}
export const roiProfit = (i: RoiLite) => roiResult(i).profit;

export const ROI_ASSUMPTIONS: Assumption<RoiLite>[] = [
  won<RoiLite>("value", "회수 금액(현재 가치)", "돌려받은 돈", (i) => i.value, (i, v) => ({ ...i, value: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 20_000_000)]),
  won<RoiLite>("cost", "투자 원금", "넣은 돈", (i) => i.cost, (i, v) => ({ ...i, cost: Math.max(1, v) }), (a) => [1, Math.max(a * 2, 20_000_000)]),
  { key: "years", label: "보유 기간", plain: "기간", unit: "years", kind: "fact", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(1, Math.round(v)) }), range: fixedRange(1, 30) },
];

export function roiPlain(i: RoiLite, top?: TornadoBar) {
  const r = roiResult(i);
  return {
    headline: `${roughWon(i.cost)}을 넣어 ${roughWon(i.value)}이 됐으니 수익률 ${pct(r.roi)}(${r.profit >= 0 ? "이익" : "손실"} ${roughWon(Math.abs(r.profit))})이에요.`,
    driver: driverLine(top, "손익"),
    reasons: [
      `${i.years}년 걸렸다면 1년 평균(연복리) ${pct(r.cagr)}예요. 기간이 다른 투자끼리는 이 연평균으로 비교해야 공정해요.`,
      `원금의 ${r.multiple.toFixed(2)}배가 됐어요. 같은 기간 예금(연 3%)이었다면 약 ${roughWon(i.cost * Math.pow(1.03, i.years))}이에요.`,
      "세금·수수료·물가를 빼기 전 수익률이에요. 중간에 받은 배당·이자가 있으면 회수 금액에 더해서 넣어요.",
    ],
  };
}

export interface RentalLite {
  price: number;
  deposit: number;
  rent: number;
  loan: number;
  loanRate: number;
  /** 공실 비율 */
  vacancy: number;
  /** 1년 비용(재산세·수선비·관리비 중 집주인 몫) */
  costs: number;
}

export function rentalResult(i: RentalLite) {
  const equity = i.price - i.deposit - i.loan;
  const rentYear = i.rent * 12 * (1 - Math.min(1, Math.max(0, i.vacancy)));
  const interest = Math.max(0, i.loan) * Math.max(0, i.loanRate);
  const net = rentYear - interest - Math.max(0, i.costs);
  const gross = i.price > 0 ? (i.rent * 12) / i.price : 0;
  return { equity, rentYear, interest, net, monthly: net / 12, gross, cashYield: equity > 0 ? net / equity : NaN };
}
export const rentalNet = (i: RentalLite) => rentalResult(i).net;

export const RENTAL_ASSUMPTIONS: Assumption<RentalLite>[] = [
  won<RentalLite>("rent", "월세", "월세", (i) => i.rent, (i, v) => ({ ...i, rent: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 3_000_000)]),
  { key: "loanRate", label: "대출 금리", plain: "대출 이자율", unit: "rate", kind: "assumption", get: (i) => i.loanRate, set: (i, v) => ({ ...i, loanRate: Math.max(0, v) }), range: fixedRange(0, 0.08) },
  { key: "vacancy", label: "공실률", plain: "비어 있는 기간", unit: "pct", kind: "assumption", get: (i) => i.vacancy, set: (i, v) => ({ ...i, vacancy: Math.min(1, Math.max(0, v)) }), range: fixedRange(0, 0.3) },
  won<RentalLite>("loan", "대출", "빌린 돈", (i) => i.loan, (i, v) => ({ ...i, loan: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 300_000_000)]),
  won<RentalLite>("costs", "연 보유 비용", "1년 비용", (i) => i.costs, (i, v) => ({ ...i, costs: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 5_000_000)]),
  won<RentalLite>("price", "매입가", "집값", (i) => i.price, (i, v) => ({ ...i, price: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 600_000_000)]),
];

export function rentalBridge(i: RentalLite): BridgeStep[] {
  const r = rentalResult(i);
  return [
    { label: "1년 월세(공실 반영)", value: r.rentYear, kind: "total" },
    { label: "대출 이자", value: -r.interest, kind: "add" },
    { label: "보유 비용", value: -Math.max(0, i.costs), kind: "add" },
    { label: "1년 순수익", value: r.net, kind: "total" },
  ];
}

export function rentalPlain(i: RentalLite, top?: TornadoBar) {
  const r = rentalResult(i);
  const breakEvenRate = i.loan > 0 ? (r.rentYear - Math.max(0, i.costs)) / i.loan : null;
  return {
    headline: Number.isFinite(r.cashYield)
      ? `내 돈 ${roughWon(r.equity)}을 넣고 1년에 약 ${roughWon(r.net)}(한 달 약 ${roughWon(r.monthly)})이 남아요. 내 돈 대비 수익률 ${pct(r.cashYield)}예요.`
      : `보증금과 대출로 집값을 다 채워 내 돈이 들지 않아요. 1년에 약 ${roughWon(r.net)}이 남아요.`,
    driver: driverLine(top, "1년 순수익"),
    reasons: [
      `집값 대비 월세 수익률(표면 수익률)은 ${pct(r.gross)}예요. 대출을 쓰면 대출 금리보다 이 수익률이 높을 때만 레버리지가 이득이에요.`,
      breakEvenRate !== null ? `대출 금리가 ${pct(Math.max(0, breakEvenRate))}를 넘으면 적자가 나요.` : "대출이 없어 금리 변화에 흔들리지 않아요.",
      "임대소득세·건강보험료, 취득세·중개수수료, 집값 오르내림은 빼고 1년 현금 흐름만 봤어요. 보증금은 돌려줄 돈이라 수익이 아니에요.",
    ],
  };
}

export interface AvgLite {
  price: number;
  qty: number;
  addPrice: number;
  addQty: number;
  /** 지금 시세(평가 손익 계산용) */
  market: number;
}

export function avgResult(i: AvgLite) {
  const q = Math.max(0, i.qty) + Math.max(0, i.addQty);
  const cost = i.price * Math.max(0, i.qty) + i.addPrice * Math.max(0, i.addQty);
  const avg = q > 0 ? cost / q : 0;
  const pl = (i.market - avg) * q;
  return { avg, qty: q, cost, pl, toEven: i.market > 0 ? avg / i.market - 1 : 0, drop: i.price > 0 ? 1 - avg / i.price : 0 };
}
export const avgPrice = (i: AvgLite) => avgResult(i).avg;

export const AVG_ASSUMPTIONS: Assumption<AvgLite>[] = [
  won<AvgLite>("addPrice", "추가 매수가", "새로 사는 값", (i) => i.addPrice, (i, v) => ({ ...i, addPrice: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 10_000)]),
  { key: "addQty", label: "추가 수량", plain: "새로 사는 주식 수", unit: "shares", kind: "assumption", get: (i) => i.addQty, set: (i, v) => ({ ...i, addQty: Math.max(0, Math.round(v)) }), range: (a) => [0, Math.max(a * 3, 100)] },
  { key: "qty", label: "보유 수량", plain: "가진 주식 수", unit: "shares", kind: "fact", get: (i) => i.qty, set: (i, v) => ({ ...i, qty: Math.max(0, Math.round(v)) }), range: (a) => [0, Math.max(a * 3, 100)] },
];

export function avgPlain(i: AvgLite, top?: TornadoBar) {
  const r = avgResult(i);
  return {
    headline: `평균 단가가 ${Math.round(i.price).toLocaleString("ko-KR")}원에서 ${Math.round(r.avg).toLocaleString("ko-KR")}원으로 ${r.drop >= 0 ? "내려가요" : "올라가요"}(${pct(Math.abs(r.drop))}).`,
    driver: driverLine(top, "평균 단가"),
    reasons: [
      i.market > 0 ? (r.toEven > 0 ? `지금 시세 ${Math.round(i.market).toLocaleString("ko-KR")}원에서 ${pct(r.toEven)} 오르면 본전이에요. 지금 평가손익은 ${roughWon(r.pl)}이에요.` : `지금 시세가 평균 단가보다 높아 평가이익 약 ${roughWon(r.pl)}이에요.`) : "지금 시세를 넣으면 본전까지 남은 상승률을 알려 줘요.",
      `총 ${r.qty.toLocaleString("ko-KR")}주, 들어간 돈 ${roughWon(r.cost)}이에요. 물타기는 손실 종목에 돈이 더 몰리는 거라 회사가 괜찮은지 먼저 확인하세요.`,
      "매매 수수료와 세금은 빼고 계산했어요.",
    ],
  };
}
