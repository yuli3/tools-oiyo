import { test } from "node:test";
import assert from "node:assert/strict";
import { checkSchedule, headcountThresholds, regularHeadcount } from "./kr-workforce-2026.ts";

test("평균 5명 이상이어도 5명 미만인 날이 절반 이상이면 미적용", () => {
  const r = regularHeadcount([8, 8, 8, 4, 4, 4, 4, 4]);
  assert.equal(r.average, 5.5);
  assert.equal(r.applies, false);
});

test("평균 5명 미만이어도 5명 이상인 날이 절반 이상이면 적용", () => {
  const r = regularHeadcount([5, 5, 5, 5, 1, 1, 1, 1]);
  assert.equal(r.average, 3);
  assert.equal(r.applies, true);
  assert.equal(headcountThresholds([12, 12, 12, 9]).find((t) => t.n === 10)!.applies, true);
});

const week = (start: string, end: string, breakMin: number, days = 5) =>
  ["월", "화", "수", "목", "금", "토", "일"].slice(0, days).map((day) => ({ day, start, end, breakMin }));

test("9~18시 휴게 1시간 주 5일: 40시간, 연장 없음, 주휴 생김", () => {
  const r = checkSchedule({ shifts: week("09:00", "18:00", 60) });
  assert.equal(r.total, 40);
  assert.equal(r.overtime, 0);
  assert.equal(r.limitOk, true);
  assert.ok(r.issues.some((i) => i.tone === "good" && i.text.includes("주휴")));
});

test("9~22시 휴게 30분 주 5일: 하루 12.5시간 → 휴게 부족, 연장 22.5시간 초과", () => {
  const r = checkSchedule({ shifts: week("09:00", "22:00", 30) });
  assert.equal(r.total, 62.5);
  assert.equal(r.overtime, 22.5);
  assert.equal(r.limitOk, false);
  assert.ok(r.issues.some((i) => i.cite === "근로기준법 제54조"));
  assert.ok(r.issues.some((i) => i.cite === "근로기준법 제53조"));
});

test("야간 22~06시 근무 시간과 5명 미만 안내", () => {
  const r = checkSchedule({ shifts: [{ day: "월", start: "20:00", end: "04:00", breakMin: 60 }], small: true });
  assert.equal(r.night, 6);
  assert.equal(r.total, 7);
  assert.equal(r.limitOk, true);
  assert.ok(r.issues.some((i) => i.text.includes("5명 미만")));
});
