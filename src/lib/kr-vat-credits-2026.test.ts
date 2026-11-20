import { test } from "node:test";
import assert from "node:assert/strict";
import { badDebtCredit, cardSalesCredit, deemedInputCredit } from "./kr-vat-credits-2026.ts";

test("개인 음식점 반기 과세표준 1.5억, 면세 식재료 6,000만 원: 9/109, 한도 70% 안이라 495만 원", () => {
  const r = deemedInputCredit({ type: "restaurant-individual", purchases: 60_000_000, taxBase: 150_000_000 });
  assert.equal(r.rate, "9/109");
  assert.equal(r.credit, 4_954_128);
  assert.equal(r.capped, false);
});

test("한도 초과: 개인 음식점 과세표준 1억, 매입 9,000만 원 → 한도 75%(7,500만 원분)", () => {
  const r = deemedInputCredit({ type: "restaurant-individual", purchases: 90_000_000, taxBase: 100_000_000 });
  assert.equal(r.capped, true);
  assert.equal(r.limitPurchases, 75_000_000);
  assert.equal(r.credit, 6_192_660);
  assert.equal(deemedInputCredit({ type: "restaurant-corp", purchases: 10_000_000, taxBase: 100_000_000, corp: true }).rate, "6/106");
});

test("신용카드 발행세액공제 1.3%, 연 1,000만 원·납부세액 한도", () => {
  assert.equal(cardSalesCredit({ cardSales: 300_000_000, priorYearSupply: 500_000_000 }).credit, 3_900_000);
  assert.equal(cardSalesCredit({ cardSales: 300_000_000, priorYearSupply: 500_000_000, usedThisYear: 8_000_000 }).credit, 2_000_000);
  assert.equal(cardSalesCredit({ cardSales: 300_000_000, priorYearSupply: 500_000_000, payable: 1_000_000 }).credit, 1_000_000);
  assert.equal(cardSalesCredit({ cardSales: 300_000_000, priorYearSupply: 1_100_000_000 }).eligible, false);
});

test("대손: 1,100만 원 → 100만 원, 2016-09 공급분은 2027-01-25까지 확정", () => {
  const r = badDebtCredit({ amount: 11_000_000, supplied: "2016-09-10", confirmed: "2026-11-20" });
  assert.equal(r.credit, 1_000_000);
  assert.equal(r.deadline, "2027-01-25");
  assert.equal(r.ok, true);
});
