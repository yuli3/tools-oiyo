import { test } from "node:test";
import assert from "node:assert/strict";
import { jpTaxCalendar, jpBlueReturn, jpConsumptionTax, jpPenalty, jpAppealDeadlines, jpDepreciation, straightRate, jpShift, JP_SCOPE } from "./jp-tax-pack-2026.ts";

test("calendar: 2027 deadlines and weekend shift", () => {
  const r = jpTaxCalendar({ year: 2027, consumptionTax: true, prepaid: true, today: "2027-03-01" });
  const by = Object.fromEntries(r.events.map((e) => [e.id, e]));
  assert.equal(by.income.date, "2027-03-15"); // Monday
  assert.equal(by.income.daysLeft, 14);
  assert.equal(by.consumption.date, "2027-03-31");
  assert.equal(by.prepay1.date, "2027-08-02"); // 7/31 Sat → 8/2 Mon
  assert.equal(by.prepay2.date, "2027-11-30");
  assert.equal(by.blue.date, "2027-03-15");
  // 2026-03-15 is Sunday → 3/16
  assert.equal(jpTaxCalendar({ year: 2026 }).events.find((e) => e.id === "income")!.date, "2026-03-16");
  assert.equal(jpShift(new Date(Date.UTC(2026, 10, 28))).toISOString().slice(0, 10), "2026-11-30");
});

test("calendar: business started after 1/16 → 2 months", () => {
  const r = jpTaxCalendar({ year: 2027, started: "2027-05-20" });
  assert.equal(r.events.find((e) => e.id === "blue")!.date, "2027-07-20");
  const r2 = jpTaxCalendar({ year: 2027, started: "2027-12-31" });
  assert.equal(r2.events.find((e) => e.id === "blue")!.date, "2028-02-29");
});

test("blue return: 65万 saves more than 10万, white saving 0", () => {
  const r = jpBlueReturn({ income: 5_000_000 });
  assert.equal(r.rows[0].saving, 0);
  assert.ok(r.rows[3].saving > r.rows[2].saving && r.rows[2].saving > r.rows[1].saving && r.rows[1].saving > 0);
  // resident tax diff 65万 vs white = 65,000
  assert.equal(r.rows[0].residentTax - r.rows[3].residentTax, 65_000);
  assert.equal(jpBlueReturn({ income: 300_000 }).rows[3].total, 0);
});

test("consumption tax: exempt, invoice, simple and 2割/3割", () => {
  assert.equal(jpConsumptionTax({ year: 2026, baseSales: 8_000_000, sales: 8_000_000 }).exempt, true);
  const spec = jpConsumptionTax({ year: 2026, baseSales: 8_000_000, specSales: 11_000_000, specWages: 11_000_000, sales: 20_000_000 });
  assert.equal(spec.exempt, false);
  const inv = jpConsumptionTax({ year: 2026, baseSales: 8_000_000, invoice: true, wasExempt: true, sales: 8_000_000, purchases: 1_000_000, type: 5 });
  assert.equal(inv.exempt, false);
  assert.equal(inv.outTax, 800_000);
  assert.equal(inv.methods.find((m) => m.id === "twenty")!.tax, 160_000);
  assert.equal(inv.best, "twenty");
  const y27 = jpConsumptionTax({ year: 2027, baseSales: 8_000_000, invoice: true, wasExempt: true, sales: 8_000_000, type: 5 });
  assert.equal(y27.methods.find((m) => m.id === "twenty")!.ok, false);
  assert.equal(y27.methods.find((m) => m.id === "thirty")!.tax, 240_000);
  assert.equal(y27.best, "thirty");
  const big = jpConsumptionTax({ year: 2026, baseSales: 60_000_000, sales: 60_000_000, purchases: 40_000_000, type: 1 });
  assert.equal(big.methods.find((m) => m.id === "simple")!.ok, false);
  assert.equal(big.best, "general");
});

test("penalty: 無申告 at audit, 過少, fraud, delinquency", () => {
  assert.equal(jpPenalty({ kind: "none", stage: "audit", tax: 1_000_000 }).additionalTax, 175_000);
  assert.equal(jpPenalty({ kind: "none", stage: "voluntary", tax: 1_000_000 }).additionalTax, 50_000);
  assert.equal(jpPenalty({ kind: "none", stage: "notice", tax: 4_000_000 }).additionalTax, 50_000 + 375_000 + 250_000);
  // 過少: original 400万, add 600万 at audit → 400万×10% + 200万×15% = 70万
  assert.equal(jpPenalty({ kind: "under", stage: "audit", tax: 6_000_000, original: 4_000_000 }).additionalTax, 700_000);
  assert.equal(jpPenalty({ kind: "under", stage: "voluntary", tax: 6_000_000 }).additionalTax, 0);
  assert.equal(jpPenalty({ kind: "under", stage: "notice", tax: 90_000 }).additionalTax, 0); // 4,500 < 5,000
  assert.equal(jpPenalty({ kind: "under", stage: "audit", fraud: true, tax: 1_000_000 }).additionalTax, 350_000);
  // 延滞税: 100万, 3/15→6/15 (92 days; 2か月=61日 low, 31日 high)
  const p = jpPenalty({ kind: "none", stage: "voluntary", tax: 1_000_000, deadline: "2027-03-15", paid: "2027-06-15" });
  assert.equal(p.lateDays, 92);
  assert.equal(p.delinquency, Math.floor((1_000_000 * 0.028 * 61 / 365 + 1_000_000 * 0.091 * 31 / 365) / 100) * 100);
});

test("appeal deadlines", () => {
  const r = jpAppealDeadlines({ noticed: "2026-11-30", reinvestigationDecided: "2027-01-31" });
  assert.equal(r[0].date, "2027-03-01"); // 2/28 Sun → 3/1
  assert.equal(r[1].date, "2027-03-01"); // 2/28 Sun → 3/1
  assert.equal(r[2].date, "2027-11-30");
});

test("depreciation", () => {
  assert.equal(straightRate(6), 0.167);
  assert.equal(straightRate(22), 0.046);
  assert.equal(straightRate(4), 0.25);
  assert.equal(jpDepreciation({ cost: 90_000, life: 4, acquired: "2026-05-01" }).treatment, "expense");
  assert.equal(jpDepreciation({ cost: 350_000, life: 4, acquired: "2026-05-01", blue: true, sme: true }).treatment, "sme");
  assert.equal(jpDepreciation({ cost: 350_000, life: 4, acquired: "2026-03-01", blue: true, sme: true }).treatment, "depreciate");
  assert.equal(jpDepreciation({ cost: 150_000, life: 4, acquired: "2026-03-01" }).treatment, "lump3");
  const d = jpDepreciation({ cost: 1_200_000, life: 4, acquired: "2026-10-15" });
  assert.equal(d.firstYear, 75_000); // 300,000 × 3/12
  assert.equal(d.schedule.at(-1)!.book, 1);
  assert.equal(d.schedule.reduce((s, r) => s + r.amount, 0), 1_199_999);
  assert.ok(JP_SCOPE.length >= 6);
});
