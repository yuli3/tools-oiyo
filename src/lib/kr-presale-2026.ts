// 분양·건축 묶음 1 (2026-11-02, CHOSEUN "진행"). 아파트 분양 대금 일정과 건폐율·용적률. 한국 제도라 ko 전용.
import { acquisitionTax } from "./kr-real-estate-tax.ts";

export const PRESALE_AS_OF = "2026-11-02";

/* ---------- 분양 대금 일정 ---------- */

export type InterestMode = "free" | "deferred" | "self";

export interface PresaleInput {
  /** 분양가(옵션 제외) */
  price: number;
  /** 계약금 비율, 보통 0.1 또는 0.2 */
  depositRate: number;
  /** 중도금 비율, 보통 0.6 */
  midRate: number;
  /** 중도금 회차 */
  midCount: number;
  /** 계약부터 입주(잔금)까지 개월 */
  months: number;
  /** 중도금 가운데 집단대출로 내는 비율(0~1) */
  loanShare: number;
  /** 중도금 대출 연 금리 */
  loanRate: number;
  /** free: 무이자(시행사 부담), deferred: 이자후불제(입주 때 한 번에), self: 유이자(매달 본인 부담) */
  interestMode: InterestMode;
  /** 발코니 확장·유상 옵션(잔금 때 낸다고 가정) */
  options: number;
  /** 전용 85㎡ 초과 */
  over85: boolean;
}

export interface PresaleRow {
  label: string;
  month: number;
  amount: number;
  /** 이번 회차에서 본인 현금으로 내는 돈 */
  cash: number;
  /** 이번 회차에서 대출로 내는 돈 */
  loan: number;
  /** 이 대출분이 입주까지 붙는 이자 */
  interest: number;
}

export interface PresaleResult {
  rows: PresaleRow[];
  deposit: number;
  midTotal: number;
  balance: number;
  loanTotal: number;
  interestTotal: number;
  /** 입주 전까지 본인이 현금으로 내는 돈(계약금 + 중도금 자납분 + 유이자일 때 이자) */
  cashBeforeMoveIn: number;
  acquisition: number;
  /** 입주 때 필요한 돈(잔금 + 옵션 + 후불 이자 + 취득세, 중도금 대출 상환은 별도) */
  moveIn: number;
  /** 입주 때 중도금 대출을 갚거나 잔금대출로 바꿔야 하는 금액 */
  loanToRefinance: number;
  /** 분양가 + 옵션 + 이자(본인 부담분) + 취득세 */
  totalCost: number;
}

const won = (n: number) => Math.round(n);

export function presaleSchedule(i: PresaleInput): PresaleResult {
  const nums = { price: i.price, months: i.months, loanRate: i.loanRate, options: i.options };
  for (const [k, v] of Object.entries(nums)) if (!Number.isFinite(v) || v < 0) throw new RangeError(k);
  if (!(i.depositRate >= 0 && i.midRate >= 0 && i.depositRate + i.midRate <= 1)) throw new RangeError("rates");
  if (!(Number.isInteger(i.midCount) && i.midCount >= 0 && i.midCount <= 12)) throw new RangeError("midCount");
  if (!(i.loanShare >= 0 && i.loanShare <= 1)) throw new RangeError("loanShare");
  if (i.months < i.midCount + 1) throw new RangeError("months");

  const deposit = won(i.price * i.depositRate);
  const midTotal = won(i.price * i.midRate);
  const balance = i.price - deposit - midTotal;
  const rows: PresaleRow[] = [{ label: "계약금", month: 0, amount: deposit, cash: deposit, loan: 0, interest: 0 }];

  let allocated = 0;
  for (let n = 1; n <= i.midCount; n++) {
    const amount = n === i.midCount ? midTotal - allocated : Math.floor(midTotal / i.midCount);
    allocated += amount;
    // 중도금은 계약과 입주 사이에 고르게 나눠 낸다고 가정해요.
    const month = Math.round((i.months * n) / (i.midCount + 1));
    const loan = won(amount * i.loanShare);
    const interest = won((loan * i.loanRate * (i.months - month)) / 12);
    rows.push({ label: `중도금 ${n}회`, month, amount, cash: amount - loan, loan, interest });
  }

  const loanTotal = rows.reduce((s, r) => s + r.loan, 0);
  const accrued = rows.reduce((s, r) => s + r.interest, 0);
  const interestTotal = i.interestMode === "free" ? 0 : accrued;
  const acq = acquisitionTax({ price: i.price + i.options, houses: 1, regulated: false, temporaryTwo: false, over85: i.over85 }).total;
  const deferred = i.interestMode === "deferred" ? interestTotal : 0;
  const selfPaid = i.interestMode === "self" ? interestTotal : 0;
  rows.push({ label: "잔금", month: i.months, amount: balance, cash: balance, loan: 0, interest: 0 });

  const cashBeforeMoveIn = rows.filter((r) => r.label !== "잔금").reduce((s, r) => s + r.cash, 0) + selfPaid;
  const moveIn = balance + i.options + deferred + acq;
  return {
    rows,
    deposit,
    midTotal,
    balance,
    loanTotal,
    interestTotal,
    cashBeforeMoveIn,
    acquisition: acq,
    moveIn,
    loanToRefinance: loanTotal,
    totalCost: i.price + i.options + interestTotal + acq,
  };
}

/* ---------- 건폐율·용적률 ---------- */

export interface Zone {
  id: string;
  label: string;
  group: "주거" | "상업" | "공업" | "녹지" | "관리·농림·보전";
  /** 국토계획법 시행령 제84조 건폐율 상한(%) */
  coverage: number;
  /** 국토계획법 시행령 제85조 용적률 범위(%) */
  farMin: number;
  farMax: number;
}

/**
 * 국토의 계획 및 이용에 관한 법률 시행령 제84조(건폐율)·제85조(용적률)의 용도지역별 범위.
 * 실제로 적용하는 값은 이 범위 안에서 시·군 도시·군계획조례가 정해요(예: 서울은 대부분 법정 상한보다 낮아요).
 */
export const ZONES: readonly Zone[] = [
  { id: "r1x", label: "제1종 전용주거", group: "주거", coverage: 50, farMin: 50, farMax: 100 },
  { id: "r2x", label: "제2종 전용주거", group: "주거", coverage: 50, farMin: 50, farMax: 150 },
  { id: "r1", label: "제1종 일반주거", group: "주거", coverage: 60, farMin: 100, farMax: 200 },
  { id: "r2", label: "제2종 일반주거", group: "주거", coverage: 60, farMin: 100, farMax: 250 },
  { id: "r3", label: "제3종 일반주거", group: "주거", coverage: 50, farMin: 100, farMax: 300 },
  { id: "rq", label: "준주거", group: "주거", coverage: 70, farMin: 200, farMax: 500 },
  { id: "cc", label: "중심상업", group: "상업", coverage: 90, farMin: 200, farMax: 1500 },
  { id: "cg", label: "일반상업", group: "상업", coverage: 80, farMin: 200, farMax: 1300 },
  { id: "cn", label: "근린상업", group: "상업", coverage: 70, farMin: 200, farMax: 900 },
  { id: "cd", label: "유통상업", group: "상업", coverage: 80, farMin: 200, farMax: 1100 },
  { id: "ix", label: "전용공업", group: "공업", coverage: 70, farMin: 150, farMax: 300 },
  { id: "ig", label: "일반공업", group: "공업", coverage: 70, farMin: 150, farMax: 350 },
  { id: "iq", label: "준공업", group: "공업", coverage: 70, farMin: 150, farMax: 400 },
  { id: "gp", label: "보전녹지", group: "녹지", coverage: 20, farMin: 50, farMax: 80 },
  { id: "gf", label: "생산녹지", group: "녹지", coverage: 20, farMin: 50, farMax: 100 },
  { id: "gn", label: "자연녹지", group: "녹지", coverage: 20, farMin: 50, farMax: 100 },
  { id: "mp", label: "보전관리", group: "관리·농림·보전", coverage: 20, farMin: 50, farMax: 80 },
  { id: "mf", label: "생산관리", group: "관리·농림·보전", coverage: 20, farMin: 50, farMax: 80 },
  { id: "mc", label: "계획관리", group: "관리·농림·보전", coverage: 40, farMin: 50, farMax: 100 },
  { id: "ag", label: "농림", group: "관리·농림·보전", coverage: 20, farMin: 50, farMax: 80 },
  { id: "ne", label: "자연환경보전", group: "관리·농림·보전", coverage: 20, farMin: 50, farMax: 80 },
];

export interface DensityInput {
  /** 대지면적(㎡) */
  site: number;
  /** 건축면적(㎡): 건물을 위에서 본 수평투영면적 */
  footprint: number;
  /** 용적률 산정 연면적(㎡): 지상층 바닥면적 합계, 지하층·지상 주차장 등 제외 */
  floorArea: number;
  /** 적용 건폐율 상한(%) — 조례 값을 알면 그 값 */
  coverageLimit: number;
  /** 적용 용적률 상한(%) — 조례 값을 알면 그 값 */
  farLimit: number;
}

export function density(i: DensityInput) {
  for (const [k, v] of Object.entries(i)) if (!Number.isFinite(v) || v < 0) throw new RangeError(k);
  if (i.site === 0) throw new RangeError("site");
  const coverage = (i.footprint / i.site) * 100;
  const far = (i.floorArea / i.site) * 100;
  const maxFootprint = (i.site * i.coverageLimit) / 100;
  const maxFloorArea = (i.site * i.farLimit) / 100;
  return {
    coverage,
    far,
    maxFootprint,
    maxFloorArea,
    coverageOk: coverage <= i.coverageLimit + 1e-9,
    farOk: far <= i.farLimit + 1e-9,
    /** 최대 건축면적으로 지었을 때 몇 층까지 올릴 수 있나(층마다 같은 면적일 때) */
    floorsAtMaxFootprint: maxFootprint > 0 ? Math.floor(maxFloorArea / maxFootprint + 1e-9) : 0,
  };
}

export const PYEONG = 3.305785;
export const toPyeong = (m2: number) => m2 / PYEONG;
