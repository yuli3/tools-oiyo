import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isIgnoredNode, toolIdFromPath } from './tool-telemetry.ts';

test('tool id comes from the locale-prefixed slug only', () => {
  assert.equal(toolIdFromPath('/ko/gas-bill-calculator/'), 'gas-bill-calculator');
  assert.equal(toolIdFromPath('/en/loan-comparison-calculator'), 'loan-comparison-calculator');
  assert.equal(toolIdFromPath('/'), null);
  assert.equal(toolIdFromPath('/en/'), null);
  assert.equal(toolIdFromPath('/de/some-tool/'), null);
  assert.equal(toolIdFromPath('/ko/Bad_Slug/'), null);
});

const el = (insideAd: boolean) => ({ closest: () => (insideAd ? {} : null) });

test('ad containers and detached nodes are ignored', () => {
  assert.equal(isIgnoredNode(el(true)), true);
  assert.equal(isIgnoredNode(el(false)), false);
  assert.equal(isIgnoredNode({ parentElement: el(false) }), false);
  assert.equal(isIgnoredNode({ parentElement: el(true) }), true);
  assert.equal(isIgnoredNode({ parentElement: null }), true);
  assert.equal(isIgnoredNode(null), true);
});
