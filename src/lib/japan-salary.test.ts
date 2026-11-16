import test from "node:test";
import assert from "node:assert/strict";
import * as J from "./japan-salary.ts";

test("日本の手取り: 旧画面と同じ計算", () => {
  const r = J.jpSalary({ salary: 5_000_000, age40: false, health: 0.0985 });
  assert.equal(r.gross, 416_666);
  assert.equal(r.healthIns, Math.floor(416_666 * 0.04925));
  assert.equal(r.pension, Math.floor(416_666 * 0.0915));
  assert.ok(r.net > 300_000 && r.net < 360_000);
  assert.ok(J.jpSalary({ salary: 5_000_000, age40: true, health: 0.0985 }).net < r.net);
  assert.equal(J.incomeTax(1_000_000), Math.floor(50_000 * 1.021));
  assert.equal(J.employmentDeduction(10_000_000), 1_950_000);
});
