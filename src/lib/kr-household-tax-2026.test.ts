import test from "node:test";
import assert from "node:assert/strict";
import { dependentIncomeTest, dependentsTax, judgeDependent, majorShareholderTax, whoShouldClaim } from "./kr-household-tax-2026.ts";

test("부양가족: 근로소득만 있으면 총급여 500만 원까지, 1원만 넘어도 안 돼요", () => {
  assert.equal(judgeDependent({ relation: "spouse", birthYear: 1990, wage: 5_000_000 }).status, "ok");
  assert.equal(judgeDependent({ relation: "spouse", birthYear: 1990, wage: 5_000_001 }).status, "income");
});

test("부양가족: 근로 + 다른 소득이면 근로소득금액을 합쳐 100만 원 이하", () => {
  // 총급여 300만 → 근로소득공제 210만 → 근로소득금액 90만 + 기타 20만 = 110만
  const t = dependentIncomeTest({ wage: 3_000_000, otherIncome: 200_000 });
  assert.deepEqual([t.wageOnly, t.value, t.pass], [false, 1_100_000, false]);
  assert.equal(dependentIncomeTest({ wage: 3_000_000, otherIncome: 100_000 }).pass, true);
});

test("부양가족: 나이·동거·중복·장애인 예외", () => {
  assert.equal(judgeDependent({ relation: "parent", birthYear: 1966 }).status, "ok"); // 2026년 60세(1966년생까지)
  assert.equal(judgeDependent({ relation: "parent", birthYear: 1967 }).status, "age");
  assert.equal(judgeDependent({ relation: "parent", birthYear: 1967, disabled: true }).status, "ok");
  assert.equal(judgeDependent({ relation: "child", birthYear: 2005 }).status, "age"); // 21세
  assert.equal(judgeDependent({ relation: "sibling", birthYear: 2010, livingTogether: false }).status, "living");
  assert.equal(judgeDependent({ relation: "spouse", birthYear: 1990, claimedByOther: true }).status, "duplicate");
  const senior = judgeDependent({ relation: "parent", birthYear: 1956, disabled: true });
  assert.equal(senior.deduction, 1_500_000 + 1_000_000 + 2_000_000);
});

test("자녀세액공제 대상: 2026년 9~20세, 2017년생 제외", () => {
  assert.equal(judgeDependent({ relation: "child", birthYear: 2016 }).creditChild, true);
  assert.equal(judgeDependent({ relation: "child", birthYear: 2017 }).creditChild, false);
  assert.equal(judgeDependent({ relation: "child", birthYear: 2006 }).creditChild, true);
});

test("총급여 5천만 원, 배우자·자녀 2·70대 부모 → 4명 공제, 세금이 줄어요", () => {
  const r = dependentsTax({ salary: 50_000_000, married: true, people: [
    { relation: "spouse", birthYear: 1990 },
    { relation: "child", birthYear: 2015 },
    { relation: "child", birthYear: 2020 },
    { relation: "parent", birthYear: 1950 },
    { relation: "parent", birthYear: 1968 },
  ] });
  assert.equal(r.eligibleCount, 4);
  assert.equal(r.deductionTotal, 7_000_000);
  assert.equal(r.creditChildren, 1);
  assert.ok(r.saving > 1_000_000 && r.saving < 2_000_000);
  assert.equal(r.perPerson[4], 0);
  assert.ok(r.taxWith < r.taxWithout);
});

test("맞벌이: 월급이 많은 쪽이 부모님을 올리면 더 줄어요", () => {
  const w = whoShouldClaim({ salary: 90_000_000, married: true }, { salary: 35_000_000, married: true }, [{ relation: "parent", birthYear: 1950 }]);
  assert.equal(w.better, "a");
  assert.ok(w.gainA > w.gainB);
});

test("대주주: 코스피 60억 보유, 차익 5억, 1년 이상 → 20%·25% + 지방세 1억 2,031만 원", () => {
  const r = majorShareholderTax({ market: "kospi", heldValue: 6_000_000_000, gain: 500_000_000, overOneYear: true });
  assert.equal(r.isMajor, true);
  assert.equal(r.taxBase, 497_500_000);
  assert.equal(r.national, 60_000_000 + 49_375_000);
  assert.equal(r.total, 120_312_500);
  assert.equal(r.cutToAvoid, 1_000_000_001);
});

test("대주주: 지분율 기준(코스닥 2%)과 중소기업 외 1년 미만 30%", () => {
  const r = majorShareholderTax({ market: "kosdaq", heldValue: 1_000_000_000, heldShare: 0.025, gain: 100_000_000 });
  assert.deepEqual([r.byValue, r.byShare], [false, true]);
  assert.equal(r.national, 29_250_000);
  assert.equal(r.local, 2_925_000);
});

test("대주주 아님: 49억 보유면 세금 0, 대주주였다면 낼 세금은 따로 보여 줘요", () => {
  const r = majorShareholderTax({ market: "kospi", heldValue: 4_900_000_000, gain: 100_000_000, overOneYear: true });
  assert.equal(r.isMajor, false);
  assert.equal(r.total, 0);
  assert.equal(r.ifMajor, Math.floor(97_500_000 * 0.2 * 1.1));
});
