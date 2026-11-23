import { test } from "node:test";
import assert from "node:assert/strict";
import { usRefund2026, jpKakutei2026, caTakeHome2026, auTakeHome, auLito, ontarioHealthPremium } from "./world-tax-season-2027.ts";

test("us 2026 refund estimate", () => {
  const a = usRefund2026({ wages: 60_000, withheld: 6_000, today: "2026-11-23" });
  assert.equal(a.taxable, 43_900);
  assert.equal(a.tax, 5_020);
  assert.equal(a.refund, 980);
  assert.equal(a.due, "2027-04-15");
  const b = usRefund2026({ wages: 50_000, withheld: 2_000, filing: "mfj", children: 2 });
  assert.equal(b.ctc, 1_780);
  assert.equal(b.actc, 2_620);
  assert.equal(b.refund, 4_620);
  const c = usRefund2026({ wages: 15_000, withheld: 500, filing: "hoh", children: 2 });
  assert.equal(c.actc, 1_875); // 15% of (15,000 - 2,500)
  const d = usRefund2026({ wages: 210_500, withheld: 0, children: 1 });
  assert.equal(d.ctc + d.actc, 2_200 - 11 * 50); // $50 per $1,000 or part over $200,000
  assert.ok(usRefund2026({ wages: 60_000, withheld: 1_000 }).owe);
});

test("jp 令和8年分 確定申告", () => {
  const r = jpKakutei2026({ salary: 5_000_000, withheld: 120_000, social: 750_000, medical: 300_000, today: "2026-11-23" });
  assert.equal(r.empIncome, 3_560_000);
  assert.equal(r.basic, 1_040_000);
  assert.equal(r.medical, 200_000);
  assert.equal(r.taxable, 1_570_000);
  assert.equal(r.tax, 80_100);
  assert.equal(r.refund, 39_900);
  assert.equal(r.due, "2027-03-15");
  assert.equal(r.mustFile, false);
  const f = jpKakutei2026({ salary: 4_000_000, withheld: 0, social: 0, donation: 50_000 });
  assert.equal(f.donation, 48_000);
  assert.equal(jpKakutei2026({ salary: 4_000_000, withheld: 0, social: 0, otherIncome: 300_000 }).mustFile, true);
});

test("canada take-home 2026", () => {
  const on = caTakeHome2026({ annual: 80_000, province: "on" });
  assert.equal(on.cpp, 4_230.45);
  assert.equal(on.cpp2, 216);
  assert.equal(on.ei, 1_123.07);
  assert.equal(on.federal, 9_242.6);
  assert.equal(on.ohp, 750);
  assert.equal(on.provincial, 4_885.26);
  assert.equal(caTakeHome2026({ annual: 80_000, province: "ab" }).provincial, 4_490.38);
  assert.equal(caTakeHome2026({ annual: 80_000, province: "bc" }).provincial, 4_030.92);
  assert.equal(ontarioHealthPremium(20_000), 0);
  assert.equal(ontarioHealthPremium(250_000), 900);
  assert.equal(caTakeHome2026({ annual: 0 }).net, 0);
});

test("australia take-home", () => {
  const a = auTakeHome({ annual: 90_000 });
  assert.equal(a.incomeTax, 17_520);
  assert.equal(a.medicare, 1_800);
  assert.equal(a.super, 10_800);
  assert.equal(auTakeHome({ annual: 90_000, year: "2025-26" }).incomeTax, 17_788);
  const low = auTakeHome({ annual: 30_000 });
  assert.equal(low.incomeTax, 1_070);
  assert.equal(low.medicare, 198.9);
  assert.equal(auTakeHome({ annual: 25_000 }).medicare, 0);
  assert.equal(auLito(66_667), 0);
  assert.equal(auLito(45_000), 325);
  assert.equal(auTakeHome({ annual: 112_000, packageIncludesSuper: true }).salary, 100_000);
});
