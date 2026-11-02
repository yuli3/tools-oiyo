import assert from "node:assert/strict";
import { test } from "node:test";
import { compareGenerations, silsonPayout, type Bill } from "./kr-silson-generations.ts";

const bill = (b: Partial<Bill>): Bill => ({
  care: "outpatient",
  tier: "clinic",
  covered: 0,
  nonCovered: 0,
  riderItems: 0,
  severe: false,
  ...b,
});

test("3세대 통원은 급여와 비급여를 합쳐 병원 규모별 정액과 20% 중 큰 금액을 뺀다", () => {
  // 의원 급여 2만 + 비급여 3만 = 5만, 20% 1만 = 정액 1만 → 4만
  assert.equal(silsonPayout("g3", bill({ covered: 20_000, nonCovered: 30_000 })).payout, 40_000);
  // 병원 1.5만 > 20%(1만)
  assert.equal(silsonPayout("g3", bill({ tier: "hospital", covered: 20_000, nonCovered: 30_000 })).deductible, 15_000);
  // 종합병원 20만 → 20% 4만 > 2만
  assert.equal(silsonPayout("g3", bill({ tier: "general", covered: 200_000 })).deductible, 40_000);
});

test("3세대 도수·주사·MRI는 특약으로 2만 원과 30% 중 큰 금액", () => {
  assert.equal(silsonPayout("g3", bill({ riderItems: 100_000 })).deductible, 30_000);
  assert.equal(silsonPayout("g3", bill({ riderItems: 50_000 })).deductible, 20_000);
});

test("4세대 통원은 급여·비급여를 나눠 공제한다 (비급여 3만 원과 30%)", () => {
  const r = silsonPayout("g4", bill({ covered: 20_000, nonCovered: 30_000 }));
  assert.equal(r.deductible, 10_000 + 30_000);
  assert.equal(r.payout, 10_000);
  // 같은 영수증에서 3세대가 4세대보다 많이 받는다
  assert.ok(silsonPayout("g3", bill({ covered: 20_000, nonCovered: 30_000 })).payout > r.payout);
});

test("5세대 비급여는 중증 30%, 비중증 50%(통원 5만 원)", () => {
  const nonSevere = silsonPayout("g5", bill({ nonCovered: 200_000 }));
  assert.equal(nonSevere.deductible, 100_000);
  const severe = silsonPayout("g5", bill({ nonCovered: 200_000, severe: true }));
  assert.equal(severe.deductible, 60_000);
  assert.equal(silsonPayout("g5", bill({ nonCovered: 60_000 })).deductible, 50_000);
});

test("입원은 정액 없이 비율만 뺀다", () => {
  const b = bill({ care: "inpatient", tier: "general", covered: 1_000_000, nonCovered: 1_000_000 });
  const [g3, g4, g5] = compareGenerations(b);
  assert.equal(g3.payout, 1_600_000);
  assert.equal(g4.payout, 800_000 + 700_000);
  assert.equal(g5.payout, 800_000 + 500_000);
});

test("공제가 금액보다 크면 보험금은 0원, 빈 영수증은 0원", () => {
  assert.equal(silsonPayout("g4", bill({ nonCovered: 20_000 })).payout, 0);
  assert.deepEqual(
    compareGenerations(bill({})).map((r) => r.payout),
    [0, 0, 0],
  );
  assert.throws(() => silsonPayout("g4", bill({ covered: -1 })), RangeError);
});
