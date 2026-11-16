import test from "node:test";
import assert from "node:assert/strict";
import * as C from "./china-salary.ts";

test("中国个税: 与旧画面相同，专项附加扣除减少个税", () => {
  const r = C.cnSalary({ gross: 15_000, hf: 0.12, special: 0 });
  assert.equal(r.si, Math.round(15_000 * 0.08) + Math.round(15_000 * 0.02) + Math.round(15_000 * 0.005) + Math.round(15_000 * 0.12));
  assert.equal(r.monthlyTaxable, 15_000 - r.si - 5_000);
  assert.ok(C.cnSalary({ gross: 15_000, hf: 0.12, special: 2_000 }).iit < r.iit);
  assert.equal(C.annualIIT(36_000), 1_080);
  assert.equal(C.cnSalary({ gross: 100_000, hf: 0.07, special: 0 }).base, C.SI_BASE_CAP);
});
