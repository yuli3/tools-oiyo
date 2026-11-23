import { test } from "node:test";
import assert from "node:assert/strict";
import { appraisalBaseFee, appraisalFee, legalAidCheck, medianIncome2026 } from "./kr-expert-fees-2026.ts";

const EOK = 100_000_000;
// [별표] 각 구간 시작 금액(하한·기준·상한)을 원문 PDF 그대로 대조해요.
const TABLE: [number, number, number, number][] = [
  [5 * EOK, 646_000, 745_000, 844_000],
  [10 * EOK, 1_006_000, 1_195_000, 1_384_000],
  [50 * EOK, 3_566_000, 4_395_000, 5_224_000],
  [100 * EOK, 6_366_000, 7_895_000, 9_424_000],
  [500 * EOK, 25_566_000, 31_895_000, 38_224_000],
  [1000 * EOK, 45_566_000, 56_895_000, 68_224_000],
  [3000 * EOK, 109_566_000, 136_895_000, 164_224_000],
  [6000 * EOK, 181_566_000, 226_895_000, 272_224_000],
  [10000 * EOK, 245_566_000, 306_895_000, 368_224_000],
];

test("감정평가수수료 별표 구간 시작 금액이 원문과 같아요", () => {
  for (const [v, lo, mid, hi] of TABLE) {
    assert.equal(appraisalBaseFee(v, 0.8), lo, `${v} 하한`);
    assert.equal(appraisalBaseFee(v, 1), mid, `${v} 기준`);
    assert.equal(appraisalBaseFee(v, 1.2), hi, `${v} 상한`);
  }
  assert.equal(appraisalBaseFee(30_000_000), 250_000);
  assert.equal(appraisalBaseFee(50_000_000, 1.2), 250_000);
});

test("감정평가 10호 이상 공동주택 20% 할인, 최저 25만원 · 할증은 금액 계산 안 함", () => {
  assert.equal(appraisalFee({ value: 5 * EOK, apartments10: true }).base, 596_000);
  assert.equal(appraisalFee({ value: 1 * EOK, apartments10: true }).low, 250_000);
  const s = appraisalFee({ value: 5 * EOK, surcharge: ["court"] });
  assert.equal(s.surcharged, true);
  assert.equal(s.base, 745_000);
  assert.ok(s.items.some((i) => i.text.includes("375,000원")));
});

test("법률구조: 2026 기준 중위소득과 125%·150%·400만원·3억원 선", () => {
  assert.equal(medianIncome2026(1), 2_564_238);
  assert.equal(medianIncome2026(8), 10_474_348);
  assert.equal(legalAidCheck({ group: "median125", household: 1, monthlyIncome: 3_205_297 }).fits, true);
  assert.equal(legalAidCheck({ group: "median125", household: 1, monthlyIncome: 3_205_298 }).fits, false);
  assert.equal(legalAidCheck({ group: "median150", household: 4, monthlyIncome: 9_742_107 }).fits, true);
  assert.equal(legalAidCheck({ group: "wage400", household: 1, monthlyIncome: 0, avgWage3m: 4_000_000 }).fits, false);
  assert.equal(legalAidCheck({ group: "smallBiz", household: 1, monthlyIncome: 0, sales: 300_000_000 }).fits, true);
  assert.equal(legalAidCheck({ group: "none", household: 1, monthlyIncome: 0 }).fits, null);
});
