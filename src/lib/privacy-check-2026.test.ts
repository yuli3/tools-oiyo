import { test } from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_POLICY, breachClock, checkPolicy, parseAt } from "./privacy-check-2026.ts";

test("유출 72시간: 시각까지 계산하고 휴일에도 미루지 않아요", () => {
  const r = breachClock({ knownAt: "2026-12-24T15:30", affected: 120 });
  assert.equal(r.deadline, "2026-12-27 15:30");
  assert.equal(r.report, false);
  assert.equal(r.noticeItems.length, 5);
  assert.equal(r.steps.length, 4);
});

test("신고 기준: 1천 명, 민감·고유식별정보, 해킹", () => {
  assert.deepEqual(breachClock({ knownAt: "2026-11-20", affected: 1000 }).reportReasons, ["1천 명 이상(1,000명)"]);
  assert.equal(breachClock({ knownAt: "2026-11-20", affected: 999 }).report, false);
  assert.equal(breachClock({ knownAt: "2026-11-20", affected: 3, sensitive: true }).report, true);
  const h = breachClock({ knownAt: "2026-11-20", affected: 3, hacking: true });
  assert.equal(h.report, true);
  assert.equal(h.steps.length, 5);
  assert.equal(h.deadline, "2026-11-23 00:00");
});

test("연락처를 모르면 홈페이지 30일 게시", () => {
  const r = breachClock({ knownAt: "2026-11-20T09:00", contactUnknown: true });
  assert.equal(r.postDays, 30);
  assert.match(r.steps[1].what, /30일/);
});

test("시각 읽기", () => {
  assert.equal(parseAt("2026-02-30"), null);
  assert.equal(parseAt("bad"), null);
  assert.equal(parseAt("2026-11-20 08:05")?.getHours(), 8);
});

test("처리방침 예시: 빠진 항목을 찾아요", () => {
  const r = checkPolicy(SAMPLE_POLICY, { website: true, outsource: true });
  assert.deepEqual(r.missing.map((m) => m.id), ["destroy", "cookies", "safety", "remedy"]);
  assert.equal(r.required, 11);
  assert.equal(r.found, 7);
  assert.equal(r.contactFound, false);
  assert.equal(r.effectiveDate, "2026-01-01");
  assert.ok(r.notes.some((n) => n.includes("연락처")));
});

test("상황에 따라 필요한 항목만 셈", () => {
  assert.equal(checkPolicy(SAMPLE_POLICY).required, 9);
  const r = checkPolicy(SAMPLE_POLICY, { thirdParty: true, overseas: true });
  assert.ok(r.missing.some((m) => m.id === "thirdParty"));
  assert.ok(r.missing.some((m) => m.id === "overseas"));
  assert.ok(r.notes.some((n) => n.includes("처리 위탁")));
});

test("다 갖춘 방침", () => {
  const full = `${SAMPLE_POLICY}\n파기: 기간이 끝나면 지체 없이 파기합니다.\n쿠키를 사용하며 브라우저 설정으로 거부할 수 있습니다.\n안전성 확보 조치로 암호화와 접근 통제를 합니다.\n권익침해는 개인정보 분쟁조정위원회, 개인정보침해신고센터(118)에 문의하세요.\n연락처 02-1234-5678`;
  const r = checkPolicy(full, { website: true, outsource: true });
  assert.equal(r.missing.length, 0);
  assert.equal(r.contactFound, true);
});
