// 2묶음 4차(실업급여·저축 비교) 계산기의 가정 목록·쉬운 결과 문장 (2026-11-16).
// 요율은 kr-rates-2026.mjs, 이자는 kr-deposit.ts, ISA 세금은 isa-tax-comparison.ts에서 가져와요.
import { compareIsaTax } from "./finance/isa-tax-comparison.ts";
import { depositInterest } from "./kr-deposit.ts";
import { driverLine } from "./kr-money-scenarios.ts";
import { KR_RATES_2026, unemploymentDailyBenefit2026, unemploymentDays2026 } from "./kr-rates-2026.mjs";
import { fixedRange, roughWon, type Assumption, type TornadoBar } from "./scenario.ts";

const exact = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const pct = (r: number) => `${(r * 100).toFixed(1).replace(/\.0$/, "")}%`;

// ───────────────────────── 실업급여(구직급여) ─────────────────────────

export type PeriodCode = "p1" | "p2" | "p3" | "p4" | "p5";
export interface JoblessLite {
  /** 퇴직 전 3개월 월평균 임금(세전) */
  wage: number;
  hours: number;
  age: "under" | "over";
  period: PeriodCode;
}

export function joblessResult(i: JoblessLite) {
  const d = unemploymentDailyBenefit2026({ monthlyWage: Math.max(0, i.wage), hoursPerDay: i.hours });
  const days = unemploymentDays2026(i.age, i.period) as number;
  return { ...d, days, total: d.dailyBenefit * days, monthly: d.dailyBenefit * 30 };
}
export const joblessTotal = (i: JoblessLite) => joblessResult(i).total;

/** 하한·상한이 걸리기 시작하는 월급(그래프 점선) */
export function joblessMarks(i: JoblessLite) {
  const U = KR_RATES_2026.unemployment;
  const floor = joblessResult(i).minDailyFloor;
  return [
    { at: Math.ceil((floor / U.replacementRate) * 30), label: "하한" },
    { at: Math.ceil((U.dailyCap / U.replacementRate) * 30), label: "상한" },
  ];
}

export const JOBLESS_ASSUMPTIONS: Assumption<JoblessLite>[] = [
  { key: "wage", label: "퇴직 전 월평균 임금", plain: "월급", unit: "won", kind: "assumption", get: (i) => i.wage, set: (i, v) => ({ ...i, wage: Math.max(0, v) }), range: (a) => [0, Math.max(a * 2, 5_000_000)] },
  { key: "hours", label: "1일 소정근로시간", plain: "하루 근무시간", unit: "hours", kind: "assumption", get: (i) => i.hours, set: (i, v) => ({ ...i, hours: Math.min(8, Math.max(1, Math.round(v))) }), range: fixedRange(1, 8) },
];

const PERIOD_TEXT: Record<PeriodCode, string> = { p1: "1년 미만", p2: "1~3년", p3: "3~5년", p4: "5~10년", p5: "10년 이상" };

export function joblessPlain(i: JoblessLite, top?: TornadoBar) {
  const r = joblessResult(i);
  return {
    headline: `하루 ${exact(r.dailyBenefit)}씩 ${r.days}일, 모두 약 ${roughWon(r.total)}을 받을 것 같아요(한 달 약 ${roughWon(r.monthly)}).`,
    driver: driverLine(top, "받는 총액"),
    reasons: [
      r.limitType === "floor_applied"
        ? `월급의 60%가 하한보다 적어서 하한 ${exact(r.minDailyFloor)}(최저임금 80% × ${r.hours}시간)을 받아요. 그래서 월급이 조금 달라도 금액이 같아요.`
        : r.limitType === "cap_applied"
          ? `월급의 60%가 상한을 넘어서 상한 ${exact(r.maxDailyCap)}만 받아요. 월급이 더 높아도 늘지 않아요.`
          : `퇴직 전 3개월 하루 평균 임금 ${roughWon(Math.round(r.baseDailyWage))}의 60%를 받아요.`,
      `받는 날수는 나이(${i.age === "over" ? "50세 이상·장애인" : "50세 미만"})와 고용보험 가입 기간(${PERIOD_TEXT[i.period]})으로 정해져요. 기간이 길수록 최대 ${i.age === "over" ? 270 : 240}일까지 늘어요.`,
      "자진 퇴사는 원칙적으로 못 받고, 퇴사 전 18개월 동안 보험 가입 180일 이상이어야 해요. 세금은 없어요.",
    ],
  };
}

// ───────────────────────── 저축 상품 비교 ─────────────────────────

export interface SaveLite {
  monthly: number;
  years: number;
  depositRate: number;
  savingsRate: number;
  isaRate: number;
  parkingRate: number;
}

const TAX = 0.154;
export function saveResult(i: SaveLite) {
  const months = Math.max(1, Math.round(i.years * 12));
  const amount = Math.max(1, i.monthly);
  const zero = { principal: amount * months, interest: 0, tax: 0, afterTaxInterest: 0, total: amount * months };
  const run = (kind: "deposit" | "savings", a: number, r: number, taxRate: number) => depositInterest({ kind, amount: a, annualRate: Math.max(0, r), months, compound: false, taxRate }) ?? zero;
  const deposit = run("deposit", amount * months, i.depositRate, TAX);
  const savings = run("savings", amount, i.savingsRate, TAX);
  const isaGross = run("savings", amount, i.isaRate, 0);
  const isaTax = compareIsaTax({ type: "normal", taxableProfit: String(isaGross.interest), deductibleLoss: "0" });
  const isaNet = isaGross.interest - (isaTax.ok ? isaTax.isaTax : 0);
  const parking = run("savings", amount, i.parkingRate, TAX);
  return [
    { id: "deposit", label: "정기예금(처음에 한 번에)", net: deposit.afterTaxInterest },
    { id: "savings", label: "정기적금", net: savings.afterTaxInterest },
    { id: "isa", label: "ISA(예금·적금형)", net: isaNet },
    { id: "parking", label: "파킹통장", net: parking.afterTaxInterest },
  ];
}
/** 같은 돈을 매달 넣을 때 가장 많이 받는 상품의 세후 이자 */
export const saveBest = (i: SaveLite) => Math.max(...saveResult(i).filter((r) => r.id !== "deposit").map((r) => r.net));

export const SAVE_ASSUMPTIONS: Assumption<SaveLite>[] = [
  { key: "monthly", label: "월 저축액", plain: "매달 넣는 돈", unit: "won", kind: "assumption", get: (i) => i.monthly, set: (i, v) => ({ ...i, monthly: Math.max(0, v) }), range: (a) => [0, Math.max(a * 2, 1_000_000)] },
  { key: "years", label: "기간", plain: "기간", unit: "years", kind: "assumption", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(1, Math.round(v)) }), range: fixedRange(1, 10) },
  { key: "savingsRate", label: "적금 금리", plain: "적금 금리", unit: "rate", kind: "assumption", get: (i) => i.savingsRate, set: (i, v) => ({ ...i, savingsRate: Math.max(0, v) }), range: fixedRange(0, 0.08) },
  { key: "isaRate", label: "ISA 안 금리", plain: "ISA 금리", unit: "rate", kind: "assumption", get: (i) => i.isaRate, set: (i, v) => ({ ...i, isaRate: Math.max(0, v) }), range: fixedRange(0, 0.08) },
  { key: "parkingRate", label: "파킹통장 금리", plain: "파킹통장 금리", unit: "rate", kind: "assumption", get: (i) => i.parkingRate, set: (i, v) => ({ ...i, parkingRate: Math.max(0, v) }), range: fixedRange(0, 0.06) },
];

export function saveCompare(i: SaveLite) {
  const rows = saveResult(i);
  const best = Math.max(...rows.map((r) => r.net));
  return rows.map((r) => ({ label: r.label, value: r.net, current: r.net === best }));
}

export function savePlain(i: SaveLite, top?: TornadoBar) {
  const rows = saveResult(i).filter((r) => r.id !== "deposit");
  const best = rows.reduce((a, b) => (b.net > a.net ? b : a));
  const savings = rows.find((r) => r.id === "savings")!;
  const isa = rows.find((r) => r.id === "isa")!;
  return {
    headline: `매달 ${roughWon(i.monthly)}씩 ${i.years}년 넣으면 ${best.label}이 세후 이자 약 ${roughWon(best.net)}으로 가장 많아요.`,
    driver: driverLine(top, "가장 많은 세후 이자"),
    reasons: [
      `같은 금리라도 ISA는 이자 200만 원까지 세금이 없고 넘는 돈도 9.9%만 떼요. 지금 조건에서 ISA는 적금보다 ${roughWon(Math.abs(isa.net - savings.net))} ${isa.net >= savings.net ? "더" : "덜"} 받아요.`,
      `적금은 매달 넣는 돈마다 이자가 붙는 기간이 달라서, 표시 금리 ${pct(i.savingsRate)}보다 실제 수익은 절반쯤이에요.`,
      "정기예금 막대는 같은 총액을 처음에 한 번에 넣었을 때예요. 목돈이 있을 때만 비교하세요.",
    ],
  };
}
