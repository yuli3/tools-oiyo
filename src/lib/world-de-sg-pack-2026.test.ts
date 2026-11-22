import { test } from "node:test";
import assert from "node:assert/strict";
import { deTarif, deIncomeTax, deNoticePeriod, deMinimumWage, deEInvoice, sgCpf, sgNotice } from "./world-de-sg-pack-2026.ts";

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
