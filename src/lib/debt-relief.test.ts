import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gbDroCheck, jpMinimumRepayment, jpSaiseiEstimate, krLivingCost, krMinimumTotal, krRehabEstimate } from './debt-relief.ts';

test('KR living cost is 60% of the 2026 median income, rounded to the won', () => {
  assert.equal(krLivingCost(2026, 1), 1_538_543); // 2,564,238 × 0.6
  assert.equal(krLivingCost(2026, 2), 2_519_575);
  assert.equal(krLivingCost(2027, 4), 4_157_931); // 6,929,885 × 0.6
  assert.equal(krLivingCost(2026, 9), krLivingCost(2026, 7));
});

test('KR §614②3 minimum total: 5% under 50M, 3% + 1M above, 30M cap', () => {
  assert.equal(krMinimumTotal(40_000_000), 2_000_000);
  assert.equal(krMinimumTotal(50_000_000), 2_500_000);
  assert.equal(krMinimumTotal(2_000_000_000), 30_000_000);
});

test('KR 36-month plan from 2.5M income, 1 person, 50M unsecured', () => {
  const r = krRehabEstimate({ monthlyIncome: 2_500_000, household: 1, year: 2026, unsecured: 50_000_000 });
  assert.equal(r.status, 'ok');
  assert.equal(r.available, 961_457);
  assert.equal(r.months, 36);
  assert.equal(r.total, 34_612_452);
});

test('KR plan stretches past 36 months to cover the liquidation value, up to 60', () => {
  const r = krRehabEstimate({ monthlyIncome: 1_700_000, household: 1, year: 2026, unsecured: 80_000_000, liquidation: 8_000_000 });
  assert.equal(r.available, 161_457);
  assert.equal(r.status, 'extended');
  assert.equal(r.months, 50);
  const short = krRehabEstimate({ monthlyIncome: 1_600_000, household: 1, year: 2026, unsecured: 80_000_000, liquidation: 8_000_000 });
  assert.equal(short.status, 'short');
});

test('KR edge cases: full repayment, no surplus, over the debt limit', () => {
  const full = krRehabEstimate({ monthlyIncome: 3_000_000, household: 1, year: 2026, unsecured: 20_000_000 });
  assert.equal(full.status, 'full');
  assert.equal(full.months, 14);
  assert.equal(full.total, 20_000_000);
  assert.equal(krRehabEstimate({ monthlyIncome: 1_500_000, household: 1, year: 2026, unsecured: 30_000_000 }).status, 'no-surplus');
  assert.equal(krRehabEstimate({ monthlyIncome: 9_000_000, household: 1, year: 2026, unsecured: 1_000_000_001 }).status, 'over-limit');
});

test('JP 最低弁済額 follows 民事再生法 §231②3–4', () => {
  assert.equal(jpMinimumRepayment(600_000), 600_000);
  assert.equal(jpMinimumRepayment(4_000_000), 1_000_000);
  assert.equal(jpMinimumRepayment(8_000_000), 1_600_000);
  assert.equal(jpMinimumRepayment(20_000_000), 3_000_000);
  assert.equal(jpMinimumRepayment(40_000_000), 4_000_000);
  assert.equal(jpMinimumRepayment(60_000_000), null);
});

test('JP plan takes the largest of the legal minimum, liquidation value and two years of disposable income', () => {
  const r = jpSaiseiEstimate({ base: 8_000_000, liquidation: 2_000_000, annualDisposable: 1_200_000 });
  assert.equal(r.plan, 2_400_000);
  assert.equal(r.monthly36, 66_667);
  assert.equal(jpSaiseiEstimate({ base: 60_000_000 }).eligible, false);
});

test('GB DRO limits are strict "less than"', () => {
  const ok = gbDroCheck({ debt: 49_999, surplus: 74, assets: 1_999, vehicle: 3_999, livedOrWorkedEW: true });
  assert.equal(ok.eligible, true);
  const edge = gbDroCheck({ debt: 50_000, surplus: 75, assets: 2_000, vehicle: 4_000, livedOrWorkedEW: true });
  assert.deepEqual(edge.checks, { debt: false, surplus: false, assets: false, vehicle: false, residence: true });
});
