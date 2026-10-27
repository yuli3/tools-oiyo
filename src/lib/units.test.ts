import assert from 'node:assert/strict';
import { test } from 'node:test';
import { UNIT_CATEGORIES as U, convertUnit, roundReadable } from './units.ts';

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} ≉ ${b}`);

test('exact NIST length and mass definitions', () => {
  close(convertUnit(U.length, 1, 'in', 'cm'), 2.54);
  close(convertUnit(U.length, 1, 'mile', 'm'), 1609.344);
  close(convertUnit(U.weight, 1, 'lb', 'kg'), 0.45359237);
  close(convertUnit(U.weight, 1, 'stone', 'lb'), 14);
});

test('temperature is affine', () => {
  close(convertUnit(U.temperature, 100, 'c', 'f'), 212);
  close(convertUnit(U.temperature, 0, 'k', 'f'), -459.67);
  close(convertUnit(U.temperature, 36.5, 'c', 'f'), 97.7);
});

test('US volume, speed, pressure and energy', () => {
  close(convertUnit(U.volume, 1, 'gallon_us', 'l'), 3.785411784);
  close(convertUnit(U.volume, 1, 'tbsp_us', 'tsp_us'), 3);
  close(convertUnit(U.speed, 10, 'ms', 'kmh'), 36);
  close(convertUnit(U.speed, 1, 'knot', 'kmh'), 1.852);
  close(convertUnit(U.pressure, 1, 'atm', 'bar'), 1.01325);
  assert.equal(roundReadable(convertUnit(U.pressure, 1, 'atm', 'psi')), 14.696);
  close(convertUnit(U.energy, 1, 'kwh', 'kj'), 3600);
  close(convertUnit(U.energy, 1, 'kcal', 'kj'), 4.184);
});

test('area: pyeong is 400/121 m², acre and hectare exact', () => {
  close(convertUnit(U.area, 121, 'm2', 'pyeong'), 36.6025);
  close(convertUnit(U.area, 1, 'acre', 'm2'), 4046.8564224);
  assert.equal(roundReadable(convertUnit(U.area, 33, 'pyeong', 'm2')), 109.09);
});

test('data storage uses the binary base and time has no months', () => {
  close(convertUnit(U.data, 1, 'gb', 'mb'), 1024);
  close(convertUnit(U.time, 1, 'week', 'hour'), 168);
  assert.ok(!U.time.units.some((u) => u.key === 'month'));
});
