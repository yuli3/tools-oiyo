import assert from "node:assert/strict";
import test from "node:test";
import { brokerageFee, leaseBase } from "./kr-brokerage-fee.ts";

test("매매 구간과 한도", () => {
  assert.equal(brokerageFee("sale", 40_000_000).fee, 240_000);
  assert.equal(brokerageFee("sale", 150_000_000).fee, 750_000);
  assert.equal(brokerageFee("sale", 190_000_000).fee, 800_000);
  assert.equal(brokerageFee("sale", 500_000_000).fee, 2_000_000);
  assert.equal(brokerageFee("sale", 1_000_000_000).fee, 5_000_000);
  assert.equal(brokerageFee("sale", 1_300_000_000).rate, 0.006);
  assert.equal(brokerageFee("sale", 1_500_000_000).rate, 0.007);
});

test("임대차 구간과 한도", () => {
  assert.equal(brokerageFee("lease", 80_000_000).fee, 300_000);
  assert.equal(brokerageFee("lease", 300_000_000).fee, 900_000);
  assert.equal(brokerageFee("lease", 1_300_000_000).rate, 0.005);
  assert.equal(brokerageFee("lease", 1_500_000_000).rate, 0.006);
});

test("월세 거래금액: ×100, 5천만 미만이면 ×70", () => {
  assert.equal(leaseBase(10_000_000, 500_000), 60_000_000);
  assert.equal(leaseBase(5_000_000, 300_000), 26_000_000);
  assert.equal(leaseBase(300_000_000, 0), 300_000_000);
});
