import { test } from 'node:test';
import assert from 'node:assert/strict';
import { debtAmountCents, precedingIncomeMonths, bankruptcyIncomeWorksheet, monthlyDebtBudget } from './debt-planning.ts';

test('money accepts explicit zero and decimal cents, rejects missing, unsafe and partial values', () => {
  assert.equal(debtAmountCents('0'), 0);
  assert.equal(debtAmountCents('12,05'), 1205);
  for (const value of ['', ' ', '-1', '1e3', '12 dollars', 'NaN', 'Infinity', '1.001', '9007199254740992']) assert.equal(debtAmountCents(value), null);
});
test('six complete calendar months exclude the filing month across year and leap boundaries', () => {
  assert.deepEqual(precedingIncomeMonths('2027-01-15'), ['2026-07','2026-08','2026-09','2026-10','2026-11','2026-12']);
  assert.deepEqual(precedingIncomeMonths('2028-03-01'), ['2027-09','2027-10','2027-11','2027-12','2028-01','2028-02']);
  assert.equal(precedingIncomeMonths('2026-02-29'), null);
  assert.equal(precedingIncomeMonths(''), null);
});
test('annualization uses the unrounded six-month total; comparison requires a confirmed positive reference', () => {
  const inputs = ['1.01','0','0','0','0','0'];
  assert.equal(bankruptcyIncomeWorksheet(inputs, '2.02', true)?.annualCents, 202);
  assert.equal(bankruptcyIncomeWorksheet(inputs, '2.02', true)?.differenceCents, 0);
  assert.equal(bankruptcyIncomeWorksheet(inputs, '2.00', true)?.differenceCents, 2);
  assert.equal(bankruptcyIncomeWorksheet(inputs, '3', false)?.differenceCents, null);
  assert.equal(bankruptcyIncomeWorksheet(inputs, '0', true)?.differenceCents, null);
  assert.equal(bankruptcyIncomeWorksheet([''], '3', true), null);
});
test('French budget preserves a shortfall and refuses missing input instead of assuming zero', () => {
  assert.deepEqual(monthlyDebtBudget('1500','1200','400'), { incomeCents:150000, essentialsCents:120000, paymentsCents:40000, balanceCents:-10000 });
  assert.equal(monthlyDebtBudget('1500','','400'), null);
  assert.equal(monthlyDebtBudget('0','0','0')?.balanceCents, 0);
});

import { cardMinimumPaymentCents, simulateCardPayoff, levelPaymentCents, cardPayoffComparison } from './debt-planning.ts';
test('card minimum uses percent of balance plus interest with a floor, never above the payoff amount', () => {
  const rule = { percent: 1, floorCents: 3500, addInterest: true };
  assert.equal(cardMinimumPaymentCents(500000, 9167, rule), 14167);
  assert.equal(cardMinimumPaymentCents(100000, 1833, rule), 3500);
  assert.equal(cardMinimumPaymentCents(2000, 37, rule), 2037);
  assert.equal(cardMinimumPaymentCents(500000, 9167, { percent: 2, floorCents: 2500, addInterest: false }), 10000);
});
test('36-month level payment clears the balance in exactly 36 months', () => {
  const pay = levelPaymentCents(500000, 22, 36);
  assert.equal(pay, 19096);
  const plan = simulateCardPayoff(500000, 22, () => pay);
  assert.equal(plan.months, 36);
  assert.equal(levelPaymentCents(36000, 0, 36), 1000);
});
test('payments at or below interest never pay off; zero APR is plain division', () => {
  assert.deepEqual(simulateCardPayoff(500000, 24, () => 10000), { months: null, reason: 'never' });
  assert.deepEqual(simulateCardPayoff(120000, 0, () => 10000), { months: 12, totalPaidCents: 120000, interestCents: 0 });
});
test('comparison rejects blank or invalid inputs and shows minimum-only takes longer than 36 months', () => {
  assert.equal(cardPayoffComparison('', '22', '1', '35', true, ''), null);
  assert.equal(cardPayoffComparison('5000', '', '1', '35', true, ''), null);
  assert.equal(cardPayoffComparison('5000', '22', '0', '35', true, ''), null);
  assert.equal(cardPayoffComparison('5000', '22', '1', '35', true, '-5'), null);
  const r = cardPayoffComparison('5000', '22', '1', '35', true, '250')!;
  assert.equal(r.firstMinimumCents, 14167);
  assert.ok(r.minimum.months !== null && r.minimum.months > 36);
  assert.ok(r.fixedPlan && r.fixedPlan.months !== null && r.fixedPlan.months < 36);
  assert.ok(r.minimum.months !== null && r.in36.months === 36 && r.minimum.interestCents > r.in36.interestCents);
});
