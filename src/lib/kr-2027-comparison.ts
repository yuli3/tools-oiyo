import { minimumWageForYear } from './kr-rates-registry.mjs';
import { KR_RATES_2027 } from './kr-rates-2027.mjs';
function bounded(value: number, max: number, name: string) {
  if (!Number.isFinite(value) || value < 0 || value > max) throw new Error(`${name} 범위를 확인해 주세요.`);
}
export function minimumPayComparison(paidHours: number) {
  bounded(paidHours, 744, '월 유급시간');
  const before = Math.round(minimumWageForYear(2026).hourly * paidHours);
  const after = Math.round(minimumWageForYear(2027).hourly * paidHours);
  return { before, after, difference: after - before };
}
export function proposedWithholdingComparison(monthlyGross: number) {
  bounded(monthlyGross, 1_000_000_000, '월 지급액');
  // 2026-10-29: cash-flow scenarios only; the proposal never changes enacted
  // 2026 tax calculations or promises a reduction in the final income-tax bill.
  const before = Math.round(monthlyGross * 0.033);
  const after = Math.round(monthlyGross * KR_RATES_2027.freelancerProposal.value);
  return { before, after, currentCash: monthlyGross - before, proposedCash: monthlyGross - after, difference: before - after };
}
