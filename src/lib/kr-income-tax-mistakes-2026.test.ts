import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { ALWAYS, MISTAKE_QUESTIONS, checkMistakes, isMistakeAnswer } from "./kr-income-tax-mistakes-2026.ts";

test("아무 답 없으면 패턴 없음, 전부 미확인", () => {
  const r = checkMistakes({});
  assert.equal(r.hits.length, 0);
  assert.equal(r.unknown.length, MISTAKE_QUESTIONS.length);
  assert.match(r.memo, /미확인/);
});

test("예면 걸리고, 단순경비율은 '아니요'일 때 걸려요", () => {
  const r = checkMistakes({ wagePlus: "yes", dependentShared: "yes", rateChecked: "no", noBooks: "yes", financialOver2000: "no" });
  assert.deepEqual(r.hits.map((h) => h.id), ["wagePlus", "dependentShared", "noBooks", "rateChecked"]);
  assert.ok(r.hits.every((h) => /제\d+조/.test(h.cite)));
  assert.equal(checkMistakes({ rateChecked: "yes" }).hits.length, 0);
});

test("장부를 쓰면 단순경비율 질문은 미확인으로 남기지 않아요", () => {
  const r = checkMistakes({ noBooks: "no" });
  assert.ok(!r.unknown.some((u) => u.id === "rateChecked"));
  assert.equal(r.answered, MISTAKE_QUESTIONS.length - r.unknown.length);
});

test("법에 적힌 기준 금액만 써요", () => {
  const text = JSON.stringify([MISTAKE_QUESTIONS, checkMistakes(Object.fromEntries(MISTAKE_QUESTIONS.map((q) => [q.id, q.id === "rateChecked" ? "no" : "yes"]))).hits, ALWAYS]);
  const amounts = new Set(text.match(/[\d,]+만원/g));
  for (const a of amounts) assert.ok(["300만원", "1,500만원", "100만원", "500만원", "4,800만원"].includes(a), a);
});

test("연결한 도구 페이지가 있어요", () => {
  const all = checkMistakes(Object.fromEntries(MISTAKE_QUESTIONS.map((q) => [q.id, q.id === "rateChecked" ? "no" : "yes"])));
  assert.equal(all.hits.length, MISTAKE_QUESTIONS.length);
  for (const h of all.hits) for (const t of h.tools ?? []) {
    const slug = t.href.replace(/^\/ko\//, "").replace(/\/$/, "");
    assert.ok(existsSync(`src/pages/ko/${slug}.astro`) || existsSync(`src/pages/[locale]/${slug}.astro`), t.href);
  }
  assert.ok(existsSync("src/pages/ko/income-tax-filing-mistake-check.astro"));
});

test("답 값 검사", () => {
  assert.ok(isMistakeAnswer("yes") && isMistakeAnswer("unknown"));
  assert.ok(!isMistakeAnswer("maybe"));
});
