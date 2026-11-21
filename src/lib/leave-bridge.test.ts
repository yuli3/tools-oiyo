import { test } from "node:test";
import assert from "node:assert/strict";
import { bestByLeave, bridgeWindows, holidaySet, isOff, topEfficient } from "./leave-bridge.ts";

test("2027 추석: 연차 2일(9/13, 9/17)로 9/11~9/19 9일", () => {
  const r = bestByLeave(2027, 2);
  assert.equal(r[1].best?.start, "2027-09-11");
  assert.equal(r[1].best?.end, "2027-09-19");
  assert.equal(r[1].best?.days, 9);
  assert.deepEqual(r[1].best?.leave, ["2027-09-13", "2027-09-17"]);
});

test("2027 설: 2/5(금) 하루로 2/5~2/9 5일", () => {
  const ws = topEfficient(2027, 1, 20);
  const seol = ws.find((w) => w.start === "2027-02-05");
  assert.ok(seol);
  assert.equal(seol.days, 5);
  assert.deepEqual(seol.leave, ["2027-02-05"]);
});

test("대체공휴일이 쉬는 날로 잡혀요", () => {
  const h = holidaySet(2027);
  assert.equal(isOff("2027-10-04", h), true); // 개천절 대체
  assert.equal(isOff("2027-12-27", h), true); // 성탄절 대체
  assert.equal(isOff("2027-10-05", h), false);
});

test("회사 휴무일을 더하면 더 길어지고, 토요일 근무면 짧아져요", () => {
  const base = bestByLeave(2027, 1)[0].best!.days;
  const more = bestByLeave(2027, 1, { extra: ["2027-09-17"] })[0].best!.days;
  assert.ok(more > base);
  const sat = bestByLeave(2027, 1, { saturdayWork: true })[0].best!.days;
  assert.ok(sat < base);
});

test("구간은 연차를 1일 이상 쓰고 쉬는 날로 끝나요", () => {
  for (const w of bridgeWindows(2027, 3)) {
    assert.ok(w.leave.length >= 1 && w.leave.length <= 3);
    assert.ok(w.days >= 3);
  }
});
