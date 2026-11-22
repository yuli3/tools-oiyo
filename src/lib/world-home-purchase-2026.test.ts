import { test } from "node:test";
import assert from "node:assert/strict";
import { homePurchaseTax, jpContractStamp, ukSdlt } from "./world-home-purchase-2026.ts";

test("UK SDLT bands, first-time buyers, higher rates", () => {
  // 2% of 125,000 + 5% of 45,000
  assert.equal(ukSdlt({ price: 295_000 }).tax, 4_750);
  assert.equal(ukSdlt({ price: 295_000, firstTime: true }).tax, 0);
  assert.equal(ukSdlt({ price: 450_000, firstTime: true }).tax, 7_500);
  // over 500,000: relief lost, standard rates
  assert.equal(ukSdlt({ price: 600_000, firstTime: true }).firstTimeRelief, false);
  assert.equal(ukSdlt({ price: 600_000, firstTime: true }).tax, 2_500 + 17_500);
  // additional property: +5% on every band (GOV.UK table 5/7/10/15/17)
  assert.equal(ukSdlt({ price: 300_000, additional: true }).tax, 6_250 + 8_750 + 5_000);
  assert.equal(ukSdlt({ price: 300_000, nonResident: true }).tax, 2_500 + 5_000 + 3_500);
});

test("JP contract stamp (reduced) and country wrappers", () => {
  assert.equal(jpContractStamp(5_000), 0);
  assert.equal(jpContractStamp(50_000), 200);
  assert.equal(jpContractStamp(30_000_000), 10_000);
  assert.equal(jpContractStamp(80_000_000), 30_000);
  assert.equal(homePurchaseTax({ country: "UK", price: 295_000 }).total, 4_750);
  const fr = homePurchaseTax({ country: "FR", price: 300_000, departmentRate: 0.045 });
  assert.ok(fr.total > 300_000 * 0.058 && fr.total < 300_000 * 0.06);
  assert.equal(homePurchaseTax({ country: "CN", price: 1_000_000, area: 90, order: "first" }).total, 10_000);
});
