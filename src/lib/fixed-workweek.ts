/** Full-year, unchanged workweek only; legal exceptions belong outside this arithmetic (2026-10-27). */
export function positiveInput(value: string, max: number, allowZero = false): number {
  const normalized = value.trim().replace(',', '.')
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) throw new Error('invalid input')
  const n = Number(normalized)
  if (!Number.isFinite(n) || n > max || (allowZero ? n < 0 : n <= 0)) throw new Error('out of range')
  return n
}
export function annualLeave(kind: 'de-leave' | 'nl-leave', value: string, confirmed: boolean): number {
  if (!confirmed) throw new Error('scope not confirmed')
  const n = positiveInput(value, kind === 'de-leave' ? 6 : 168)
  if (kind === 'de-leave' && !Number.isInteger(n)) throw new Error('whole workdays required')
  return n * 4
}
export function grossOffer(values: readonly string[], confirmed: boolean) {
  if (!confirmed || values.length !== 6) throw new Error('scope not confirmed')
  const [a, extraA, hoursA, b, extraB, hoursB] = values.map((v, i) => positiveInput(v, i % 3 === 2 ? 168 : 1e8, i % 3 === 1))
  const annualA = a * 12 + extraA, annualB = b * 12 + extraB
  return {annualA, annualB, difference: annualB - annualA, monthlyComparison: (annualB - annualA) / 12, hoursDifference: hoursB - hoursA}
}
