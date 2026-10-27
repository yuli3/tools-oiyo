import test from 'node:test';
import assert from 'node:assert/strict';
import { retirementIncomeTax, serviceYearDeduction, convertedSalaryDeduction } from './kr-retirement-tax.ts';

test('근속연수공제 구간 경계', () => {
  assert.equal(serviceYearDeduction(5), 5_000_000);
  assert.equal(serviceYearDeduction(10), 15_000_000);
  assert.equal(serviceYearDeduction(20), 40_000_000);
  assert.equal(serviceYearDeduction(25), 55_000_000);
});

test('환산급여공제 구간 경계', () => {
  assert.equal(convertedSalaryDeduction(8_000_000), 8_000_000);
  assert.equal(convertedSalaryDeduction(70_000_000), 45_200_000);
  assert.equal(convertedSalaryDeduction(100_000_000), 61_700_000);
  assert.equal(convertedSalaryDeduction(300_000_000), 151_700_000);
});

test('퇴직금 8천만 원·10년 근속: 2023~ 세율표로 계산', () => {
  // (8,000만 − 1,500만) × 12 / 10 = 7,800만 → 공제 4,520만 + 800만 × 55% = 4,960만 → 과표 2,840만
  // 기본세율: 84만 + (2,840만 − 1,400만) × 15% = 300만 → × 10 / 12 = 250만
  const r = retirementIncomeTax(80_000_000, 10);
  assert.equal(r.convertedSalary, 78_000_000);
  assert.equal(r.convertedTaxBase, 28_400_000);
  assert.equal(r.convertedCalculatedTax, 3_000_000);
  assert.equal(r.nationalTax, 2_500_000);
  assert.equal(r.localTax, 250_000);
  assert.equal(r.totalTax, 2_750_000);
});

test('근속연수공제가 퇴직금보다 크면 세금 0', () => {
  assert.equal(retirementIncomeTax(4_000_000, 5).totalTax, 0);
});
