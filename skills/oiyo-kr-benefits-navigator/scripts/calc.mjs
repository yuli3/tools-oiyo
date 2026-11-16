#!/usr/bin/env node
// OIYO 지원금·노동권 길잡이 계산기. tools.oiyo.net과 같은 공식(kr-welfare-2026.mjs는 생성 파일, 고치지 않아요).
// Usage: node scripts/calc.mjs <tool> '<json>'   ·   node scripts/calc.mjs help
import { WELFARE_AS_OF, workChildCredit, maternityLeavePay, spouseLeavePay, wageGuarantee, injuryLeavePay, averageDailyWage, monthlyRentCredit, dbVsDc, breakEvenReturn, ordinaryWage, fixedOvertimeCheck, longTermCareCopay, dismissalNoticePay, shutdownAllowance, reducedHoursPay, probationMinWage, leavePromotionSchedule, voluntaryQuitCheck, directPaymentCheck, youthRentSupport, housingLoanBest, specialSupplyCheck } from "./kr-welfare-2026.mjs";
import { comprehensiveRealEstateTax, rentalIncomeTax } from "./kr-home-tax-2026.mjs";
import { dependentsTax, majorShareholderTax, familyLoanGift, freeUseGift, lowPriceSale, commercialRentCheck, smeYouthReduction, yellowUmbrella, vatTypeCompare, businessCarExpense, overseasCompare, officetelHouseCount, ticketPresaleTax, inheritedValuation, filingDeadlines } from "./kr-household-tax-2026.mjs";

const EXAMPLES = {
  "work-child-incentive": { household: "oneEarner", income: 24000000, assets: 120000000, children: 1, late: false },
  "maternity-leave": { monthlyWage: 3200000, priorityFirm: true, kind: "single" },
  "wage-guarantee": { kind: "simpleRetired", age: 35, monthlyWage: 3000000, unpaidMonths: 3, unpaidSeverance: 9000000, serviceYears: 3, afterReform: true },
  "injury-leave": { avgDailyWage: 120000, days: 60, threeMonthWages: null, calendarDays: 92 },
  "rent-credit": { income: 42000000, incomeType: "wage", monthlyRent: 600000, months: 12 },
  "pension-db-dc": { monthlyWage: 4000000, yearsServed: 5, yearsLeft: 20, wageGrowth: 0.03, dcReturn: 0.04 },
  "ordinary-wage": { basePay: 2500000, fixedAllowances: 300000, bonusAnnual: 6000000, bonusConditional: true, overtime: 20, night: 0, holiday: 0, holidayOver8: 0, monthlyHours: 209, smallFirm: false },
  "fixed-overtime": { basePay: 2508000, fixedOtPay: 300000, overtime: 30, night: 4, holiday: 0, months: 12, monthlyHours: 209, smallFirm: false },
  "comprehensive-real-estate-tax": { prices: [1500000000], oneHouse: true, corporate: false, age: 62, holdYears: 7 },
  "long-term-care": { grade: "3", kind: "home", reduction: "none", homeUse: null, days: 30, dailyExtra: 15000 },
  "dependents": { salary: 50000000, married: true, selfFemale: false, selfDisabled: false, people: [{ relation: "spouse", birthYear: 1990, wage: 4000000 }, { relation: "child", birthYear: 2015 }, { relation: "parent", birthYear: 1954 }] },
  "stock-major-shareholder": { market: "kospi", heldValue: 6000000000, heldShare: 0, gain: 500000000, sme: false, overOneYear: true, deductionUsed: false },
  "dismissal-notice": { monthlyOrdinaryWage: 3000000, weeklyHours: 40, noticeDays: 7, tenureMonths: 14, exception: "none", fivePlus: true },
  "shutdown-allowance": { threeMonthWages: 9000000, calendarDays: 92, monthlyOrdinaryWage: 2800000, shutdownDays: 30, paidDuringShutdown: 0, approvedReduction: false, fivePlus: true },
  "reduced-hours": { monthlyOrdinaryWage: 3000000, beforeHours: 40, afterHours: 30 },
  "probation-min-wage": { hourlyWage: 9300, contractMonths: 0, monthsIntoProbation: 1, simpleLabor: false },
  "leave-promotion": { kind: "annual", periodEnd: "2027-12-31" },
  "voluntary-quit": { reasons: ["unpaidWages"], months: 2, commuteHours: 0, careDays: 0, leaveRefused: false, insuredDays: 300 },
  "youth-rent": { age: 27, livesApart: true, ownsHome: false, youthIncome: 1400000, youthHousehold: 1, youthAssets: 30000000, parentIncome: 5000000, parentHousehold: 3, parentAssets: 300000000, deposit: 10000000, rent: 550000 },
  "housing-loan": { purpose: "jeonse", age: 29, income: 42000000, netAssets: 60000000, newlywed: false, children: 0, newbornWithin2y: false, firstTimeBuyer: true, metro: true, amount: 200000000, areaM2: 40, singleHousehold: true },
  "special-supply": { sector: "private", householdSize: 3, monthlyIncome: 9000000, dualIncome: true, realEstate: 0, noHome: true, neverOwned: true, marriedYears: 2, childUnder2: true, minorChildren: 1, taxPaid5y: true, elderParent3y: false },
  "subcontract-direct-pay": { cause: "twoMissed", missedInstallments: 2, requested: true, primeStopRequest: false, workValue: 50000000, receivedFromPrime: 10000000, ownerUnpaidToPrime: 30000000, daysSinceDelivery: 120 },
  "family-loan": { principal: 300000000, rate: 0, deductionLeft: 50000000 },
  "free-use": { propertyValue: 1500000000, coResiding: false, collateralLoan: 0, collateralInterest: 0, deductionLeft: 50000000 },
  "low-price-sale": { marketValue: 1100000000, price: 700000000, deductionLeft: 50000000 },
  "commercial-rent": { region: "seoul", deposit: 100000000, monthlyRent: 5000000, newDeposit: 100000000, newMonthlyRent: 5500000, monthsSinceLast: 24, baseRate: 0.03 },
  "sme-youth": { salary: 36000000, persons: 1, ageAtContract: 29, militaryMonths: 0, start: "2026-03" },
  "yellow-umbrella": { kind: "business", income: 35000000, paid: 6000000, otherDeductions: 1500000 },
  "vat-type": { sector: "retail", sales: 80000000, purchases: 35000000, cardShare: 0.8 },
  "business-car": { ownership: "own", amount: 60000000, otherCosts: 8000000, logbook: false, businessShare: 0.9, marginalRate: 0.264 },
  "overseas-etf": { gain: 15000000, otherFinancial: 3000000, marginalRate: 0.264, isaLowIncome: false },
  officetel: { price: 250000000, acquired: "2023-05-01", residentialUse: true, areaM2: 30, metro: true, firstSaleNew: false, otherHouses: 1, nextHomePrice: 800000000, nextRegulated: true },
  "ticket-presale": { kind: "ticket", gain: 300000000, holdYears: 8, original: true, preApprovalGain: 150000000, yearsToApproval: 6, oneHouseExempt: false, salePrice: 1100000000 },
  "inherited-valuation": { official: 600000000, appraisal: 900000000, otherEstate: 200000000, spouse: false, salePrice: 1000000000, yearsAfter: 1, appraisalFee: 2000000 },
  "filing-deadline": { kind: "inheritance", date: "2026-11-01", abroad: false, tax: 50000000, lateDays: 0 },
  "rental-income-tax": { houses: 2, annualRent: 12000000, deposits: 100000000, registered: false, otherIncome: 40000000, highPriceOneHouse: false },
};

const [tool, json] = process.argv.slice(2);
if (!tool || tool === "help" || !EXAMPLES[tool]) {
  console.log(`기준일 ${WELFARE_AS_OF}\ntools: ${Object.keys(EXAMPLES).join(", ")}\n`);
  for (const [k, v] of Object.entries(EXAMPLES)) console.log(`node scripts/calc.mjs ${k} '${JSON.stringify(v)}'`);
  process.exit(tool && tool !== "help" ? 1 : 0);
}
const i = { ...EXAMPLES[tool], ...(json ? JSON.parse(json) : {}) };
let result;
switch (tool) {
  case "work-child-incentive": result = workChildCredit(i); break;
  case "maternity-leave": result = { maternity: maternityLeavePay(i), spouse: spouseLeavePay(i.monthlyWage, i.priorityFirm) }; break;
  case "wage-guarantee": result = wageGuarantee(i); break;
  case "injury-leave": {
    const avg = i.threeMonthWages ? averageDailyWage(i.threeMonthWages, i.calendarDays ?? 92, i.annualBonus ?? 0, i.annualLeavePay ?? 0) : i.avgDailyWage;
    result = { avgDailyWage: Math.round(avg), ...injuryLeavePay({ avgDailyWage: avg, days: i.days }) };
    break;
  }
  case "rent-credit": result = monthlyRentCredit(i); break;
  case "pension-db-dc": {
    const r = dbVsDc(i);
    result = { db: r.db, dc: r.dc, diff: r.diff, better: r.better, finalWage: r.finalWage, breakEvenReturn: breakEvenReturn(i) };
    break;
  }
  case "ordinary-wage": result = ordinaryWage(i); break;
  case "fixed-overtime": result = fixedOvertimeCheck(i); break;
  case "comprehensive-real-estate-tax": result = comprehensiveRealEstateTax(i); break;
  case "rental-income-tax": result = rentalIncomeTax(i); break;
  case "dependents": result = dependentsTax(i); break;
  case "stock-major-shareholder": result = majorShareholderTax(i); break;
  case "dismissal-notice": result = dismissalNoticePay(i); break;
  case "shutdown-allowance": result = shutdownAllowance(i); break;
  case "reduced-hours": result = reducedHoursPay(i); break;
  case "probation-min-wage": result = probationMinWage(i); break;
  case "leave-promotion": result = leavePromotionSchedule(i.kind, i.periodEnd); break;
  case "voluntary-quit": result = voluntaryQuitCheck(i); break;
  case "subcontract-direct-pay": result = directPaymentCheck(i); break;
  case "youth-rent": result = youthRentSupport(i); break;
  case "housing-loan": result = housingLoanBest(i); break;
  case "special-supply": result = specialSupplyCheck(i); break;
  case "family-loan": result = familyLoanGift(i); break;
  case "free-use": result = freeUseGift(i); break;
  case "low-price-sale": result = lowPriceSale(i); break;
  case "commercial-rent": result = commercialRentCheck(i); break;
  case "sme-youth": result = smeYouthReduction(i); break;
  case "yellow-umbrella": result = yellowUmbrella(i); break;
  case "vat-type": result = vatTypeCompare(i); break;
  case "business-car": result = businessCarExpense(i); break;
  case "overseas-etf": result = overseasCompare(i); break;
  case "officetel": result = officetelHouseCount(i); break;
  case "ticket-presale": result = ticketPresaleTax(i); break;
  case "inherited-valuation": result = inheritedValuation(i); break;
  case "filing-deadline": result = filingDeadlines(i); break;
  case "long-term-care": result = longTermCareCopay({ ...i, homeUse: i.homeUse ?? undefined }); break;
}
console.log(JSON.stringify({ tool, asOf: WELFARE_AS_OF, input: i, result }, null, 2));
