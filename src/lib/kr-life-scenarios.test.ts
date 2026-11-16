import test from "node:test";
import assert from "node:assert/strict";
import * as L from "./kr-life-scenarios.ts";
import * as H from "./kr-home-scenarios.ts";

test("실업급여: 하한·상한 벡터와 나이별 일수", () => {
  const i: L.JoblessLite = { wage: 2_000_000, hours: 8, age: "under", period: "p3" };
  assert.equal(L.joblessResult(i).dailyBenefit, 66_048);
  assert.equal(L.joblessResult({ ...i, wage: 5_000_000 }).dailyBenefit, 68_100);
  assert.equal(L.joblessResult({ ...i, age: "over" }).days, 210);
  assert.equal(L.joblessTotal(i), 66_048 * 180);
});

test("저축 비교: ISA는 같은 금리 적금보다 세후 이자가 많아요", () => {
  const i: L.SaveLite = { monthly: 500_000, years: 3, depositRate: 0.035, savingsRate: 0.04, isaRate: 0.04, parkingRate: 0.025 };
  const rows = L.saveResult(i);
  assert.ok(rows.find((r) => r.id === "isa")!.net > rows.find((r) => r.id === "savings")!.net);
  assert.equal(L.saveBest(i), rows.find((r) => r.id === "isa")!.net);
});

test("전세 vs 매매: 손익분기 상승률에서 차이가 거의 0", () => {
  const i: H.BuyLite = { price: 500_000_000, jeonse: 350_000_000, ltv: 0.6, mortgageRate: 0.04, savingsRate: 0.03, growth: 0.03, years: 5, holding: 0.002, over85: false };
  const g = H.buyBreakEvenGrowth(i);
  assert.ok(g !== null);
  assert.ok(Math.abs(H.buyAdvantage({ ...i, growth: g! })) < 1000);
  assert.ok(H.buyAdvantage({ ...i, growth: 0.06 }) > H.buyAdvantage(i));
});

test("전월세 전환: 법정 상한은 기준금리 + 2%p, 10%를 넘지 않아요", () => {
  assert.equal(H.legalConversionCap(0.025), 0.045);
  assert.equal(H.legalConversionCap(0.09), 0.1);
  assert.equal(H.convertRent({ jeonse: 300_000_000, deposit: 50_000_000, rate: 0.045, baseRate: 0.025 }), 937_500);
});
