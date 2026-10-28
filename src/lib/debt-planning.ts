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
