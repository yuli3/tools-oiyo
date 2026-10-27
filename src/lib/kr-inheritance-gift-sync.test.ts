import test from 'node:test';
import assert from 'node:assert/strict';
import { INHERITANCE_GIFT_2026 } from './kr-payroll-2026.ts';
import { KR_RATES_2026 } from './kr-rates-2026.mjs';

// W8 (2026-10-27): the inheritance/gift calculator reads kr-payroll-2026.ts; the rate registry is the source.
test('inheritance and gift numbers match the Tools rate registry', () => {
  const r = KR_RATES_2026.inheritanceGift;
  assert.deepEqual(INHERITANCE_GIFT_2026.brackets.map((b) => [...b]), r.brackets.map((b: number[]) => [...b]));
  for (const [k, v] of Object.entries(INHERITANCE_GIFT_2026.giftDeductions)) assert.equal(v, r.giftDeductions[k], k);
  for (const k of ['marriageBirthDeduction', 'inheritanceLumpSum', 'spouseInheritanceMin', 'spouseInheritanceMax', 'filingCredit'] as const)
    assert.equal(INHERITANCE_GIFT_2026[k], r[k], k);
});
