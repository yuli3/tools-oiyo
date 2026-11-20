import test from "node:test";
import assert from "node:assert/strict";
import { MUST_ITEMS, filterItems, monthlyBackoffice, taxCalendar, upcoming } from "./biz-checklist.ts";

test("체크리스트: id 중복 없음, 법·세무 항목은 근거가 있음", () => {
  const ids = new Set(MUST_ITEMS.map((i) => i.id));
  assert.equal(ids.size, MUST_ITEMS.length);
  for (const i of MUST_ITEMS) if (i.area !== "strategy" && i.area !== "money") assert.ok(i.basis || i.id === "cofounder-agreement" || i.id === "joint-guarantee" || i.id === "miss-deadline-sunday" || i.id === "advisor-early", i.id);
  assert.ok(filterItems({ roles: ["bookkeeper"], stages: ["hire"] }).every((i) => i.roles.includes("bookkeeper") && i.stages.includes("hire")));
  assert.ok(MUST_ITEMS.some((i) => i.kind === "dont") && MUST_ITEMS.some((i) => i.kind === "do"));
});

test("2026 법인 일반과세 직원 있음: 주말·공휴일은 다음 영업일", () => {
  const { events, holidaysKnown } = taxCalendar(2026, { entity: "corp", vat: "general", employer: true });
  assert.ok(holidaysKnown);
  const find = (t: string) => events.find((e) => e.title.includes(t))!;
  // 2026-01-25는 일요일 → 1/26
  assert.equal(find("2기 부가세 확정").due, "2026-01-26");
  assert.equal(find("법인세 신고·납부").due, "2026-03-31");
  // 2026-04-25 토요일 → 4/27
  assert.equal(find("1기 부가세 예정신고").due, "2026-04-27");
  assert.equal(find("법인세 중간예납").due, "2026-08-31");
  assert.equal(events.filter((e) => e.title.includes("원천세 신고·납부")).length, 12);
  assert.ok(events.some((e) => e.title === "상반기 근로소득 간이지급명세서"));
  for (let i = 1; i < events.length; i++) assert.ok(events[i - 1].due <= events[i].due);
});

test("개인 간이·성실신고, 2027 근로 간이지급명세서 매월", () => {
  const { events } = taxCalendar(2026, { entity: "indiv", vat: "simple", employer: false, sincere: true });
  // 2026-06-30 화요일
  assert.equal(events.find((e) => e.title.includes("종합소득세·개인"))!.due, "2026-06-30");
  assert.ok(!events.some((e) => e.title.includes("원천세")));
  const y27 = taxCalendar(2027, { entity: "corp", vat: "general", employer: true, halfYearWithholding: true }).events;
  assert.equal(y27.filter((e) => e.title.includes("원천세 신고·납부(반기)")).length, 2);
  assert.ok(y27.find((e) => e.title.startsWith("1월 지급분 사업·일용"))!.title.includes("근로소득 포함"));
  assert.ok(!y27.find((e) => e.title.startsWith("12월 지급분 사업·일용"))!.title.includes("근로소득 포함"));
  assert.ok(!y27.some((e) => e.title === "상반기 근로소득 간이지급명세서"));
  assert.equal(upcoming(y27, "2027-12-01", 2).length, 2);
});

test("이번 달 백오피스: 정기 기한 + 입사·퇴사 기한", () => {
  const r = monthlyBackoffice("2026-12", { entity: "indiv", vat: "general", employer: true, payday: 25 }, { hires: ["2026-11-17"], leaves: ["2026-12-04"] }, "2026-11-20");
  assert.deepEqual(r.tasks.map((t) => t.due), ["2026-12-10", "2026-12-10", "2026-12-10", "2026-12-15", "2026-12-18", "2026-12-25", "2026-12-31", "2026-12-31"]);
  assert.ok(r.tasks.some((t) => t.title.includes("4대보험 취득신고")));
  assert.equal(r.tasks[0].daysLeft, 20);
  assert.deepEqual(r.later.map((t) => t.due), ["2027-01-15"]);
  assert.ok(r.routine.some((x) => x.tool === "/ko/bookkeeping-data-bridge/"));
});

test("이번 달 백오피스: 휴일로 밀린 기한과 직원 없는 간이과세자", () => {
  const j = monthlyBackoffice("2027-01", { entity: "corp", vat: "general", employer: true });
  assert.ok(j.tasks.some((t) => t.title.includes("최저임금")));
  assert.ok(j.tasks.some((t) => t.due === "2027-02-01" && t.title.includes("간이지급명세서")));
  const s = monthlyBackoffice("2026-05", { entity: "indiv", vat: "simple", employer: false });
  assert.deepEqual(s.tasks.map((t) => t.title), ["2025년 종합소득세·개인지방소득세 신고·납부"]);
  assert.equal(s.tasks[0].due, "2026-06-01");
  assert.throws(() => monthlyBackoffice("2026-5", { entity: "indiv", vat: "simple", employer: false }));
});
