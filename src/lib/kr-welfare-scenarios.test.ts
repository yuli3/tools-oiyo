import test from "node:test";
import assert from "node:assert/strict";
import { sweep, tornado } from "./scenario.ts";
import { EITC_ASSUMPTIONS, eitcPlain, eitcTotal, GUARANTEE_ASSUMPTIONS, guaranteeTotal, INJURY_ASSUMPTIONS, injuryDaily, PENSION_ASSUMPTIONS, pensionDiff, RENT_ASSUMPTIONS, rentTotal } from "./kr-welfare-scenarios.ts";

const eitc = { household: "oneEarner" as const, income: 24_000_000, assets: 120_000_000, children: 1 };

test("장려금 곡선은 구간 경계를 정확히 지나요", () => {
  const a = EITC_ASSUMPTIONS(eitc)[0];
  const pts = sweep(eitc, a, eitcTotal, a.range(a.get(eitc)), 40);
  const at = (x: number) => pts.find((p) => p.x === x)?.y;
  assert.equal(at(7_000_000), 2_850_000 + 1_000_000);
  assert.equal(at(14_000_000), 2_850_000 + 1_000_000);
  assert.ok(pts.every((p) => p.y >= 0));
});

test("쉬운 문장: 재산 초과·자녀로 홑벌이 전환", () => {
  assert.match(eitcPlain({ ...eitc, assets: 250_000_000 }).headline, /받을 수 없어요/);
  assert.match(eitcPlain({ ...eitc, household: "single" }).reasons.join(" "), /홑벌이/);
});

test("토네이도: 대지급금·퇴직연금 가정 순서", () => {
  const g = { kind: "insolvency" as const, age: 35, monthlyWage: 3_000_000, unpaidMonths: 4, unpaidSeverance: 9_000_000, serviceYears: 3, afterReform: true };
  assert.ok(tornado(g, GUARANTEE_ASSUMPTIONS, guaranteeTotal).length >= 2);
  const p = { monthlyWage: 4_000_000, yearsServed: 5, yearsLeft: 20, wageGrowth: 0.03, dcReturn: 0.04 };
  const bars = tornado(p, PENSION_ASSUMPTIONS, pensionDiff);
  assert.deepEqual(bars.map((b) => b.key).sort(), ["dcReturn", "wageGrowth"]);
});

test("휴업급여 곡선의 역전 구간과 월세 한도", () => {
  const a = INJURY_ASSUMPTIONS[0];
  const base = { avgDailyWage: 120_000, days: 30 };
  assert.equal(injuryDaily(a.set(base, 90_000)), 82_560);
  assert.ok(injuryDaily(a.set(base, 100_000)) < 82_560);
  const r = { income: 40_000_000, incomeType: "wage" as const, monthlyRent: 1_200_000, months: 12 };
  const m = RENT_ASSUMPTIONS(r)[0];
  assert.equal(rentTotal(m.set(r, 1_200_000)), rentTotal(m.set(r, 900_000)));
});

test("종부세 가정: 합계를 바꾸면 집마다 같은 비율로, 1주택만 나이·보유 기간", async () => {
  const { CRE_ASSUMPTIONS, creTotal } = await import("./kr-welfare-scenarios.ts");
  const two = { prices: [800_000_000, 400_000_000], oneHouse: false };
  const a = CRE_ASSUMPTIONS(two);
  assert.deepEqual(a.map((x) => x.key), ["total"]);
  assert.deepEqual(a[0].set(two, 2_400_000_000).prices, [1_600_000_000, 800_000_000]);
  const one = { prices: [1_500_000_000], oneHouse: true, age: 50, holdYears: 2 };
  assert.deepEqual(CRE_ASSUMPTIONS(one).map((x) => x.key), ["total", "age", "holdYears"]);
  assert.ok(creTotal({ ...one, age: 70 }) < creTotal(one));
});

test("주택임대·통상임금·포괄임금 가정이 결과를 움직여요", async () => {
  const m = await import("./kr-welfare-scenarios.ts");
  const rent = { houses: 3, annualRent: 12_000_000, deposits: 800_000_000, registered: false, otherIncome: 10_000_000 };
  assert.deepEqual(m.RENTAL_ASSUMPTIONS(rent).map((x) => x.key), ["annualRent", "otherIncome", "deposits"]);
  assert.ok(m.rentalTax({ ...rent, deposits: 1_200_000_000 }) > m.rentalTax(rent));
  const ow = { basePay: 2_500_000, fixedAllowances: 300_000, bonusAnnual: 6_000_000, bonusConditional: true, overtime: 20, night: 0, holiday: 0 };
  assert.ok(m.ordinaryPremium({ ...ow, overtime: 40 }) > m.ordinaryPremium(ow));
  const ot = { basePay: 2_508_000, fixedOtPay: 300_000, overtime: 30, night: 0, holiday: 0, months: 36 };
  const marks = m.FIXED_OT_ASSUMPTIONS(ot)[0].marks!;
  assert.equal(marks[0].at, 16.6);
  assert.equal(m.fixedOtShort({ ...ot, overtime: 10 }), 0);
});
