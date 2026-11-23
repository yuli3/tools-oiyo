#!/usr/bin/env node
// Financial planning guide (OIYO) — CLI. Logic: the same src/lib code as the tools.oiyo.net pages (vendored, do not edit those files here).
//   node scripts/calc.mjs <tool> '<json>'      node scripts/calc.mjs help
import { us401kLimit, usIraLimit, rothIraLimit, tradVsRoth, ukPensionRelief, COUNTRY_PENSION_4_AS_OF } from "./country-pension-4.mjs";
import { socialSecurityTable, pmiDates, ukStudentLoan, nisaPlan, COUNTRY_FINANCE_2_VERIFIED_ON } from "./country-finance-2.mjs";
import { lisaPlan, cpfRefund } from "./country-finance-3.mjs";
import { caStressTest, cnComboLoan, jpHousingLoanCredit, COUNTRY_FINANCE_5_AS_OF } from "./country-finance-5.mjs";
import { krNpsEarlyDefer, twLaborPensionVoluntary, deRiester, deBasisrente, auSuper, KR_NPS } from "./plan-gap-4-2026.mjs";
import { jpIdecoMonthlyLimit, japanIdecoSaving, chinaPensionSaving, francePerSaving, frPerCeilingSalarie, spainPensionLimit, PENSION_AS_OF } from "./pension-countries.mjs";

const S = (v) => (v === undefined || v === null ? "" : String(v));
export const EXAMPLES = {
  "us-limits": { age: 62, magi: 160000, filing: "single" },
  "us-trad-vs-roth": { contribution: 7000, years: 30, growth: 0.06, rateNow: 0.22, rateLater: 0.12 },
  "us-social-security": { birthDate: "1970-05-15", pia: 2000, lifeAge: 85 },
  "us-pmi": { value: 400000, loan: 360000, rate: 6, years: 30, extra: 0 },
  "uk-pension-relief": { earnings: 60000, netContribution: 4000 },
  "uk-lisa": { age: 30, balance: 0, yearly: 4000, growth: 4, targetAge: 50 },
  "uk-student-loan": { plan: "plan2", balance: 45000, salary: 35000, growth: 2, base: 4.1, thresholdGrowth: 0 },
  "jp-nisa": { used: 0, usedGrowth: 0, monthly: 100000, growthYear: 2400000, startYear: 2026 },
  "jp-ideco": { category: "employee", period: "current", otherMonthly: 0, salary: 6000000, otherIncome: 0, socialInsurance: 900000, spouse: false, dependents: 0, annualContribution: 276000 },
  "jp-housing-loan": { loan: 40000000, annualRatePct: 0.8, termYears: 35, borrowingLimit: 30000000, creditYears: 13, incomeTax: 150000, residentTaxCap: 97500 },
  "cn-pension": { income: 300000, socialInsurance: 30000, specialAdditional: 36000, otherDeductions: 0, contribution: 12000 },
  "cn-combo-loan": { fundAmount: 1000000, fundRatePct: 2.6, commercialAmount: 1000000, commercialRatePct: 3.5, years: 30, method: "annuity" },
  "fr-per": { revenusPro2025: 45000, revenu: 45000, couple: false, children: 0, versement: 5000, plafond: 0 },
  "es-pension": { individual: 1500, employer: 1000, workerEmployment: 2000, workIncomeOver60k: false, autonomo: 0, netIncome: 40000 },
  "sg-cpf-refund": { upfront: 50000, monthly: 1500, months: 120, rate: 2.5, price: 600000, loan: 400000 },
  "kr-nps-early-defer": { birthYear: 1966, monthly: 1000000, mode: "early", earlyYears: 3, deferMonths: 12, deferSharePct: 100, untilAge: 85 },
  "tw-labor-pension-voluntary": { monthlyWage: 50000, voluntaryPct: 6, marginalRatePct: 12 },
  "de-riester": { vorjahresEinnahmen: 40000, eigenbeitrag: 1125, kinderVor2008: 0, kinderAb2008: 1, berufseinsteiger: false, grenzsteuersatzPct: 30 },
  "de-basisrente": { jahr: 2025, beitrag: 5000, grvBeitraegeGesamt: 7440, zusammen: false, grenzsteuersatzPct: 30 },
  "au-super": { year: "2025-26", salary: 120000, salarySacrifice: 10000, personalDeductible: 0, unusedCarryForward: 0, tsbUnder500k: true, div293Income: 120000, nonConcessional: 0, marginalRatePct: 32 },
  "ca-stress-test": { grossAnnualIncome: 120000, contractRatePct: 4.5, amortizationYears: 25, propertyTaxMonthly: 350, heatingMonthly: 100, condoFeesMonthly: 0, otherDebtMonthly: 500 },
};
const ASOF = { us: COUNTRY_PENSION_4_AS_OF, f2: COUNTRY_FINANCE_2_VERIFIED_ON, f5: COUNTRY_FINANCE_5_AS_OF, p: PENSION_AS_OF };

export function run(tool, input) {
  const x = { ...EXAMPLES[tool], ...input };
  switch (tool) {
    case "us-limits": return { asOf: ASOF.us, k401: us401kLimit(x.age), ira: usIraLimit(x.age), roth: rothIraLimit(x.age, x.magi, x.filing) };
    case "us-trad-vs-roth": return { asOf: ASOF.us, ...tradVsRoth(x) };
    case "us-social-security": return { asOf: ASOF.f2, result: socialSecurityTable(x.birthDate, S(x.pia), S(x.lifeAge)) };
    case "us-pmi": return { asOf: ASOF.f2, result: pmiDates(S(x.value), S(x.loan), S(x.rate), S(x.years), x.extra ? S(x.extra) : "") };
    case "uk-pension-relief": return { asOf: ASOF.us, ...ukPensionRelief(x) };
    case "uk-lisa": return { asOf: ASOF.f2, result: lisaPlan(S(x.age), S(x.balance), S(x.yearly), S(x.growth), S(x.targetAge)) };
    case "uk-student-loan": return { asOf: ASOF.f2, result: ukStudentLoan(x.plan, S(x.balance), S(x.salary), S(x.growth), S(x.base), S(x.thresholdGrowth)) };
    case "jp-nisa": return { asOf: ASOF.f2, result: nisaPlan(S(x.used), S(x.usedGrowth), S(x.monthly), S(x.growthYear), S(x.startYear)) };
    case "jp-ideco": return { asOf: ASOF.p, monthlyLimit: jpIdecoMonthlyLimit(x.category, x.period, x.otherMonthly), saving: japanIdecoSaving(x) };
    case "jp-housing-loan": return { asOf: ASOF.f5, ...jpHousingLoanCredit(x) };
    case "cn-pension": return { asOf: ASOF.p, ...chinaPensionSaving(x) };
    case "cn-combo-loan": return { asOf: ASOF.f5, ...cnComboLoan(x) };
    case "fr-per": {
      const plafond = x.plafond > 0 ? x.plafond : frPerCeilingSalarie(x.revenusPro2025);
      return { asOf: ASOF.p, plafond, ...francePerSaving({ ...x, plafond }) };
    }
    case "es-pension": return { asOf: ASOF.p, ...spainPensionLimit(x) };
    case "sg-cpf-refund": return { asOf: ASOF.f2, result: cpfRefund(S(x.upfront), S(x.monthly), S(x.months), S(x.rate), S(x.price), S(x.loan)) };
    case "ca-stress-test": return { asOf: ASOF.f5, ...caStressTest(x) };
    case "kr-nps-early-defer": return { asOf: KR_NPS.asOf, ...krNpsEarlyDefer(x) };
    case "tw-labor-pension-voluntary": return { asOf: KR_NPS.asOf, ...twLaborPensionVoluntary(x) };
    case "de-riester": return { asOf: KR_NPS.asOf, ...deRiester(x) };
    case "de-basisrente": return { asOf: KR_NPS.asOf, ...deBasisrente(x) };
    case "au-super": return { asOf: KR_NPS.asOf, ...auSuper(x) };
    default: return null;
  }
}

if (process.argv[1] && process.argv[1].endsWith("calc.mjs")) {
  const [tool, json] = process.argv.slice(2);
  if (!tool || tool === "help" || !EXAMPLES[tool]) {
    console.log(`tools: ${Object.keys(EXAMPLES).join(", ")}\n`);
    for (const [k, v] of Object.entries(EXAMPLES)) console.log(`node scripts/calc.mjs ${k} '${JSON.stringify(v)}'`);
    process.exit(tool && tool !== "help" ? 1 : 0);
  }
  const input = json ? JSON.parse(json) : {};
  console.log(JSON.stringify({ tool, isEstimate: true, input: { ...EXAMPLES[tool], ...input }, result: run(tool, input) }, null, 2));
}
