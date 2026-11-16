import test from "node:test";
import assert from "node:assert/strict";
import {
  MIN_WAGE_2026, eitcAmount, ctcPerChild, workChildCredit, maternityLeavePay, spouseLeavePay, wageGuarantee, guaranteeMonthlyCap,
  injuryLeaveDaily, injuryLeavePay, averageDailyWage, monthlyRentCredit, dbVsDc, breakEvenReturn,
} from "./kr-welfare-2026.ts";
import { KR_RATES_2026 } from "./kr-rates-2026.mjs";

test("최저임금은 요율 정본과 같아요", () => {
  assert.equal(MIN_WAGE_2026, KR_RATES_2026.minimumWage);
});

test("근로장려금 구간: 점증·평탄·점감·상한", () => {
  assert.equal(eitcAmount("single", 2_000_000), 825_000);
  assert.equal(eitcAmount("single", 6_000_000), 1_650_000);
  assert.equal(eitcAmount("single", 22_000_000), 0);
  // 홑벌이 2,000만 원: 285 − (2,000 − 1,400) × 285/1,800 = 190만 원
  assert.equal(eitcAmount("oneEarner", 20_000_000), 1_900_000);
  assert.equal(eitcAmount("twoEarner", 10_000_000), 3_300_000);
  assert.equal(eitcAmount("twoEarner", 4_000_000), 1_650_000);
  assert.equal(eitcAmount("twoEarner", 44_000_000), 0);
});

test("자녀장려금: 1명당 100만 원에서 7천만 원 직전 50만 원까지", () => {
  assert.equal(ctcPerChild("oneEarner", 20_000_000), 1_000_000);
  assert.equal(ctcPerChild("oneEarner", 30_000_000), 908_163);
  assert.equal(ctcPerChild("twoEarner", 35_000_000), 888_888);
  assert.equal(ctcPerChild("twoEarner", 69_999_999), 500_000);
  assert.equal(ctcPerChild("oneEarner", 70_000_000), 0);
});

test("재산 1.7억 이상 반액, 2.4억 이상 0, 자녀 있으면 홑벌이", () => {
  const base = { household: "single" as const, income: 15_000_000, assets: 100_000_000, children: 0 };
  assert.equal(workChildCredit(base).eitc, eitcAmount("single", 15_000_000));
  assert.equal(workChildCredit({ ...base, assets: 180_000_000 }).eitc, Math.floor(eitcAmount("single", 15_000_000) * 0.5));
  assert.equal(workChildCredit({ ...base, assets: 240_000_000 }).total, 0);
  const kid = workChildCredit({ ...base, children: 2 });
  assert.equal(kid.household, "oneEarner");
  assert.equal(kid.upgraded, true);
  assert.equal(kid.ctc, 2_000_000);
  assert.equal(workChildCredit({ ...base, late: true }).eitc, Math.floor(eitcAmount("single", 15_000_000) * 0.95));
});

test("출산전후휴가: 중소기업은 90일 전부 보험, 대기업은 마지막 30일", () => {
  const sme = maternityLeavePay({ monthlyWage: 3_000_000, priorityFirm: true, kind: "single" });
  assert.equal(sme.insuranceDays, 90);
  assert.equal(sme.insurance, 6_600_000);
  assert.equal(sme.employerPay, Math.floor((100_000 - 6_600_000 / 90) * 60));
  assert.equal(sme.employeeTotal, 6_000_000 + Math.floor((6_600_000 / 90) * 30));
  const big = maternityLeavePay({ monthlyWage: 3_000_000, priorityFirm: false, kind: "single" });
  assert.equal(big.insuranceDays, 30);
  assert.equal(big.employerPay, 6_000_000);
  const twins = maternityLeavePay({ monthlyWage: 2_000_000, priorityFirm: false, kind: "multiple" });
  assert.equal(twins.days, 120);
  assert.equal(twins.insuranceDays, 45);
  assert.equal(twins.floored, true); // 200만 원 < 최저임금 월 2,156,880원
});

test("배우자 출산휴가 20일", () => {
  const s = spouseLeavePay(4_500_000, true);
  assert.equal(s.employeeTotal, 3_000_000);
  assert.equal(s.insurance, 1_684_210);
  assert.equal(s.employerPay, 3_000_000 - 1_684_210);
  assert.equal(spouseLeavePay(4_500_000, false).insurance, 0);
});

test("도산대지급금: 나이별 월 상한, 6개월·3년", () => {
  assert.equal(guaranteeMonthlyCap(29), 2_200_000);
  assert.equal(guaranteeMonthlyCap(35), 3_100_000);
  assert.equal(guaranteeMonthlyCap(45), 3_500_000);
  assert.equal(guaranteeMonthlyCap(60), 2_300_000);
  // 오마이뉴스 2026-09-03 예시: 35세, 월 350만 원 5개월 + 5년치 퇴직금 1,750만 원 → 1,550 + 930 = 2,480만 원
  const r = wageGuarantee({ kind: "insolvency", age: 35, monthlyWage: 3_500_000, unpaidMonths: 5, unpaidSeverance: 17_500_000, serviceYears: 5, afterReform: true });
  assert.equal(r.wagePay, 15_500_000);
  assert.equal(r.severancePay, 9_300_000);
  assert.equal(r.total, 24_800_000);
  const old = wageGuarantee({ kind: "insolvency", age: 35, monthlyWage: 3_500_000, unpaidMonths: 5, unpaidSeverance: 0, serviceYears: 5, afterReform: false });
  assert.equal(old.wagePay, 9_300_000);
});

test("간이대지급금: 퇴직자 임금 700·퇴직금 700·합계 1,000만 원", () => {
  const r = wageGuarantee({ kind: "simpleRetired", age: 40, monthlyWage: 3_000_000, unpaidMonths: 4, unpaidSeverance: 9_000_000, serviceYears: 3 });
  assert.equal(r.wagePay, 7_000_000);
  assert.equal(r.severancePay, 3_000_000);
  assert.equal(r.total, 10_000_000);
  const e = wageGuarantee({ kind: "simpleEmployed", age: 40, monthlyWage: 2_000_000, unpaidMonths: 2, unpaidSeverance: 9_000_000, serviceYears: 3 });
  assert.equal(e.total, 4_000_000);
});

test("산재 휴업급여: 70%, 최고 기준, 최저임금 보장과 역전 구간", () => {
  assert.deepEqual(injuryLeaveDaily(150_000), { daily: 105_000, rule: "regular" });
  assert.deepEqual(injuryLeaveDaily(400_000), { daily: 187_809, rule: "max" });
  assert.deepEqual(injuryLeaveDaily(90_000), { daily: 82_560, rule: "minWage" });
  // 70%가 66,048원을 넘는 순간부터는 최저임금보다 적게 받아요(법 구조상 역전).
  assert.equal(injuryLeaveDaily(100_000).daily, 70_000);
  assert.equal(injuryLeavePay({ avgDailyWage: 150_000, days: 3 }).total, 0);
  assert.equal(injuryLeavePay({ avgDailyWage: 150_000, days: 30 }).total, 3_150_000);
  assert.equal(Math.round(averageDailyWage(9_200_000, 92)), 100_000);
});

test("월세 세액공제 17%·15%, 한도 1,000만 원", () => {
  const a = monthlyRentCredit({ income: 50_000_000, incomeType: "wage", monthlyRent: 600_000, months: 12 });
  assert.equal(a.rate, 0.17);
  assert.equal(a.credit, 1_224_000);
  assert.equal(a.total, 1_346_400);
  const b = monthlyRentCredit({ income: 70_000_000, incomeType: "wage", monthlyRent: 1_000_000, months: 12 });
  assert.equal(b.base, 10_000_000);
  assert.equal(b.credit, 1_500_000);
  assert.equal(monthlyRentCredit({ income: 50_000_000, incomeType: "comprehensive", monthlyRent: 500_000, months: 12 }).rate, 0.15);
  assert.equal(monthlyRentCredit({ income: 90_000_000, incomeType: "wage", monthlyRent: 500_000, months: 12 }).credit, 0);
  assert.equal(monthlyRentCredit({ income: 30_000_000, incomeType: "wage", monthlyRent: 500_000, months: 12, taxBeforeCredit: 300_000 }).credit, 300_000);
});

test("DB vs DC: 수익률이 임금 상승률보다 높으면 DC", () => {
  const base = { monthlyWage: 4_000_000, yearsServed: 5, yearsLeft: 20, wageGrowth: 0.03, dcReturn: 0.03 };
  const r = dbVsDc(base);
  assert.equal(r.series.length, 21);
  assert.ok(dbVsDc({ ...base, dcReturn: 0.06 }).better === "dc");
  assert.ok(dbVsDc({ ...base, dcReturn: 0.01 }).better === "db");
  const be = breakEvenReturn(base);
  assert.ok(Math.abs(dbVsDc({ ...base, dcReturn: be }).diff) < 1000);
  assert.equal(dbVsDc({ ...base, yearsLeft: 0 }).db, 20_000_000);
});
