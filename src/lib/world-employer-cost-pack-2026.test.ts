import { test } from "node:test";
import assert from "node:assert/strict";
import { jpEmployerCost, ukEmployerCost, ukNicPerEmployee, usEmployerCost, usFicaEmployer, esEmployerCost } from "./world-employer-cost-pack-2026.ts";

test("jp: 300k Tokyo under 40", () => {
  const r = jpEmployerCost({ monthly: 300_000, age: 30 });
  const by = Object.fromEntries(r.lines.map((l) => [l.id, l.amount]));
  assert.equal(by.health, 14_775);
  assert.equal(by.pension, 27_450);
  assert.equal(by.child, 1_080);
  assert.equal(by.employment, 2_550);
  assert.equal(by.care, undefined);
  assert.equal(r.employer, 14_775 + 27_450 + 1_080 + 2_550);
  assert.equal(r.worker.employment, 1_500);
});
test("jp: care 40-64 and pension cap", () => {
  const r = jpEmployerCost({ monthly: 1_000_000, age: 45, industry: "construction" });
  const by = Object.fromEntries(r.lines.map((l) => [l.id, l.amount]));
  assert.equal(by.care, 8_100);
  assert.equal(by.pension, 59_475);
  assert.equal(by.employment, 10_500);
});
test("uk: NICs, under-21 and allowance", () => {
  assert.equal(ukNicPerEmployee(30_000), 3_750);
  assert.equal(ukNicPerEmployee(30_000, "under21"), 0);
  assert.equal(ukNicPerEmployee(60_270, "apprentice"), 1_500);
  const r = ukEmployerCost({ annual: 30_000, employees: 4, allowance: true });
  assert.equal(r.employer, 15_000 - 10_500);
  const big = ukEmployerCost({ annual: 40_000, employees: 100 });
  assert.equal(big.lines.find((l) => l.id === "levy")!.amount, 5_000);
});
test("us: FICA with wage base", () => {
  assert.equal(usFicaEmployer(100_000), 7_650);
  assert.equal(usFicaEmployer(200_000), 11_439 + 2_900);
  assert.equal(usEmployerCost({ annual: 50_000 }).employer, 3_825);
});
test("es: base clamp", () => {
  assert.equal(esEmployerCost({ monthly: 2_000 }).employer, 472);
  assert.equal(esEmployerCost({ monthly: 1_000, group: 1 }).base, 1_989.3);
  assert.equal(esEmployerCost({ monthly: 9_000 }).base, 5_101.2);
});
