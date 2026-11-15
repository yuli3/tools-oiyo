// 경영 도구 가정 목록 (2026-11-14). 단위경제·런웨이의 가정을 scenario.ts 형식으로 두고 토네이도·훑기 곡선에 써요.
import { moneyRange, type Assumption } from "./scenario.ts";
import { runway, unitEconomics } from "./biz-strategy.ts";

export interface GrowthInput {
  arpu: number;
  grossMargin: number;
  monthlyChurn: number;
  cac: number;
  cash: number;
  revenue: number;
  revenueGrowth: number;
  expenses: number;
  expenseGrowth: number;
}

export const GROWTH_EXAMPLE: GrowthInput = {
  arpu: 39_000, grossMargin: 0.7, monthlyChurn: 0.06, cac: 120_000,
  cash: 300_000_000, revenue: 25_000_000, revenueGrowth: 0.08, expenses: 55_000_000, expenseGrowth: 0.02,
};

export const RUNWAY_HORIZON = 36;

const rate = (anchor: number, cap = 0.5): [number, number] => [0, Math.max(cap, Math.min(1, anchor * 2))];
const a = (key: keyof GrowthInput, label: string, plain: string, unit: Assumption<GrowthInput>["unit"], range: (x: number) => [number, number]): Assumption<GrowthInput> => ({
  key, label, plain, unit, kind: "assumption", get: (i) => i[key], set: (i, v) => ({ ...i, [key]: v }), range,
});

export const UNIT_ASSUMPTIONS: Assumption<GrowthInput>[] = [
  a("arpu", "ARPU(고객당 월 매출)", "고객 한 명이 한 달에 내는 돈", "won", (x) => moneyRange(x, { minSpan: 100_000 })),
  a("grossMargin", "매출총이익률", "매출에서 원가를 빼고 남는 비율", "pct", () => [0.05, 0.95]),
  a("monthlyChurn", "월 이탈률", "한 달에 떠나는 고객 비율", "rate", (x) => [0.005, Math.max(0.2, x * 2)]),
  a("cac", "CAC(고객 획득 비용)", "고객 한 명 데려오는 비용", "won", (x) => moneyRange(x, { minSpan: 100_000 })),
];

export const RUNWAY_ASSUMPTIONS: Assumption<GrowthInput>[] = [
  a("cash", "보유 현금", "지금 통장에 있는 돈", "won", (x) => moneyRange(x)),
  a("revenue", "월 매출", "이번 달 매출", "won", (x) => moneyRange(x, { minSpan: 10_000_000 })),
  a("revenueGrowth", "월 매출 성장률", "매출이 매달 늘어나는 비율", "rate", (x) => rate(x, 0.3)),
  a("expenses", "월 비용", "한 달에 나가는 돈 전체", "won", (x) => moneyRange(x, { minSpan: 10_000_000 })),
  a("expenseGrowth", "월 비용 증가율", "비용이 매달 늘어나는 비율", "rate", (x) => rate(x, 0.2)),
];

export const ltvCac = (i: GrowthInput) => {
  const r = unitEconomics(i).ltvToCac;
  return Number.isFinite(r) ? r : 99;
};
export const paybackMonths = (i: GrowthInput) => {
  const r = unitEconomics(i).paybackMonths;
  return Number.isFinite(r) ? r : 999;
};
/** 현금이 버티는 달 수(36개월 넘으면 36) */
export const cashMonths = (i: GrowthInput) => {
  const r = runway({ ...i, months: RUNWAY_HORIZON });
  return r.zeroMonth === null ? RUNWAY_HORIZON : r.zeroMonth - 1;
};
