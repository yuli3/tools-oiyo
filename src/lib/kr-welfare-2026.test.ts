import test from "node:test";
import assert from "node:assert/strict";
import {
  MIN_WAGE_2026, eitcAmount, ctcPerChild, workChildCredit, maternityLeavePay, spouseLeavePay, wageGuarantee, guaranteeMonthlyCap,
  injuryLeaveDaily, injuryLeavePay, averageDailyWage, monthlyRentCredit, dbVsDc, breakEvenReturn,
  premiumPay, ordinaryWage, fixedOvertimeCheck, longTermCareCopay,
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

test("가산수당: 연장 1.5배, 야간 0.5배 가산, 휴일 8시간 넘으면 2배, 5인 미만은 가산 없음", () => {
  const p = premiumPay(10_000, { overtime: 10, night: 4, holiday: 10, holidayOver8: 2 });
  assert.equal(p.overtime, 150_000);
  assert.equal(p.night, 20_000);
  assert.equal(p.holiday, 10_000 * (1.5 * 8 + 2 * 2));
  const s = premiumPay(10_000, { overtime: 10, night: 4, holiday: 10 }, true);
  assert.equal(s.total, 200_000);
  assert.equal(s.night, 0);
});

test("통상임금: 재직조건 상여도 넣으면(2024 전원합의체) 시급과 연장수당이 올라요", () => {
  const r = ordinaryWage({ basePay: 2_500_000, fixedAllowances: 300_000, bonusAnnual: 6_000_000, bonusConditional: true, overtime: 20, night: 0, holiday: 0 });
  assert.equal(r.monthly, 3_300_000);
  assert.equal(r.hourly, 15_789);
  assert.equal(r.hourlyBefore, 13_397);
  assert.equal(r.ruling, true);
  assert.equal(r.diffMonthly, r.premium.total - r.premiumBefore.total);
  assert.ok(r.diffMonthly > 70_000);
  // 조건 없는 상여는 판결 전에도 들어가서 차이가 없어요.
  assert.equal(ordinaryWage({ basePay: 2_500_000, fixedAllowances: 300_000, bonusAnnual: 6_000_000, bonusConditional: false, overtime: 20, night: 0, holiday: 0 }).diffMonthly, 0);
});

test("포괄임금 고정 연장수당 점검: 법정 수당보다 적으면 차액 × 최대 36개월", () => {
  const r = fixedOvertimeCheck({ basePay: 2_508_000, fixedOtPay: 300_000, overtime: 30, night: 8, holiday: 8 });
  assert.equal(r.hourly, 12_000);
  assert.equal(r.legal.total, 732_000);
  assert.equal(r.shortMonthly, 432_000);
  assert.equal(r.shortTotal, 432_000 * 36);
  assert.equal(r.coveredHours, 16.6);
  assert.equal(fixedOvertimeCheck({ basePay: 2_508_000, fixedOtPay: 800_000, overtime: 30, night: 0, holiday: 0 }).shortMonthly, 0);
  assert.equal(fixedOvertimeCheck({ basePay: 2_000_000, fixedOtPay: 0, overtime: 0, night: 0, holiday: 0, months: 50 }).months, 36);
  assert.equal(fixedOvertimeCheck({ basePay: 2_000_000, fixedOtPay: 0, overtime: 0, night: 0, holiday: 0 }).belowMinWage, true);
});

test("장기요양: 재가 15%·한도 초과 전액, 시설 20%+비급여, 감경 40·60%, 수급자 0", () => {
  const h = longTermCareCopay({ grade: "3", kind: "home", reduction: "none" });
  assert.equal(h.limit, 1_528_200);
  assert.equal(h.copay, 229_230);
  const over = longTermCareCopay({ grade: "3", kind: "home", homeUse: 1_700_000, reduction: "none" });
  assert.equal(over.over, 171_800);
  assert.equal(over.total, 229_230 + 171_800);
  assert.equal(longTermCareCopay({ grade: "3", kind: "home", reduction: "40" }).copay, Math.floor(1_528_200 * 0.09));
  assert.equal(longTermCareCopay({ grade: "3", kind: "home", reduction: "basic" }).copay, 0);
  const f = longTermCareCopay({ grade: "1", kind: "facility", days: 30, dailyExtra: 15_000, reduction: "none" });
  assert.equal(f.copay, Math.floor(93_070 * 30 * 0.2));
  assert.equal(f.total, f.copay + 450_000);
  assert.equal(longTermCareCopay({ grade: "cognitive", kind: "facility", reduction: "none" }).facilityAllowed, false);
});

// ── 노동권 묶음 A (2026-11-16) ──
import { monthlyPaidHours, dismissalNoticePay, shutdownAllowance, reducedHoursPay, probationMinWage, leavePromotionSchedule } from "./kr-welfare-2026.ts";

test("월 소정근로시간: 주 40시간 209, 30시간 156", () => {
  assert.equal(monthlyPaidHours(40), 209);
  assert.equal(monthlyPaidHours(30), 156);
});

test("해고예고수당: 30일분 전액, 30일 예고·3개월 미만·예외면 0", () => {
  const base = { monthlyOrdinaryWage: 2_090_000, weeklyHours: 40, noticeDays: 10, tenureMonths: 12, exception: "none" as const, fivePlus: true };
  const r = dismissalNoticePay(base);
  assert.equal(r.hourly, 10_000);
  assert.equal(r.daily, 80_000);
  assert.equal(r.amount, 2_400_000);
  assert.equal(r.missingDays, 20);
  assert.equal(dismissalNoticePay({ ...base, noticeDays: 30 }).amount, 0);
  assert.equal(dismissalNoticePay({ ...base, tenureMonths: 2 }).reason, "shortTenure");
  assert.equal(dismissalNoticePay({ ...base, exception: "disaster" }).amount, 0);
});

test("휴업수당: 평균임금 70%, 통상임금 대체, 일부 임금 공제, 5명 미만 0", () => {
  const base = { threeMonthWages: 9_200_000, calendarDays: 92, monthlyOrdinaryWage: 3_650_000, shutdownDays: 10, paidDuringShutdown: 0, approvedReduction: false, fivePlus: true };
  const r = shutdownAllowance(base); // 1일 평균 100,000원, 통상 120,000원
  assert.equal(r.avgDaily, 100_000);
  assert.equal(r.minimum, 700_000);
  assert.equal(r.useOrdinary, false);
  assert.equal(shutdownAllowance({ ...base, paidDuringShutdown: 200_000 }).minimum, 560_000);
  const low = shutdownAllowance({ ...base, monthlyOrdinaryWage: 1_825_000 }); // 통상 60,000원 < 70,000원
  assert.equal(low.useOrdinary, true);
  assert.equal(low.minimum, 600_000);
  assert.equal(shutdownAllowance({ ...base, fivePlus: false }).minimum, 0);
});

test("육아기 근로시간 단축 급여 2026: 처음 10시간 100%(250만), 나머지 80%(160만)", () => {
  const a = reducedHoursPay({ monthlyOrdinaryWage: 3_000_000, beforeHours: 40, afterHours: 20 });
  assert.equal(a.first, 625_000);
  assert.equal(a.rest, 400_000);
  assert.equal(a.benefit, 1_025_000);
  const b = reducedHoursPay({ monthlyOrdinaryWage: 2_000_000, beforeHours: 40, afterHours: 25 });
  assert.equal(b.benefit, 700_000);
  assert.equal(reducedHoursPay({ monthlyOrdinaryWage: 3_000_000, beforeHours: 40, afterHours: 12 }).valid, false);
  // 하한 50만 원
  assert.equal(reducedHoursPay({ monthlyOrdinaryWage: 400_000, beforeHours: 40, afterHours: 30 }).first, 125_000);
});

test("수습 최저임금: 1년 이상·3개월 안·단순노무 아님일 때만 90%", () => {
  const base = { hourlyWage: 9_300, contractMonths: 0, monthsIntoProbation: 1, simpleLabor: false };
  assert.equal(probationMinWage(base).minimum, 9_288);
  assert.equal(probationMinWage(base).ok, true);
  assert.equal(probationMinWage({ ...base, contractMonths: 6 }).minimum, 10_320);
  assert.equal(probationMinWage({ ...base, simpleLabor: true }).why, "simpleLabor");
  const after = probationMinWage({ ...base, monthsIntoProbation: 3 });
  assert.equal(after.shortHourly, 1_020);
  assert.equal(after.shortMonthly, 213_180);
});

test("연차 사용촉진 일정: 회계연도 7/1~7/10, 10/31 / 첫해 10/1~10/10, 11/30, 12/21", () => {
  const a = leavePromotionSchedule("annual", "2026-12-31");
  assert.deepEqual(a.map((s) => s.due), ["2026-07-10", "2026-07-20", "2026-10-31", "2026-12-31"]);
  assert.equal(a[0].from, "2026-07-01");
  const f = leavePromotionSchedule("firstYear", "2026-12-31");
  assert.equal(f.find((s) => s.id === "notify")?.from, "2026-10-01");
  assert.equal(f.find((s) => s.id === "assign")?.due, "2026-11-30");
  assert.equal(f.find((s) => s.id === "assignLate")?.due, "2026-12-21");
  // 말일 보정: 6월 30일 끝 → 6개월 전 1월 1일 시작
  assert.equal(leavePromotionSchedule("annual", "2027-06-30")[0].from, "2027-01-01");
});

import { voluntaryQuitCheck, directPaymentCheck } from "./kr-welfare-2026.ts";

test("자진퇴사 정당 사유: 체불 2개월·통근 3시간·간호 30일+휴직 거부·가입 180일", () => {
  assert.equal(voluntaryQuitCheck({ reasons: ["unpaidWages"], months: 2, insuredDays: 200 }).verdict, "likely");
  assert.equal(voluntaryQuitCheck({ reasons: ["unpaidWages"], months: 1, insuredDays: 200 }).verdict, "check");
  assert.equal(voluntaryQuitCheck({ reasons: ["commute"], commuteHours: 3, insuredDays: 200 }).reasonOk, true);
  assert.equal(voluntaryQuitCheck({ reasons: ["familyCare"], careDays: 40, leaveRefused: false, insuredDays: 200 }).reasonOk, false);
  assert.equal(voluntaryQuitCheck({ reasons: ["workplaceHarassment"], insuredDays: 150 }).verdict, "check");
  assert.equal(voluntaryQuitCheck({ reasons: [], insuredDays: 300 }).verdict, "unlikely");
});

test("하도급 직접 지급: 2회분+요청, 발주자 미지급 범위, 60일 뒤 지연이자 15.5%", () => {
  const base = { cause: "twoMissed" as const, missedInstallments: 2, requested: true, primeStopRequest: false, workValue: 50_000_000, receivedFromPrime: 10_000_000, ownerUnpaidToPrime: 30_000_000, daysSinceDelivery: 125 };
  const r = directPaymentCheck(base);
  assert.equal(r.direct, 30_000_000);
  assert.equal(r.remainder, 10_000_000);
  assert.equal(r.lateInterest, Math.floor((40_000_000 * 0.155 * 65) / 365));
  assert.equal(directPaymentCheck({ ...base, requested: false }).direct, 0);
  assert.equal(directPaymentCheck({ ...base, missedInstallments: 1 }).eligible, false);
  assert.equal(directPaymentCheck({ ...base, cause: "agreement", requested: false }).eligible, true);
  assert.equal(directPaymentCheck({ ...base, primeStopRequest: true }).direct, 0);
  assert.equal(directPaymentCheck({ ...base, daysSinceDelivery: 60 }).lateInterest, 0);
});
