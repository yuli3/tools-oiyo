import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateJapanPremium } from './japan-premium.ts';

test('Japan MHLW hourly example: 1,000 yen and one overtime hour pays 1,250', () => {
  const r = calculateJapanPremium({hourly:1000, ordinary:0, overtime:1, night:0, overtimeNight:0, holiday:0, holidayNight:0});
  assert.equal(r.ok && r.total,1250);
  assert.equal(r.ok && r.premium,250);
});
const zero={hourly:1000,ordinary:0,overtime:0,night:0,overtimeNight:0,holiday:0,holidayNight:0};
test('night overtime and statutory holiday are distinct non-overlapping categories',()=>{
  const r=calculateJapanPremium({...zero,overtimeNight:2,holidayNight:1});
  assert.equal(r.ok && r.total,4600);
  assert.equal(r.ok && r.premium,1600);
});
test('invalid money or unsupported hour totals produce no amount',()=>{
  for(const input of [{...zero,hourly:NaN},{...zero,hourly:Infinity},{...zero,hourly:0},{...zero,night:-1},{...zero,overtime:61},{...zero,ordinary:745},{...zero,hourly:1e308}]) {
    assert.equal(calculateJapanPremium(input).ok,false);
  }
});
