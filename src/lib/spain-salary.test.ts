import test from "node:test";
import assert from "node:assert/strict";
import * as E from "./spain-salary.ts";

test("Salario España: mismas cotizaciones que la pantalla anterior, hijos bajan el IRPF", () => {
  const r = E.esSalary({ gross: 30_000, children: 0, pagas: 12 });
  assert.equal(r.total, Math.round(30_000 * 0.047) + Math.round(30_000 * 0.0155) + Math.round(30_000 * 0.001) + Math.round(30_000 * 0.0015));
  assert.equal(r.annualNet, r.netBeforeIR - r.irpf);
  assert.ok(E.esSalary({ gross: 30_000, children: 2, pagas: 12 }).irpf < r.irpf);
  assert.equal(E.esSalary({ gross: 30_000, children: 0, pagas: 14 }).perPaga, Math.round(r.annualNet / 14));
  assert.ok(E.esSalary({ gross: 80_000, children: 0, pagas: 12 }).solidaridad > 0);
});
