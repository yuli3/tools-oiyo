import { test } from "node:test";
import assert from "node:assert/strict";
import { usTaxCalendar, usSelfEmployment, usIncomeTax, usEstimatedTax, usPenalty, usAppealDeadlines, usDepreciation, usShift, US_SCOPE } from "./us-tax-pack-2026.ts";

const d = (s: string) => new Date(`${s}T00:00:00Z`);
const on = (s: string) => usShift(d(s)).toISOString().slice(0, 10);

test("calendar: 2026 tax year dates and shifts", () => {
  const r = usTaxCalendar({ taxYear: 2026, selfEmployed: true, pays1099: true, extension: true, entity: "scorp", today: "2027-04-01" });
  const by = Object.fromEntries(r.events.map((e) => [e.id, e]));
  assert.equal(by["1040"].date, "2027-04-15");
  assert.equal(by["1040"].daysLeft, 14);
  assert.equal(by["4868"].date, "2027-10-15");
  assert.equal(by.es1.date, "2026-04-15");
  assert.equal(by.es2.date, "2026-06-15");
  assert.equal(by.es3.date, "2026-09-15");
  assert.equal(by.es4.date, "2027-01-15");
  assert.equal(by["1099nec"].date, "2027-02-01"); // Jan 31 2027 is Sunday
  assert.equal(by.entity.date, "2027-03-15");
  assert.equal(on("2026-03-15"), "2026-03-16");
  assert.equal(on("2029-01-15"), "2029-01-16"); // MLK Day 2029
  assert.equal(on("2028-04-15"), "2028-04-18"); // Sat; 4/16 Sun → Emancipation Day observed Mon 4/17 → Tue
  assert.equal(on("2023-04-15"), "2023-04-18"); // Sat → Mon 4/17 = Emancipation Day observed → Tue
});

test("income tax brackets 2026", () => {
  assert.equal(usIncomeTax(12_400, "single"), 1_240);
  assert.equal(usIncomeTax(50_400, "single"), 1_240 + 4_560);
  assert.equal(usIncomeTax(24_800, "mfj"), 2_480);
});

test("self-employment: SE tax, half deduction, QBI", () => {
  const r = usSelfEmployment({ net: 80_000 });
  assert.equal(r.seTax, Math.round(80_000 * 0.9235 * 0.153));
  assert.equal(r.halfSe, Math.round(r.seTax / 2));
  assert.equal(r.qbi, Math.round(Math.min((80_000 - r.halfSe) * 0.2, (r.agi - 16_100) * 0.2)));
  assert.equal(usSelfEmployment({ net: 300 }).seTax, 0);
  // SS part capped by wage base after W-2 wages
  const w = usSelfEmployment({ net: 100_000, wages: 184_500 });
  assert.equal(w.seTax, Math.round(100_000 * 0.9235 * 0.029));
  assert.equal(usSelfEmployment({ net: 400_000 }).qbi, null);
  // $400 minimum QBI
  assert.equal(usSelfEmployment({ net: 1_500, otherIncome: 40_000 }).qbi, 400);
});

test("estimated tax safe harbor", () => {
  const r = usEstimatedTax({ priorTax: 10_000, priorAgi: 100_000, currentTax: 20_000 });
  assert.equal(r.required, 10_000);
  assert.equal(r.toPay, 10_000);
  assert.deepEqual(r.schedule.map((s) => s.amount), [2_500, 2_500, 2_500, 2_500]);
  assert.equal(usEstimatedTax({ priorTax: 10_000, priorAgi: 200_000, currentTax: 20_000 }).required, 11_000);
  assert.equal(usEstimatedTax({ priorTax: 10_000, priorAgi: 100_000, currentTax: 5_000, withholding: 4_500 }).needed, false);
  assert.equal(usEstimatedTax({ priorTax: 0, priorAgi: 0, priorFullYear: false, currentTax: 10_000 }).required, 9_000);
});

test("penalties and interest", () => {
  // filed and paid 3 months + 1 day late → 4 months each
  const r = usPenalty({ tax: 10_000, due: "2027-04-15", filed: "2027-07-16", paid: "2027-07-16" });
  assert.equal(r.fileMonths, 4);
  assert.equal(r.failureToPay, 200);
  assert.equal(r.failureToFile, 1_800); // 4 × 4.5%
  assert.ok(r.interest > 170 && r.interest < 185, String(r.interest));
  // small tax, >60 days: minimum $535 or 100% of tax
  assert.equal(usPenalty({ tax: 400, due: "2027-04-15", filed: "2027-07-01" }).failureToFile, 400);
  assert.equal(usPenalty({ tax: 5_000, due: "2027-04-15", filed: "2027-07-01" }).failureToFile, 750);
  assert.equal(usPenalty({ tax: 2_000, due: "2027-04-15", filed: "2027-07-01" }).failureToFile, 535);
  // extension: filing on time in October, paid in October
  const e = usPenalty({ tax: 1_000, due: "2027-04-15", filed: "2027-10-15", paid: "2027-10-15", extension: true });
  assert.equal(e.failureToFile, 0);
  assert.equal(e.failureToPay, 30);
  assert.equal(usPenalty({ tax: 1_000, due: "2027-04-15", filed: "2027-04-10", paid: "2027-04-15" }).total, 0);
});

test("appeal and refund deadlines", () => {
  const r = usAppealDeadlines({ notice: "2027-05-03", filed: "2027-03-01", returnDue: "2027-04-15", paid: "2028-06-01" });
  assert.equal(r.find((x) => x.id === "taxcourt")!.date, "2027-08-02"); // 90 days → Sun 8/1 → Mon
  assert.equal(r.find((x) => x.id === "refund")!.date, "2030-06-01");
  assert.equal(usAppealDeadlines({ notice: "2027-05-03", abroad: true })[0].date, "2027-09-30");
  assert.equal(usAppealDeadlines({ notice: "2027-05-03", kind: "cdp" })[0].date, "2027-06-02");
  assert.equal(usAppealDeadlines({ filed: "2027-03-01", returnDue: "2027-04-15" })[0].date, "2030-04-15");
});

test("depreciation", () => {
  assert.equal(usDepreciation({ cost: 2_000, life: 5, placed: "2026-05-01" }).treatment, "expense");
  assert.equal(usDepreciation({ cost: 4_000, life: 5, placed: "2026-05-01", afs: true }).treatment, "expense");
  const b = usDepreciation({ cost: 10_000, life: 5, placed: "2026-05-01" });
  assert.equal(b.bonus, 10_000);
  assert.equal(b.firstYear, 10_000);
  const m = usDepreciation({ cost: 10_000, life: 5, placed: "2026-05-01", bonus: false });
  assert.deepEqual(m.schedule.map((s) => s.amount), [2_000, 3_200, 1_920, 1_152, 1_152, 576]);
  const s = usDepreciation({ cost: 50_000, life: 7, placed: "2026-05-01", sec179: 20_000, bonus: false });
  assert.equal(s.firstYear, 20_000 + Math.round(30_000 * 0.1429));
  assert.equal(usDepreciation({ cost: 3_000_000, life: 7, placed: "2026-05-01", sec179: 3_000_000, totalPlaced: 4_190_000 }).sec179, 2_460_000);
  assert.ok(US_SCOPE.some((x) => x.cite.includes("10.3")));
});
