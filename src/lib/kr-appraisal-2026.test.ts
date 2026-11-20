import { test } from "node:test";
import assert from "node:assert/strict";
import { businessLoss, costApproach, incomeApproach, landCompensation, reconcile, relocationAllowance, salesComparison } from "./kr-appraisal-2026.ts";

test("원가법: 재조달원가 5억, 40년 중 10년 경과, 잔가 0 → 감가 1.25억", () => {
  const r = costApproach({ replacementCost: 500_000_000, usefulLife: 40, age: 10, land: 300_000_000 });
  assert.equal(r.depreciation, 125_000_000);
  assert.equal(r.value, 675_000_000);
});

test("비교방식: 사례 2건 보정 단가 평균 × 면적", () => {
  const r = salesComparison(100, [
    { price: 1_000_000_000, area: 100, time: 1.02, individual: 0.95 },
    { price: 900_000_000, area: 90, time: 1.01, regional: 1.05 },
  ]);
  assert.equal(r.rows[0].adjusted, 9_690_000);
  assert.equal(r.rows[1].adjusted, 10_605_000);
  assert.equal(r.unit, 10_147_500);
  assert.equal(r.value, 1_014_750_000);
});

test("수익방식·시산가액 조정", () => {
  const r = incomeApproach({ grossIncome: 60_000_000, vacancy: 0.05, expenses: 7_000_000, capRate: 0.05 });
  assert.equal(r.noi, 50_000_000);
  assert.equal(r.value, 1_000_000_000);
  const c = reconcile([{ label: "비교", value: 1_000_000_000, weight: 2 }, { label: "수익", value: 900_000_000, weight: 1 }]);
  assert.equal(c.value, 966_666_667);
  assert.equal(c.spread, 11.1);
});

test("토지보상: 공시지가 300만 원 × 지가변동 3.2% × 개별 0.9 × 200㎡", () => {
  const r = landCompensation({ officialPrice: 3_000_000, area: 200, landChange: 0.032, individual: 0.9 });
  assert.equal(r.unit, 2_786_400);
  assert.equal(r.value, 557_280_000);
});

test("영업손실(휴업 4개월·폐업 2년)과 주거이전비(세입자 4개월)", () => {
  assert.equal(businessLoss({ annualProfit: 36_000_000, kind: "pause", months: 4, fixedCosts: 2_000_000, moving: 3_000_000 }).total, 17_000_000);
  assert.equal(businessLoss({ annualProfit: 36_000_000, kind: "close", saleLoss: 5_000_000 }).total, 77_000_000);
  assert.equal(relocationAllowance(4_000_000, true).amount, 16_000_000);
});
