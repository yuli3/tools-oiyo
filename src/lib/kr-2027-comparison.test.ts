import test from 'node:test';
import assert from 'node:assert/strict';
import { minimumPayComparison, proposedWithholdingComparison } from './kr-2027-comparison.ts';
import { KR_RATES_2027 } from './kr-rates-2027.mjs';
test('209-hour published examples and custom paid hours are arithmetic only', () => {
  assert.deepEqual(minimumPayComparison(209), { before: 2156880, after: 2236300, difference: 79420 });
  assert.deepEqual(minimumPayComparison(0), { before: 0, after: 0, difference: 0 });
  assert.equal(minimumPayComparison(40).difference, 15200);
});
test('proposal changes advance withholding, not the final tax liability', () => {
  assert.deepEqual(proposedWithholdingComparison(3000000), { before: 99000, after: 66000, currentCash: 2901000, proposedCash: 2934000, difference: 33000 });
  assert.equal(KR_RATES_2027.freelancerProposal.legalStatus, 'proposal');
});
test('both public calculators reject nonfinite, negative and out-of-scope values', () => {
  for (const value of [NaN, Infinity, -1]) {
    assert.throws(() => minimumPayComparison(value));
    assert.throws(() => proposedWithholdingComparison(value));
  }
  assert.throws(() => minimumPayComparison(745));
  assert.throws(() => proposedWithholdingComparison(1000000001));
});
