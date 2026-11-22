import { test } from "node:test";
import assert from "node:assert/strict";
import { service, jpLaborExit, ukLaborExit, usLaborExit, frLaborExit, esLaborExit, cnLaborExit, twLaborExit } from "./world-labor-pack-2026.ts";

test("service length", () => {
  assert.deepEqual(service("2020-04-01", "2026-03-31"), { years: 5, months: 11, totalMonths: 71, exactYears: 71 / 12 });
  assert.equal(service("2020-04-01", "2026-04-01").years, 6);
});

test("Japan", () => {
  const r = jpLaborExit({ start: "2016-04-01", end: "2026-10-31", age: 40, insuredYears: 10, reason: "dismissal", dailyAverageWage: 12_000, noticeDays: 10, hourlyWage: 1_250, region: "tokyo" });
  assert.equal(r.noticePay, 240_000);
  assert.equal(r.benefitDays, 240);
  assert.equal(r.paidLeaveDays, 20);
  assert.ok(r.items.some((i) => i.tone === "warn" && i.text.includes("1280")));
  assert.equal(r.dates[0].date, "2029-10-31");
  assert.equal(jpLaborExit({ start: "2024-04-01", end: "2026-04-01", age: 28, insuredYears: 2, reason: "self" }).benefitDays, 90);
  assert.equal(jpLaborExit({ start: "2024-04-01", end: "2026-04-01", age: 28, insuredYears: 2, reason: "dismissal" }).benefitDays, null);
  assert.equal(jpLaborExit({ start: "2025-04-01", end: "2026-01-01", age: 30, insuredYears: 0.7, reason: "self" }).paidLeaveDays, 10);
});

test("UK", () => {
  const r = ukLaborExit({ start: "2014-01-01", end: "2026-11-21", age: 45, weeklyPay: 900, incident: "2026-11-21", hourlyPay: 12.5, averageWeeklyEarnings: 100 });
  // 12 years: ages 44..33 → years at 41+ : i=0..3 (a=44,43,42,41) → 4×1.5 + 8×1 = 14 weeks
  assert.equal(r.redundancyWeeks, 14);
  assert.equal(r.redundancyPay, 14 * 751);
  assert.equal(r.noticeWeeks, 12);
  assert.equal(r.holidayDays, 28);
  assert.equal(r.dates[0].date, "2027-05-21");
  assert.ok(r.items.some((i) => i.tone === "warn" && i.text.includes("12.71")));
  assert.ok(r.items.some((i) => i.text.includes("£80")));
  assert.equal(ukLaborExit({ start: "2025-01-01", end: "2026-09-01", age: 25, weeklyPay: 500 }).dates[0].date, "2026-12-01");
  assert.equal(ukLaborExit({ start: "2026-01-01", end: "2026-09-01", age: 25, weeklyPay: 500, daysPerWeek: 3 }).holidayDays, 16.8);
});

test("US", () => {
  const r = usLaborExit({ state: "CA", hourlyWage: 20, weeklyHours: 45, incident: "2026-11-21", fired: true });
  assert.equal(r.minimumWage, 16.9);
  assert.equal(r.overtimePay, 150);
  assert.equal(r.dates.find((d) => d.id === "eeoc")!.date, "2027-05-20");
  assert.equal(usLaborExit({ state: "NY-NYC", hourlyWage: 16.5 }).items[0].tone, "warn");
  assert.equal(usLaborExit({ incident: "2026-01-01", stateAgency: true }).dates[0].date, "2026-10-28");
  assert.ok(usLaborExit({ employees: 150, layoffAtSite: 60 }).items.some((i) => i.text.includes("60 days")));
});

test("France", () => {
  const r = frLaborExit({ start: "2012-01-01", end: "2026-01-01", monthlyReference: 3_000, mode: "rupture", signed: "2026-01-10" });
  assert.equal(r.indemnite, 3_000 * (10 / 4 + 4 / 3));
  assert.equal(r.dates[0].date, "2026-01-25");
  assert.equal(r.dates.find((d) => d.id === "contestation")!.date, "2027-01-01");
  assert.equal(frLaborExit({ start: "2025-06-01", end: "2026-01-01", monthlyReference: 2_000 }).indemnite, 0);
});

test("Spain", () => {
  const r = esLaborExit({ start: "2016-11-21", end: "2026-11-21", annualSalary: 36_500, type: "improcedente", contributedDays: 1_000, monthlySalary: 1_200, notified: "2026-11-20" });
  assert.equal(r.indemnizacion, 100 * 33 * 10);
  assert.equal(r.paroDays, 300);
  assert.equal(r.dates[0].date, "2026-12-18");
  const capped = esLaborExit({ start: "2000-01-01", end: "2026-01-01", annualSalary: 36_500, type: "objetivo" });
  assert.equal(capped.indemnizacion, 100 * 30 * 12);
  assert.ok(esLaborExit({ start: "2010-01-01", end: "2026-01-01", annualSalary: 30_000, type: "improcedente" }).items.some((i) => i.text.includes("45 días")));
});

test("China", () => {
  const r = cnLaborExit({ start: "2020-01-01", end: "2026-08-01", monthlyWage: 10_000, unlawful: true, noNotice: true, insuredYears: 6 });
  assert.equal(r.months, 7);
  assert.equal(r.compensation, 70_000);
  assert.equal(r.total, 140_000);
  const hi = cnLaborExit({ start: "2006-01-01", end: "2026-01-01", monthlyWage: 50_000, localAverageMonthly: 12_000 });
  assert.equal(hi.months, 12);
  assert.equal(hi.compensation, 36_000 * 12);
  assert.equal(cnLaborExit({ start: "2026-01-01", end: "2026-04-01", monthlyWage: 8_000 }).months, 0.5);
});

test("Taiwan", () => {
  const r = twLaborExit({ start: "2016-01-01", end: "2026-07-01", averageMonthlyWage: 40_000, system: "new", age: 50, insuredMonthlyWage: 40_000 });
  assert.equal(r.noticeDays, 30);
  assert.equal(r.severance, 6 * 40_000 * 0.5 > 0 ? Math.min(6, 10.5 * 0.5) * 40_000 : 0);
  assert.equal(r.specialLeaveDays, 16);
  assert.equal(r.unemploymentMonthly, 24_000);
  assert.equal(r.unemploymentMonths, 9);
  assert.equal(twLaborExit({ start: "2026-01-01", end: "2026-05-01", averageMonthlyWage: 30_000, system: "old" }).noticeDays, 10);
});

test("TW minimum wage 2026/2027 shown, low wage warned", () => {
  const ok = twLaborExit({ start: "2024-01-01", end: "2026-07-01", averageMonthlyWage: 40_000, system: "new" });
  assert.ok(ok.items.some((i) => i.text.includes("29,500") && i.text.includes("30,900")));
  assert.ok(!ok.items.some((i) => i.tone === "warn"));
  const low = twLaborExit({ start: "2024-01-01", end: "2026-07-01", averageMonthlyWage: 20_000, system: "new" });
  assert.ok(low.items.some((i) => i.tone === "warn" && i.text.includes("196")));
});

test("FR préavis by service, doubled for disabled workers up to 3 months", () => {
  assert.equal(frLaborExit({ start: "2026-01-01", end: "2026-05-01", monthlyReference: 2_000 }).preavisMonths, null);
  assert.equal(frLaborExit({ start: "2025-06-01", end: "2026-07-01", monthlyReference: 2_000 }).preavisMonths, 1);
  assert.equal(frLaborExit({ start: "2020-01-01", end: "2026-07-01", monthlyReference: 2_000 }).preavisMonths, 2);
  assert.equal(frLaborExit({ start: "2020-01-01", end: "2026-07-01", monthlyReference: 2_000, disabled: true }).preavisMonths, 3);
  assert.equal(frLaborExit({ start: "2025-06-01", end: "2026-07-01", monthlyReference: 2_000, disabled: true }).preavisMonths, 2);
  assert.equal(frLaborExit({ start: "2020-01-01", end: "2026-07-01", monthlyReference: 2_000, mode: "rupture" }).preavisMonths, null);
});

test("CN annual leave by cumulative years and 1-year arbitration date", () => {
  const r = cnLaborExit({ start: "2020-01-01", end: "2026-08-01", monthlyWage: 10_000 });
  assert.equal(r.annualLeaveDays, 5);
  assert.equal(r.dates.find((d) => d.id === "arbitration")?.date, "2027-08-01");
  assert.equal(cnLaborExit({ start: "2020-01-01", end: "2026-08-01", monthlyWage: 10_000, cumulativeYears: 12 }).annualLeaveDays, 10);
  assert.equal(cnLaborExit({ start: "2020-01-01", end: "2026-08-01", monthlyWage: 10_000, cumulativeYears: 20 }).annualLeaveDays, 15);
  assert.equal(cnLaborExit({ start: "2026-01-01", end: "2026-08-01", monthlyWage: 10_000 }).annualLeaveDays, 0);
});
