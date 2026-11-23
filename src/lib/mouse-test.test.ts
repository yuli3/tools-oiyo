import { test } from "node:test";
import assert from "node:assert/strict";
import { buttonKey, cps, emptyStats, press, release } from "./mouse-test.ts";

test("뗀 뒤 80ms 안에 다시 눌리면 채터링으로 센다", () => {
  let s = press(emptyStats(), 0);
  s = release(s, 90);
  s = press(s, 120); // 30ms
  assert.equal(s.presses, 2);
  assert.equal(s.chatter, 1);
  assert.equal(s.minGap, 30);
  s = release(s, 200);
  s = press(s, 400); // 200ms, 사람이 누른 간격
  assert.equal(s.chatter, 1);
  assert.equal(s.minGap, 30);
});

test("첫 누름과 정확히 80ms는 채터링이 아니다", () => {
  let s = press(emptyStats(), 5);
  assert.equal(s.chatter, 0);
  s = press(release(s, 10), 90);
  assert.equal(s.chatter, 0);
});

test("CPS는 최근 1초 안의 누름만 센다", () => {
  assert.equal(cps([0, 100, 500, 900, 1500], 1500), 3);
  assert.equal(cps([], 10), 0);
});

test("버튼 번호를 이름으로 바꾼다", () => {
  assert.equal(buttonKey(0), "left");
  assert.equal(buttonKey(4), "forward");
  assert.equal(buttonKey(7), null);
});
