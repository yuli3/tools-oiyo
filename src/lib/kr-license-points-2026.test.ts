import { test } from "node:test";
import assert from "node:assert/strict";
import { accidentPoints, licenseStatus, suspensionToSurcharge, violationPoints } from "./kr-license-points-2026.ts";

test("어린이보호구역은 2배, 최고 120점", () => {
  assert.equal(violationPoints("speed20", true), 30);
  assert.equal(violationPoints("speed60", true), 120);
  assert.equal(violationPoints("drunk", true), 100);
  assert.equal(accidentPoints({ serious: 1, minor: 2 }), 25);
  assert.equal(accidentPoints({ serious: 1, minor: 2, bothFault: true }), 12);
});

test("40점 미만은 1년 지나면 소멸, 40점 넘으면 정지(교육 20일 감경)", () => {
  const a = licenseStatus([{ date: "2025-03-01", points: 30 }], "2026-03-02");
  assert.equal(a.pending, 0);
  const b = licenseStatus([{ date: "2026-01-10", points: 30 }], "2026-11-20");
  assert.equal(b.pending, 30);
  assert.equal(b.expiresOn, "2027-01-10");
  assert.equal(b.toSuspension, 10);
  const c = licenseStatus([{ date: "2026-01-10", points: 30 }, { date: "2026-11-01", points: 15 }], "2026-11-20", { education: true });
  assert.deepEqual(c.suspension, { from: "2026-11-01", points: 45, days: 25 });
});

test("1년 121점 이상이면 취소", () => {
  const r = licenseStatus([{ date: "2026-02-01", points: 100 }, { date: "2026-09-01", points: 30 }], "2026-11-20");
  assert.equal(r.revoked, true);
  assert.equal(r.revokeRule, "1년 121점 이상");
});

test("영업정지 1개월 × 1일 100만 원 = 3,000만 원, 한도 10억", () => {
  assert.equal(suspensionToSurcharge({ months: 1, perDay: 1_000_000 }).amount, 30_000_000);
  assert.equal(suspensionToSurcharge({ months: 3, perDay: 13_810_000 }).capped, true);
});
