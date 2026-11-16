import test from "node:test";
import assert from "node:assert/strict";
import * as H from "./health-scenarios.ts";

test("BMI: 한국 기준 구간과 정상 체중 범위", () => {
  assert.equal(H.bmiBand(22.9), "정상");
  assert.equal(H.bmiBand(23), "비만 전단계");
  assert.equal(H.bmiBand(25), "1단계 비만");
  const r = H.bmiResult({ height: 175, weight: 80 });
  assert.equal(Math.round(r.bmi * 10) / 10, 26.1);
  assert.equal(Math.round(r.high * 10) / 10, 70.1);
  assert.ok(r.toNormal > 0);
});

test("체지방률: 미 해군 cm 공식", () => {
  const m = H.bodyFatResult({ sex: "m", height: 175, weight: 70, waist: 82, neck: 37, hip: 95 });
  assert.equal(Math.round(m.pct * 10) / 10, 15.4);
  const f = H.bodyFatPct({ sex: "f", height: 162, weight: 55, waist: 70, neck: 32, hip: 95 });
  assert.equal(Math.round(f * 10) / 10, 25.7);
  assert.ok(Number.isNaN(H.bodyFatPct({ sex: "m", height: 175, weight: 70, waist: 30, neck: 37, hip: 95 })));
});

test("TDEE: Mifflin-St Jeor × 활동 계수", () => {
  const i: H.TdeeLite = { sex: "m", age: 30, height: 175, weight: 70, activity: "moderate" };
  assert.equal(H.bmrOf(i), 1648.75);
  assert.equal(H.tdeeOf(i), 1648.75 * 1.55);
  assert.equal(H.bmrOf({ ...i, sex: "f" }), 1648.75 - 166);
  assert.equal(H.tdeeCompare(i).filter((x) => x.current).length, 1);
});
