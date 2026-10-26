export type TaiwanDayKind = 'workday' | 'restday' | 'holiday';
export function calculateTaiwanOvertime(input: { hourly: number; hours: number; kind: TaiwanDayKind; scopeConfirmed: boolean }) {
  if (!input.scopeConfirmed) return { ok: false as const, reason: 'scope' as const };
  const { hourly, hours, kind } = input;
  if (![hourly, hours].every(Number.isFinite) || hourly <= 0 || hourly > 1_000_000 || hours < 0 || !['workday', 'restday', 'holiday'].includes(kind)) return { ok: false as const, reason: 'invalid' as const };
  if (hours > (kind === 'workday' ? 4 : 8)) return { ok: false as const, reason: 'unsupported' as const };
  // WHY 2026-10-26 MOL holiday guidance: monthly pay already contains the
  // holiday's ordinary wage; any attendance up to 8h adds a whole day's pay.
  const firstHours = kind === 'holiday' ? (hours > 0 ? 8 : 0) : Math.min(hours, 2);
  const secondHours = kind === 'holiday' ? 0 : Math.max(0, hours - 2);
  const firstRate = kind === 'holiday' ? 1 : 4 / 3;
  const firstPay = hourly * firstHours * firstRate;
  const secondPay = hourly * secondHours * 5 / 3;
  return { ok: true as const, firstHours, secondHours, firstRate, firstPay, secondPay, total: firstPay + secondPay };
}
