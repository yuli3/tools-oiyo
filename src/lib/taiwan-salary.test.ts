import test from "node:test";
import assert from "node:assert/strict";
import * as T from "./taiwan-salary.ts";

test("台湾薪资: 与旧画面相同的分段税率", () => {
  assert.equal(T.twAnnualTax(600_000, 1), Math.round((600_000 - 136_000 - 227_000 - 101_000) * 0.05));
  const r = T.twSalary({ gross: 50_000, people: 1, bonus: 0 });
  assert.equal(r.labor, Math.round(45_800 * 0.025));
  assert.equal(r.nhi, Math.round(50_000 * 0.01551));
  assert.ok(T.twSalary({ gross: 50_000, people: 1, bonus: 2 }).annualNet > r.annualNet);
  assert.ok(T.twAnnualTax(1_000_000, 3) < T.twAnnualTax(1_000_000, 1));
});
