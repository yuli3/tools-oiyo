import { test } from "node:test";
import assert from "node:assert/strict";
import { afterDeathTimeline, monthEndPlusDays, monthEndPlusMonths, plusMonths, rollBusiness } from "./after-death-timeline-2026.ts";

test("기간 계산: 첫날 빼기, 말일 기준", () => {
  assert.equal(plusMonths("2026-03-15", 1), "2026-04-15");
  assert.equal(plusMonths("2026-01-31", 1), "2026-02-28");
  assert.equal(monthEndPlusMonths("2026-03-15", 6), "2026-09-30");
  assert.equal(monthEndPlusMonths("2026-03-15", 12), "2027-03-31");
  assert.equal(monthEndPlusDays("2026-03-15", 25), "2026-04-25");
});

test("마지막 날이 주말이면 다음 영업일", () => {
  // 2026-04-25 토요일 → 2026-04-27 월요일
  assert.equal(rollBusiness("2026-04-25"), "2026-04-27");
  assert.equal(rollBusiness("2026-04-24"), "2026-04-24");
});

test("기본: 사망신고 → 상속포기 → 상속세 → 안심상속 순서", () => {
  const r = afterDeathTimeline({ deathDate: "2026-03-10" });
  assert.deepEqual(r.tasks.map((t) => t.id), ["death-report", "renounce", "inheritance-tax", "one-stop"]);
  const by = Object.fromEntries(r.tasks.map((t) => [t.id, t.due]));
  assert.equal(by["death-report"], "2026-04-10");
  assert.equal(by.renounce, "2026-06-10");
  assert.equal(by["inheritance-tax"], "2026-09-30");
  assert.equal(by["one-stop"], "2027-03-31");
});

test("안 날이 늦으면 사망신고·상속포기만 늦춰져요", () => {
  const r = afterDeathTimeline({ deathDate: "2026-03-10", knownDate: "2026-05-04" });
  const by = Object.fromEntries(r.tasks.map((t) => [t.id, t.due]));
  assert.equal(by["death-report"], "2026-06-04");
  assert.equal(by.renounce, "2026-08-04");
  assert.equal(by["inheritance-tax"], "2026-09-30");
  // 사망일보다 이른 안 날은 무시
  assert.equal(afterDeathTimeline({ deathDate: "2026-03-10", knownDate: "2026-01-01" }).knownDate, "2026-03-10");
});

test("상황 모두: 임금 14일, 임차 1개월, 폐업 25일, 시효 3·5년", () => {
  const r = afterDeathTimeline({ deathDate: "2026-03-10", employed: true, renting: true, business: true, otherIncome: true, realEstate: true, car: true, insurance: true, workAccident: true, pension: true, debts: true });
  const by = Object.fromEntries(r.tasks.map((t) => [t.id, t]));
  assert.equal(by.wages.due, "2026-03-24");
  assert.equal(by.lease.due, "2026-04-10");
  assert.equal(by.business.due, "2026-04-27"); // 4/25 토
  assert.equal(by["income-tax"].due, "2026-09-30");
  assert.equal(by.realty.due, "2026-09-30");
  assert.equal(by.car.due, "2026-09-30");
  assert.equal(by.insurance.due, "2029-03-12"); // 3/10 토 → 월
  assert.equal(by.pension.due, "2031-03-10");
  assert.equal(by.wages.phase, "week");
  assert.equal(by.pension.phase, "later");
  assert.match(by.renounce.label, /빚/);
  assert.equal(r.tasks.length, 13);
  for (let i = 1; i < r.tasks.length; i++) assert.ok(r.tasks[i - 1].due <= r.tasks[i].due);
});

test("해외 주소면 상속세·취득세 9개월", () => {
  const r = afterDeathTimeline({ deathDate: "2026-03-10", abroad: true, realEstate: true });
  const by = Object.fromEntries(r.tasks.map((t) => [t.id, t.due]));
  assert.equal(by["inheritance-tax"], "2026-12-31");
  assert.equal(by.realty, "2026-12-31");
});

test("오늘 기준 지난 것과 다음 것", () => {
  const r = afterDeathTimeline({ deathDate: "2026-03-10" }, "2026-05-01");
  assert.deepEqual(r.overdue.map((t) => t.id), ["death-report"]);
  assert.equal(r.next[0].id, "renounce");
});

test("잘못된 날짜는 기준일로", () => {
  const r = afterDeathTimeline({ deathDate: "bad" });
  assert.equal(r.deathDate, "2026-11-20");
  assert.ok(r.tasks.every((t) => /^\d{4}-\d{2}-\d{2}$/.test(t.due)));
});
