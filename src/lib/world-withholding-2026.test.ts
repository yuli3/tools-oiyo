import { test } from "node:test";
import assert from "node:assert/strict";
import { withholding, WHT_RULES } from "./world-withholding-2026.ts";

test("domestic withholding rates as read", () => {
  assert.equal(withholding({ country: "JP", type: "royalty", amount: 1_000_000 }).tax, 204_200);
  assert.equal(withholding({ country: "JP", type: "dividend", amount: 100_000, listedShares: true }).rate, 15.315);
  assert.equal(withholding({ country: "US", type: "royalty", amount: 10_000 }).tax, 3_000);
  assert.equal(withholding({ country: "ES", type: "services", amount: 1_000, euEea: true }).rate, 19);
  assert.equal(withholding({ country: "ES", type: "services", amount: 1_000 }).rate, 24);
  assert.equal(withholding({ country: "TW", type: "salary", amount: 50_000, lowPay: true }).rate, 6);
  assert.equal(withholding({ country: "DE", type: "royalty", amount: 10_000 }).tax, 1_500);
  assert.equal(withholding({ country: "DE", type: "director", amount: 10_000 }).rate, 30);
  assert.equal(withholding({ country: "FR", type: "royalty", amount: 1_000, etnc: true }).rate, 75);
});

test("unread rates are not computed", () => {
  const r = withholding({ country: "FR", type: "interest", amount: 1_000 });
  assert.equal(r.covered, false);
  assert.equal(r.tax, null);
  assert.equal(withholding({ country: "US", type: "salary", amount: 1_000 }).tax, null);
  for (const c of Object.values(WHT_RULES)) for (const r of Object.values(c)) assert.ok(r.note && r.cite);
});
