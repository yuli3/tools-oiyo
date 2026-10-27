import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lottoTax } from './lotto-tax.ts';

test('a 2,000,000 won prize is tax-free', () => {
  const r = lottoTax(2_000_000);
  assert.equal(r.totalTax, 0);
  assert.equal(r.net, 2_000_000);
});

test('a prize just over the tax-free limit pays 22% on prize minus ticket', () => {
  const r = lottoTax(2_000_001);
  // income 1,999,001 → 399,800.2 → 399,800; local 39,980
  assert.equal(r.incomeTax, 399_800);
  assert.equal(r.localTax, 39_980);
});

test('2 billion won jackpot: 20% to 300M, 30% above, plus 10% local', () => {
  const r = lottoTax(2_000_000_000);
  assert.equal(r.income, 1_999_999_000);
  assert.equal(r.incomeTax, 569_999_700);
  assert.equal(r.localTax, 56_999_970);
  assert.equal(r.totalTax, 626_999_670);
  assert.equal(r.net, 1_373_000_330);
});

test('exactly 300,000,000 + ticket stays in the 22% band', () => {
  const r = lottoTax(300_001_000);
  assert.equal(r.incomeTax, 60_000_000);
  assert.equal(r.totalTax, 66_000_000);
});

test('negative or fractional input is clamped', () => {
  assert.equal(lottoTax(-5).net, 0);
  assert.equal(lottoTax(1500.9).net, 1500);
});
