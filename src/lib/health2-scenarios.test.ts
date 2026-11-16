import test from "node:test";
import assert from "node:assert/strict";
import * as H from "./health2-scenarios.ts";

test("탄단지: 4·4·9kcal/g, 탄수는 나머지", () => {
  const r = H.macroResult({ calories: 2000, weight: 70, protein: 0.3, fat: 0.3 });
  assert.equal(r.proteinG, 150);
  assert.equal(Math.round(r.carbsG), 200);
  assert.equal(Math.round(r.fatG), 67);
  assert.equal(Math.round(r.c * 100), 40);
  const k = H.macroResult({ calories: 2000, weight: 70, protein: 0.4, fat: 0.7 });
  assert.equal(k.c, 0);
  assert.ok(Math.abs(k.f - 0.6) < 1e-9);
});

test("표준 체중: 키² × 22/21, 공식 6개", () => {
  assert.equal(Math.round(H.standardWeight({ sex: "m", height: 175, weight: 70 }) * 10) / 10, 67.4);
  assert.equal(Math.round(H.standardWeight({ sex: "f", height: 160, weight: 55 }) * 10) / 10, 53.8);
  assert.equal(H.idealFormulas({ sex: "m", height: 175, weight: 70 }).length, 6);
});

test("물·심박·1RM·자녀 키·카페인", () => {
  const w = H.waterResult({ weight: 65, activity: "moderate", temp: "normal", alcohol: 0 });
  assert.equal(w.total, 1950 + 350 + 150);
  assert.equal(w.cups, 10);
  const h = H.heartResult({ age: 40, resting: 0, zone: 1 });
  assert.equal(h.max, 180);
  assert.equal(Math.round(h.z.from), 108);
  const k = H.heartResult({ age: 40, resting: 60, zone: 1 });
  assert.ok(k.karvonen);
  assert.equal(Math.round(k.z.from), 132);
  assert.equal(H.oneRmOf({ weight: 100, reps: 1 }), 100);
  assert.equal(Math.round(H.epley(100, 5) * 10) / 10, 116.7);
  assert.equal(Math.round(H.brzycki(100, 5) * 10) / 10, 112.5);
  assert.equal(H.childOf({ father: 175, mother: 162, sex: "m" }), 175);
  assert.equal(H.caffeineLeft({ amount: 200, gap: 5, halfLife: 5 }), 100);
  assert.equal(H.hoursUntil({ amount: 200, gap: 0, halfLife: 5 }, 50), 10);
});
