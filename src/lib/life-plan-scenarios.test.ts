import test from "node:test";
import assert from "node:assert/strict";
import * as P from "./life-plan-scenarios.ts";

test("생애 설계: 출발 자금·교육 자금·전세 비율", () => {
  assert.equal(P.startNet({ mine: 5e7, partner: 5e7, wedding: 3e7, housing: 2e8 }), -1.3e8);
  const e = P.eduResult({ cost: 1e7, years: 10, duration: 4, inflation: 0.03, ret: 0 });
  assert.ok(Math.abs(e.monthly - e.future / 120) < 1e-6);
  assert.ok(e.future > 4e7);
  assert.ok(P.eduMonthly({ cost: 1e7, years: 10, duration: 4, inflation: 0.03, ret: 0.05 }) < e.monthly);
  assert.equal(P.jeonseRatio({ price: 3e8, deposit: 2e8, debt: 5e7 }), 0.25e9 / 3e8);
  assert.equal(P.jeonseBand(0.83), "위험");
});
