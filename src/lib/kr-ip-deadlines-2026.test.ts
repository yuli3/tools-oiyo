import { test } from "node:test";
import assert from "node:assert/strict";
import { ipDeadlines } from "./kr-ip-deadlines-2026.ts";

const get = (r: ReturnType<typeof ipDeadlines>, id: string) => r.find((x) => x.id === id);

test("특허: 공개 2026-03-02, 출원 2026-05-15 → 공지예외·우선권·PCT·심사청구", () => {
  const r = ipDeadlines({ kind: "patent", disclosed: "2026-03-02", filed: "2026-05-15" }, "2026-11-20");
  assert.equal(get(r, "grace")!.due, "2027-03-02");
  assert.equal(get(r, "paris")!.due, "2027-05-17"); // 2027-05-15 토요일 → 월요일
  assert.equal(get(r, "pct-national")!.due, "2028-12-15");
  assert.equal(get(r, "exam")!.due, "2029-05-15");
});

test("상표: 우선권 6개월, 등록 2020-03-10 → 2030 만료와 갱신 기간", () => {
  const r = ipDeadlines({ kind: "trademark", filed: "2026-09-01", registered: "2020-03-10" }, "2026-11-20");
  assert.equal(get(r, "paris")!.due, "2027-03-02");
  assert.equal(get(r, "term")!.due, "2030-03-10");
  assert.equal(get(r, "renew-open")!.due, "2029-03-10");
  assert.equal(get(r, "grace"), undefined);
});

test("특허 등록 2022-06-01: 다음 연차료(5년차) 2026-06-01은 지났고 2027-06-01(6년차)", () => {
  const r = ipDeadlines({ kind: "patent", filed: "2020-01-10", registered: "2022-06-01" }, "2026-11-20");
  const a = get(r, "annuity")!;
  assert.equal(a.label, "6년차 연차료 납부 마감");
  assert.equal(a.due, "2027-06-01");
  assert.equal(get(r, "term")!.due, "2040-01-10");
});

test("거절결정 등본 2026-11-20 → 3개월 뒤, 특허결정 → 등록료 3개월·추가 6개월", () => {
  const r = ipDeadlines({ kind: "patent", rejectionServed: "2026-11-20", decisionServed: "2026-11-20" }, "2026-11-20");
  assert.equal(get(r, "rejection")!.due, "2027-02-22");
  assert.equal(get(r, "reg-fee-late")!.due, "2027-08-20");
});
