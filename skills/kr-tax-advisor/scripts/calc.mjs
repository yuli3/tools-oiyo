#!/usr/bin/env node
// OIYO kr-tax-advisor skill calculator. Same formulas as tools.oiyo.net (vendored, do not edit here).
// Usage: node scripts/calc.mjs <tool> '<json>'
import { taxPenalty, nextReductionStep, PENALTY_NOTE, PENALTY_AS_OF } from "./kr-tax-penalty-2026.mjs";
import { deemedInputCredit, cardSalesCredit, badDebtCredit, VAT_CREDIT_NOTE, VAT_CREDIT_AS_OF } from "./kr-vat-credits-2026.mjs";
import { depreciation, leaseSchedule, bondSchedule, externalAuditCheck, ACCT_NOTE, ACCT_AS_OF } from "./kr-accounting-schedules-2026.mjs";
import { deferredTax, materiality, musSample, attributeSample, AUDIT_DEFERRED_NOTE, AUDIT_DEFERRED_AS_OF } from "./kr-audit-deferred-2026.mjs";
import { withholdingStatement, studentLoanRepayment, bookVsEstimate, exemptBusinessReport, pensionIncomeChoice, NTS_PACK_NOTE, NTS_PACK_AS_OF } from "./kr-nts-pack-2026.mjs";
import { corpTax, entertainmentLimit, CORP_TAX_AS_OF, CORP_TAX_NOTE } from "./kr-corp-tax-2026.mjs";
import { simplifiedWithholding, joinLeaveMonths, PAYROLL_MONTH_AS_OF } from "./kr-payroll-month-2026.mjs";
import { midYearLeaver, LEAVER_AS_OF } from "./kr-midyear-leaver-2026.mjs";
import { valueUnlistedShares, familyBusinessInheritance, incorporationConversion, dcfValuation, dcfSensitivity, wacc, ADVISORY_AS_OF } from "./kr-advisory-2026.mjs";

const EXAMPLES = {
  "unlisted-shares": { sharesOutstanding: 100000, netIncome: [600000000, 500000000, 400000000], netAssets: 3000000000, goodwill: 0, realEstateRatio: 0.2, netAssetOnlyReason: false, heldShares: 60000, isMajorityHolder: true, premiumExempt: true },
  "family-business": { businessValue: 10000000000, unrelatedAssetRatio: 0.1, years: 15, size: "sme", otherEstate: 2000000000, netFinancial: 300000000, debts: 0, funeralSpent: 10000000, hasSpouse: true, spouseInherited: 500000000 },
  "incorporation-conversion": { business: "general", realEstateMarket: 1000000000, realEstateCost: 400000000, holdYears: 10, otherAssets: 300000000, liabilities: 500000000, acquisitionBase: 0 },
  dcf: { revenue0: 10000000000, growth: 0.1, ebitMargin: 0.12, taxRate: 0.22, daRatio: 0.03, capexRatio: 0.04, nwcRatio: 0.15, wacc: 0.1, terminalGrowth: 0.02, netDebt: 2000000000, shares: 1000000, years: 5, midYear: false },
  "corp-tax": { size: "sme", profit: 500000000, addBack: 0, deduct: 0, months: 12, revenue: 15000000000, relatedRevenue: 0, entertainment: 80000000, cultureEntertainment: 0, entertainmentNoProof: 0, specialDonation: 0, generalDonation: 10000000, losses: 0, credits: 0, creditsOutside: 0, prepaid: 0, smallRealEstate: false },
  entertainment: { size: "sme", months: 12, revenue: 15000000000, relatedRevenue: 0, spent: 80000000, cultureSpent: 0, noProof: 0 },
  penalty: { kind: "none", tax: 10000000, fraud: false, revenue: 0, due: "2026-06-01", filed: "2026-06-21", paid: "", noticed: false },
  "deemed-input": { type: "restaurant-individual", purchases: 60000000, taxBase: 150000000, corp: false },
  "card-credit": { cardSales: 300000000, priorYearSupply: 500000000, corp: false, usedThisYear: 0 },
  "bad-debt": { amount: 11000000, supplied: "2025-03-10", confirmed: "2026-11-20" },
  depreciation: { cost: 10000000, residual: 0, years: 5, method: "straight", firstMonths: 12 },
  lease: { payment: 1000000, periods: 3, rate: 0.05, advance: false, directCost: 0 },
  bond: { face: 100000000, couponRate: 0.05, marketRate: 0.06, periods: 3 },
  audit: { listed: false, llc: false, assets: 13000000000, liabilities: 8000000000, revenue: 5000000000, employees: 20, members: 0 },
  "deferred-tax": { items: [{ label: "퇴직급여충당부채", amount: 100000000 }, { label: "일시상각충당금", amount: -40000000 }], rate: 0.209, futureIncome: 300000000, openingNet: 5000000, currentTax: 30000000, pretaxIncome: 200000000 },
  materiality: { benchmark: "pretax", base: 1000000000, pct: 0.05, risk: "medium", trivialPct: 0.05 },
  sample: { population: 5000000000, tolerable: 32500000, expected: 0, confidence: 95, tolerableRate: 0.05 },
  "withholding-statement": { kind: "simple-business", year: 2026, month: 10, amount: 20000000, submitted: "", semiAnnualPayer: false },
  "student-loan": { incomeType: "salary", amount: 40000000, loan: "undergrad", balance: 0 },
  "book-vs-estimate": { group: "personal", prevRevenue: 30000000, revenue: 50000000, newBusiness: false, actualExpense: 10000000, simpleRate: 64.1, simpleRateOver: 49.7, standardRate: 21.6, majorExpense: 3000000, otherIncome: 0, people: 1 },
  "exempt-report": { year: 2026, kind: "personal", vatFiledAll: false, mixed: false, unreported: 0 },
  "pension-income": { privatePension: 20000000, age: 66, lifelong: false, publicPension: 12000000, otherIncome: 0, people: 1 },
  "withholding-table": { pay: 3500000, family: 4, children: 2, ratio: 100 },
  "join-leave": { join: "2026-03-15", leave: "", monthlyPay: 3000000, pensionFromJoinMonth: false, untilMonth: "" },
  leaver: { year: 2026, salaryToDate: 24000000, withheld: 600000, nationalPension: 1140000, healthEmployment: 1080000, extra: { persons: 1, card: { credit: 0, debit: 0 }, medical: 0, education: 0, donation: 0, rent: 0, rentEligible: false, pensionSavings: 0 } },
  wacc: { riskFree: 0.03, beta: 1.1, marketPremium: 0.06, sizePremium: 0.03, preTaxCostOfDebt: 0.055, taxRate: 0.22, debtWeight: 0.3 },
};

const [tool, json] = process.argv.slice(2);
if (!tool || tool === "help" || !EXAMPLES[tool]) {
  console.log(`tools: ${Object.keys(EXAMPLES).join(", ")}\n`);
  for (const [k, v] of Object.entries(EXAMPLES)) console.log(`node scripts/calc.mjs ${k} '${JSON.stringify(v)}'`);
  process.exit(tool && tool !== "help" ? 1 : 0);
}
const input = { ...EXAMPLES[tool], ...(json ? JSON.parse(json) : {}) };
let result;
if (tool === "unlisted-shares") result = valueUnlistedShares(input);
else if (tool === "family-business") result = familyBusinessInheritance(input);
else if (tool === "incorporation-conversion") result = incorporationConversion(input);
else if (tool === "dcf") result = { ...dcfValuation(input), sensitivity: dcfSensitivity(input) };
else if (tool === "corp-tax") result = { ...corpTax(input), note: CORP_TAX_NOTE, corpTaxAsOf: CORP_TAX_AS_OF };
else if (tool === "entertainment") result = { ...entertainmentLimit(input), corpTaxAsOf: CORP_TAX_AS_OF };
else if (tool === "penalty") result = { ...taxPenalty(input, new Date().toISOString().slice(0, 10)), next: input.kind === "withholding" || !input.filed ? null : nextReductionStep(input.kind, input.due, input.filed), note: PENALTY_NOTE, penaltyAsOf: PENALTY_AS_OF };
else if (tool === "deemed-input") result = { ...deemedInputCredit(input), note: VAT_CREDIT_NOTE, vatCreditAsOf: VAT_CREDIT_AS_OF };
else if (tool === "card-credit") result = { ...cardSalesCredit(input), note: VAT_CREDIT_NOTE, vatCreditAsOf: VAT_CREDIT_AS_OF };
else if (tool === "bad-debt") result = { ...badDebtCredit(input), note: VAT_CREDIT_NOTE, vatCreditAsOf: VAT_CREDIT_AS_OF };
else if (tool === "depreciation") result = { ...depreciation(input.cost, input.residual, input.years, input.method, input.firstMonths), note: ACCT_NOTE, acctAsOf: ACCT_AS_OF };
else if (tool === "lease") result = { ...leaseSchedule(input.payment, input.periods, input.rate, input.advance, input.directCost), note: ACCT_NOTE, acctAsOf: ACCT_AS_OF };
else if (tool === "bond") result = { ...bondSchedule(input.face, input.couponRate, input.marketRate, input.periods), note: ACCT_NOTE, acctAsOf: ACCT_AS_OF };
else if (tool === "deferred-tax") result = { ...deferredTax(input), note: AUDIT_DEFERRED_NOTE, asOf: AUDIT_DEFERRED_AS_OF };
else if (tool === "materiality") result = { ...materiality(input), note: AUDIT_DEFERRED_NOTE, asOf: AUDIT_DEFERRED_AS_OF };
else if (tool === "sample") result = { mus: musSample(input), attribute: input.tolerableRate ? attributeSample(input) : null, note: AUDIT_DEFERRED_NOTE, asOf: AUDIT_DEFERRED_AS_OF };
else if (tool === "withholding-statement") result = { ...withholdingStatement({ ...input, submitted: input.submitted || undefined, today: new Date().toISOString().slice(0, 10) }), note: NTS_PACK_NOTE, asOf: NTS_PACK_AS_OF };
else if (tool === "student-loan") result = { ...studentLoanRepayment({ ...input, balance: input.balance || undefined }), note: NTS_PACK_NOTE, asOf: NTS_PACK_AS_OF };
else if (tool === "book-vs-estimate") result = { ...bookVsEstimate(input), note: NTS_PACK_NOTE, asOf: NTS_PACK_AS_OF };
else if (tool === "exempt-report") result = { ...exemptBusinessReport({ ...input, today: new Date().toISOString().slice(0, 10) }), note: NTS_PACK_NOTE, asOf: NTS_PACK_AS_OF };
else if (tool === "pension-income") result = { ...pensionIncomeChoice(input), note: NTS_PACK_NOTE, asOf: NTS_PACK_AS_OF };
else if (tool === "audit") result = { ...externalAuditCheck(input), note: ACCT_NOTE, acctAsOf: ACCT_AS_OF };
else if (tool === "withholding-table") result = { ...simplifiedWithholding(input), note: "소득세법 시행령 [별표 2] 근로소득 간이세액표(2026.2.27 개정). 10원 미만 버림. 지방소득세 10%. 자녀 차감 적용 시기와 77만 원 미만 처리는 원문 미확인.", asOf: PAYROLL_MONTH_AS_OF };
else if (tool === "join-leave") result = { ...joinLeaveMonths({ ...input, leave: input.leave || undefined, untilMonth: input.untilMonth || undefined }), note: "취득 다음 달부터 상실일 전날이 속한 달까지(1일 취득은 그 달부터). 국민연금은 희망하면 입사 달부터. 퇴사 달 고용보험은 실제 보수로 정산이라 금액을 더하지 않음(확인 필요).", asOf: PAYROLL_MONTH_AS_OF };
else if (tool === "leaver") result = { ...midYearLeaver(input), note: "퇴사 때 회사 정산(본인 기본공제·4대보험·표준세액공제)과 다음 해 5월 종합소득세 신고를 비교한 어림. 같은 해 재취업하면 새 회사가 합산 정산.", asOf: LEAVER_AS_OF };
else result = wacc(input);
console.log(JSON.stringify({ tool, asOf: ADVISORY_AS_OF, isEstimate: true, input, result }, null, 2));
