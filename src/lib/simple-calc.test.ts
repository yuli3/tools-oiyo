import test from 'node:test';
import assert from 'node:assert/strict';
import { pressKey, initialCalc, koreanUnits, parseAmount, discount, daysBetween, ageOn, zodiacIndex, addTime, depositInterest, convertArea, type CalcState } from './simple-calc.ts';

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

test('age in full years and days to next birthday', () => {
  assert.deepEqual(ageOn('1956-03-10', '2026-11-22'), { age: 70, toNext: 108, birthYear: 1956 });
  assert.equal(ageOn('1956-11-22', '2026-11-22')?.age, 70);
  assert.equal(ageOn('1956-11-22', '2026-11-22')?.toNext, 0);
  assert.equal(ageOn('1956-11-23', '2026-11-22')?.age, 69);
  assert.equal(ageOn('2000-02-29', '2026-03-02')?.toNext, 364);
  assert.equal(ageOn('2030-01-01', '2026-11-22'), null);
});

test('zodiac', () => {
  assert.equal(zodiacIndex(2020), 0); // 쥐
  assert.equal(zodiacIndex(1956), 8); // 원숭이
  assert.equal(zodiacIndex(2026), 6); // 말
});

test('add time across midnight', () => {
  assert.deepEqual(addTime('21:30', 8, 0), { hour: 5, minute: 30, dayOffset: 1 });
  assert.deepEqual(addTime('08:00', 4, 30), { hour: 12, minute: 30, dayOffset: 0 });
});

test('deposit interest with 15.4% tax', () => {
  const r = depositInterest(10_000_000, 3, 12, 0.154);
  assert.equal(Math.round(r.gross), 300000);
  assert.equal(Math.round(r.net), 253800);
});

test('area 평 to m2', () => {
  assert.equal(Math.round(convertArea(34, 'pyeong', 'm2') * 100) / 100, 112.4);
  assert.equal(Math.round(convertArea(84, 'm2', 'pyeong') * 100) / 100, 25.41);
});
