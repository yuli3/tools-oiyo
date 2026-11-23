import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync } from "node:fs";
import { KR_DESKS, findDesks } from "./kr-desks-2026.ts";

const exists = (href: string) => {
  const [, loc, slug] = href.split("/");
  return existsSync(new URL(`../pages/${loc}/${slug}.astro`, import.meta.url)) || existsSync(new URL(`../pages/[locale]/${slug}.astro`, import.meta.url));
};

test("직업 7곳, 인생 사건 8가지", () => {
  assert.equal(KR_DESKS.filter((d) => d.kind === "job").length, 7);
  assert.equal(KR_DESKS.filter((d) => d.kind === "event").length, 8);
  assert.equal(new Set(KR_DESKS.map((d) => d.id)).size, KR_DESKS.length);
});

test("모든 도구 링크는 실제 페이지예요", () => {
  for (const d of KR_DESKS) for (const t of d.tools) assert.ok(exists(t.href), `${d.id} ${t.href}`);
});

test("모든 창구에 할 일과 무료 창구가 있어요", () => {
  for (const d of KR_DESKS) assert.ok(d.steps.length >= 3 && d.help.length >= 1, d.id);
});

test("질문으로 창구를 찾아요", () => {
  assert.equal(findDesks("유튜브 애드센스 수익 세금")[0].id, "creator");
  assert.equal(findDesks("배민 라이더인데 다쳤어요")[0].id, "rider");
  assert.equal(findDesks("아버지가 돌아가셔서 상속포기", "event")[0].id, "death");
  assert.equal(findDesks("전혀 관계없는 말").length, 0);
});

test("새 창구도 질문으로 찾아요", () => {
  assert.equal(findDesks("학원 강사인데 3.3% 떼여요", "job")[0]?.id, "tutor");
  assert.equal(findDesks("집 사려는데 취득세랑 등기", "event")[0]?.id, "homebuy");
  assert.equal(findDesks("교통사고 과실 합의", "event")[0]?.id, "accident");
  assert.equal(findDesks("세입자한테 월세 받는 집주인", "job")[0]?.id, "landlord");
});
