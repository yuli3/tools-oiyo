import assert from 'node:assert/strict';
import { test } from 'node:test';
import { annualDividend, dividendMonths, latteFutureValue, monthlyNetSchedule, topPayers, yearOverYear } from './savings-math.ts';

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

test('dividend months follow the ex-date month and the frequency', () => {
  assert.deepEqual(dividendMonths('quarterly', '2026-02-14'), [1, 4, 7, 10]);
  assert.deepEqual(dividendMonths('quarterly', ''), [2, 5, 8, 11]);
  assert.deepEqual(dividendMonths('semiannual', '2026-11-30'), [4, 10]);
  assert.equal(dividendMonths('monthly', '').length, 12);
  assert.deepEqual(dividendMonths('annual', '2026-04-01'), [3]);
  assert.deepEqual(dividendMonths('annual', 'bad'), [11]);
});

test('monthly schedule spreads the net amount over payment months', () => {
  const m = monthlyNetSchedule([
    { ticker: 'A', shares: 10, perShare: 1, freq: 'quarterly', exDate: '2026-03-10', taxPct: 0 },
    { ticker: 'B', shares: 12, perShare: 1, freq: 'monthly', exDate: '', taxPct: 50 },
  ]);
  assert.equal(m.length, 12);
  assert.equal(m[2], 10 + 6);
  assert.equal(m[0], 6);
  assert.equal(Math.round(m.reduce((a, b) => a + b, 0)), 40 + 72);
});

test('top payers merge tickers and give shares of the total', () => {
  const top = topPayers([
    { ticker: 'schd', shares: 10, perShare: 1, freq: 'annual', exDate: '', taxPct: 0 },
    { ticker: 'SCHD ', shares: 10, perShare: 1, freq: 'annual', exDate: '', taxPct: 0 },
    { ticker: 'O', shares: 5, perShare: 1, freq: 'annual', exDate: '', taxPct: 0 },
    { ticker: 'ZERO', shares: 0, perShare: 1, freq: 'annual', exDate: '', taxPct: 0 },
  ], 5);
  assert.deepEqual(top.map((x) => x.ticker), ['SCHD', 'O']);
  assert.equal(top[0].share, 80);
});

test('year over year sums duplicate years and skips change without a prior year', () => {
  const r = yearOverYear([{ year: 2025, amount: 100 }, { year: 2024, amount: 80 }, { year: 2025, amount: 20 }, { year: 2022, amount: 50 }]);
  assert.deepEqual(r.map((x) => x.year), [2022, 2024, 2025]);
  assert.equal(r[0].change, null);
  assert.equal(r[1].change, null);
  assert.equal(r[2].amount, 120);
  assert.equal(r[2].change, 50);
});
