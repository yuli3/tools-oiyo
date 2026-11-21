import { test } from "node:test";
import assert from "node:assert/strict";
import { cnTaxCalendar, progressive, IIT_BUSINESS, IIT_COMPREHENSIVE, cnBusinessIncome, cnComprehensive, cnSmallProfitCit, cnSmallScaleVat, cnLateFee, cnAppealDeadlines, cnDepreciation, cnShift, CN_SCOPE } from "./cn-tax-pack-2026.ts";

test("calendar 2026", () => {
  const r = cnTaxCalendar({ year: 2026, vat: "quarter", business: "month", today: "2026-11-21" });
  const by = Object.fromEntries(r.events.map((e) => [e.id, e]));
  assert.equal(by["vat-1"].date, "2026-01-20");
  assert.equal(by["vat-4"].date, "2026-04-20");
  assert.equal(by["vat-10"].date, "2026-10-26");
  assert.equal(by["biz-2"].date, "2026-02-24");
  assert.equal(by["biz-12"].date, "2026-12-15");
  assert.equal(by["biz-12"].daysLeft, 24);
  assert.equal(by["iit-annual"].from, "2026-03-01");
  assert.equal(by["biz-annual"].date, "2026-03-31");
  assert.match(by["vat-4"].label, /2026年第1季度/);
  const o = cnTaxCalendar({ year: 2027, vat: "month" });
  assert.equal(o.items[0].tone, "warn");
  assert.ok(o.events.filter((e) => e.id.startsWith("vat")).every((e) => !e.date));
  assert.equal(cnShift(new Date(Date.UTC(2026, 7, 15))).toISOString().slice(0, 10), "2026-08-17");
});

test("individual income tax", () => {
  assert.equal(progressive(36_000, IIT_COMPREHENSIVE), 1_080);
  assert.equal(progressive(144_000, IIT_COMPREHENSIVE), 1_080 + 10_800);
  assert.equal(progressive(100_000, IIT_BUSINESS), 1_500 + 6_000 + 2_000);
  const b = cnBusinessIncome({ taxable: 100_000 });
  assert.equal(b.relief, 4_750);
  assert.equal(b.payable, 4_750);
  const big = cnBusinessIncome({ taxable: 4_000_000 });
  assert.equal(big.relief, Math.round(big.tax * 0.5 * 0.5 * 100) / 100);
  assert.equal(cnComprehensive({ income: 96_000 }).tax, 1_080);
  assert.equal(cnSmallProfitCit({ taxable: 1_000_000, employees: 20, assets: 3_000_000 }).tax, 50_000);
  assert.equal(cnSmallProfitCit({ taxable: 3_500_000, employees: 20, assets: 3_000_000 }).eligible, false);
});

test("small-scale VAT 起征点 is all-or-nothing", () => {
  assert.equal(cnSmallScaleVat({ sales: 99_999, period: "month" }).tax, 0);
  assert.equal(cnSmallScaleVat({ sales: 100_000, period: "month" }).tax, 1_000);
  assert.equal(cnSmallScaleVat({ sales: 310_000, period: "quarter" }).tax, 3_100);
  assert.equal(cnSmallScaleVat({ sales: 310_000, period: "quarter", realEstate: true }).rate, null);
  assert.ok(cnSmallScaleVat({ sales: 500_000, period: "quarter", annualSales: 6_000_000 }).items.some((i) => i.cite.includes("第9条")));
});

test("late fee and appeals", () => {
  const f = cnLateFee({ tax: 10_000, due: "2026-05-22", paid: "2026-06-21" });
  assert.equal(f.days, 30);
  assert.equal(f.fee, 150);
  assert.deepEqual(f.fineRange, [5_000, 50_000]);
  const a = cnAppealDeadlines({ known: "2026-03-02", kind: "penalty", decision: "2026-06-01", paid: "2026-01-20" });
  const by = Object.fromEntries(a.deadlines.map((d) => [d.id, d.date]));
  assert.equal(by.fuyi, "2026-05-01");
  assert.equal(by.susong, "2026-09-02");
  assert.equal(by["after-fuyi"], "2026-06-16");
  assert.equal(by.refund, "2029-01-20");
});

test("depreciation", () => {
  const s = cnDepreciation({ category: "electronics", cost: 30_000, start: "2026-03-10" });
  assert.equal(s.firstMonth, "2026-04");
  assert.equal(s.years, 3);
  assert.equal(s.schedule[0].amount, 10_000);
  assert.equal(cnDepreciation({ category: "electronics", cost: 30_000, start: "2026-03-10", years: 2 }).years, 3);
  const d = cnDepreciation({ category: "machinery", cost: 100_000, start: "2026-01-15", method: "double", accelerated: true, years: 6 });
  assert.equal(d.years, 6);
  assert.equal(d.schedule[0].amount, Math.round(100_000 / 3 * 100) / 100);
  assert.equal(d.schedule.at(-1)?.nbv, 0);
  const y = cnDepreciation({ category: "tools", cost: 15_000, start: "2026-01-15", method: "sum", accelerated: true, years: 5 });
  assert.equal(y.schedule[0].amount, 5_000);
  assert.equal(cnDepreciation({ category: "machinery", cost: 800_000, start: "2026-02-01", oneOff: true }).method, "one-off");
  assert.equal(cnDepreciation({ category: "buildings", cost: 800_000, start: "2026-02-01", oneOff: true }).method, "straight");
  assert.ok(CN_SCOPE.length >= 5);
});
