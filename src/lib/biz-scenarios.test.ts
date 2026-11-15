import test from "node:test";
import assert from "node:assert/strict";
import { GROWTH_EXAMPLE, RUNWAY_ASSUMPTIONS, UNIT_ASSUMPTIONS, cashMonths, ltvCac, paybackMonths } from "./biz-scenarios.ts";
import { tornado, sweep } from "./scenario.ts";

test("예시 단위경제: LTV/CAC와 회수 기간", () => {
  // 39,000 × 0.7 = 27,300/월, LTV 27,300/0.06 = 455,000, CAC 120,000
  assert.equal(Math.round(ltvCac(GROWTH_EXAMPLE) * 100) / 100, 3.79);
  assert.equal(Math.round(paybackMonths(GROWTH_EXAMPLE) * 100) / 100, 4.4);
});

test("토네이도: 이탈률·CAC가 LTV/CAC를 크게 흔듦, 런웨이는 비용", () => {
  const bars = tornado(GROWTH_EXAMPLE, UNIT_ASSUMPTIONS, ltvCac);
  assert.equal(bars.length, 4);
  assert.ok(["monthlyChurn", "cac", "arpu", "grossMargin"].includes(bars[0].key));
  const rb = tornado(GROWTH_EXAMPLE, RUNWAY_ASSUMPTIONS, cashMonths);
  assert.ok(rb[0].span > 0);
  const pts = sweep(GROWTH_EXAMPLE, RUNWAY_ASSUMPTIONS[3], cashMonths, [0, 100_000_000], 10);
  // 비용이 커질수록 버티는 달은 줄어요(단조 비증가)
  for (let i = 1; i < pts.length; i++) assert.ok(pts[i].y <= pts[i - 1].y);
});

test("현금 버티는 달: 예시는 36개월 안에 흑자 전환 여부와 무관하게 0~36", () => {
  const m = cashMonths(GROWTH_EXAMPLE);
  assert.ok(m >= 0 && m <= 36);
  assert.equal(cashMonths({ ...GROWTH_EXAMPLE, revenue: 100_000_000 }), 36);
});
