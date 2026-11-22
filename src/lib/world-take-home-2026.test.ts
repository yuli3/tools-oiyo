import { test } from "node:test";
import assert from "node:assert/strict";
import { ukTakeHome, ukScottishTax, usTakeHome, jpTakeHome, frTakeHome, esTakeHome } from "./world-take-home-2026.ts";
import { jpSalary } from "./japan-salary.ts";
import { frSalary } from "./france-salary.ts";
import { esSalary } from "./spain-salary.ts";

test("UK 2026-27 take-home (England)", () => {
  const r = ukTakeHome({ annual: 35_000 });
  // tax (35,000 - 12,570) * 20% = 4,486; NI (35,000 - 12,570) * 8% = 1,794.40
  assert.equal(r.incomeTax, 4_486);
  assert.equal(r.ni, 1_794.4);
  assert.equal(r.net, 35_000 - 4_486 - 1_794.4);
  const hi = ukTakeHome({ annual: 60_000 });
  assert.equal(hi.ni, (50_270 - 12_570) * 0.08 + (60_000 - 50_270) * 0.02);
  const loan = ukTakeHome({ annual: 35_000, loans: ["plan2", "pg"] });
  assert.equal(loan.loan, Math.round(((35_000 - 29_385) * 0.09 + (35_000 - 21_000) * 0.06) * 100) / 100);
});

test("UK Scottish bands", () => {
  // taxable 22,430: 3,967*19% + (16,956-3,967)*20% + (22,430-16,956)*21%
  assert.equal(ukScottishTax(35_000).tax, Math.round((3_967 * 0.19 + 12_989 * 0.2 + 5_474 * 0.21) * 100) / 100);
  assert.equal(ukScottishTax(125_140).personalAllowance, 0);
});

test("US 2026 federal + FICA", () => {
  const r = usTakeHome({ annual: 60_000 });
  // taxable 43,900: 12,400*10% + 31,500*12% = 1,240 + 3,780
  assert.equal(r.federalTax, 5_020);
  assert.equal(r.socialSecurity, 3_720);
  assert.equal(r.medicare, 870);
  assert.equal(r.additionalMedicare, 0);
  const big = usTakeHome({ annual: 250_000 });
  assert.equal(big.socialSecurity, 184_500 * 0.062);
  assert.equal(big.additionalMedicare, 450);
});

test("JP / FR / ES match the existing salary libraries", () => {
  assert.equal(jpTakeHome({ annual: 5_000_000 }).net, jpSalary({ salary: 5_000_000, age40: false, health: 0.0985 }).annualNet);
  assert.equal(frTakeHome({ annual: 40_000 }).net, frSalary({ gross: 40_000, parts: 1 }).annualNet);
  assert.equal(esTakeHome({ annual: 30_000 }).net, esSalary({ gross: 30_000, children: 0, pagas: 12 }).annualNet);
});
