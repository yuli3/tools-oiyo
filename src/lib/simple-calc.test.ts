import test from 'node:test';
import assert from 'node:assert/strict';
import { pressKey, initialCalc, koreanUnits, parseAmount, discount, daysBetween, type CalcState } from './simple-calc.ts';

const run = (keys: string[]) => keys.reduce<CalcState>((s, k) => pressKey(s, k), initialCalc);

test('desk calculator evaluates in key order', () => {
  assert.equal(run(['2', '+', '3', '×', '4', '=']).display, '20');
  assert.equal(run(['1', '0', '÷', '4', '=']).display, '2.5');
  assert.equal(run(['0', '.', '1', '+', '0', '.', '2', '=']).display, '0.3');
  assert.equal(run(['9', '⌫', '7', '=']).display, '7');
});

test('percent like a desk calculator', () => {
  assert.equal(run(['2', '0', '0', '0', '0', '-', '1', '0', '%', '=']).display, '18000');
  assert.equal(run(['5', '0', '%']).display, '0.5');
});

test('divide by zero shows Error and C resets', () => {
  const e = run(['5', '÷', '0', '=']);
  assert.equal(e.display, 'Error');
  assert.equal(pressKey(e, '3').display, '3');
});

test('Korean unit reading', () => {
  assert.equal(koreanUnits(29000), '2만 9,000');
  assert.equal(koreanUnits(1234567), '123만 4,567');
  assert.equal(koreanUnits(150000000), '1억 5,000만');
  assert.equal(koreanUnits(9999), '9,999');
});

test('parseAmount handles commas', () => {
  assert.equal(parseAmount('87,000'), 87000);
  assert.equal(parseAmount('12.5'), 12.5);
  assert.equal(parseAmount(''), 0);
});

test('discount and days', () => {
  assert.deepEqual(discount(100000, 30), { final: 70000, saved: 30000 });
  assert.equal(daysBetween('2026-11-22', '2026-12-25'), 33);
  assert.equal(daysBetween('2026-11-22', '2026-11-01'), -21);
  assert.equal(daysBetween('bad', '2026-11-01'), null);
});
