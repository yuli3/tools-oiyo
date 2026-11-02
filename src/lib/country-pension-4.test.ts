import assert from "node:assert/strict";
import { test } from "node:test";
import { rothIraLimit, tradVsRoth, ukIncomeTax, ukPensionRelief, us401kLimit, usIraLimit, US_2026 } from "./country-pension-4.ts";

test("pins IRS Notice 2025-67 limits", () => {
  assert.equal(US_2026.deferral, 24_500);
  assert.deepEqual(us401kLimit(45), { base: 24_500, catchUp: 0, total: 24_500 });
  assert.equal(us401kLimit(55).total, 32_500);
  assert.equal(us401kLimit(61).total, 35_750);
  assert.equal(us401kLimit(64).total, 32_500);
  assert.equal(usIraLimit(49).total, 7_500);
  assert.equal(usIraLimit(50).total, 8_600);
});

test("Roth IRA phase-out", () => {
  assert.equal(rothIraLimit(40, 150_000, "single"), 7_500);
  assert.equal(rothIraLimit(40, 160_500, "single"), 3_750);
  assert.equal(rothIraLimit(40, 167_900, "single"), 200);
  assert.equal(rothIraLimit(40, 170_000, "single"), 0);
  assert.equal(rothIraLimit(40, 247_000, "joint"), 3_750);
});

test("traditional vs Roth turns on the two tax rates", () => {
  const same = tradVsRoth({ contribution: 10_000, years: 20, growth: 0.05, rateNow: 0.22, rateLater: 0.22 });
  assert.equal(same.better, "same");
  assert.equal(tradVsRoth({ contribution: 10_000, years: 20, growth: 0.05, rateNow: 0.24, rateLater: 0.12 }).better, "traditional");
  assert.equal(tradVsRoth({ contribution: 10_000, years: 20, growth: 0.05, rateNow: 0.12, rateLater: 0.22 }).better, "roth");
  assert.equal(tradVsRoth({ contribution: 1_000, years: 2, growth: 0, rateNow: 0.1, rateLater: 0.1 }).tradGross, 2_000);
});

test("UK income tax 2026/27 rUK bands", () => {
  assert.equal(ukIncomeTax(12_570), 0);
  assert.equal(ukIncomeTax(50_270), 7_540);
  assert.equal(ukIncomeTax(60_000), 7_540 + 9_730 * 0.4);
  // £125,140: allowance fully tapered away
  assert.equal(Math.round(ukIncomeTax(125_140)), Math.round(37_700 * 0.2 + (125_140 - 37_700) * 0.4));
});

test("UK relief: basic-rate taxpayer gets 20% only", () => {
  const r = ukPensionRelief({ earnings: 35_000, netContribution: 2_400 });
  assert.equal(r.gross, 3_000);
  assert.equal(r.basicRelief, 600);
  assert.equal(r.selfAssessmentRelief, 0);
});

test("UK relief: higher-rate taxpayer claims another 20% through Self Assessment", () => {
  const r = ukPensionRelief({ earnings: 70_000, netContribution: 8_000 });
  assert.equal(r.gross, 10_000);
  assert.equal(r.basicRelief, 2_000);
  assert.equal(r.selfAssessmentRelief, 2_000);
  assert.equal(r.effectiveCost, 6_000);
});

test("UK relief: contribution that drops adjusted net income below £100k restores the allowance", () => {
  const r = ukPensionRelief({ earnings: 110_000, netContribution: 8_000 });
  // gross 10,000 brings adjusted net income to 100,000: £5,000 allowance back at 40% (2,000) + 20% extra on 10,000 (2,000)
  assert.equal(r.selfAssessmentRelief, 4_000);
});

test("UK relief: no earnings caps relief at £3,600 gross", () => {
  const r = ukPensionRelief({ earnings: 0, netContribution: 4_000 });
  assert.equal(r.relievable, 3_600);
  assert.equal(r.basicRelief, 720);
  assert.equal(r.overRelief, 1_400);
});
