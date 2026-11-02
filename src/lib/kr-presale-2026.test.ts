import assert from "node:assert/strict";
import { test } from "node:test";
import { density, presaleSchedule, ZONES, type PresaleInput } from "./kr-presale-2026.ts";

const base: PresaleInput = {
  price: 600_000_000,
  depositRate: 0.1,
  midRate: 0.6,
  midCount: 6,
  months: 35,
  loanShare: 1,
  loanRate: 0.045,
  interestMode: "deferred",
  options: 15_000_000,
  over85: false,
};

test("10/60/30 split adds back to the price", () => {
  const r = presaleSchedule(base);
  assert.equal(r.deposit, 60_000_000);
  assert.equal(r.midTotal, 360_000_000);
  assert.equal(r.balance, 180_000_000);
  assert.equal(r.rows.reduce((s, x) => s + x.amount, 0), 600_000_000);
  assert.deepEqual(r.rows.map((x) => x.month), [0, 5, 10, 15, 20, 25, 30, 35]);
});

test("deferred interest is simple interest from each draw to move-in", () => {
  const r = presaleSchedule(base);
  // 6천만 × 4.5% × (30+25+20+15+10+5)/12 = 6천만 × 0.045 × 105/12
  assert.equal(r.interestTotal, 23_625_000);
  assert.equal(r.loanToRefinance, 360_000_000);
  assert.equal(r.cashBeforeMoveIn, 60_000_000);
  // 취득세는 kr-real-estate-tax의 1주택 표준세율 계산을 그대로 써요(분양가 + 옵션 기준).
  const acq = r.acquisition;
  assert.equal(r.moveIn, 180_000_000 + 15_000_000 + 23_625_000 + acq);
  assert.equal(r.totalCost, 615_000_000 + 23_625_000 + acq);
});

test("interest-free presale charges no interest; self-paid moves it before move-in", () => {
  assert.equal(presaleSchedule({ ...base, interestMode: "free" }).interestTotal, 0);
  const self = presaleSchedule({ ...base, interestMode: "self" });
  assert.equal(self.cashBeforeMoveIn, 60_000_000 + 23_625_000);
  assert.equal(self.moveIn, 180_000_000 + 15_000_000 + self.acquisition);
});

test("partial loan share leaves the rest as cash", () => {
  const r = presaleSchedule({ ...base, loanShare: 0.5, interestMode: "free" });
  assert.equal(r.loanTotal, 180_000_000);
  assert.equal(r.cashBeforeMoveIn, 60_000_000 + 180_000_000);
});

test("rejects impossible splits", () => {
  assert.throws(() => presaleSchedule({ ...base, depositRate: 0.5, midRate: 0.6 }));
  assert.throws(() => presaleSchedule({ ...base, months: 4 }));
});

test("zone table pins the national ranges", () => {
  assert.equal(ZONES.length, 21);
  const r2 = ZONES.find((z) => z.id === "r2")!;
  assert.deepEqual([r2.coverage, r2.farMin, r2.farMax], [60, 100, 250]);
  const cc = ZONES.find((z) => z.id === "cc")!;
  assert.deepEqual([cc.coverage, cc.farMax], [90, 1500]);
});

test("coverage and floor-area ratio", () => {
  const d = density({ site: 330, footprint: 190, floorArea: 640, coverageLimit: 60, farLimit: 200 });
  assert.equal(Math.round(d.coverage * 100) / 100, 57.58);
  assert.equal(Math.round(d.far * 100) / 100, 193.94);
  assert.equal(d.maxFootprint, 198);
  assert.equal(d.maxFloorArea, 660);
  assert.equal(d.coverageOk && d.farOk, true);
  assert.equal(d.floorsAtMaxFootprint, 3);
  assert.equal(density({ site: 100, footprint: 70, floorArea: 100, coverageLimit: 60, farLimit: 200 }).coverageOk, false);
});
