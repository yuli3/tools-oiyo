import test from "node:test";
import assert from "node:assert/strict";
import { comprehensiveRealEstateTax, creThreshold, rentalIncomeTax, seniorCreditRate, holdingCreditRate } from "./kr-home-tax-2026.ts";

test("종부세 1세대 1주택 공시 15억: 과표 1.8억 → 90만 원, 재산세 중복분 32.4만 원 빼고 57.6만 원", () => {
  const r = comprehensiveRealEstateTax({ prices: [1_500_000_000], oneHouse: true });
  assert.equal(r.deduction, 1_200_000_000);
  assert.equal(r.base, 180_000_000);
  assert.equal(r.rawTax, 900_000);
  assert.equal(r.overlap, 324_000);
  assert.equal(r.tax, 576_000);
  assert.equal(r.rural, 115_200);
  assert.equal(r.totalTax, 691_200);
});

test("고령·장기보유 세액공제는 합쳐서 80%까지", () => {
  assert.equal(seniorCreditRate(72) + holdingCreditRate(16), 0.9);
  const r = comprehensiveRealEstateTax({ prices: [1_500_000_000], oneHouse: true, age: 72, holdYears: 16 });
  assert.equal(r.creditRate, 0.8);
  assert.equal(r.tax, 115_200);
  // 2주택이면 세액공제 없음
  assert.equal(comprehensiveRealEstateTax({ prices: [800_000_000, 700_000_000], oneHouse: true, age: 72, holdYears: 16 }).creditRate, 0);
});

test("2주택 합계 15억: 일반세율, 3주택 30억: 12억 초과분 2%", () => {
  const two = comprehensiveRealEstateTax({ prices: [800_000_000, 700_000_000], oneHouse: false });
  assert.equal(two.base, 360_000_000);
  assert.equal(two.rawTax, 1_920_000);
  assert.equal(two.overlap, 864_000);
  assert.equal(two.tax, 1_056_000);
  const three = comprehensiveRealEstateTax({ prices: [1e9, 1e9, 1e9], oneHouse: false });
  assert.equal(three.heavy, true);
  assert.equal(three.rawTax, 10_800_000);
  assert.equal(three.installment, true);
});

test("공제선 이하면 0, 법인은 공제 없이 2.7%", () => {
  assert.equal(creThreshold(true), 1_200_000_000);
  assert.equal(comprehensiveRealEstateTax({ prices: [1_000_000_000], oneHouse: true }).totalTax, 0);
  const corp = comprehensiveRealEstateTax({ prices: [500_000_000], oneHouse: false, corporate: true });
  assert.equal(corp.deduction, 0);
  assert.equal(corp.rawTax, 8_100_000);
});

test("주택임대소득: 1주택 비과세, 2천만 이하 분리과세 14%", () => {
  assert.equal(rentalIncomeTax({ houses: 1, annualRent: 12_000_000, deposits: 0, registered: false, otherIncome: 0 }).tax, 0);
  assert.equal(rentalIncomeTax({ houses: 1, highPriceOneHouse: true, annualRent: 12_000_000, deposits: 0, registered: false, otherIncome: 0 }).exempt, false);
  const r = rentalIncomeTax({ houses: 2, annualRent: 12_000_000, deposits: 0, registered: true, otherIncome: 50_000_000 });
  assert.equal(r.basic, 0); // 다른 소득 2천만 초과면 기본공제 없음
  assert.equal(r.separateBase, 4_800_000);
  assert.equal(r.separateTax, 739_200);
  const low = rentalIncomeTax({ houses: 2, annualRent: 12_000_000, deposits: 0, registered: true, otherIncome: 10_000_000 });
  assert.equal(low.separateBase, 800_000);
  assert.equal(low.separateTax, 123_200);
});

test("3주택 보증금 8억: 간주임대료 930만 원, 수입 2천만 넘으면 종합과세", () => {
  const r = rentalIncomeTax({ houses: 3, annualRent: 12_000_000, deposits: 800_000_000, registered: false, otherIncome: 10_000_000 });
  assert.equal(r.deemed, 9_300_000);
  assert.equal(r.revenue, 21_300_000);
  assert.equal(r.separateAllowed, false);
  assert.equal(r.better, "comprehensive");
  assert.ok(r.tax > 0);
});
