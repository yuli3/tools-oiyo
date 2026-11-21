import { test } from "node:test";
import assert from "node:assert/strict";
import { kstIsoDate, localIsoDate, localIsoDateOffset } from "./local-date.ts";

test("kstIsoDate: 한국 오전 8시(UTC 전날 23시)도 한국 날짜로", () => {
  assert.equal(kstIsoDate(new Date("2026-11-20T23:30:00Z")), "2026-11-21");
  assert.equal(kstIsoDate(new Date("2026-11-21T14:59:00Z")), "2026-11-21");
  assert.equal(kstIsoDate(new Date("2026-11-21T15:00:00Z")), "2026-11-22");
});

test("localIsoDate: 로컬 자정 직후도 그날 날짜", () => {
  const d = new Date(2026, 0, 1, 0, 5);
  assert.equal(localIsoDate(d), "2026-01-01");
  assert.equal(localIsoDateOffset(-14, new Date(2026, 0, 10, 0, 5)), "2025-12-27");
  assert.equal(localIsoDateOffset(1, new Date(2026, 1, 28, 23, 59)), "2026-03-01");
});
