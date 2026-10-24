import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTaiwanLeave } from './taiwan-leave.ts';
test('Taiwan MOL six-month 3-day grant and separate first-year 7-day grant',()=>{
  const half=calculateTaiwanLeave({hireDate:'2025-01-01',asOf:'2025-07-01',used:1});
  const year=calculateTaiwanLeave({hireDate:'2025-01-01',asOf:'2026-01-01',used:1});
  assert.equal(half.ok && half.days,3);
  assert.equal(year.ok && year.days,7);
  assert.equal(year.ok && year.remaining,6);
});
test('grant ladder and its boundaries match the official MOL table',()=>{
  for(const [asOf,days] of [['2025-06-30',0],['2027-01-01',10],['2028-01-01',14],['2030-01-01',15],['2035-01-01',16],['2050-01-01',30],['2051-01-01',30]] as const) {
    const r=calculateTaiwanLeave({hireDate:'2025-01-01',asOf,used:0}); assert.equal(r.ok && r.days,days);
  }
});
test('bad dates, reverse dates, unsupported month-end hire and impossible used days return no estimate',()=>{
  for(const input of [{hireDate:'2025-02-30',asOf:'2026-01-01',used:0},{hireDate:'2025-01-01',asOf:'2024-01-01',used:0},{hireDate:'2024-02-29',asOf:'2026-03-01',used:0},{hireDate:'2025-01-01',asOf:'2026-01-01',used:8},{hireDate:'2025-01-01',asOf:'2026-01-01',used:NaN}]) assert.equal(calculateTaiwanLeave(input).ok,false);
});
