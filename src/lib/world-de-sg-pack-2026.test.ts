import { test } from "node:test";
import assert from "node:assert/strict";
import { deTarif, deSoli, deIncomeTax, deNoticePeriod, deMinimumWage, deEInvoice, sgCpf, sgNotice, sgResidentTax, sgIncomeTax } from "./world-de-sg-pack-2026.ts";

test("de tarif zones", () => {
  assert.equal(deTarif(12_348), 0);
  assert.equal(deTarif(17_799), Math.floor((914.51 * 0.5451 + 1400) * 0.5451));
  assert.equal(deTarif(100_000), Math.floor(0.42 * 100_000 - 11_135.63));
  assert.equal(deTarif(300_000), Math.floor(0.45 * 300_000 - 19_470.38));
  assert.equal(deIncomeTax({ zvE: 100_000, joint: true }).tax, 2 * deTarif(50_000));
  // zone continuity at 69 878 / 69 879
  assert.ok(Math.abs(deTarif(69_879) - deTarif(69_878)) <= 1);
});
test("de notice", () => {
  assert.equal(deNoticePeriod({ noticeDate: "2026-11-02", by: "employee" }).end, "2026-11-30");
  assert.equal(deNoticePeriod({ noticeDate: "2026-11-17", by: "employee" }).end, "2026-12-15");
  assert.equal(deNoticePeriod({ noticeDate: "2026-11-20", startDate: "2020-01-01", by: "employer" }).end, "2027-01-31");
  assert.equal(deNoticePeriod({ noticeDate: "2026-11-20", startDate: "2020-01-01", by: "employee" }).end, "2026-12-31");
  assert.equal(deNoticePeriod({ noticeDate: "2026-11-20", by: "employer", probation: true }).end, "2026-12-04");
});
test("de min wage, e-invoice", () => {
  assert.equal(deMinimumWage({ date: "2026-11-22", hourly: 13 }).belowMinimum, true);
  assert.equal(deMinimumWage({ date: "2027-02-01" }).minimumWage, 14.6);
  assert.equal(deEInvoice({ turnover2026: 900_000 }).issueFrom, "2027-01-01");
  assert.equal(deEInvoice({ turnover2026: 500_000 }).issueFrom, "2028-01-01");
});
test("sg cpf and notice", () => {
  const r = sgCpf({ monthlyWage: 5000, age: 30 });
  assert.equal(r.employer, 850); assert.equal(r.employee, 1000);
  assert.equal(sgCpf({ monthlyWage: 10_000, age: 58 }).employee, 1440);
  assert.equal(sgCpf({ monthlyWage: 700, age: 30 }).computed, false);
  assert.equal(sgNotice({ startDate: "2020-01-01", noticeDate: "2026-11-02" }).lastDay, "2026-11-29");
  assert.equal(sgNotice({ startDate: "2026-09-01", noticeDate: "2026-11-02" }).lastDay, "2026-11-02");
  assert.equal(sgNotice({ startDate: "2025-01-01", noticeDate: "2026-11-02" }).days, 7);
});
test("de soli", () => {
  assert.equal(deSoli(20_350), 0);
  assert.equal(deSoli(21_000), Math.floor(650 * 0.119 * 100) / 100);
  assert.equal(deSoli(100_000), 5_500);
  assert.equal(deSoli(40_000, true), 0);
  assert.equal(deIncomeTax({ zvE: 300_000 }).soli, Math.floor(deTarif(300_000) * 0.055 * 100) / 100);
});
test("sg income tax (IRAS cumulative)", () => {
  for (const [c, t] of [[20_000, 0], [30_000, 200], [40_000, 550], [80_000, 3_350], [120_000, 7_950], [160_000, 13_950], [200_000, 21_150], [240_000, 28_750], [280_000, 36_550], [320_000, 44_550], [500_000, 84_150], [1_000_000, 199_150]] as const) assert.equal(sgResidentTax(c), t);
  assert.equal(sgIncomeTax({ chargeableIncome: 80_000, resident: true, ya: 2025 }).payable, 3_150);
  assert.equal(sgIncomeTax({ chargeableIncome: 80_000, resident: true, ya: 2026 }).rebate, 0);
  assert.equal(sgIncomeTax({ chargeableIncome: 0, resident: false, employmentIncome: 50_000 }).tax, 7_500);
  assert.equal(sgIncomeTax({ chargeableIncome: 0, resident: false, employmentIncome: 600_000 }).tax, sgResidentTax(600_000));
});
