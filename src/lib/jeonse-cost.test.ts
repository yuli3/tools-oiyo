import test from 'node:test';
import assert from 'node:assert/strict';
import { annualRentCredit, housingCost } from './jeonse-cost.ts';
test('unconfirmed credit stays zero; confirmed annual cap applies', () => {
  assert.equal(annualRentCredit(1_000_000, .17, false), 0);
  assert.equal(annualRentCredit(1_000_000, .17, true), 1_700_000);
  assert.equal(annualRentCredit(500_000, .15, true), 900_000);
});
const base = { jeonse: 300_000_000, rentDeposit: 30_000_000, monthlyRent: 1_000_000, loanRatio: .7, loanRate: 3.8, savingsRate: 3.2, creditRate: .17, confirmed: false };
test('monthly cost includes loan and separate equity cost without phantom refund', () => {
  const r = housingCost(base); assert.equal(Math.round(r.jeonseCost), 905_000); assert.equal(r.rentCost, 1_080_000); assert.equal(r.credit, 0);
  assert.equal(Math.round(housingCost({...base, confirmed:true}).rentCost),938333);
});
test('reject invalid or contradictory ranges', () => {
  for (const patch of [{jeonse:NaN},{loanRatio:1.2},{monthlyRent:-1},{loanRate:101},{creditRate:.5}]) assert.throws(()=>housingCost({...base,...patch}), RangeError);
});
