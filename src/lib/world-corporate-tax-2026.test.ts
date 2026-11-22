import { test } from "node:test";
import assert from "node:assert/strict";
import { corporateTax } from "./world-corporate-tax-2026.ts";

test("corporate tax by statutory rates", () => {
  assert.equal(corporateTax({ country: "JP", profit: 10_000_000 }).tax, 2_320_000);
  assert.equal(corporateTax({ country: "JP", profit: 10_000_000, smallCapital: true }).tax, 1_200_000 + 464_000);
  assert.equal(corporateTax({ country: "UK", profit: 40_000 }).tax, 7_600);
  assert.equal(corporateTax({ country: "UK", profit: 300_000 }).tax, 75_000);
  // HMRC CTM03925 example: profits 90,000 + exempt distributions 8,000 -> 20,406
  assert.equal(Math.round(corporateTax({ country: "UK", profit: 90_000, distributions: 8_000 }).tax), 20_406);
  // one associated company halves the limits: 40,000 > 25,000 lower limit
  assert.ok(corporateTax({ country: "UK", profit: 40_000, associated: 1 }).tax > 7_600);
  assert.equal(corporateTax({ country: "US", profit: 100_000 }).tax, 21_000);
  assert.equal(corporateTax({ country: "FR", profit: 100_000, frSme: true }).tax, 6_375 + 14_375);
  assert.equal(corporateTax({ country: "ES", profit: 100_000, esKind: "micro" }).tax, 9_500 + 10_500);
  assert.equal(corporateTax({ country: "ES", profit: 100_000, esKind: "reduced" }).tax, 23_000);
  const de = corporateTax({ country: "DE", profit: 100_000, hebesatz: 400 });
  assert.equal(de.tax, 15_000);
  assert.equal(de.local, 14_000);
  assert.equal(corporateTax({ country: "DE", profit: 100_000 }).local, null);
});
