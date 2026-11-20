import { test } from "node:test";
import assert from "node:assert/strict";
import { apartmentSchedule, franchiseCheck, mandatoryManagement } from "./kr-franchise-housing-2026.ts";

const by = (r: { id: string }[], id: string) => r.find((x) => x.id === id) as { id: string; date?: string; tone: string } | undefined;

test("정보공개서 11-01 → 11-16부터 계약, 그 전에 계약하면 경고, 반환 요구 4개월", () => {
  const r = franchiseCheck({ infoGiven: "2026-11-01", signed: "2026-11-10" });
  assert.equal(by(r, "cooling")!.date, "2026-11-16");
  assert.ok(by(r, "cooling-breach"));
  assert.equal(by(r, "refund")!.date, "2027-03-10");
  assert.equal(by(franchiseCheck({ infoGiven: "2026-11-01", advised: true }), "cooling")!.date, "2026-11-09");
});

test("갱신 요구 180~90일 전, 갱신요구권 10년", () => {
  const r = franchiseCheck({ currentEnd: "2027-06-30", firstStart: "2019-07-01" });
  assert.equal(by(r, "renew-open")!.date, "2027-01-01");
  assert.equal(by(r, "renew-close")!.date, "2027-04-01");
  assert.equal(by(r, "renew-right")!.date, "2029-07-01");
});

test("의무관리대상: 300세대, 150세대+승강기", () => {
  assert.equal(mandatoryManagement({ households: 320 }).mandatory, true);
  assert.equal(mandatoryManagement({ households: 160, elevator: true }).mandatory, true);
  assert.equal(mandatoryManagement({ households: 160 }).mandatory, false);
});

test("하자담보: 사용검사 2024-03-15 → 2·3·5·10년, 장기수선충당금 2025-03부터", () => {
  const r = apartmentSchedule({ households: 500, useApproval: "2024-03-15", handover: "2024-04-01" }, "2026-11-20");
  assert.equal(by(r.items, "defect-common-2")!.date, "2026-03-15");
  assert.equal(by(r.items, "defect-common-10")!.date, "2034-03-15");
  assert.equal(by(r.items, "repair-fund")!.date, "2025-03-01");
  assert.equal(by(r.items, "defect-unit-3")!.date, "2027-04-01");
  assert.equal(by(r.items, "repair-plan")!.date, "2027-03-15");
});
