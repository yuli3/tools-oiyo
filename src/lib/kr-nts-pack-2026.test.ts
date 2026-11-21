import { test } from "node:test";
import assert from "node:assert/strict";
import { bookVsEstimate, exemptBusinessReport, pensionIncomeChoice, pensionIncomeDeduction, pensionWithholdingRate, studentLoanRepayment, withholdingStatement } from "./kr-nts-pack-2026.ts";

test("지급명세서: 근로 연간분 3월 10일, 3개월 안에 내면 0.5%, 넘기면 1%", () => {
  const r = withholdingStatement({ kind: "annual-wage", year: 2026, amount: 100_000_000, submitted: "2027-04-20" });
  assert.equal(r.due, "2027-03-10");
  assert.equal(r.status, "late-reduced");
  assert.equal(r.penalty, 500_000);
  assert.equal(withholdingStatement({ kind: "annual-wage", year: 2026, amount: 100_000_000, submitted: "2027-06-11" }).penalty, 1_000_000);
  // 2027-02-28은 일요일이라 3월 2일(3월 1일 삼일절)로 밀려요.
  assert.equal(withholdingStatement({ kind: "annual-other", year: 2026, amount: 1 }).due, "2027-03-02");
});

test("지급명세서: 일용·간이는 0.25%, 1개월 안 0.125%", () => {
  const r = withholdingStatement({ kind: "daily", year: 2026, month: 5, amount: 30_000_000, submitted: "2026-07-15" });
  assert.equal(r.due, "2026-06-30");
  assert.equal(r.penalty, 37_500);
  assert.equal(withholdingStatement({ kind: "simple-business", year: 2026, month: 5, amount: 30_000_000, submitted: "2026-08-15" }).penalty, 75_000);
});

test("근로 간이지급명세서: 2026은 반기, 2027부터 매월이지만 2027년은 반기 안에 내면 가산세 없음", () => {
  assert.equal(withholdingStatement({ kind: "simple-wage", year: 2026, month: 3, amount: 1 }).due, "2026-07-31");
  assert.equal(withholdingStatement({ kind: "simple-wage", year: 2026, month: 9, amount: 1 }).due, "2027-02-01");
  const y27 = withholdingStatement({ kind: "simple-wage", year: 2027, month: 2, amount: 50_000_000, submitted: "2027-07-20" });
  assert.equal(y27.due, "2027-03-31");
  assert.equal(y27.status, "on-time");
  assert.equal(y27.penalty, 0);
  assert.equal(withholdingStatement({ kind: "simple-wage", year: 2028, month: 2, amount: 50_000_000, submitted: "2028-07-20" }).status, "late");
  assert.equal(withholdingStatement({ kind: "simple-wage", year: 2028, month: 2, amount: 50_000_000, submitted: "2028-07-20", semiAnnualPayer: true }).status, "on-time");
});

test("학자금: 상환기준소득 2,056만 원 초과분 × 20%(학부)·25%(대학원)", () => {
  const r = studentLoanRepayment({ incomeType: "salary", amount: 40_000_000, loan: "undergrad" });
  assert.equal(r.income, 28_750_000);
  assert.equal(r.yearly, 1_638_000);
  assert.equal(r.monthly, 136_500);
  assert.equal(studentLoanRepayment({ incomeType: "income", amount: 30_560_000, loan: "graduate" }).yearly, 2_500_000);
  assert.ok(studentLoanRepayment({ incomeType: "salary", amount: 30_370_000, loan: "undergrad" }).yearly < 1_000, "총급여 3,037만 원은 기준선 근처");
  assert.equal(studentLoanRepayment({ incomeType: "salary", amount: 30_000_000, loan: "undergrad" }).yearly, 0);
  assert.equal(studentLoanRepayment({ incomeType: "income", amount: 50_000_000, loan: "undergrad", balance: 1_000_000 }).yearly, 1_000_000);
});

test("장부 vs 추계: 간편장부대상 인적용역은 단순경비율, 무기장가산세 없음, 복식 신고하면 기장세액공제", () => {
  const r = bookVsEstimate({ group: "personal", prevRevenue: 30_000_000, revenue: 50_000_000, actualExpense: 10_000_000, simpleRate: 64.1, simpleRateOver: 49.7, standardRate: 21.6 });
  assert.equal(r.doubleEntry, false);
  assert.equal(r.simpleOk, true);
  assert.equal(r.simpleIncome, 50_000_000 - 25_640_000 - 4_970_000);
  assert.equal(r.estimate.penalty, 0);
  assert.ok(r.book.credit > 0 && r.book.credit <= 1_000_000);
});

test("장부 vs 추계: 복식부기의무자는 기준경비율 1/2, 비교소득 3.4배, 무기장가산세 20%", () => {
  const r = bookVsEstimate({ group: "c", prevRevenue: 80_000_000, revenue: 90_000_000, actualExpense: 30_000_000, simpleRate: 60, standardRate: 20, majorExpense: 20_000_000 });
  assert.equal(r.doubleEntry, true);
  assert.equal(r.simpleOk, false);
  assert.equal(r.standardIncome, 61_000_000);
  assert.equal(r.estimate.penalty, Math.floor((r.estimate.calculated * 0.2) / 10) * 10);
  assert.equal(r.better, "book");
  // 비교소득: 단순경비율 소득 × 배율로 잘려요
  const capped = bookVsEstimate({ group: "c", prevRevenue: 30_000_000, revenue: 60_000_000, actualExpense: 0, simpleRate: 90, standardRate: 5 });
  assert.equal(capped.multiple, 2.8);
  assert.equal(capped.standardIncome, Math.round(capped.simpleIncome * 2.8));
});

test("사업장현황신고: 2월 10일, 0.5% 가산세는 의료·수의·약국만", () => {
  const med = exemptBusinessReport({ year: 2026, kind: "medical", unreported: 100_000_000 });
  assert.equal(med.due, "2027-02-10");
  assert.equal(med.penalty, 500_000);
  const free = exemptBusinessReport({ year: 2026, kind: "personal", unreported: 100_000_000 });
  assert.equal(free.penaltyApplies, false);
  assert.equal(free.penalty, 0);
  assert.equal(exemptBusinessReport({ year: 2026, kind: "academy", vatFiledAll: true }).must, false);
});

test("연금소득: 공제표·한도 900만, 원천징수 5/4/3%·종신 3%", () => {
  assert.equal(pensionIncomeDeduction(3_000_000), 3_000_000);
  assert.equal(pensionIncomeDeduction(10_000_000), 5_500_000);
  assert.equal(pensionIncomeDeduction(100_000_000), 9_000_000);
  assert.equal(pensionWithholdingRate(65), 0.05);
  assert.equal(pensionWithholdingRate(75), 0.04);
  assert.equal(pensionWithholdingRate(85), 0.03);
  assert.equal(pensionWithholdingRate(60, true), 0.03);
});

test("연금소득: 1,500만 원 넘으면 15% 분리 vs 종합 비교", () => {
  const r = pensionIncomeChoice({ privatePension: 20_000_000, age: 66, publicPension: 12_000_000 });
  assert.equal(r.over, true);
  assert.equal(r.separate.pensionTax, 3_000_000);
  assert.equal(r.better, "combined");
  const small = pensionIncomeChoice({ privatePension: 12_000_000, age: 72 });
  assert.equal(small.over, false);
  assert.equal(small.separate.pensionTax, 480_000);
  // 다른 소득이 크면 분리과세가 유리해져요
  assert.equal(pensionIncomeChoice({ privatePension: 20_000_000, age: 66, otherIncome: 150_000_000 }).better, "separate");
});
