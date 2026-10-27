import test from 'node:test';
import assert from 'node:assert/strict';
import { acquisitionTax, standardHomeRate, propertyTax, capitalGainsTax, longTermRateGeneral, longTermRateOneHouse } from './kr-real-estate-tax.ts';

const base = { houses: 1 as const, regulated: false, temporaryTwo: false, over85: false };

test('취득세 1주택 표준세율', () => {
  assert.equal(standardHomeRate(600_000_000), 0.01);
  assert.equal(standardHomeRate(750_000_000), 0.02);
  assert.equal(standardHomeRate(700_000_000), 0.0167); // 0.016666… → 0.0167
  assert.equal(standardHomeRate(900_000_001), 0.03);
  assert.deepEqual(acquisitionTax({ ...base, price: 500_000_000 }).total, 5_500_000);
  const mid = acquisitionTax({ ...base, price: 750_000_000, over85: true });
  assert.equal(mid.tax, 15_000_000); assert.equal(mid.education, 1_500_000); assert.equal(mid.rural, 1_500_000);
});

test('취득세 다주택 중과', () => {
  const r = acquisitionTax({ ...base, price: 1_000_000_000, houses: 2, regulated: true, over85: true });
  assert.equal(r.rate, 0.08); assert.equal(r.total, 90_000_000);
  assert.equal(acquisitionTax({ ...base, price: 500_000_000, houses: 2, regulated: true, temporaryTwo: true }).rate, 0.01);
  assert.equal(acquisitionTax({ ...base, price: 500_000_000, houses: 2 }).rate, 0.01);
  assert.equal(acquisitionTax({ ...base, price: 500_000_000, houses: 3 }).rate, 0.08);
  const twelve = acquisitionTax({ ...base, price: 500_000_000, houses: 4, over85: true });
  assert.equal(twelve.rate, 0.12); assert.equal(twelve.total, 67_000_000); // 13.4%
});

test('재산세 1주택 특례와 다주택', () => {
  const one = propertyTax(500_000_000, true);
  assert.equal(one.ratio, 0.44); assert.equal(one.base, 220_000_000);
  assert.equal(one.tax, 260_000); assert.equal(one.urban, 308_000); assert.equal(one.education, 52_000);
  const multi = propertyTax(500_000_000, false);
  assert.equal(multi.base, 300_000_000); assert.equal(multi.tax, 570_000);
  const over9 = propertyTax(1_000_000_000, true);
  assert.equal(over9.special, false); assert.equal(over9.base, 450_000_000); assert.equal(over9.tax, 1_170_000);
});

test('장기보유특별공제 표', () => {
  assert.equal(longTermRateGeneral(2.9), 0);
  assert.equal(longTermRateGeneral(3), 0.06);
  assert.equal(longTermRateGeneral(15), 0.3);
  assert.equal(longTermRateGeneral(20), 0.3);
  assert.equal(Number(longTermRateOneHouse(10, 10).toFixed(2)), 0.8);
  assert.equal(Number(longTermRateOneHouse(5, 2).toFixed(2)), 0.28);
});

test('양도세 1주택 비과세와 고가주택', () => {
  const g = { kind: 'house' as const, purchase: 500_000_000, expenses: 0, holdYears: 10, liveYears: 10, houses: 1 as const, exemptEligible: true, regulated: true };
  assert.equal(capitalGainsTax({ ...g, sale: 1_200_000_000 }).total, 0);
  const hi = capitalGainsTax({ ...g, sale: 1_500_000_000 });
  assert.equal(hi.taxableGain, 200_000_000); assert.equal(hi.base, 37_500_000); assert.equal(hi.tax, 4_365_000); assert.equal(hi.local, 436_500);
});

test('양도세 중과와 단기', () => {
  const g = { kind: 'house' as const, sale: 800_000_000, purchase: 600_000_000, expenses: 0, holdYears: 5, liveYears: 0, exemptEligible: false };
  const heavy = capitalGainsTax({ ...g, houses: 2, regulated: true });
  assert.equal(heavy.longTerm, 0); assert.equal(heavy.base, 197_500_000);
  // 기본세율 55.11M(1.5억까지 37.06M + 47.5M×38%) + 20%p 39.5M
  assert.equal(heavy.tax, 94_610_000);
  const normal = capitalGainsTax({ ...g, houses: 2, regulated: false });
  assert.equal(normal.longTermRate, 0.1);
  const short = capitalGainsTax({ ...g, houses: 2, regulated: false, holdYears: 0.5 });
  assert.equal(short.rateLabel, '단기 70%'); assert.equal(short.tax, 197_500_000 * 0.7);
});
