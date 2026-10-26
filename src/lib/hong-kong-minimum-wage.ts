import { laborDate, DAY_MS } from './labor-date.ts';
export const HK_MINIMUM_WAGE = { hourly: 43.1, effectiveFrom: '2026-05-01', checkedThrough: '2026-10-26', source: 'https://www.labour.gov.hk/eng/news/mwo.htm' } as const;
export function calculateHongKongMinimumWage(input: { start: string; end: string; dutyHours: number; extraCountedHours: number; wages: number; restPay: number; nonworkingMealPay: number; scopeConfirmed: boolean }) {
  if (!input.scopeConfirmed) return { ok: false as const, reason: 'scope' as const };
  const start = laborDate(input.start), end = laborDate(input.end);
  if (start === null || end === null || end < start) return { ok: false as const, reason: 'invalid' as const };
  if (input.start < HK_MINIMUM_WAGE.effectiveFrom || input.end > HK_MINIMUM_WAGE.checkedThrough) return { ok: false as const, reason: 'date' as const };
  const days = (end - start) / DAY_MS + 1;
  const { dutyHours, extraCountedHours, wages, restPay, nonworkingMealPay } = input;
  if (![dutyHours, extraCountedHours, wages, restPay, nonworkingMealPay].every(n => Number.isFinite(n) && n >= 0) || wages > 100_000_000 || restPay + nonworkingMealPay > wages || dutyHours + extraCountedHours > days * 24) return { ok: false as const, reason: 'invalid' as const };
  if (days > 31) return { ok: false as const, reason: 'unsupported' as const };
  // WHY 2026-10-26 LD guidance: wages for non-working rest/meal time cannot
  // offset minimum wages for hours worked. Count on-duty meals only once.
  const countedHours = dutyHours + extraCountedHours;
  const countedWages = wages - restPay - nonworkingMealPay;
  const minimum = countedHours * HK_MINIMUM_WAGE.hourly;
  return { ok: true as const, countedHours, countedWages, minimum, difference: minimum - countedWages, excludedWages: restPay + nonworkingMealPay };
}
