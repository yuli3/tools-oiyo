import assert from "node:assert/strict";
import test from "node:test";
import { recoverableLawyerFee, serviceFee, stampDuty } from "./kr-litigation-cost.ts";

test("인지액 구간과 전자소송 9/10", () => {
  assert.equal(stampDuty(5_000_000, false), 25_000);
  assert.equal(stampDuty(30_000_000, false), 140_000);
  assert.equal(stampDuty(30_000_000, true), 126_000);
  assert.equal(stampDuty(200_000_000, false), 855_000);
  assert.equal(stampDuty(100_000, false), 1_000);
});

test("송달료: 소액 10회, 그 외 15회, 1회 5,640원", () => {
  assert.deepEqual(serviceFee(30_000_000, 2), { rounds: 10, fee: 112_800 });
  assert.deepEqual(serviceFee(30_000_001, 3), { rounds: 15, fee: 253_800 });
});

test("변호사보수 산입 상한(2020 개정 별표)", () => {
  assert.equal(recoverableLawyerFee(3_000_000), 300_000);
  assert.equal(recoverableLawyerFee(20_000_000), 2_000_000);
  assert.equal(recoverableLawyerFee(30_000_000), 2_800_000);
  assert.equal(recoverableLawyerFee(150_000_000), 9_400_000);
  assert.equal(recoverableLawyerFee(200_000_000), 10_400_000);
  assert.equal(recoverableLawyerFee(500_000_000), 13_400_000);
  assert.equal(recoverableLawyerFee(1_000_000_000), 15_900_000);
});
