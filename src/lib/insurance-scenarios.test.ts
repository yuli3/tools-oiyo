import test from "node:test";
import assert from "node:assert/strict";
import * as I from "./insurance-scenarios.ts";

test("보험료: 기존 배수 모형(가산) 그대로", () => {
  const base: I.InsLite = { type: "term", age: 30, sex: "m", smoke: "never", health: "good", coverage: 100000000, term: 20 };
  const r = I.insResult(base);
  assert.equal(Math.round(r.base), 120000);
  assert.equal(Math.round(r.monthly), 134400); // 30세 배수 1.0, 남성 정기 1.12
  assert.ok(I.insMonthly({ ...base, smoke: "current" }) > r.monthly);
  assert.equal(I.ageK(34), 1);
  assert.equal(I.ageK(70), 3.4);
});
