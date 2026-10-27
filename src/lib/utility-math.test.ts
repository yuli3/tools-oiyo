import assert from 'node:assert/strict';
import test from 'node:test';
import { convertBase, simplifyRatio } from './utility-math.ts';

test('common screen sizes reduce to their published ratios', () => {
  assert.deepEqual(simplifyRatio(1920, 1080), { w: 16, h: 9 });
  assert.deepEqual(simplifyRatio(1024, 768), { w: 4, h: 3 });
  assert.deepEqual(simplifyRatio(3440, 1440), { w: 43, h: 18 });
  assert.deepEqual(simplifyRatio(0, 1080), { w: 0, h: 0 });
});

test('base conversion round-trips and rejects digits outside the base', () => {
  assert.equal(convertBase('255', 10, 16), 'FF');
  assert.equal(convertBase('255', 10, 2), '11111111');
  assert.equal(convertBase('ff', 16, 10), '255');
  assert.equal(convertBase('0017', 8, 10), '15');
  assert.equal(convertBase('102', 2, 10), null);
  assert.equal(convertBase('', 10, 2), null);
});
