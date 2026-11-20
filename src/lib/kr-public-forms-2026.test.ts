import { test } from "node:test";
import assert from "node:assert/strict";
import { PORTALS, TOPIC_FORMS, formsFor } from "./kr-public-forms-2026.ts";
import { TOPICS, intake } from "./kr-expert-guide-2026.ts";

test("서식 바로가기: 모든 주제에 항목이 있고, 없는 주제 id는 없어요", () => {
  const ids = new Set(TOPICS.map((t) => t.id));
  for (const t of TOPICS) assert.ok(t.id in TOPIC_FORMS, `${t.id} 서식 항목 없음`);
  for (const k of Object.keys(TOPIC_FORMS)) assert.ok(ids.has(k), `없는 주제 ${k}`);
  const withForms = TOPICS.filter((t) => TOPIC_FORMS[t.id].length > 0).length;
  assert.ok(withForms >= TOPICS.length - 2);
});

test("서식 바로가기: 첫 화면 https 주소와 검색어만 써요", () => {
  for (const p of Object.values(PORTALS)) assert.match(p.url, /^https:\/\/[a-z0-9.-]+\/$/);
  for (const list of Object.values(TOPIC_FORMS)) for (const x of list) assert.match(x.find, /^검색: \S/);
});

test("intake 결과에 서식 화면이 붙어요", () => {
  const r = intake("labor-unpaid", {}, "2026-11-20");
  assert.ok(r.forms.some((x) => x.site === "고용노동부" && x.url === "https://www.moel.go.kr/"));
  assert.deepEqual(formsFor("없는-주제"), []);
});
