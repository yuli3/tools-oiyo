import { test } from "node:test";
import assert from "node:assert/strict";
import { accidentReport, safetyEducation, safetyStaffing, seriousAccident } from "./kr-industrial-safety-2026.ts";

test("중대재해 판정: 사망 1명은 두 법 모두, 6개월 2명은 처벌법만, 3개월 동시 2명은 산안법만", () => {
  const d = seriousAccident({ deaths: 1, headcount: 30, date: "2026-11-02" });
  assert.equal(d.criSerious, true);
  assert.equal(d.oshSerious, true);
  assert.equal(d.actApplies, true);
  assert.ok(d.items.some((i) => i.text.includes("10억 원")));
  const six = seriousAccident({ injured6m: 2, injured3m: 0, headcount: 80 });
  assert.equal(six.criSerious, true);
  const three = seriousAccident({ injured3m: 2, headcount: 80 });
  assert.equal(three.criSerious, false);
  assert.equal(three.oshSerious, true);
  assert.equal(seriousAccident({ illness1y: 3, headcount: 10 }).criSerious, true);
  assert.equal(seriousAccident({ injuredTotal: 10, headcount: 10 }).oshSerious, true);
});

test("중대재해처벌법 적용: 5명 미만 제외, 50명 미만은 2024-01-27 전 사고면 유예", () => {
  assert.equal(seriousAccident({ deaths: 1, headcount: 4 }).actApplies, false);
  assert.equal(seriousAccident({ deaths: 1, headcount: 20, date: "2023-12-01" }).actApplies, false);
  assert.equal(seriousAccident({ deaths: 1, headcount: 60, date: "2023-12-01" }).actApplies, true);
  assert.equal(seriousAccident({ deaths: 1, headcount: 20, date: "2024-01-27" }).actApplies, true);
});

test("보고: 산업재해조사표는 발생일부터 1개월, 휴일이면 다음 날, 늦으면 차수별 과태료", () => {
  const r = accidentReport({ date: "2026-11-10", lostDays3: true, today: "2026-11-21" });
  assert.equal(r.due, "2026-12-10");
  assert.equal(r.dday, 19);
  // 2026-12-27은 일요일이라 28일로
  assert.equal(accidentReport({ date: "2026-11-27", lostDays3: true }).due, "2026-12-28");
  const late = accidentReport({ date: "2026-10-01", deaths: 1, serious: true, reported: "2026-11-20", nth: 2 });
  assert.equal(late.late, true);
  assert.equal(late.fine, 10_000_000);
  assert.ok(late.items.some((i) => i.text.includes("3,000만 원")));
  assert.equal(accidentReport({ date: "2026-11-10" }).must, false);
});

test("교육시간: 사무직 반기 6, 그 밖 12, 채용 8/4/1, 변경 2/1, 관리감독자 16, 50명 미만 도소매·숙박음식 절반", () => {
  const o = safetyEducation({ job: "office", hire: "regular", workers: 10 });
  assert.equal(o.perWorker.periodicHalf, 6);
  assert.equal(o.perWorker.onHire, 8);
  assert.equal(o.yearlyTotal, 120);
  const d = safetyEducation({ job: "other", hire: "daily", construction: true });
  assert.equal(d.perWorker.onHire, 1);
  assert.equal(d.perWorker.change, 1);
  assert.ok(d.items.some((i) => i.text.includes("기초안전보건교육 4시간")));
  assert.equal(safetyEducation({ job: "other", hire: "month" }).perWorker.onHire, 4);
  const h = safetyEducation({ job: "sales", hire: "regular", workers: 4, supervisors: 1, half: true });
  assert.equal(h.perWorker.periodicHalf, 3);
  assert.equal(h.yearlyTotal, 4 * 6 + 8);
});

test("선임: 제조 50명 책임자·안전·보건, 20~49명 담당자, IT는 300명 책임자만, 건설은 공사금액", () => {
  const m = safetyStaffing({ sector: "mfg-heavy", headcount: 120 });
  assert.deepEqual([m.chief, m.safety, m.health, m.officer], [true, 1, 1, false]);
  assert.equal(safetyStaffing({ sector: "mfg-food", headcount: 30 }).officer, true);
  assert.equal(safetyStaffing({ sector: "mfg-food", headcount: 1200 }).health, 2);
  assert.equal(safetyStaffing({ sector: "mfg-heavy", headcount: 1200 }).health, 2);
  const r = safetyStaffing({ sector: "retail", headcount: 80 });
  assert.deepEqual([r.chief, r.safety, r.health], [false, 1, 1]);
  const it = safetyStaffing({ sector: "it", headcount: 400 });
  assert.deepEqual([it.chief, it.safety, it.health], [true, 0, 0]);
  const c = safetyStaffing({ sector: "construction", amount: 100_000_000_000 });
  assert.deepEqual([c.chief, c.safety, c.health, c.dedicated], [true, 2, 1, true]);
  assert.equal(safetyStaffing({ sector: "construction", amount: 60_000_000_000 }).health, 0);
  assert.equal(safetyStaffing({ sector: "construction", amount: 200_000_000_000 }).safety, 3);
  assert.equal(safetyStaffing({ sector: "construction", amount: 230_000_000_000 }).health, 2);
  assert.equal(safetyStaffing({ sector: "construction", amount: 4_000_000_000 }).safety, 0);
  assert.equal(safetyStaffing({ sector: "construction", amount: 13_000_000_000, civil: true }).dedicated, false);
});
