import { test } from "node:test";
import assert from "node:assert/strict";
import { corpTax, donationLimit, entertainmentLimit, interimPrepay, lossDeduction, minimumTaxRate } from "./kr-corp-tax-2026.ts";

const MAN = 10_000;
const EOK = 100_000_000;

test("기업업무추진비 한도: 중소기업 수입 150억 → 7,600만 원", () => {
  const r = entertainmentLimit({ size: "sme", revenue: 150 * EOK, spent: 1 * EOK });
  assert.equal(r.base, 3600 * MAN);
  assert.equal(r.revenuePart, 4000 * MAN);
  assert.equal(r.limit, 7600 * MAN);
  assert.equal(r.excess, 2400 * MAN);
});

test("특수관계인 수입금액분은 10%만, 문화비는 일반 한도의 20%까지, 6개월 법인은 기본 한도도 절반", () => {
  const r = entertainmentLimit({ size: "sme", revenue: 150 * EOK, relatedRevenue: 50 * EOK, spent: 0, cultureSpent: 1 * EOK });
  assert.equal(r.general, 6700 * MAN);
  assert.equal(r.culture, 1340 * MAN);
  assert.equal(entertainmentLimit({ size: "general", months: 6, revenue: 0, spent: 0 }).base, 600 * MAN);
  assert.equal(entertainmentLimit({ size: "sme", revenue: 0, spent: 5000 * MAN, noProof: 300 * MAN }).disallowed, 1100 * MAN + 300 * MAN);
});

test("이월결손금: 일반 법인은 소득의 80%까지", () => {
  assert.deepEqual(lossDeduction(10 * EOK, 20 * EOK, "general"), { cap: 8 * EOK, used: 8 * EOK, left: 12 * EOK });
  assert.equal(lossDeduction(10 * EOK, 20 * EOK, "sme").used, 10 * EOK);
});

test("기부금 한도: 특례 50%, 일반 10%", () => {
  const r = donationLimit({ incomeBeforeDonation: 1 * EOK, size: "sme", special: 1 * EOK, general: 2000 * MAN });
  assert.equal(r.baseIncome, 22000 * MAN);
  assert.equal(r.specialExcess, 0);
  assert.equal(r.generalCap, 1200 * MAN);
  assert.equal(r.generalExcess, 800 * MAN);
});

test("법인세: 과세표준 5억 → 8,000만 원(2026 세율), 지방소득세 800만, 다음 중간예납 4,000만", () => {
  const r = corpTax({ size: "sme", profit: 5 * EOK });
  assert.equal(r.base, 5 * EOK);
  assert.equal(r.computed, 8000 * MAN);
  assert.equal(r.local, 800 * MAN);
  assert.equal(r.interim.amount, 4000 * MAN);
});

test("최저한세: 중소기업 7% 아래로는 공제가 잘려요", () => {
  const r = corpTax({ size: "sme", profit: 5 * EOK, credits: 6000 * MAN });
  assert.equal(r.minTax, 3500 * MAN);
  assert.equal(r.creditsAllowed, 4500 * MAN);
  assert.equal(r.creditsCut, 1500 * MAN);
  assert.equal(r.determined, 3500 * MAN);
  assert.equal(minimumTaxRate(500 * EOK, "general"), 0.12);
});

test("중간예납: 중소기업 50만 원 미만이면 안 내요", () => {
  assert.equal(interimPrepay(90 * MAN, "sme").exempt, true);
  assert.equal(interimPrepay(90 * MAN, "general").amount, 45 * MAN);
});
