import { test } from "node:test";
import assert from "node:assert/strict";
import { bondSchedule, depreciation, externalAuditCheck, leaseSchedule } from "./kr-accounting-schedules-2026.ts";

test("정액법 1,000만 원·잔존 0·5년: 해마다 200만 원", () => {
  const r = depreciation(10_000_000, 0, 5, "straight");
  assert.equal(r.rows.length, 5);
  assert.ok(r.rows.every((x) => x.expense === 2_000_000));
  assert.equal(r.rows[4].closing, 0);
});

test("정률법 잔존 0이면 5% 기준 상각률(5년 0.451), 마지막 해에 남은 장부금액을 모두 상각", () => {
  const r = depreciation(10_000_000, 0, 5, "declining");
  assert.equal(r.rate, 0.4507);
  assert.equal(r.rows[0].expense, 4_507_197);
  assert.equal(r.rows[r.rows.length - 1].closing, 0);
});

test("연수합계법 4년 1,000만 원: 4/10, 3/10, 2/10, 1/10, 7월 취득이면 첫해 6개월", () => {
  assert.deepEqual(depreciation(10_000_000, 0, 4, "syd").rows.map((x) => x.expense), [4_000_000, 3_000_000, 2_000_000, 1_000_000]);
  const half = depreciation(12_000_000, 0, 3, "straight", 6);
  assert.equal(half.rows[0].expense, 2_000_000);
  assert.equal(half.rows.length, 4);
  assert.equal(half.rows[3].closing, 0);
});

test("IFRS 16 리스: 연 100만 원 3년 5% 기말 지급 → 부채 2,723,248", () => {
  const r = leaseSchedule(1_000_000, 3, 0.05);
  assert.equal(r.liability, 2_723_248);
  assert.equal(r.rows[0].interest, 136_162);
  assert.equal(r.rows[2].closing, 0);
  const a = leaseSchedule(1_000_000, 3, 0.05, true);
  assert.equal(a.liability, 2_859_410);
  assert.equal(a.rows[2].closing, 0);
});

test("사채 액면 1억, 표면 5%, 시장 6%, 3년 → 할인발행, 만기 장부금액 = 액면", () => {
  const r = bondSchedule(100_000_000, 0.05, 0.06, 3);
  assert.equal(r.type, "할인발행");
  assert.equal(r.price, 97_326_988);
  assert.equal(r.rows[2].closing, 100_000_000);
});

test("외감 대상: 500억 기준, 4개 중 2개, 유한회사 5개 중 3개", () => {
  const E = 100_000_000;
  assert.equal(externalAuditCheck({ assets: 600 * E, liabilities: 0, revenue: 0, employees: 0 }).required, true);
  assert.equal(externalAuditCheck({ assets: 130 * E, liabilities: 80 * E, revenue: 50 * E, employees: 20 }).required, true);
  assert.equal(externalAuditCheck({ assets: 130 * E, liabilities: 10 * E, revenue: 50 * E, employees: 20 }).required, false);
  assert.equal(externalAuditCheck({ llc: true, assets: 130 * E, liabilities: 80 * E, revenue: 50 * E, employees: 20, members: 10 }).required, false);
});
