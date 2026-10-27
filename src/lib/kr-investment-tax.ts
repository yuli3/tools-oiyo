// Korean investment taxes for a resident individual, checked on law.go.kr on 2026-10-27
// (소득세법·국제조세조정에 관한 법률, in force 2026-01-01). Calculated tax only: credits,
// dividend gross-up (§17③) and the dividend tax credit (§56) are left out on purpose.
import { progressiveIncomeTax, KR_RATES_2026 } from './kr-rates-2026.mjs';

export const INVESTMENT_TAX_VERIFIED_ON = '2026-10-27';

/* ── Interest and dividends: separate (15.4%) or comprehensive taxation ──
 * §14③6: up to 20,000,000 won a year stays separately taxed by withholding.
 * §129①1라: withholding is 14% (+10% local = 15.4%).
 * §62: above the threshold, tax is the larger of
 *   (1) progressive tax on (financial income − 20M + other tax base) + 20M × 14%
 *   (2) financial income × 14% + progressive tax on the other tax base. */
export const FINANCIAL_THRESHOLD = 20_000_000;
export const FINANCIAL_WITHHOLDING_RATE = 0.14;
const LOCAL = KR_RATES_2026.incomeTax.localIncomeTaxRate;

export interface FinancialIncomeTax {
  comprehensive: boolean;
  withheld: number; // national 14% already withheld
  method1: number; // §62 1호
  method2: number; // §62 2호
  calculated: number; // larger of the two, or 0 when not comprehensive
  extraNational: number; // owed in May beyond withholding and the tax on other income
  extraLocal: number;
  extraTotal: number;
}

export function financialIncomeTax(financialIncome: number, otherTaxBase: number): FinancialIncomeTax {
  const fin = Math.max(0, Math.floor(financialIncome));
  const other = Math.max(0, Math.floor(otherTaxBase));
  const withheld = Math.floor(fin * FINANCIAL_WITHHOLDING_RATE);
  if (fin <= FINANCIAL_THRESHOLD) {
    return { comprehensive: false, withheld, method1: 0, method2: 0, calculated: 0, extraNational: 0, extraLocal: 0, extraTotal: 0 };
  }
  const method1 = progressiveIncomeTax(other + fin - FINANCIAL_THRESHOLD) + Math.floor(FINANCIAL_THRESHOLD * FINANCIAL_WITHHOLDING_RATE);
  const method2 = withheld + progressiveIncomeTax(other);
  const calculated = Math.max(method1, method2);
  const extraNational = calculated - method2;
  const extraLocal = Math.floor(extraNational * LOCAL);
  return { comprehensive: true, withheld, method1, method2, calculated, extraNational, extraLocal, extraTotal: extraNational + extraLocal };
}

/* ── Foreign-listed stock gains (양도소득세) ──
 * §103①2: basic deduction 2,500,000 won a year for the stock group.
 * §104①12 (§94①3다): 20%, or 10% for a 중소기업 stock. Local income tax 10% on top.
 * Gains and losses within the year net off; filed in May of the next year. */
export const STOCK_GAIN_DEDUCTION = 2_500_000;
export const FOREIGN_STOCK_RATE = 0.2;
export const FOREIGN_SME_STOCK_RATE = 0.1;

export interface ForeignStockTax {
  netGain: number;
  deduction: number;
  taxBase: number;
  incomeTax: number;
  localTax: number;
  totalTax: number;
}

/** gains: realised gain (+) or loss (−) per sale in won, after fees. */
export function foreignStockTax(gains: number[], sme = false): ForeignStockTax {
  const netGain = Math.round(gains.reduce((s, g) => s + (Number.isFinite(g) ? g : 0), 0));
  const deduction = netGain > 0 ? Math.min(STOCK_GAIN_DEDUCTION, netGain) : 0;
  const taxBase = Math.max(0, netGain - STOCK_GAIN_DEDUCTION);
  const incomeTax = Math.floor(taxBase * (sme ? FOREIGN_SME_STOCK_RATE : FOREIGN_STOCK_RATE));
  const localTax = Math.floor(incomeTax * LOCAL);
  return { netGain, deduction, taxBase, incomeTax, localTax, totalTax: incomeTax + localTax };
}

/* ── Overseas financial accounts (해외금융계좌 신고) ──
 * 국제조세조정법 §53①: report in June of the next year when the total balance on any
 * month-end exceeds the threshold; 시행령 §92③ sets it at 500,000,000 won. */
export const FOREIGN_ACCOUNT_THRESHOLD = 500_000_000;

export interface ForeignAccountCheck {
  peak: number;
  peakMonth: number; // 1–12, 0 when nothing entered
  mustReport: boolean;
}

/** monthEnds: total KRW value of all overseas accounts on each month-end (Jan…Dec). */
export function foreignAccountCheck(monthEnds: number[]): ForeignAccountCheck {
  let peak = 0;
  let peakMonth = 0;
  monthEnds.slice(0, 12).forEach((v, i) => {
    const n = Number.isFinite(v) ? v : 0;
    if (n > peak) { peak = n; peakMonth = i + 1; }
  });
  return { peak, peakMonth, mustReport: peak > FOREIGN_ACCOUNT_THRESHOLD };
}
