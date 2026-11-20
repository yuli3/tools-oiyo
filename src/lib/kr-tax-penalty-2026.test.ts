import { test } from "node:test";
import assert from "node:assert/strict";
import { nextReductionStep, reductionRate, taxPenalty } from "./kr-tax-penalty-2026.ts";

test("종합소득세 무신고 1,000만 원, 6월 20일 기한후신고·납부: 20% × 50% 감면 + 20일 납부지연", () => {
  const r = taxPenalty({ kind: "none", tax: 10_000_000, due: "2026-06-01", filed: "2026-06-21" });
  assert.equal(r.reduction, 0.5);
  assert.equal(r.filing, 1_000_000);
  assert.equal(r.days, 20);
  assert.equal(r.delay, 44_000);
  assert.equal(r.total, 1_044_000);
});

test("수정신고 감면 6단계, 기한후신고 3단계", () => {
  assert.equal(reductionRate("under", "2026-03-31", "2026-04-30"), 0.9);
  assert.equal(reductionRate("under", "2026-03-31", "2026-06-30"), 0.75);
  assert.equal(reductionRate("under", "2026-03-31", "2027-03-31"), 0.3);
  assert.equal(reductionRate("under", "2026-03-31", "2028-04-01"), 0);
  assert.equal(reductionRate("none", "2026-03-31", "2026-10-01"), 0);
  assert.deepEqual(nextReductionStep("under", "2026-03-31", "2026-05-15"), { until: "2026-06-30", rate: 0.75 });
});

test("복식부기 무신고는 수입금액 0.07%와 비교, 조사 통지 뒤면 감면 없음", () => {
  const r = taxPenalty({ kind: "none", tax: 1_000_000, revenue: 1_000_000_000, due: "2026-06-01", filed: "2026-06-10", noticed: true });
  assert.equal(r.filingBase, 700_000);
  assert.equal(r.reduction, 0);
  assert.equal(r.filing, 700_000);
});

test("원천세 납부지연: 3% + 일 0.022%, 10% 한도", () => {
  assert.equal(taxPenalty({ kind: "withholding", tax: 1_000_000, due: "2026-01-10", paid: "2026-01-20" }).total, 32_200);
  assert.equal(taxPenalty({ kind: "withholding", tax: 1_000_000, due: "2025-01-10", paid: "2026-11-20" }).total, 100_000);
});
