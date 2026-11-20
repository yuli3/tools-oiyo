import assert from "node:assert/strict";
import { test } from "node:test";
import { disabilityBenefit } from "./kr-injury-disability-2026.ts";
import { depositCheck } from "./kr-court-deposit-2026.ts";
import { housingBond, selfRegistrationCost, stampTax } from "./kr-self-registration-2026.ts";
import { agePoints, f27Points, incomePoints } from "./kr-f27-points-2026.ts";

test("disability grade 5: pension 193 days, lump 869 days, break-even 4.5 years", () => {
  const r = disabilityBenefit({ grade: 5, avgWage: 150_000, healed: "2026-03-10" });
  assert.equal(r.form, "choice");
  assert.equal(r.pensionAnnual, 28_950_000);
  assert.equal(r.lumpSum, 130_350_000);
  assert.equal(r.breakEvenYears, 4.5);
  assert.equal(r.claimBy, "2031-03-10");
  assert.deepEqual(r.advance.map((a) => a.years), [1, 2]);
});
test("disability: grade 2 pension only, grade 10 lump only, wage caps", () => {
  const a = disabilityBenefit({ grade: 2, avgWage: 400_000 });
  assert.equal(a.lumpSum, null);
  assert.equal(a.wage, 268_299);
  assert.equal(a.capped, "max");
  assert.equal(a.advance.length, 4);
  const b = disabilityBenefit({ grade: 10, avgWage: 50_000 });
  assert.equal(b.pensionAnnual, null);
  assert.equal(b.wage, 82_560);
  assert.equal(b.lumpSum, 82_560 * 297);
});
test("deposit interest 0.35% and 10-year lapse", () => {
  const r = depositCheck({ amount: 100_000_000, deposited: "2025-11-21", withdrawn: "2026-11-21", ground: "refused" });
  assert.equal(r.days, 365);
  assert.equal(r.interest, 350_000);
  assert.equal(r.lapseOn, "2035-11-21");
  assert.equal(r.items[0].tone, "good");
  assert.equal(depositCheck({ amount: 1 }).items[0].tone, "warn");
});
test("housing bond rates and rounding", () => {
  assert.deepEqual(housingBond(3 * 1e8, true), { rate: 0.026, amount: 7_800_000 });
  assert.deepEqual(housingBond(3 * 1e8, false), { rate: 0.021, amount: 6_300_000 });
  assert.equal(housingBond(1_500 * 1e4, true).amount, 0);
  // 2,345만 × 1.3% = 304,850 → 끝수 4,850 버림 → 300,000
  assert.equal(housingBond(2_345 * 1e4, true).amount, 300_000);
  // 2,350만 × 1.3% = 305,500 → 끝수 5,500 올림 → 310,000
  assert.equal(housingBond(2_350 * 1e4, true).amount, 310_000);
});
test("stamp tax brackets and house exemption", () => {
  assert.equal(stampTax(1e8), 0);
  assert.equal(stampTax(1e8, false), 70_000);
  assert.equal(stampTax(5e8), 150_000);
  assert.equal(stampTax(12e8), 350_000);
});
test("self registration total: 5억 1주택 서울 전자신청", () => {
  const r = selfRegistrationCost({ price: 5e8, standardPrice: 3.5e8, metro: true, bondDiscount: 0.06, other: 20_000, agentFee: 500_000 });
  assert.equal(r.acquisition.total, 5_500_000);
  assert.equal(r.bond.amount, 9_100_000);
  assert.equal(r.bond.cost, 546_000);
  assert.equal(r.fee, 10_000);
  assert.equal(r.stamp, 75_000);
  assert.equal(r.total, 5_500_000 + 546_000 + 10_000 + 75_000 + 20_000);
  assert.equal(r.withAgent, r.total + 500_000);
});
test("F-2-7 points", () => {
  assert.equal(agePoints(27), 25);
  assert.equal(agePoints(45), 8);
  assert.equal(incomePoints(55_000_000), 45);
  assert.equal(incomePoints(20_000_000), 10);
  const r = f27Points({ age: 31, degree: "master", stemOrDouble: true, korean: 4, income: 45_000_000, koreanUniDegree: "master" });
  assert.equal(r.base, 23 + 20 + 15 + 40);
  assert.equal(r.bonus, 7);
  assert.equal(r.total, 105);
  assert.equal(r.pass, true);
  const low = f27Points({ age: 46, degree: "bachelor", korean: 2, income: 30_000_000, criminal: "low" });
  assert.equal(low.total, 8 + 15 + 5 + 30 - 20);
  assert.equal(low.pass, false);
  assert.ok(low.gaps.length > 0);
  assert.equal(f27Points({ age: 30, degree: "phd", korean: 5, income: 1e8, warCountry: true, ministryRecommend: true, kiip5: true }).bonus, 40);
});
