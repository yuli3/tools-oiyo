import { test } from "node:test";
import assert from "node:assert/strict";
import { EASY_LABEL, EASY_WORDS, koDate, splitSentences, toEasyRead } from "./easy-read-2026.ts";

test("koDate: ISO 날짜를 한국어로", () => {
  assert.equal(koDate("2026-12-01까지"), "2026년 12월 1일까지");
  assert.equal(koDate("날짜 없음"), "날짜 없음");
});

test("splitSentences: 문장마다 나누고 1.5는 그대로", () => {
  assert.deepEqual(splitSentences("먼저 내세요. 이율은 1.5%예요! 끝?"), ["먼저 내세요.", "이율은 1.5%예요!", "끝?"]);
});

test("조문 괄호는 빼서 근거로 모아요", () => {
  const r = toEasyRead([{ kind: "todo", text: "3년 안에 청구하세요 (근로기준법 제49조). 증거를 모으세요 (민법 제162조, 근로기준법 제49조)." }], { words: false });
  assert.deepEqual(r.lines.map((l) => l.text), ["3년 안에 청구하세요.", "증거를 모으세요."]);
  assert.deepEqual(r.cites, ["근로기준법 제49조", "민법 제162조"]);
  const r2 = toEasyRead([{ kind: "todo", text: "알려요 (주택임대차보호법 제6조, 제6조의2)." }]);
  assert.deepEqual(r2.cites, ["주택임대차보호법 제6조", "주택임대차보호법 제6조의2"]);
});

test("급한 것 먼저, 어려운 말은 처음 한 번만 풀이", () => {
  const r = toEasyRead([
    { kind: "doc", text: "확정일자 받은 계약서를 챙기세요." },
    { kind: "warn", text: "확정일자가 없으면 순서가 밀려요." },
    { kind: "date", text: "2026-12-01까지 신청하세요." },
  ]);
  assert.deepEqual(r.lines.map((l) => l.kind), ["warn", "word", "date", "doc"]);
  assert.equal(r.lines[1].text, `확정일자: ${EASY_WORDS["확정일자"]}`);
  assert.equal(r.lines[2].text, "2026년 12월 1일까지 신청하세요.");
});

test("keepOrder면 원래 순서 그대로", () => {
  const r = toEasyRead([{ kind: "call", text: "가." }, { kind: "warn", text: "나." }], { keepOrder: true });
  assert.deepEqual(r.lines.map((l) => l.text), ["가.", "나."]);
});

test("7줄까지 보이고 나머지는 더 보기, 풀이 줄은 붙어 다녀요", () => {
  const items = Array.from({ length: 9 }, (_, i) => ({ kind: "todo" as const, text: i === 6 ? "체불 금액을 적으세요." : `할 일 ${i + 1}번이에요.` }));
  const r = toEasyRead(items);
  assert.equal(r.lines.filter((l) => l.kind !== "word").length, 7);
  assert.equal(r.lines.at(-1)?.kind, "word");
  assert.equal(r.more.length, 2);
});

test("같은 문장은 한 번만, 다른 언어는 풀이·날짜 바꿈 없음", () => {
  const r = toEasyRead([{ kind: "todo", text: "File by 2026-12-01. File by 2026-12-01." }], { locale: "en" });
  assert.deepEqual(r.lines.map((l) => l.text), ["File by 2026-12-01."]);
  for (const k of ["ko", "en", "ja", "cn", "fr", "es"]) assert.ok(EASY_LABEL[k].open);
});

test("풀이는 한 줄 해요체", () => {
  for (const [w, v] of Object.entries(EASY_WORDS)) {
    assert.ok(!v.includes("\n"), w);
    assert.match(v, /요\.$/, w);
  }
});
