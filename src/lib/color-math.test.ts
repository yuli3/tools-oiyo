import assert from 'node:assert/strict';
import test from 'node:test';
import { cmykToRgb, contrast, hexToRgb, hslToRgb, rgbToCmyk, rgbToHex, rgbToHsl, rgbToHsv } from './color-math.ts';

test('hex and rgb round-trip', () => {
  assert.deepEqual(hexToRgb('#ff8000'), [255, 128, 0]);
  assert.equal(rgbToHex(255, 128, 0), '#ff8000');
});

test('hsl, hsv and cmyk match published values for pure colors', () => {
  assert.deepEqual(rgbToHsl(255, 0, 0), [0, 100, 50]);
  assert.deepEqual(hslToRgb(120, 100, 50), [0, 255, 0]);
  assert.deepEqual(rgbToHsv(0, 0, 255), [240, 100, 100]);
  assert.deepEqual(rgbToCmyk(255, 255, 0), [0, 0, 100, 0]);
  assert.deepEqual(rgbToCmyk(0, 0, 0), [0, 0, 0, 100]);
  assert.deepEqual(cmykToRgb(0, 100, 100, 0), [255, 0, 0]);
});

test('WCAG contrast: black on white is 21, same color is 1', () => {
  assert.equal(contrast('000000', 'FFFFFF').toFixed(2), '21.00');
  assert.equal(contrast('#777777', '#777777'), 1);
  assert.ok(contrast('767676', 'FFFFFF') >= 4.5);
});
