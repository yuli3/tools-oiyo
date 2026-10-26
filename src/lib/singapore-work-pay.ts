export type SingaporeKind = 'workman' | 'nonworkman';
type Base = { basic: number; kind: SingaporeKind; scopeConfirmed: boolean };
function singaporeRates({ basic, kind, scopeConfirmed }: Base) {
  if (!scopeConfirmed) return { ok: false as const, reason: 'scope' as const };
  if (!Number.isFinite(basic) || basic <= 0 || !['workman', 'nonworkman'].includes(kind)) return { ok: false as const, reason: 'invalid' as const };
  if (basic > (kind === 'workman' ? 4500 : 2600)) return { ok: false as const, reason: 'unsupported' as const };
  const formulaHourly = 12 * basic / (52 * 44);
  // WHY 2026-10-26 MOM explicitly caps non-workman OT at SGD13.60/hour;
  // the unrounded 2600 formula alone would disagree with its SGD40.80 example.
  const hourly = kind === 'nonworkman' ? Math.min(formulaHourly, 13.6) : formulaHourly;
  return { ok: true as const, hourly, formulaHourly };
}
export function calculateSingaporeOvertime(input: Base & { hours: number }) {
  const r = singaporeRates(input);
  if (!r.ok) return r;
  if (!Number.isFinite(input.hours) || input.hours < 0) return { ok: false as const, reason: 'invalid' as const };
  if (input.hours > 72) return { ok: false as const, reason: 'unsupported' as const };
  return { ok: true as const, hourly: r.hourly, amount: r.hourly * 1.5 * input.hours };
}
export function calculateSingaporeRestDay(input: Base & { daysPerWeek: number; normalHours: number; hours: number; request: 'employer' | 'employee'; otherMonthlyOT: number }) {
  const r = singaporeRates(input);
  if (!r.ok) return r;
  const { daysPerWeek, normalHours, hours, request, otherMonthlyOT } = input;
  if (![daysPerWeek, normalHours, hours, otherMonthlyOT].every(Number.isFinite) || ![5, 5.5, 6].includes(daysPerWeek) || normalHours <= 0 || normalHours > 9 || hours < 0 || otherMonthlyOT < 0 || !['employer', 'employee'].includes(request)) return { ok: false as const, reason: 'invalid' as const };
  const extraHours = Math.max(0, hours - normalHours);
  if (hours > 12 || extraHours + otherMonthlyOT > 72) return { ok: false as const, reason: 'unsupported' as const };
  const daily = 12 * input.basic / (52 * daysPerWeek);
  const dayMultiplier = hours === 0 ? 0 : hours <= normalHours / 2 ? (request === 'employer' ? 1 : 0.5) : (request === 'employer' ? 2 : 1);
  const dailyPay = daily * dayMultiplier, overtimePay = extraHours * r.hourly * 1.5;
  return { ok: true as const, daily, hourly: r.hourly, dayMultiplier, dailyPay, extraHours, overtimePay, total: dailyPay + overtimePay };
}
