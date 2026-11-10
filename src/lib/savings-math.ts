// Dividend totals and the latte-factor projection. Plain arithmetic, no tax rules.

export const DIVIDEND_FREQ = { monthly: 12, quarterly: 4, semiannual: 2, annual: 1 } as const;
export type DividendFreq = keyof typeof DIVIDEND_FREQ;

export function annualDividend(shares: number, perShare: number, freq: DividendFreq, taxPct: number) {
  const gross = Math.max(0, shares) * Math.max(0, perShare) * (DIVIDEND_FREQ[freq] ?? 1);
  const rate = Math.min(100, Math.max(0, taxPct)) / 100;
  return { gross, net: gross * (1 - rate) };
}

// 2026-11-10 (클리앙 실버블렛스톡 차용): 월별 배당 분포·많이 주는 종목·연도별 기록.
// 지급 달은 모른다. 배당기준일의 달을 지급 달로 보고, 그 달부터 주기 간격으로 1년에 펼친다.
// 기준일이 없으면 흔한 미국 분기 배당 달(3·6·9·12월)에서 시작한다.
const DEFAULT_START_MONTH = 2; // 0 = 1월

/** 1년 중 배당이 들어오는 달(0–11). */
export function dividendMonths(freq: DividendFreq, exDate: string): number[] {
  const n = DIVIDEND_FREQ[freq] ?? 1;
  const m = /^\d{4}-(\d{2})-\d{2}$/.exec(exDate ?? '');
  const parsed = m ? Number(m[1]) - 1 : NaN;
  const start = parsed >= 0 && parsed <= 11 ? parsed : (n === 12 ? 0 : n === 1 ? 11 : n === 2 ? 5 : DEFAULT_START_MONTH);
  const step = 12 / n;
  return Array.from({ length: n }, (_, i) => (start + i * step) % 12).sort((a, b) => a - b);
}

export interface DividendHolding { ticker: string; shares: number; perShare: number; freq: DividendFreq; exDate: string; taxPct: number }

/** 12개월 세후 배당. 한 번에 받는 금액 = 연 세후 ÷ 지급 횟수. */
export function monthlyNetSchedule(holdings: readonly DividendHolding[]): number[] {
  const months = Array<number>(12).fill(0);
  for (const h of holdings) {
    const { net } = annualDividend(h.shares, h.perShare, h.freq, h.taxPct);
    if (!(net > 0)) continue;
    const at = dividendMonths(h.freq, h.exDate);
    for (const mo of at) months[mo] += net / at.length;
  }
  return months;
}

/** 세후 연 배당이 큰 종목 순, 비중(%) 포함. 같은 종목명은 합친다. */
export function topPayers(holdings: readonly DividendHolding[], limit = 5): { ticker: string; net: number; share: number }[] {
  const by = new Map<string, number>();
  for (const h of holdings) {
    const { net } = annualDividend(h.shares, h.perShare, h.freq, h.taxPct);
    if (!(net > 0)) continue;
    const key = h.ticker.trim().toUpperCase() || '—';
    by.set(key, (by.get(key) ?? 0) + net);
  }
  const total = [...by.values()].reduce((a, b) => a + b, 0);
  return [...by.entries()]
    .map(([ticker, net]) => ({ ticker, net, share: total > 0 ? (net / total) * 100 : 0 }))
    .sort((a, b) => b.net - a.net)
    .slice(0, limit);
}

/** 연도별로 실제 받은 배당 합계와 전년 대비 증감(%). 전년이 없거나 0이면 change 는 null. */
export function yearOverYear(records: readonly { year: number; amount: number }[]): { year: number; amount: number; change: number | null }[] {
  const by = new Map<number, number>();
  for (const r of records) {
    if (!Number.isInteger(r.year) || !(r.amount >= 0)) continue;
    by.set(r.year, (by.get(r.year) ?? 0) + r.amount);
  }
  return [...by.entries()].sort((a, b) => a[0] - b[0]).map(([year, amount]) => {
    const prev = by.get(year - 1);
    return { year, amount, change: prev && prev > 0 ? ((amount - prev) / prev) * 100 : null };
  });
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
