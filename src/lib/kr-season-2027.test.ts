import { test } from "node:test";
import assert from "node:assert/strict";
import { seasonPlan } from "./kr-season-2027.ts";

test("deadlines move past weekends and holidays (국세기본법 제5조)", () => {
  const corp = seasonPlan("corp", "2026-11-21");
  const by = (id: string) => corp.find((r) => r.id === id)!;
  assert.equal(by("wht-dec").due, "2027-01-11"); // 1/10 is a Sunday
  assert.equal(by("vat-2").due, "2027-01-25");
  assert.equal(by("pay-stmt-feb").due, "2027-03-02"); // 2/28 Sun, 3/1 holiday
  assert.equal(by("pay-stmt-feb").shifted, true);
  assert.equal(by("corp-tax").due, "2027-03-31");
  assert.equal(by("wht-dec").daysLeft, 51);
});

test("roles get their own tasks, dated ones first", () => {
  const emp = seasonPlan("employee", "2026-11-21");
  assert.ok(emp.every((r) => r.due === null));
  const exempt = seasonPlan("exempt", "2026-11-21");
  assert.deepEqual(exempt.map((r) => r.id), ["exempt-report"]);
  assert.equal(exempt[0].due, "2027-02-10");
});
