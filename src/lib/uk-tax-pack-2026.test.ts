import { test } from "node:test";
import assert from "node:assert/strict";
import { ukTaxCalendar, ukIncomeTax, ukMtdStart, ukSelfEmployed, ukVatCheck, ukInterest, ukSaPenalties, ukAppealDeadlines, ukCapitalAllowances, UK_SCOPE } from "./uk-tax-pack-2026.ts";

test("Self Assessment, MTD, Corporation Tax and VAT dates", () => {
  const r = ukTaxCalendar({ taxYear: 2025, newToSA: true, mtd: true, companyYearEnd: "2026-03-31", vatPeriodEnd: "2026-03-31", today: "2026-11-21" });
  const by = Object.fromEntries(r.events.map((e) => [e.id, e]));
  assert.equal(r.taxYear, "2025-26");
  assert.equal(by.register.date, "2026-10-05");
  assert.equal(by.paper.date, "2026-10-31");
  assert.equal(by.online.date, "2027-01-31");
  assert.equal(by.online.daysLeft, 71);
  assert.equal(by.poa2.date, "2027-07-31");
  assert.equal(by["mtd-q1"].date, "2025-08-07");
  assert.equal(by["mtd-q3"].date, undefined);
  assert.equal(by["ct-pay"].date, "2027-01-01");
  assert.equal(by["ct-return"].date, "2027-03-31");
  assert.equal(by.vat.date, "2026-05-07");
  assert.equal(r.events.at(-1)!.id, "mtd-q3");
  assert.equal(ukTaxCalendar({ taxYear: 2026 }).events.some((e) => e.id === "register"), false);
});

test("income tax, personal allowance taper and Class 4 NI", () => {
  assert.equal(ukIncomeTax(50_270).tax, 7_540);
  const t = ukIncomeTax(110_000);
  assert.equal(t.personalAllowance, 7_570);
  assert.equal(t.tax, 7_540 + 25_892);
  assert.equal(ukIncomeTax(130_000).personalAllowance, 0);
  const s = ukSelfEmployed({ profit: 40_000 });
  assert.equal(s.incomeTaxOnProfit, 5_486);
  assert.equal(s.class4, 1_645.8);
  assert.equal(s.total, 7_131.8);
  assert.equal(s.class2Due, "treated-as-paid");
  assert.equal(ukSelfEmployed({ profit: 6_000 }).class2Due, "voluntary");
  const hi = ukSelfEmployed({ profit: 60_000, otherIncome: 20_000 });
  assert.equal(hi.class4, Math.round(((50_270 - 12_570) * 0.06 + (60_000 - 50_270) * 0.02) * 100) / 100);
  assert.equal(ukMtdStart({ qi2425: 60_000 }), "2026-04-06");
  assert.equal(ukMtdStart({ qi2526: 35_000 }), "2027-04-06");
  assert.equal(ukMtdStart({ qi2627: 25_000 }), "2028-04-06");
  assert.equal(ukMtdStart({ qi2627: 20_000 }), null);
  assert.equal(ukSelfEmployed({ profit: 55_000, qi2425: 55_000 }).mtdFrom, "2026-04-06");
});

test("VAT registration and Flat Rate Scheme", () => {
  assert.equal(ukVatCheck({ last12: 91_000 }).status, "must-register");
  assert.equal(ukVatCheck({ last12: 10_000, next30: 95_000 }).status, "must-register");
  const b = ukVatCheck({ last12: 80_000, next12: 140_000 });
  assert.equal(b.status, "below");
  assert.equal(b.headroom, 10_000);
  assert.match(b.items[1].text, /can join/);
  assert.equal(ukVatCheck({ last12: 87_000, registered: true }).status, "can-deregister");
  assert.equal(ukVatCheck({ last12: 120_000, registered: true }).status, "registered");
});

test("penalties, interest and appeal dates", () => {
  const i = ukInterest(10_000, "2025-12-30", "2026-01-10");
  assert.equal(i.unknownDays, 10);
  assert.equal(i.interest, Math.round(10_000 * 0.0775 / 365 * 100) / 100);
  const p = ukSaPenalties({ tax: 2_000, taxYear: 2024, filed: "2026-08-15", paid: "2026-03-15" });
  assert.equal(p.due, "2026-01-31");
  assert.equal(p.filing, 100 + 900 + 300);
  assert.equal(p.payment, 100);
  assert.equal(p.interest, Math.round(2_000 * 0.0775 * 43 / 365 * 100) / 100);
  const big = ukSaPenalties({ tax: 20_000, taxYear: 2024, filed: "2027-03-01" });
  assert.equal(big.filing, 100 + 900 + 1_000 + 1_000);
  assert.equal(ukSaPenalties({ tax: 1_000, taxYear: 2024, filed: "2026-01-30", paid: "2026-01-31" }).total, 0);
  const late = ukInterest(1_000, "2026-11-23", "2026-11-25");
  assert.equal(late.interest, Math.round((1_000 * 0.0775 / 365 + 1_000 * 0.08 / 365) * 100) / 100);
  const a = ukAppealDeadlines({ decision: "2026-11-21", taxYear: 2022 });
  assert.equal(a[0].date, "2026-12-21");
  assert.equal(a[1].date, "2027-04-05");
});

test("capital allowances", () => {
  const r = ukCapitalAllowances({ cost: 50_000, pool: "main", company: true, date: "2026-06-01" });
  const by = Object.fromEntries(r.options.map((o) => [o.id, o.firstYear]));
  assert.deepEqual(by, { aia: 50_000, "full-expensing": 50_000, fya40: 20_000, wda: 7_000 });
  assert.equal(r.wda[0].pool, 43_000);
  const sp = ukCapitalAllowances({ cost: 10_000, pool: "special", company: true, date: "2026-06-01", aiaUsed: 995_000 });
  assert.equal(sp.options.find((o) => o.id === "aia")!.firstYear, 5_000);
  assert.equal(sp.options.find((o) => o.id === "fya50")!.firstYear, 5_000);
  assert.equal(sp.options.find((o) => o.id === "wda")!.firstYear, 600);
  const car = ukCapitalAllowances({ cost: 20_000, pool: "main", date: "2026-06-01", car: true });
  assert.deepEqual(car.options.map((o) => o.id), ["wda"]);
  assert.equal(ukCapitalAllowances({ cost: 2_000, pool: "main", date: "2026-06-01", cashBasis: true }).options.length, 0);
  assert.ok(UK_SCOPE.every((s) => !/AI tax adviser|chartered/i.test(s.title)));
});
