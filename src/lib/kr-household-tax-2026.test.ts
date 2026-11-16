import test from "node:test";
import assert from "node:assert/strict";
import { filingDeadlines, inheritedValuation, officetelHouseCount, ticketPresaleTax, FREE_USE_FACTOR, businessCarExpense, overseasCompare, commercialRentCheck, smeYouthReduction, vatTypeCompare, yellowUmbrella, dependentIncomeTest, dependentsTax, familyLoanGift, freeUseGift, judgeDependent, lowPriceSale, majorShareholderTax, whoShouldClaim } from "./kr-household-tax-2026.ts";

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

test("가족 차용: 4.6%로 계산한 이자와의 차이가 연 1천만 원 이상이어야 증여", () => {
  const two = familyLoanGift({ principal: 200_000_000, rate: 0 });
  assert.equal(two.benefit, 9_200_000);
  assert.equal(two.taxable, false);
  const three = familyLoanGift({ principal: 300_000_000, rate: 0 });
  assert.equal(three.gift, 13_800_000);
  assert.equal(three.giftTax, 0); // 성년 자녀 공제 5천만 안
  assert.equal(three.zeroRateMaxPrincipal, 217_391_304);
  assert.ok(Math.abs(three.safeRate - (0.046 - 1 / 30)) < 1e-12);
  const paid = familyLoanGift({ principal: 300_000_000, rate: 0.02 });
  assert.equal(paid.benefit, 7_800_000);
  assert.equal(paid.taxable, false);
  assert.equal(paid.lenderTax, Math.floor(6_000_000 * 0.275));
  assert.equal(familyLoanGift({ principal: 1_000_000_000, rate: 0, deductionLeft: 0 }).giftTax, Math.floor(46_000_000 * 0.1 * 0.97));
});

test("부동산 무상사용: 집값 × 2% × 3.7908이 1억 원 이상, 함께 살면 제외", () => {
  assert.ok(Math.abs(FREE_USE_FACTOR - 3.7907867694) < 1e-9);
  const r = freeUseGift({ propertyValue: 1_500_000_000 });
  assert.equal(r.annual, 30_000_000);
  assert.equal(r.fiveYear, Math.floor(1_500_000_000 * 0.02 * FREE_USE_FACTOR));
  assert.equal(r.useTaxable, true);
  assert.ok(r.useTax > 0);
  assert.equal(freeUseGift({ propertyValue: 1_500_000_000, coResiding: true }).useTaxable, false);
  assert.equal(freeUseGift({ propertyValue: 1_300_000_000 }).useTaxable, false);
  assert.ok(r.valueLine > 1_318_000_000 && r.valueLine < 1_320_000_000);
  const c = freeUseGift({ propertyValue: 500_000_000, collateralLoan: 300_000_000, collateralInterest: 0 });
  assert.equal(c.collateralGift, 13_800_000);
});

test("저가 양수도: 증여는 min(30%, 3억), 양도세 시가 재계산은 min(5%, 3억)", () => {
  const a = lowPriceSale({ marketValue: 1_100_000_000, price: 700_000_000 });
  assert.equal(a.giftLine, 300_000_000);
  assert.equal(a.gift, 100_000_000);
  assert.equal(a.sellerRecalc, true);
  assert.equal(a.noGiftAbove, 800_000_000);
  const b = lowPriceSale({ marketValue: 1_000_000_000, price: 950_000_000 });
  assert.equal(b.giftTaxable, false);
  assert.equal(b.sellerRecalc, true); // 5천만 = 5% 이상
  assert.equal(lowPriceSale({ marketValue: 1_000_000_000, price: 960_000_000 }).sellerRecalc, false);
  assert.equal(lowPriceSale({ marketValue: 500_000_000, price: 360_000_000 }).gift, 0); // 1.4억 < 1.5억
});

test("상가 임대료: 환산보증금 기준 안이면 5% 상한, 1년 안 재인상 불가", () => {
  const base = { region: "seoul" as const, deposit: 100_000_000, monthlyRent: 5_000_000, newDeposit: 100_000_000, newMonthlyRent: 5_250_000, monthsSinceLast: 24 };
  const ok = commercialRentCheck(base);
  assert.equal(ok.converted, 600_000_000);
  assert.equal(ok.verdict, "ok");
  assert.equal(ok.conversionRate, 0.12);
  assert.equal(commercialRentCheck({ ...base, newMonthlyRent: 5_300_000 }).verdict, "over");
  assert.equal(commercialRentCheck({ ...base, monthsSinceLast: 6 }).verdict, "tooSoon");
  assert.equal(commercialRentCheck({ ...base, region: "other" }).verdict, "notCovered");
  assert.equal(commercialRentCheck({ ...base, baseRate: 0.02 }).conversionRate, 0.09);
  // 보증금 2천만 줄이고 월세로 돌리면 12% 기준 월 20만 더 허용
  assert.equal(commercialRentCheck({ ...base, newDeposit: 80_000_000, newMonthlyRent: 5_450_000 }).verdict, "ok");
});

test("중소기업 청년 감면: 90%, 연 200만, 병역 최대 6년 차감, 5년 뒤 달", () => {
  const r = smeYouthReduction({ salary: 36_000_000, ageAtContract: 29, start: "2026-03" });
  assert.equal(r.ageOk, true);
  assert.ok(r.national > 0 && r.national <= 2_000_000);
  assert.equal(r.endMonth, "2031-03");
  assert.equal(smeYouthReduction({ salary: 36_000_000, ageAtContract: 36, start: "2026-03" }).ageOk, false);
  assert.equal(smeYouthReduction({ salary: 36_000_000, ageAtContract: 36, militaryMonths: 24, start: "2026-03" }).countedAge, 34);
  assert.equal(smeYouthReduction({ salary: 120_000_000, ageAtContract: 30, start: "2026-01" }).capped, true);
});

test("노란우산: 사업소득 4천 이하 600만, 6천 이하 500만, 1억 이하 400만, 법인대표 총급여 8천 초과는 안 돼요", () => {
  const a = yellowUmbrella({ kind: "business", income: 35_000_000, paid: 12_000_000 });
  assert.equal(a.limit, 6_000_000);
  assert.equal(a.deduction, 6_000_000);
  assert.equal(a.overLimit, 6_000_000);
  assert.ok(a.saved > 0);
  assert.equal(yellowUmbrella({ kind: "business", income: 50_000_000, paid: 6_000_000 }).deduction, 5_000_000);
  assert.equal(yellowUmbrella({ kind: "business", income: 80_000_000, paid: 6_000_000 }).deduction, 4_000_000);
  assert.equal(yellowUmbrella({ kind: "business", income: 150_000_000, paid: 6_000_000 }).deduction, 2_000_000);
  assert.equal(yellowUmbrella({ kind: "ceo", income: 90_000_000, paid: 3_000_000 }).eligible, false);
});

test("일반 vs 간이: 4,800만 미만 면제, 업종 부가가치율, 1억 400만 기준", () => {
  const small = vatTypeCompare({ sector: "retail", sales: 40_000_000, purchases: 20_000_000 });
  assert.equal(small.simple, 0);
  assert.equal(small.exempt, true);
  const cafe = vatTypeCompare({ sector: "retail", sales: 100_000_000, purchases: 50_000_000 });
  assert.equal(cafe.simple, 1_500_000 - 250_000);
  assert.equal(cafe.simpleAllowed, true);
  assert.equal(cafe.better, "simple");
  assert.equal(vatTypeCompare({ sector: "retail", sales: 110_000_000, purchases: 0 }).simpleAllowed, false);
  assert.equal(vatTypeCompare({ sector: "professional", sales: 50_000_000, purchases: 0 }).simpleAllowed, false);
  const refund = vatTypeCompare({ sector: "manufacturing", sales: 60_000_000, purchases: 120_000_000 });
  assert.ok(refund.generalRefund > 0);
  assert.equal(refund.simple, 600_000);
});

test("업무용 승용차: 운행기록부 없으면 1,500만 원, 감가상각 800만 원 초과 이월", () => {
  const noLog = businessCarExpense({ ownership: "own", amount: 60_000_000, otherCosts: 8_000_000, logbook: false });
  assert.equal(noLog.depreciation, 12_000_000);
  assert.equal(noLog.businessCost, 15_000_000);
  assert.ok(Math.abs(noLog.ratio - 0.75) < 1e-9);
  assert.equal(noLog.carriedOver, 1_000_000); // 1,200만 × 75% = 900만 − 800만
  assert.equal(noLog.deductible, 14_000_000);
  const log = businessCarExpense({ ownership: "own", amount: 60_000_000, otherCosts: 8_000_000, logbook: true, businessShare: 1 });
  assert.equal(log.carriedOver, 4_000_000);
  assert.equal(log.deductible, 16_000_000);
  assert.equal(businessCarExpense({ ownership: "rent", amount: 12_000_000, otherCosts: 2_000_000, logbook: false }).depreciation, 8_400_000);
});

test("해외주식 직접 vs 국내 상장 해외ETF: 약 833만 원에서 같아져요", () => {
  const r = overseasCompare({ gain: 10_000_000 });
  assert.equal(r.direct, Math.floor(7_500_000 * 0.22));
  assert.equal(r.etf, 1_540_000);
  assert.equal(r.isa, Math.floor(8_000_000 * 0.099));
  assert.equal(r.breakEven, 8_333_334);
  const big = overseasCompare({ gain: 30_000_000, otherFinancial: 5_000_000, marginalRate: 0.418 });
  assert.equal(big.comprehensive, true);
  assert.equal(big.etfExtra, Math.floor(15_000_000 * (0.418 - 0.154)));
});

test("오피스텔 주택 수: 2020-08-12 뒤 주거용은 취득세 주택 수, 소형 신축은 빠져요", () => {
  const base = { price: 250_000_000, acquired: "2023-05-01", residentialUse: true, areaM2: 30, metro: true, firstSaleNew: false, otherHouses: 1, nextHomePrice: 800_000_000, nextRegulated: true };
  const r = officetelHouseCount(base);
  assert.equal(r.officetelTax, 11_500_000);
  assert.equal(r.acquisitionCount, true);
  assert.equal(r.nextRate, 0.12);
  assert.equal(r.nextExtra, r.nextTax - r.nextTaxWithout);
  assert.equal(officetelHouseCount({ ...base, acquired: "2020-08-11" }).acquisitionCount, false);
  const small = officetelHouseCount({ ...base, acquired: "2025-05-01", firstSaleNew: true });
  assert.equal(small.smallNew, true);
  assert.equal(small.heavyCount, false);
  assert.equal(small.exemptCount, true);
  assert.equal(officetelHouseCount({ ...base, price: 350_000_000, acquired: "2025-05-01", firstSaleNew: true, metro: false }).smallNew, false);
  assert.equal(officetelHouseCount({ ...base, residentialUse: false }).heavyCount, false);
});

test("입주권 vs 분양권: 2년 뒤 기본세율, 분양권은 60%", () => {
  const t = ticketPresaleTax({ kind: "ticket", gain: 300_000_000, holdYears: 8, original: true, preApprovalGain: 150_000_000, yearsToApproval: 6 });
  assert.equal(t.longTerm, 18_000_000);
  assert.equal(t.base, 279_500_000);
  assert.equal(t.presale, Math.floor((297_500_000 * 0.6) / 10) * 10 + Math.floor((Math.floor((297_500_000 * 0.6) / 10) * 10 * 0.1) / 10) * 10);
  assert.equal(ticketPresaleTax({ kind: "presale", gain: 100_000_000, holdYears: 0.5 }).rateLabel, "70%");
  assert.equal(ticketPresaleTax({ kind: "ticket", gain: 100_000_000, holdYears: 3, original: true, oneHouseExempt: true, salePrice: 1_000_000_000 }).total, 0);
  assert.equal(ticketPresaleTax({ kind: "ticket", gain: 100_000_000, holdYears: 3, original: false }).longTerm, 0);
});

test("상속주택 평가: 상속세가 0인 구간이면 감정평가가 유리해요", () => {
  const r = inheritedValuation({ official: 300_000_000, appraisal: 450_000_000, otherEstate: 0, spouse: false, salePrice: 500_000_000, yearsAfter: 1 });
  assert.equal(r.appraisal.inheritance, 0);
  assert.equal(r.better, "appraisal");
  const big = inheritedValuation({ official: 600_000_000, appraisal: 900_000_000, otherEstate: 200_000_000, spouse: false, salePrice: 1_000_000_000, yearsAfter: 1 });
  assert.equal(big.official.base, 300_000_000);
  assert.equal(big.appraisal.base, 598_000_000);
});

test("상속·증여 신고기한: 속한 달 말일부터 6개월·3개월, 늦으면 가산세", () => {
  const i = filingDeadlines({ kind: "inheritance", date: "2026-03-15", tax: 100_000_000, lateDays: 20 });
  assert.equal(i.filingDue, "2026-09-30");
  assert.equal(i.noFiling, 10_000_000);
  assert.equal(i.latePayment, 440_000);
  assert.equal(i.extra, 13_440_000);
  assert.equal(filingDeadlines({ kind: "inheritance", date: "2026-03-15", abroad: true }).filingDue, "2026-12-31");
  const g = filingDeadlines({ kind: "gift", date: "2026-11-16", tax: 10_000_000 });
  assert.equal(g.filingDue, "2027-02-28");
  assert.equal(g.onTime, 9_700_000);
  assert.equal(g.steps.at(-1)?.due, "2027-05-31");
});
