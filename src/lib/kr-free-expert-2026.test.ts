import { test } from "node:test";
import assert from "node:assert/strict";
import { NECESSARY_EXPENSES, laborCommissionAgent, nationalTaxAgent, necessaryExpenseCheck } from "./kr-free-expert-2026.ts";

test("노동위원회 무료 대리: 월평균임금 300만원 미만만", () => {
  assert.equal(laborCommissionAgent({ monthlyWage: 2_999_999 }).eligible, true);
  assert.equal(laborCommissionAgent({ monthlyWage: 3_000_000 }).eligible, false);
  assert.equal(laborCommissionAgent({ monthlyWage: 2_000_000, hasOwnAgent: true }).eligible, false);
  assert.ok(laborCommissionAgent({ monthlyWage: 1 }).items.some((i) => i.text.includes("70만원")));
});

test("국세 국선대리인: 개인 5천만·5억·5천만, 법인 3억·5억, 상속·증여·종부세 제외", () => {
  const base = { person: "individual" as const, income: 50_000_000, assets: 500_000_000, claim: 50_000_000, taxKind: "income" as const };
  assert.equal(nationalTaxAgent(base).eligible, true);
  assert.equal(nationalTaxAgent({ ...base, income: 50_000_001 }).eligible, false);
  assert.equal(nationalTaxAgent({ ...base, assets: 500_000_001 }).eligible, false);
  assert.equal(nationalTaxAgent({ ...base, claim: 50_000_001 }).eligible, false);
  assert.equal(nationalTaxAgent({ ...base, taxKind: "gift" }).eligible, false);
  assert.equal(nationalTaxAgent({ ...base, taxKind: "comprehensiveRealEstate" }).eligible, false);
  assert.equal(nationalTaxAgent({ ...base, person: "corp", income: 300_000_000 }).eligible, true);
  assert.equal(nationalTaxAgent({ ...base, person: "corp", income: 300_000_001 }).eligible, false);
});

test("필요경비: 팔 때 소개비는 원문 목록, 수선비는 목록 밖, 취득 부대비용 세부는 확인 필요", () => {
  const r = necessaryExpenseCheck(["saleBrokerage", "repair", "acqOther"]);
  assert.deepEqual([r.listed, r.check, r.not], [1, 1, 1]);
  assert.equal(new Set(NECESSARY_EXPENSES.map((e) => e.id)).size, NECESSARY_EXPENSES.length);
});
