import test from 'node:test';
import assert from 'node:assert/strict';
import { autoTax, annualPaymentCredit, annualPaymentDays, carAge, ageReliefRate } from './kr-auto-tax.ts';

test('서울시 2025년 1월 연납 예시와 같아요', () => {
  assert.equal(annualPaymentDays(2025, 1), 334);
  assert.equal(annualPaymentCredit(668_400, 2025, 1), 30_580);
  assert.equal(annualPaymentCredit(399_600, 2025, 1), 18_280);
  assert.equal(annualPaymentCredit(223_720, 2025, 1), 10_230);
  assert.equal(annualPaymentCredit(100_000, 2025, 1), 4_570);
});

test('신차 세액은 cc×세율이에요', () => {
  assert.equal(autoTax({ fuel: 'engine', cc: 1998, taxYear: 2026, regYear: 2026, regHalf: 'first' }).carTax, 399_600);
  assert.equal(autoTax({ fuel: 'engine', cc: 1598, taxYear: 2026, regYear: 2026, regHalf: 'first' }).carTax, 223_720);
  assert.equal(autoTax({ fuel: 'electric', cc: 0, taxYear: 2030, regYear: 2020, regHalf: 'first' }).total, 130_000);
});

test('차령은 기산일 반기에 따라 달라요', () => {
  assert.equal(carAge(2026, 2024, 'first', 1), 3);
  assert.equal(carAge(2026, 2024, 'second', 1), 2);
  assert.equal(carAge(2026, 2024, 'second', 2), 3);
  assert.equal(ageReliefRate(2), 0);
  assert.equal(ageReliefRate(3), 0.05);
  assert.equal(ageReliefRate(12), 0.5);
  assert.equal(ageReliefRate(20), 0.5);
});

test('2024년 상반기 등록 2,000cc는 2026년에 5% 경감돼요', () => {
  const r = autoTax({ fuel: 'engine', cc: 2000, taxYear: 2026, regYear: 2024, regHalf: 'first' });
  assert.equal(r.carTax, 380_000);
  assert.equal(r.educationTax, 114_000);
});
