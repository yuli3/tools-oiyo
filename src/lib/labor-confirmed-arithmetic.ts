// WHY 2026-10-27: only confirmed amounts are compared; no statutory accrual,
// eligibility or default percentage is inferred from these arithmetic helpers.
export function confirmedAmount(raw: string): number {
  if (!/^(?:0|[1-9]\d*)(?:[.,]\d{1,2})?$/.test(raw.trim())) throw new RangeError('amount');
  const n=Number(raw.trim().replace(',', '.'));
  if (!Number.isFinite(n)||n>1_000_000_000) throw new RangeError('amount');
  return n;
}
export function confirmedDifference(kind:'hours'|'money',raw:readonly string[]):number {
  if(raw.length!==3) throw new RangeError('fields');
  const [a,b,c]=raw.map(confirmedAmount);
  if(kind==='money'&&b>100) throw new RangeError('percentage');
  // Signed difference is preserved: a negative value is not a legal overpayment finding.
  return Math.round((kind==='hours'?a+b-c:a*b/100-c)*100)/100;
}
