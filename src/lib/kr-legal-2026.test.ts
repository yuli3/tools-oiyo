import assert from "node:assert/strict";
import test from "node:test";
import { CLAIMS, daysUntil, inclusiveDays, legalInterest, limitationExpiry } from "./kr-legal-2026.ts";
import { compareIncorporation, corporateTax2026, founderSalaryTax, soleProprietorTax } from "./kr-incorporation-2026.ts";

test("이자 날수는 기산일과 끝나는 날을 모두 넣는다", () => {
  assert.equal(inclusiveDays("2026-01-01", "2026-12-31"), 365);
  assert.equal(inclusiveDays("2026-01-01", "2026-01-01"), 1);
  assert.equal(inclusiveDays("2026-02-01", "2026-01-01"), 0);
});

test("민사 연 5%: 1,000만 원 1년 = 50만 원", () => {
  const r = legalInterest({ principal: 10_000_000, start: "2026-01-01", end: "2026-12-31", rate: 0.05 });
  assert.equal(r.interest, 500_000);
  assert.equal(r.total, 10_500_000);
});

test("소장 송달 다음 날부터 연 12%로 나눠 계산한다", () => {
  const r = legalInterest({ principal: 10_000_000, start: "2026-01-01", end: "2026-12-31", rate: 0.05, servedOn: "2026-06-30" });
  assert.deepEqual(r.periods.map((p) => [p.from, p.to, p.days, p.rate, p.interest]), [
    ["2026-01-01", "2026-06-30", 181, 0.05, 247_945],
    ["2026-07-01", "2026-12-31", 184, 0.12, 604_931],
  ]);
  assert.equal(r.interest, 852_876);
});

test("송달일이 기산일보다 앞이면 처음부터 12%", () => {
  const r = legalInterest({ principal: 1_000_000, start: "2026-03-01", end: "2026-03-10", rate: 0.06, servedOn: "2026-01-15" });
  assert.equal(r.periods.length, 1);
  assert.equal(r.periods[0].rate, 0.12);
});

test("소멸시효: 같은 월·일에 끝나고, 해당일이 없으면 그 달 말일", () => {
  assert.equal(limitationExpiry("2023-03-10", 3).expiry, "2026-03-10");
  assert.equal(limitationExpiry("2024-02-29", 1).expiry, "2025-02-28");
});

test("말일이 토요일·공휴일이면 다음 평일로 미룬다(민법 제161조)", () => {
  const r = limitationExpiry("2021-10-03", 5); // 2026-10-03 토·개천절, 10-04 일, 10-05 대체공휴일
  assert.equal(r.nominal, "2026-10-03");
  assert.equal(r.expiry, "2026-10-06");
  assert.equal(r.extended, true);
});

test("근로자의 날은 민법상 공휴일이 아니다", () => {
  assert.equal(limitationExpiry("2016-05-01", 10).expiry, "2026-05-01");
});

test("남은 날과 시효 목록", () => {
  assert.equal(daysUntil("2026-10-27", "2026-10-27"), 0);
  assert.equal(daysUntil("2026-10-27", "2026-10-20"), -7);
  assert.equal(CLAIMS.wage.years, 3);
  assert.equal(CLAIMS.commercial.years, 5);
});

test("2026 법인세율 10/20/22/25%", () => {
  assert.equal(corporateTax2026(200_000_000), 20_000_000);
  assert.equal(corporateTax2026(300_000_000), 40_000_000);
  assert.equal(corporateTax2026(30_000_000_000), 6_180_000_000);
  assert.equal(corporateTax2026(100_000_000, true), 20_000_000);
});

test("개인사업자 1억: 기본세율 35% 구간", () => {
  const r = soleProprietorTax(100_000_000);
  assert.equal(r.base, 98_500_000);
  assert.equal(r.tax, 18_965_000);
  assert.equal(r.total, 20_861_500);
});

test("법인 비교: 급여는 이익을 넘지 않고, 배당 시 15.4% 추가", () => {
  const r = compareIncorporation(200_000_000, 60_000_000);
  assert.equal(r.corpBase, 140_000_000);
  assert.equal(r.corpTax, 14_000_000);
  assert.equal(r.corpLocal, 1_400_000);
  assert.equal(r.pay.total, founderSalaryTax(60_000_000).total);
  assert.equal(r.dividendTax, Math.floor((124_600_000 * 0.154) / 10) * 10);
  assert.equal(compareIncorporation(50_000_000, 80_000_000).salary, 50_000_000);
});
