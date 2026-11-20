import { test } from "node:test";
import assert from "node:assert/strict";
import { APPEAL_RULES, appealDue, appealsFrom, periodText } from "./kr-appeal-deadlines-2026.ts";

test("여러 분야의 불복·이의·청구 기한을 모아요", () => {
  const areas = new Set(APPEAL_RULES.map((a) => a.domain));
  for (const d of ["tax", "customs", "ip", "appraisal", "admin", "labor", "welfare", "health", "family"]) assert.ok(areas.has(d as never), d);
  assert.ok(APPEAL_RULES.every((a) => a.cite && a.period));
  assert.equal(new Set(APPEAL_RULES.map((a) => a.key)).size, APPEAL_RULES.length);
});

test("과세전적부심사 30일: 마지막 날이 일요일이면 월요일", () => {
  const r = appealDue("tax-dispute:pre-review", "2026-11-20", "2026-11-20")!;
  assert.equal(r.nominal, "2026-12-20");
  assert.equal(r.due, "2026-12-21");
  assert.equal(r.shifted, true);
  assert.equal(r.daysLeft, 31);
});

test("수용 재결 이의 30일, 특허 거절 불복 3개월, 같은 날 통지면 빠른 순", () => {
  assert.equal(appealDue("appr-expropriation:objection", "2026-03-02")!.due, "2026-04-01");
  assert.equal(appealDue("ip-rejected:appeal", "2026-03-02")!.due, "2026-06-02");
  const all = appealsFrom("2026-03-02");
  for (let i = 1; i < all.length; i++) assert.ok(all[i - 1].due <= all[i].due);
  assert.equal(periodText({ months: 3 }), "3개월");
});
