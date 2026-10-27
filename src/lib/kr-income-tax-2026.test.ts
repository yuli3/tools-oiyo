import test from 'node:test';
import assert from 'node:assert/strict';
import { simpleExpense, comprehensiveIncomeTax, freelancerSettlement } from './kr-income-tax-2026.ts';

test('단순경비율 4천만 원 초과분은 자가율', () => {
  assert.equal(simpleExpense(30_000_000), 19_230_000);
  assert.equal(simpleExpense(50_000_000), 25_640_000 + 4_970_000);
});

test('프리랜서 3,000만 원은 환급', () => {
  const r = freelancerSettlement(30_000_000, 'simple', 1, 0);
  assert.equal(r.base, 9_270_000);
  assert.equal(r.calculated, 556_200);
  assert.equal(r.determined, 486_200);
  assert.equal(r.withheld, 900_000);
  assert.equal(r.balance, -413_800);
  assert.equal(r.due, -413_800 - 41_380);
});

test('근로 + 사업 종합소득', () => {
  const r = comprehensiveIncomeTax({ businessIncome: 20_000_000, salary: 50_000_000, otherIncome: 0, people: 2, pensionPremium: 2_250_000, prepaid: 2_000_000 });
  // 근로소득금액 50M − 12.25M = 37.75M, 합계 57.75M, 공제 5.25M → 과표 52.5M
  assert.equal(r.earned, 37_750_000);
  assert.equal(r.base, 52_500_000);
  assert.equal(r.calculated, 6_840_000);
  assert.ok(r.determined < r.calculated);
});
