#!/usr/bin/env node
// OIYO kr-tax-advisor skill calculator. Same formulas as tools.oiyo.net (vendored, do not edit here).
// Usage: node scripts/calc.mjs <tool> '<json>'
import { taxPenalty, nextReductionStep, PENALTY_NOTE, PENALTY_AS_OF } from "./kr-tax-penalty-2026.mjs";
import { corpTax, entertainmentLimit, CORP_TAX_AS_OF, CORP_TAX_NOTE } from "./kr-corp-tax-2026.mjs";
import { valueUnlistedShares, familyBusinessInheritance, incorporationConversion, dcfValuation, dcfSensitivity, wacc, ADVISORY_AS_OF } from "./kr-advisory-2026.mjs";

const EXAMPLES = {
  "unlisted-shares": { sharesOutstanding: 100000, netIncome: [600000000, 500000000, 400000000], netAssets: 3000000000, goodwill: 0, realEstateRatio: 0.2, netAssetOnlyReason: false, heldShares: 60000, isMajorityHolder: true, premiumExempt: true },
  "family-business": { businessValue: 10000000000, unrelatedAssetRatio: 0.1, years: 15, size: "sme", otherEstate: 2000000000, netFinancial: 300000000, debts: 0, funeralSpent: 10000000, hasSpouse: true, spouseInherited: 500000000 },
  "incorporation-conversion": { business: "general", realEstateMarket: 1000000000, realEstateCost: 400000000, holdYears: 10, otherAssets: 300000000, liabilities: 500000000, acquisitionBase: 0 },
  dcf: { revenue0: 10000000000, growth: 0.1, ebitMargin: 0.12, taxRate: 0.22, daRatio: 0.03, capexRatio: 0.04, nwcRatio: 0.15, wacc: 0.1, terminalGrowth: 0.02, netDebt: 2000000000, shares: 1000000, years: 5, midYear: false },
  "corp-tax": { size: "sme", profit: 500000000, addBack: 0, deduct: 0, months: 12, revenue: 15000000000, relatedRevenue: 0, entertainment: 80000000, cultureEntertainment: 0, entertainmentNoProof: 0, specialDonation: 0, generalDonation: 10000000, losses: 0, credits: 0, creditsOutside: 0, prepaid: 0, smallRealEstate: false },
  entertainment: { size: "sme", months: 12, revenue: 15000000000, relatedRevenue: 0, spent: 80000000, cultureSpent: 0, noProof: 0 },
  penalty: { kind: "none", tax: 10000000, fraud: false, revenue: 0, due: "2026-06-01", filed: "2026-06-21", paid: "", noticed: false },
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
else result = wacc(input);
console.log(JSON.stringify({ tool, asOf: ADVISORY_AS_OF, isEstimate: true, input, result }, null, 2));
