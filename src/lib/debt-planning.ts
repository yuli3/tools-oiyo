export const DEBT_PLANNING_VERIFIED_ON = '2026-10-29';

// 2026-10-29: legal worksheets must distinguish an explicit zero from missing,
// negative or partially parsed input. Integer cents prevent display rounding drift.
export function debtAmountCents(text: string): number | null {
  const value = text.trim().replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) ? cents : null;
}

export function precedingIncomeMonths(filingDate: string): string[] | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(filingDate)) return null;
  const date = new Date(`${filingDate}T00:00:00Z`);
  if (!Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== filingDate || date.getUTCFullYear() < 1901) return null;
  return Array.from({ length: 6 }, (_, i) => {
    const month = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 6 + i, 1));
    return month.toISOString().slice(0, 7);
  });
}

export function bankruptcyIncomeWorksheet(incomes: readonly string[], annualMedian: string, referenceConfirmed: boolean) {
  if (incomes.length !== 6) return null;
  const values = incomes.map(debtAmountCents);
  if (values.some(value => value === null)) return null;
  const totalCents = values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  // Annualize the unrounded average, not the rounded amount displayed to cents.
  const annualCents = totalCents * 2;
  if (!Number.isSafeInteger(annualCents)) return null;
  const medianCents = debtAmountCents(annualMedian);
  const differenceCents = referenceConfirmed && medianCents !== null && medianCents > 0 ? annualCents - medianCents : null;
  return { totalCents, monthlyCents: totalCents / 6, annualCents, differenceCents };
}

export function monthlyDebtBudget(income: string, essentials: string, payments: string) {
  const incomeCents = debtAmountCents(income), essentialsCents = debtAmountCents(essentials), paymentsCents = debtAmountCents(payments);
  if (incomeCents === null || essentialsCents === null || paymentsCents === null) return null;
  const balanceCents = incomeCents - essentialsCents - paymentsCents;
  if (!Number.isSafeInteger(balanceCents) || !Number.isSafeInteger(essentialsCents + paymentsCents)) return null;
  return { incomeCents, essentialsCents, paymentsCents, balanceCents };
}

// 2026-11-02: US credit card payoff, matching the disclosures 15 U.S.C. 1637(b)(11)
// requires on statements (months and total cost at the minimum, and the 36-month payment).
// Monthly interest is balance × APR/12, a simplification of issuers' daily-balance method,
// so results are estimates. Issuers set their own minimum formula; the user enters it.
export const CARD_MAX_MONTHS = 1200;

export interface CardMinimumRule { percent: number; floorCents: number; addInterest: boolean }

export function cardMinimumPaymentCents(balanceCents: number, interestCents: number, rule: CardMinimumRule): number {
  const base = Math.round(balanceCents * rule.percent / 100) + (rule.addInterest ? interestCents : 0);
  return Math.min(balanceCents + interestCents, Math.max(rule.floorCents, base));
}

export type CardPayoff = { months: number; totalPaidCents: number; interestCents: number } | { months: null; reason: 'never' | 'too-long' };

export function simulateCardPayoff(balanceCents: number, aprPercent: number, pay: (balance: number, interest: number) => number): CardPayoff {
  if (!Number.isSafeInteger(balanceCents) || balanceCents <= 0 || !(aprPercent >= 0 && aprPercent <= 100)) return { months: null, reason: 'never' };
  const rate = aprPercent / 100 / 12;
  let balance = balanceCents, total = 0, interestSum = 0;
  for (let month = 1; month <= CARD_MAX_MONTHS; month++) {
    const interest = Math.round(balance * rate);
    const payment = Math.min(balance + interest, pay(balance, interest));
    if (payment <= interest) return { months: null, reason: 'never' };
    balance = balance + interest - payment;
    total += payment; interestSum += interest;
    if (balance <= 0) return { months: month, totalPaidCents: total, interestCents: interestSum };
  }
  return { months: null, reason: 'too-long' };
}

/** Level monthly payment that clears the balance in `months` months (standard amortization), rounded up to the cent. */
export function levelPaymentCents(balanceCents: number, aprPercent: number, months: number): number {
  const rate = aprPercent / 100 / 12;
  if (rate === 0) return Math.ceil(balanceCents / months);
  return Math.ceil(balanceCents * rate / (1 - Math.pow(1 + rate, -months)));
}

export function cardPayoffComparison(balance: string, apr: string, percent: string, floor: string, addInterest: boolean, fixed: string) {
  const balanceCents = debtAmountCents(balance), floorCents = debtAmountCents(floor), fixedCents = fixed.trim() === '' ? null : debtAmountCents(fixed);
  const aprValue = Number(apr.trim().replace(',', '.')), percentValue = Number(percent.trim().replace(',', '.'));
  if (balanceCents === null || balanceCents <= 0 || floorCents === null || apr.trim() === '' || percent.trim() === '') return null;
  if (!(aprValue >= 0 && aprValue <= 100) || !(percentValue > 0 && percentValue <= 100)) return null;
  if (fixed.trim() !== '' && (fixedCents === null || fixedCents <= 0)) return null;
  const rule = { percent: percentValue, floorCents, addInterest };
  const minimum = simulateCardPayoff(balanceCents, aprValue, (b, i) => cardMinimumPaymentCents(b, i, rule));
  const firstMinimumCents = cardMinimumPaymentCents(balanceCents, Math.round(balanceCents * aprValue / 1200), rule);
  const in36Cents = levelPaymentCents(balanceCents, aprValue, 36);
  const in36 = simulateCardPayoff(balanceCents, aprValue, () => in36Cents);
  const fixedPlan = fixedCents === null ? null : simulateCardPayoff(balanceCents, aprValue, () => fixedCents);
  return { balanceCents, firstMinimumCents, minimum, in36Cents, in36, fixedCents, fixedPlan };
}
