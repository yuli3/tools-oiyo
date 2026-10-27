import assert from 'node:assert/strict';
import { test } from 'node:test';
import { financialIncomeTax, foreignAccountCheck, foreignStockTax } from './kr-investment-tax.ts';

test('financial income at the 20M threshold stays separately taxed', () => {
  const r = financialIncomeTax(20_000_000, 50_000_000);
  assert.equal(r.comprehensive, false);
  assert.equal(r.withheld, 2_800_000);
  assert.equal(r.extraTotal, 0);
});

test('with no other income the 14% floor (method 2) wins and nothing more is owed', () => {
  const r = financialIncomeTax(30_000_000, 0);
  assert.equal(r.method1, 3_400_000); // 600,000 on 10M + 2,800,000
  assert.equal(r.method2, 4_200_000);
  assert.equal(r.calculated, 4_200_000);
  assert.equal(r.extraTotal, 0);
});

test('with a 50M other tax base, 30M of financial income adds 1.1M in May', () => {
  const r = financialIncomeTax(30_000_000, 50_000_000);
  assert.equal(r.method1, 11_440_000); // progressive(60M) 8,640,000 + 2,800,000
  assert.equal(r.method2, 10_440_000); // 4,200,000 + progressive(50M) 6,240,000
  assert.equal(r.extraNational, 1_000_000);
  assert.equal(r.extraLocal, 100_000);
  assert.equal(r.extraTotal, 1_100_000);
});

test('foreign stock: 20M gain → 17.5M base → 3.5M + 350k', () => {
  const r = foreignStockTax([20_000_000]);
  assert.equal(r.taxBase, 17_500_000);
  assert.equal(r.incomeTax, 3_500_000);
  assert.equal(r.localTax, 350_000);
  assert.equal(r.totalTax, 3_850_000);
});

test('foreign stock: losses net off within the year and small gains are covered by the deduction', () => {
  assert.equal(foreignStockTax([5_000_000, -3_000_000]).totalTax, 0);
  const loss = foreignStockTax([-1_000_000]);
  assert.equal(loss.netGain, -1_000_000);
  assert.equal(loss.deduction, 0);
  assert.equal(loss.totalTax, 0);
  assert.equal(foreignStockTax([12_500_000], true).incomeTax, 1_000_000);
});

test('foreign accounts: only a month-end above 500M triggers reporting', () => {
  const months = Array(12).fill(400_000_000);
  assert.equal(foreignAccountCheck(months).mustReport, false);
  months[8] = 500_000_000;
  assert.equal(foreignAccountCheck(months).mustReport, false);
  months[10] = 500_000_001;
  const r = foreignAccountCheck(months);
  assert.equal(r.mustReport, true);
  assert.equal(r.peakMonth, 11);
  assert.equal(foreignAccountCheck([]).peakMonth, 0);
});
