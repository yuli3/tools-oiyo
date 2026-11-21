import { test } from "node:test";
import assert from "node:assert/strict";
import { twShift, twTaxCalendar, twProgressive, TW_PIT, twIncomeTax, twBusinessTax, twLateFee, twAppealDeadlines, twDepreciation, TW_SCOPE } from "./tw-tax-pack-2026.ts";

test("calendar 2026", () => {
  assert.equal(twShift("2026-03-15"), "2026-03-16");
  assert.equal(twShift("2026-03-14"), "2026-03-16");
  const r = twTaxCalendar({ year: 2026, company: true, today: "2026-11-21" });
  const by = Object.fromEntries(r.events.map((e) => [e.id, e]));
  assert.equal(by.annual.date, "2026-06-01");
  assert.equal(by.annual.from, "2026-05-01");
  assert.equal(by["bt-3"].date, "2026-03-16");
  assert.equal(by["bt-11"].date, "2026-11-16");
  assert.equal(by["bt-1"].date, "2026-01-15");
  assert.equal(by["bt-11"].daysLeft, -5);
  assert.equal(by.prepay.date, "2026-09-30");
  assert.match(by["bt-1"].label, /114年11-12月/);
  assert.equal(twTaxCalendar({ year: 2026, businessTax: "monthly" }).events.filter((e) => e.id.startsWith("bt")).length, 12);
  const n = twTaxCalendar({ year: 2027 });
  assert.equal(n.events.find((e) => e.id === "annual")!.date, "2027-05-31");
  assert.equal(n.items[0].tone, "warn");
});

test("individual income tax", () => {
  assert.equal(twProgressive(1_000_000, TW_PIT[2026].brackets), 1_000_000 * 0.12 - 42_700);
  assert.equal(twProgressive(3_000_000, TW_PIT[2026].brackets), 3_000_000 * 0.3 - 430_100);
  assert.equal(twProgressive(6_000_000, TW_PIT[2026].brackets), 6_000_000 * 0.4 - 949_100);
  const a = twIncomeTax({ year: 2025, salary: 1_000_000 });
  assert.equal(a.taxable, 554_000);
  assert.equal(a.tax, 27_700);
  assert.equal(a.basicLivingDiff, 0);
  const b = twIncomeTax({ year: 2026, salary: 1_000_000 });
  assert.equal(b.taxable, 536_000);
  assert.equal(b.tax, 26_800);
  assert.ok(b.items.some((i) => i.text.includes("尚未公告")));
  const f = twIncomeTax({ year: 2025, salary: 1_500_000, married: true, persons: 4 });
  assert.equal(f.basicLivingDiff, 213_000 * 4 - (97_000 * 4 + 262_000));
  assert.equal(twIncomeTax({ year: 2025, salary: 100_000, persons: 2, elderly: 1 }).exemptions, 97_000 + 145_500);
});

test("business tax threshold and 5%", () => {
  assert.equal(twBusinessTax({ goodsSales: 90_000 }).status, "below-threshold");
  assert.equal(twBusinessTax({ serviceSales: 50_000 }).status, "small-scale");
  assert.equal(twBusinessTax({ serviceSales: 50_000 }).tax, 500);
  const mix = twBusinessTax({ goodsSales: 60_000, serviceSales: 20_000 });
  assert.equal(mix.ratio, 1);
  assert.equal(mix.status, "small-scale");
  assert.equal(twBusinessTax({ goodsSales: 400_000, invoice: true, purchases: 100_000 }).tax, 15_000);
  assert.equal(twBusinessTax({ goodsSales: 100_000, invoice: true, purchases: 300_000 }).tax, -10_000);
});

test("late fee and appeal deadlines", () => {
  assert.equal(twLateFee({ tax: 100_000, due: "2026-06-01", paid: "2026-06-03" }).fee, 0);
  assert.equal(twLateFee({ tax: 100_000, due: "2026-06-01", paid: "2026-06-04" }).fee, 1_000);
  const l = twLateFee({ tax: 100_000, due: "2026-06-01", paid: "2026-08-01" });
  assert.equal(l.fee, 10_000);
  assert.ok(l.items.some((i) => i.text.includes("強制執行")));
  assert.equal(twLateFee({ tax: 1, due: "2026-06-01", paid: "2026-06-01", kind: "business" }).penaltyMaxMultiple, 5);
  const a = twAppealDeadlines({ paymentPeriodEnd: "2026-06-10", reviewDecision: "2026-09-01", petitionDecision: "2026-12-10", paid: "2026-06-01" });
  const by = Object.fromEntries(a.deadlines.map((d) => [d.id, d.date]));
  assert.equal(by.review, "2026-07-10");
  assert.equal(by.petition, "2026-10-01");
  assert.equal(by.lawsuit, "2027-02-10");
  assert.equal(by.refund, "2036-05-31");
  assert.equal(twAppealDeadlines({ paid: "2026-06-01", govFault: true }).deadlines[0].date, "2041-05-31");
});

test("depreciation", () => {
  const r = twDepreciation({ category: "computer", cost: 90_000, start: "2026-10-05" });
  assert.equal(r.years, 3);
  assert.equal(r.annual, 30_000);
  assert.equal(r.schedule[0].months, 3);
  assert.equal(r.schedule[0].amount, 7_500);
  assert.equal(r.schedule.reduce((s, x) => s + x.amount, 0), 90_000);
  assert.equal(r.schedule.at(-1)!.year, 2029);
  assert.equal(r.expensable, false);
  assert.equal(twDepreciation({ category: "tools", cost: 80_000, start: "2026-01-01" }).expensable, true);
  const short = twDepreciation({ category: "rc-building", cost: 5_000_000, start: "2026-01-01", years: 20, residual: 500_000 });
  assert.equal(short.years, 50);
  assert.equal(short.annual, 90_000);
  assert.equal(short.items[0].tone, "warn");
  assert.ok(TW_SCOPE.some((s) => s.body.includes("0800-000-321")));
});
