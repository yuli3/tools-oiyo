import assert from "node:assert/strict";
import { test } from "node:test";
import { attributeSample, averageCorpRate, deferredTax, materiality, musSample } from "./kr-audit-deferred-2026.ts";

test("average rate: 3억 base → (1,800만+2,000만) / 3억 × 1.1", () => {
  // 2억 × 10% + 1억 × 20% = 4,000만 → 13.33% × 1.1 = 14.67%
  assert.equal(averageCorpRate(300_000_000), 0.1467);
  assert.equal(averageCorpRate(0), 0);
});

test("deferred tax: DTA and DTL net, expense from movement", () => {
  const r = deferredTax({ items: [{ label: "퇴직급여충당부채", amount: 100_000_000 }, { label: "감가상각 일시상각", amount: -40_000_000 }], rate: 0.209, openingNet: 5_000_000, currentTax: 30_000_000, pretaxIncome: 200_000_000 });
  assert.equal(r.dta, 20_900_000);
  assert.equal(r.dtl, 8_360_000);
  assert.equal(r.closingNet, 12_540_000);
  assert.equal(r.deferredExpense, 5_000_000 - 12_540_000);
  assert.equal(r.totalExpense, 30_000_000 - 7_540_000);
  assert.equal(r.effectiveRate, 0.1123);
});

test("deferred tax: unrecognized DTA when future income is short", () => {
  const r = deferredTax({ items: [{ label: "이월결손금", amount: 500_000_000 }], rate: 0.2, futureIncome: 200_000_000 });
  assert.equal(r.dta, 40_000_000);
  assert.equal(r.unrecognized, 60_000_000);
  assert.equal(r.recognizedRatio, 0.4);
});

test("materiality: 5% of pretax, medium risk 65%, trivial 5%", () => {
  const m = materiality({ benchmark: "pretax", base: 1_000_000_000 });
  assert.equal(m.overall, 50_000_000);
  assert.equal(m.performance, 32_500_000);
  assert.equal(m.trivial, 2_500_000);
  assert.equal(materiality({ benchmark: "revenue", base: 1e10, pct: 0.03 }).outOfRange, true);
});

test("MUS sample size and interval", () => {
  const s = musSample({ population: 5_000_000_000, tolerable: 100_000_000, expected: 10_000_000, confidence: 95 });
  // 50억 × 3.0 ÷ (1억 − 1,000만 × 1.6) = 150억 ÷ 8,400만 = 178.6 → 179
  assert.equal(s.size, 179);
  assert.equal(s.interval, Math.round(5_000_000_000 / 179));
  assert.equal(musSample({ population: 1e9, tolerable: 1e7, expected: 1e7 }).size, null);
});

test("attribute sample: 95%, 5% tolerable → 59; small population shrinks", () => {
  assert.equal(attributeSample({ tolerableRate: 0.05 }).size, 59);
  assert.equal(attributeSample({ tolerableRate: 0.05, population: 100 }).size, 38);
});
