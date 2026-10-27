// Dividend totals and the latte-factor projection. Plain arithmetic, no tax rules.

export const DIVIDEND_FREQ = { monthly: 12, quarterly: 4, semiannual: 2, annual: 1 } as const;
export type DividendFreq = keyof typeof DIVIDEND_FREQ;

export function annualDividend(shares: number, perShare: number, freq: DividendFreq, taxPct: number) {
  const gross = Math.max(0, shares) * Math.max(0, perShare) * (DIVIDEND_FREQ[freq] ?? 1);
  const rate = Math.min(100, Math.max(0, taxPct)) / 100;
  return { gross, net: gross * (1 - rate) };
}

// Purchases per month: 30 a day, 21.6 weekdays (≈ 365×5/7/12 rounded), 4.3 weekly.
export const LATTE_FREQ = { daily: 30, weekdays: 21.6, weekly: 4.3 } as const;
export type LatteFreq = keyof typeof LATTE_FREQ;

/** Month-end deposits at a nominal annual rate compounded monthly. */
export function latteFutureValue(perPurchase: number, freq: LatteFreq, annualRatePct: number, years: number) {
  const monthly = Math.max(0, perPurchase) * LATTE_FREQ[freq];
  const n = Math.max(0, Math.round(years * 12));
  const r = Math.max(0, annualRatePct) / 100 / 12;
  const principal = monthly * n;
  const total = r === 0 ? principal : (monthly * (Math.pow(1 + r, n) - 1)) / r;
  return { monthly, principal, total, growth: total - principal };
}
