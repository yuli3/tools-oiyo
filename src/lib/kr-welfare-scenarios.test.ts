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
