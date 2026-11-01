/** WHY 2026-11-01: eligibility is an explicit scenario, never inferred from salary alone.
 * KR tax cap: 조세특례제한법95조의2, 시행2026-09-18. Not a refund guarantee. */
export const RENT_CREDIT_ANNUAL_CAP = 10_000_000;
export function annualRentCredit(monthlyRent: number, rate: number, eligibilityConfirmed: boolean): number {
  if (!Number.isFinite(monthlyRent) || monthlyRent < 0 || ![0, 0.15, 0.17].includes(rate)) throw new RangeError('월세와 공제율을 확인해 주세요.');
  return eligibilityConfirmed ? Math.round(Math.min(monthlyRent * 12, RENT_CREDIT_ANNUAL_CAP) * rate) : 0;
}
export function housingCost(input: { jeonse: number; rentDeposit: number; monthlyRent: number; loanRatio: number; loanRate: number; savingsRate: number; creditRate: number; confirmed: boolean }) {
  const { jeonse, rentDeposit, monthlyRent, loanRatio, loanRate, savingsRate, creditRate, confirmed } = input;
  if (![jeonse, rentDeposit, monthlyRent, loanRatio, loanRate, savingsRate].every(Number.isFinite) || jeonse <= 0 || rentDeposit < 0 || monthlyRent < 0 || loanRatio < 0 || loanRatio > 1 || loanRate < 0 || loanRate > 100 || savingsRate < 0 || savingsRate > 100 || jeonse > 1e13 || rentDeposit > 1e13 || monthlyRent > 1e10) throw new RangeError('금액은 0 이상, 전세 보증금은 0 초과, 금리는 0~100%로 입력해 주세요.');
  const loanInterest = jeonse * loanRatio * loanRate / 100 / 12;
  const equityCost = jeonse * (1 - loanRatio) * savingsRate / 100 / 12;
  const rentEquityCost = rentDeposit * savingsRate / 100 / 12;
  const credit = annualRentCredit(monthlyRent, creditRate, confirmed) / 12;
  return { loanInterest, equityCost, rentEquityCost, credit, jeonseCost: loanInterest + equityCost, rentCost: monthlyRent + rentEquityCost - credit };
}
