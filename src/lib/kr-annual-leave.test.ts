import assert from "node:assert/strict";
import test from "node:test";
import { annualLeaveStatus, arisingDate, unusedLeavePay, yearlyLeaveDays } from "./kr-annual-leave.ts";

test("해당일이 없는 달은 다음 달 1일에 생긴다", () => {
  assert.equal(arisingDate("2026-01-31", 1), "2026-03-01");
  assert.equal(arisingDate("2025-03-02", 12), "2026-03-02");
});

test("근속연수별 연차: 15일에서 2년마다 1일, 25일 한도", () => {
  assert.deepEqual([1, 2, 3, 4, 5, 21, 26].map(yearlyLeaveDays), [15, 15, 16, 16, 17, 25, 25]);
});

test("1년 미만은 개근한 달마다 1일", () => {
  const r = annualLeaveStatus("2025-03-02", "2025-08-15")!;
  assert.equal(r.current, 5);
  assert.deepEqual(r.next, { date: "2025-09-02", days: 1, kind: "monthly" });
});

test("1년 하루 전에는 11일, 1년을 채운 다음 날 15일", () => {
  const before = annualLeaveStatus("2025-03-02", "2026-03-01")!;
  assert.equal(before.current, 11);
  assert.deepEqual(before.next, { date: "2026-03-02", days: 15, kind: "yearly" });
  const after = annualLeaveStatus("2025-03-02", "2026-03-02")!;
  assert.equal(after.completedYears, 1);
  assert.equal(after.current, 15);
});

test("장기 근속", () => {
  const r = annualLeaveStatus("2020-01-10", "2026-10-27")!;
  assert.equal(r.completedYears, 6);
  assert.equal(r.current, 17);
  assert.deepEqual(r.next, { date: "2027-01-10", days: 18, kind: "yearly" });
  assert.equal(annualLeaveStatus("2000-01-01", "2026-10-27")!.current, 25);
  assert.equal(annualLeaveStatus("2026-10-28", "2026-10-27"), null);
});

test("미사용 연차수당", () => {
  assert.equal(unusedLeavePay(5, 12_000, 8), 480_000);
});
