import test from "node:test";
import assert from "node:assert/strict";
import * as F from "./france-salary.ts";

test("Salaire France : mêmes cotisations que l'ancien écran, quotient familial", () => {
  const r = F.frSalary({ gross: 40_000, parts: 1 });
  assert.equal(r.retraiteBase, Math.round(40_000 * 0.069 + 40_000 * 0.004));
  assert.equal(r.retraiteCompl2, 0);
  assert.equal(r.annualNet, r.netBeforeIR - r.ir);
  assert.ok(F.frSalary({ gross: 40_000, parts: 2 }).ir < r.ir);
  assert.ok(F.frSalary({ gross: 80_000, parts: 1 }).retraiteCompl2 > 0);
});
