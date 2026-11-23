import assert from "node:assert/strict";
import { test } from "node:test";
import { buildConsultMemo, MEMO_EXPERTS } from "./consult-memo-2026.ts";

test("넣은 사실만으로 메모를 만들고 경과를 날짜순으로 정리해요", () => {
  const r = buildConsultMemo({ expert: "labor", situation: "월급 두 달 치를 못 받았어요", amount: 6_000_000, events: [{ date: "2026-10-31", what: "퇴사" }, { date: "2026-09-25", what: "9월 월급 미지급" }, { what: "사장님과 통화" }], questions: ["대지급금 받을 수 있나요"], have: [] });
  assert.equal(r.expert, "labor");
  assert.ok(r.text.indexOf("2026-09-25") < r.text.indexOf("2026-10-31"));
  assert.ok(r.text.includes("날짜 미상 사장님과 통화"));
  assert.ok(r.text.includes("6,000,000원"));
  assert.ok(r.missing.length > 0);
});

test("분야를 고르지 않으면 요약으로 찾아요, 모르면 미정", () => {
  assert.equal(buildConsultMemo({ situation: "종합소득세 신고를 처음 해요" }).expert, "tax");
  assert.equal(buildConsultMemo({ situation: "아무 상관 없는 말" }).expert, null);
  assert.throws(() => buildConsultMemo({ situation: " " }));
});

test("가진 서류를 고르면 빠진 서류만 남아요", () => {
  const e = MEMO_EXPERTS.find((x) => x.id === "tax")!;
  const r = buildConsultMemo({ expert: "tax", situation: "가산세 고지서", have: e.bring.slice(0, 2) });
  assert.equal(r.missing.length, e.bring.length - 2);
});
