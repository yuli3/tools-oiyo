import { test } from "node:test";
import assert from "node:assert/strict";
import { ukMaternityPay, ukChildBenefit, jpChildcareLeave, deElterngeld, elterngeldRate, jpChildAllowance } from "./world-parental-pay-2026.ts";

test("parental pay and child benefit", () => {
  const smp = ukMaternityPay({ weeklyEarnings: 600 });
  assert.equal(smp.weeklyFirst6, 540);
  assert.equal(smp.weeklyNext33, 194.32);
  assert.equal(smp.total, Math.round((540 * 6 + 194.32 * 33) * 100) / 100);
  assert.equal(ukMaternityPay({ weeklyEarnings: 200 }).weeklyNext33, 180);
  const cb = ukChildBenefit({ children: 2, adjustedNetIncome: 70_000 });
  assert.equal(cb.weekly, 44.95);
  assert.equal(cb.chargePercent, 50);
  assert.equal(ukChildBenefit({ children: 1, adjustedNetIncome: 90_000 }).chargePercent, 100);
  const jp = jpChildcareLeave({ monthlyWage: 600_000, months: 12, support: true });
  assert.ok(jp.ok && jp.monthly67 === 332_454 && jp.monthly50 === 248_100 && jp.support === 60_205);
  const jp2 = jpChildcareLeave({ monthlyWage: 300_000, months: 6 });
  assert.ok(jp2.ok && jp2.monthly67 === 201_000 && jp2.total === 201_000 * 6);
  assert.equal(elterngeldRate(1_100), 67);
  assert.equal(elterngeldRate(2_000), 65);
  assert.equal(elterngeldRate(800), 77);
  assert.equal(deElterngeld({ netBefore: 2_000 }).basic, 1_300);
  assert.equal(deElterngeld({ netBefore: 5_000 }).basic, 1_800);
  assert.equal(deElterngeld({ netBefore: 200 }).basic, 300);
  assert.equal(deElterngeld({ netBefore: 3_000, taxableIncome: 180_000 }).eligible, false);
});

test("jp child allowance", () => {
  assert.equal(jpChildAllowance({ under3: 1 }).monthly, 15_000);
  assert.equal(jpChildAllowance({ from3: 2, under3: 1 }).monthly, 10_000 + 10_000 + 30_000);
  assert.equal(jpChildAllowance({ supported19to22: 2, from3: 1 }).monthly, 30_000);
  assert.equal(jpChildAllowance({ supported19to22: 1, under3: 2 }).monthly, 15_000 + 30_000);
  assert.equal(jpChildAllowance({}).monthly, 0);
});
