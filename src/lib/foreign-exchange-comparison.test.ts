import test from 'node:test';
import assert from 'node:assert/strict';
import { compareForeignExchange } from './foreign-exchange-comparison.ts';
const base = { foreignAmount: 100, enteredRate: 1400, rateUnit: 1, networkPercent: 1, issuerPercent: 0.5, issuerBasis: 'base' as const, mode: 'offered_final' as const, offeredFinalAmount: 147000, assumedDccMarkupPercent: 5 };
test('worked example: offered final quote is compared as given', () => {
  const r = compareForeignExchange({ ...base, networkPercent: 0, issuerPercent: 0 });
  assert.equal(r.localScenario, 140000); assert.equal(r.dccScenario, 147000); assert.equal(r.delta, 7000);
});
test('issuer fee basis and markup mode', () => {
  assert.equal(compareForeignExchange(base).issuerFee, 700);
  assert.ok(Math.abs(compareForeignExchange({ ...base, issuerBasis: 'base_plus_network' }).issuerFee - 707) < 1e-9);
  assert.ok(Math.abs(compareForeignExchange({ ...base, mode: 'assumed_markup' }).dccScenario - 147000) < 1e-6);
});
test('100-unit rates match 1-unit rates', () => {
  assert.equal(compareForeignExchange({ ...base, rateUnit: 100, enteredRate: 140000 }).base, 140000);
});
test('invalid input throws', () => {
  assert.throws(() => compareForeignExchange({ ...base, enteredRate: 0 }), RangeError);
  assert.throws(() => compareForeignExchange({ ...base, rateUnit: 10 }), RangeError);
  assert.throws(() => compareForeignExchange({ ...base, offeredFinalAmount: NaN }), RangeError);
});
