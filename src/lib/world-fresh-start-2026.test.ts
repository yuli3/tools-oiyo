import { test } from "node:test";
import assert from "node:assert/strict";
import { twDebtClearance, esSecondChance, esInheritanceDeadline } from "./world-fresh-start-2026.ts";

test("fresh start checks", () => {
  const a = twDebtClearance({ totalDebt: 3_000_000, hasBankDebt: true });
  assert.ok(a.consumer && a.route === "restructure_or_liquidation" && a.needsBankNegotiation);
  assert.equal(twDebtClearance({ totalDebt: 13_000_000 }).route, "liquidation_only");
  assert.equal(twDebtClearance({ hadBusiness5y: true, avgMonthlyRevenue5y: 250_000, totalDebt: 1_000_000 }).route, "none");
  assert.equal(twDebtClearance({ hadBusiness5y: true, avgMonthlyRevenue5y: 200_000, totalDebt: 12_000_000 }).route, "restructure_or_liquidation");
  assert.equal(esSecondChance({}).eligible, true);
  assert.equal(esSecondChance({ conviction10y: true }).eligible, false);
  assert.equal(esSecondChance({ priorExoneration: "plan", priorDate: "2025-06-01", today: "2026-11-22" }).eligible, false);
  assert.equal(esSecondChance({ priorExoneration: "plan", priorDate: "2024-06-01", today: "2026-11-22" }).eligible, true);
  assert.equal(esSecondChance({ priorExoneration: "liquidation", priorDate: "2024-06-01", today: "2026-11-22" }).eligible, false);
  const d = esInheritanceDeadline({ death: "2026-08-31", today: "2026-11-22" });
  assert.ok(d.ok && d.deadline === "2027-02-28" && !d.passed);
});
