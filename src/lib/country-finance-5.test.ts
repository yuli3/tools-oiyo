import assert from "node:assert/strict";
import { test } from "node:test";
import { caQualifyingRate, caStressTest, cnComboLoan, cnLoan, jpHousingLoanCredit, mxCat } from "./country-finance-5.ts";

const near = (a: number, b: number, tol = 1) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

test("Canada B-20 qualifying rate is max(5.25%, contract + 2%)", () => {
  assert.equal(caQualifyingRate(4.5), 6.5);
  assert.equal(caQualifyingRate(3), 5.25);
});

test("Canada stress test: GDS-bound maximum mortgage at the qualifying rate", () => {
  const r = caStressTest({ grossAnnualIncome: 120_000, contractRatePct: 4.5, amortizationYears: 25, propertyTaxMonthly: 350, heatingMonthly: 100, condoFeesMonthly: 0, otherDebtMonthly: 500 });
  assert.equal(r.maxPayment, 3_450); // 0.39 × 10,000 − 450 (TDS room 3,950 is larger)
  assert.equal(r.bindingRatio, "GDS");
  near(r.maxMortgage, 515_061);
  assert.ok(r.actualPayment < r.maxPayment);
  const debtHeavy = caStressTest({ grossAnnualIncome: 120_000, contractRatePct: 4.5, amortizationYears: 25, propertyTaxMonthly: 350, heatingMonthly: 100, condoFeesMonthly: 0, otherDebtMonthly: 1_500 });
  assert.equal(debtHeavy.bindingRatio, "TDS");
  assert.equal(debtHeavy.maxPayment, 2_450);
});

test("Mexico CAT equals the effective annual rate when there are no fees", () => {
  const r = mxCat({ amount: 100_000, annualRatePct: 30, months: 24, openingCommissionPct: 0, monthlyFee: 0 });
  near(r.catPct, (Math.pow(1.025, 12) - 1) * 100, 0.001);
  const withFees = mxCat({ amount: 100_000, annualRatePct: 30, months: 24, openingCommissionPct: 2, monthlyFee: 100 });
  assert.ok(withFees.catPct > r.catPct);
  near(withFees.catPct, 40.04, 0.01);
});

test("China combo loan sums two loans and equal-principal interest formula", () => {
  const r = cnComboLoan({ fundAmount: 1_000_000, fundRatePct: 2.6, commercialAmount: 1_000_000, commercialRatePct: 3.5, years: 30, method: "annuity" });
  near(r.fund.firstMonth, 4_003.4, 0.1);
  near(r.firstMonth, 8_493.84, 0.01);
  assert.ok(r.savedVsAllCommercial > 0);
  const ep = cnLoan(1_200_000, 3.6, 10, "equalPrincipal");
  near(ep.firstMonth, 13_600, 0.001);
  near(ep.lastMonth, 10_030, 0.001);
  near(ep.totalInterest, 217_800, 0.001);
});

test("Japan housing loan credit: 0.7% of capped balance, income tax first, then resident tax", () => {
  const r = jpHousingLoanCredit({ loan: 40_000_000, annualRatePct: 0.8, termYears: 35, borrowingLimit: 30_000_000, creditYears: 13, incomeTax: 150_000, residentTaxCap: 97_500 });
  assert.equal(r.rows.length, 13);
  assert.equal(r.rows[0].credit, 210_000); // limit 30M × 0.7%
  assert.equal(r.rows[0].fromIncomeTax, 150_000);
  assert.equal(r.rows[0].fromResidentTax, 60_000);
  assert.equal(r.rows[12].credit % 100, 0);
  assert.ok(r.rows[12].yearEndBalance < 30_000_000);
  const capped = jpHousingLoanCredit({ loan: 40_000_000, annualRatePct: 0.8, termYears: 35, borrowingLimit: 30_000_000, creditYears: 13, incomeTax: 50_000, residentTaxCap: 200_000 });
  assert.equal(capped.rows[0].fromResidentTax, 97_500); // statutory max
  assert.equal(capped.rows[0].unused, 210_000 - 50_000 - 97_500);
});
