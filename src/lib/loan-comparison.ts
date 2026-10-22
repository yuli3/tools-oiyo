export type LoanMethod = 'equal-payment' | 'equal-principal' | 'bullet';
export interface LoanInput { principal: number; annualRate: number; months: number; graceMonths: number }
export type LoanError = 'principal' | 'rate' | 'months' | 'grace' | 'unrepresentable';
export interface LoanMonth { month: number; principal: number; interest: number; payment: number; balance: number }
export interface LoanSchedule {
  method: LoanMethod; rows: LoanMonth[]; firstPayment: number; repaymentStart: number;
  lastPayment: number; totalInterest: number; totalPayment: number;
}
export type LoanResult = { ok: true; schedules: LoanSchedule[] } | { ok: false; error: LoanError };

/** Fixed nominal annual rate / 12; month-end payments, no fees or tax. */
export function compareLoans(input: LoanInput): LoanResult {
  const { principal: p, annualRate, months, graceMonths } = input;
  if (!Number.isFinite(p) || p <= 0 || p > Number.MAX_SAFE_INTEGER) return { ok: false, error: 'principal' };
  if (!Number.isFinite(annualRate) || annualRate < 0 || annualRate > 1000) return { ok: false, error: 'rate' };
  // WHY 2026-10-22: cap schedule allocation at 100 years, rather than allowing
  // an untrusted month count to allocate an unbounded browser array.
  if (!Number.isInteger(months) || months < 1 || months > 1200) return { ok: false, error: 'months' };
  if (!Number.isInteger(graceMonths) || graceMonths < 0 || graceMonths >= months) return { ok: false, error: 'grace' };
  const r = annualRate / 1200;
  const n = months - graceMonths;
  // WHY 2026-10-22: expm1/log1p preserve tiny positive rates where (1+r)^n-1
  // cancels to zero. Zero-rate grace months still pay zero, not principal/n.
  const regularPayment = r === 0 ? p / n : p * r / -Math.expm1(-n * Math.log1p(r));
  if (!Number.isFinite(regularPayment) || regularPayment <= 0 || (annualRate > 0 && r === 0)) return { ok: false, error: 'unrepresentable' };
  const schedules: LoanSchedule[] = [];
  for (const method of ['equal-payment', 'equal-principal', 'bullet'] as const) {
    let balance = p;
    let totalInterest = 0;
    const rows: LoanMonth[] = [];
    for (let month = 1; month <= months; month++) {
      const interest = balance * r;
      // The discounted principal component avoids payment-interest cancellation
      // for long, high-rate loans; it is algebraically identical to the annuity.
      const annuityPrincipal = r === 0 ? p/n : regularPayment * Math.exp(-(months-month+1)*Math.log1p(r));
      let repaid = month <= graceMonths || method === 'bullet' ? 0
        : method === 'equal-principal' ? p / n : annuityPrincipal;
      // Settle the remaining principal in the final month, without rounding
      // every instalment and silently leaving a balance or changing the model.
      repaid = month === months ? balance : Math.max(0, Math.min(balance, repaid));
      balance = Math.max(0, balance - repaid);
      totalInterest += interest;
      const payment = repaid + interest;
      if (![interest, repaid, payment, balance, totalInterest].every(Number.isFinite)) return { ok: false, error: 'unrepresentable' };
      rows.push({ month, principal: repaid, interest, payment, balance });
    }
    const totalPayment = p + totalInterest;
    if (!Number.isFinite(totalPayment)) return { ok: false, error: 'unrepresentable' };
    schedules.push({ method, rows, firstPayment: rows[0].payment, repaymentStart: rows[graceMonths].payment,
      lastPayment: rows[months - 1].payment, totalInterest, totalPayment });
  }
  return { ok: true, schedules };
}
