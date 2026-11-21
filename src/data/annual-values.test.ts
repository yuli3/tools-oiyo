import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { ANNUAL_VALUES, annualAlerts } from "./annual-values.ts";

test("기준값 목록: 파일이 있고 id가 겹치지 않아요", () => {
  assert.equal(new Set(ANNUAL_VALUES.map((v) => v.id)).size, ANNUAL_VALUES.length);
  for (const v of ANNUAL_VALUES) {
    assert.ok(existsSync(v.file), `${v.id}: ${v.file}`);
    assert.ok(v.next.note, v.id);
    if (v.cycle === "sunset") assert.match(v.until ?? "", /^\d{4}-\d{2}-\d{2}$/, v.id);
  }
});

test("기준값 알림: 9월엔 조용하고 10월부터 다음 해 빈칸을 알려요", () => {
  const sep = annualAlerts("2026-09-15", [2026, 2027]).filter((a) => a.level === "warn" && a.id !== "vat-deemed-input");
  assert.deepEqual(sep, []);
  const oct = annualAlerts("2026-10-01", [2026, 2027]);
  assert.ok(oct.some((a) => a.id === "income-tax"));
  assert.ok(!oct.some((a) => a.id === "min-wage"), "확정된 값은 알리지 않아요");
  assert.ok(annualAlerts("2027-01-02", [2026, 2027]).find((a) => a.id === "health-caps")?.level === "warn");
});

test("기준값 알림: 공휴일 표가 다음 해까지 없으면 10월부터 알려요", () => {
  assert.ok(!annualAlerts("2026-11-21", [2026, 2027]).some((a) => a.id === "holidays"));
  assert.ok(annualAlerts("2027-10-01", [2026, 2027]).some((a) => a.id === "holidays"));
});

test("기준값 알림: 한시 규정은 끝나기 6개월 전부터 알려요", () => {
  assert.ok(!annualAlerts("2027-05-31", [2027, 2028]).some((a) => a.id === "acquisition-relief"));
  assert.ok(annualAlerts("2027-07-01", [2027, 2028]).some((a) => a.id === "acquisition-relief"));
});
