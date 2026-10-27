import assert from 'node:assert/strict';
import { test } from 'node:test';
import { annualDividend, latteFutureValue } from './savings-math.ts';

test('quarterly dividend: 100 shares × 500 × 4 at 15.4%', () => {
  const r = annualDividend(100, 500, 'quarterly', 15.4);
  assert.equal(r.gross, 200_000);
  assert.equal(Math.round(r.net), 169_200);
});

test('dividend tax rate is clamped to 0–100%', () => {
  assert.equal(annualDividend(10, 1, 'monthly', 150).net, 0);
  assert.equal(annualDividend(10, 1, 'annual', -5).net, 10);
});

test('latte at 0% is the plain sum', () => {
  const r = latteFutureValue(5000, 'daily', 0, 10);
  assert.equal(r.monthly, 150_000);
  assert.equal(r.total, 18_000_000);
  assert.equal(r.growth, 0);
});

test('latte at 6% over 10 years matches the annuity formula', () => {
  const r = latteFutureValue(5000, 'daily', 6, 10);
  // 150,000 × ((1.005^120 − 1) / 0.005) ≈ 24,581,902
  assert.equal(Math.floor(r.total), 24_581_902);
});
