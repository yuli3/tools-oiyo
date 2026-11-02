import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fullRetirementAgeMonths, claimingFactor, socialSecurityTable, breakEvenMonths, pmiDates, addMonths, ukPlan2Rate, ukStudentLoan, nisaPlan } from './country-finance-2.ts';

test('SSA full retirement age table and January 1 rule', () => {
  assert.equal(fullRetirementAgeMonths('1954-06-01'), 792);
  assert.equal(fullRetirementAgeMonths('1957-03-10'), 798);
  assert.equal(fullRetirementAgeMonths('1960-01-01'), 802); // Jan 1 uses 1959: 66 and 10 months
  assert.equal(fullRetirementAgeMonths('1960-01-02'), 804);
  assert.equal(fullRetirementAgeMonths('1990-02-30'), null);
  assert.equal(fullRetirementAgeMonths('1940-05-05'), null);
});
test('SSA reduction 5/9% then 5/12% and 8%/yr credit to 70', () => {
  assert.ok(Math.abs(claimingFactor(744, 804) - 0.70) < 1e-12); // 62 with FRA 67
  assert.ok(Math.abs(claimingFactor(744, 792) - 0.75) < 1e-12); // 62 with FRA 66
  assert.ok(Math.abs(claimingFactor(840, 804) - 1.24) < 1e-12); // 70 with FRA 67
  assert.ok(Math.abs(claimingFactor(900, 804) - 1.24) < 1e-12); // nothing after 70
  assert.ok(Math.abs(claimingFactor(804, 804) - 1) < 1e-12);
});
test('SSA table and break-even', () => {
  const t = socialSecurityTable('1970-05-15', '2000', '85')!;
  assert.equal(t.rows[0].monthly, 1400);
  assert.equal(t.rows.at(-1)!.monthly, 2480);
  assert.equal(breakEvenMonths(t.rows[0], t.rows.find(r => r.months === 804)!), 944); // 78y8m
  assert.equal(socialSecurityTable('1970-05-15', '', '85'), null);
});
test('PMI 80/78 dates follow the original schedule and midpoint', () => {
  const r = pmiDates('400000', '360000', '6', '30', '')!;
  assert.ok(Math.abs(r.startLtv - 90) < 1e-9);
  assert.ok(Math.abs(r.payment - 2158.38) < 0.01);
  assert.equal(r.midpoint, 180);
  assert.ok(r.request80! > 0 && r.auto78! > r.request80!);
  assert.equal(r.request80, 89); // balance first <= 320,000 in month 89
  const x = pmiDates('400000', '360000', '6', '30', '500')!;
  assert.ok(x.request80WithExtra! < r.request80!);
  assert.equal(pmiDates('400000', '300000', '6', '30', '')!.request80, 0);
  assert.equal(addMonths('2026-12', 1), '2026-12');
  assert.equal(addMonths('2026-12', 89), '2034-04');
});
test('UK Plan 2 rate scales between the gov.uk income amounts and caps at 6%', () => {
  assert.equal(ukPlan2Rate(20000), 4.1);
  assert.equal(ukPlan2Rate(60000), 6);
  assert.ok(ukPlan2Rate(41135) > 4.1 && ukPlan2Rate(41135) < 6);
});
test('UK repayment is 9% above threshold and writes off after 30/40 years', () => {
  const low = ukStudentLoan('plan5', '50000', '24000', '0', '4.1', '0')!;
  assert.equal(low.paid, 0);
  assert.equal(low.rows.length, 40);
  assert.ok(low.writtenOff > 50000);
  const high = ukStudentLoan('plan2', '20000', '80000', '0', '4.1', '0')!;
  assert.ok(Math.abs(high.rows[0].repaid - (80000 - 29385) * 0.09) < 1e-6);
  assert.ok(high.clearedYear !== null && high.writtenOff === 0);
  assert.equal(ukStudentLoan('plan2', '0', '30000', '0', '4.1', '0'), null);
});
test('NISA annual and lifetime limits', () => {
  const r = nisaPlan('0', '0', '100000', '2400000', '2026')!;
  assert.equal(r.rows[0].total, 3600000);
  assert.equal(r.fullYear, 2030);
  assert.equal(r.rows.at(-1)!.total, 18000000);
  const g = nisaPlan('0', '0', '0', '2400000', '2026')!;
  assert.equal(g.rows.at(-1)!.total, 12000000); // growth frame alone stops at 1,200万
  assert.equal(g.fullYear, null);
  assert.deepEqual(nisaPlan('0', '0', '100001', '0', '2026')!.errors, ['tsumitate']);
  assert.equal(nisaPlan('100', '200', '0', '0', '2026'), null);
});
