import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { GUIDES, guideDeadlines, recordCheck, recordText, EXPLAIN_ITEMS, SUITABILITY_ITEMS } from "./pro-practice-guides-2026.ts";

test("실무 길잡이: 페이지가 있고, 상황마다 준비물·확인할 점·창구가 있어요", () => {
  const ids = new Set<string>();
  for (const g of GUIDES) {
    assert.ok(existsSync(`src/pages/ko/${g.slug}.astro`), g.slug);
    for (const c of g.cases) {
      assert.ok(!ids.has(`${g.slug}/${c.id}`));
      ids.add(`${g.slug}/${c.id}`);
      assert.ok(c.prepare.length > 0 && c.check.length > 0 && c.links.length > 0, c.id);
      for (const l of c.links) assert.match(l.href, /^(https:\/\/|tel:)/);
      for (const d of c.deadlines) assert.ok(d.cite && d.from, d.id);
    }
  }
});

test("실무 길잡이: 기한 계산(다음 달 15일, 2주, 60일, 휴일 이월)", () => {
  const e = GUIDES.find((g) => g.slug === "eportal-practice-guide")!;
  const ins = e.cases.find((c) => c.id === "insurance4")!;
  assert.equal(guideDeadlines(ins, { acquire: "2026-11-03" })[0].due, "2026-12-15");
  const court = e.cases.find((c) => c.id === "ecourt")!;
  assert.equal(guideDeadlines(court, { appeal: "2026-11-02" })[0].due, "2026-11-16");
  const hometax = e.cases.find((c) => c.id === "hometax")!;
  assert.equal(guideDeadlines(hometax, { einvoice: "2026-11-20" })[0].due, "2026-12-10");
  const visa = GUIDES.find((g) => g.slug === "visa-stay-status-guide")!.cases[0];
  assert.equal(guideDeadlines(visa, { register: "2026-09-01" })[0].due, "2026-11-30");
  const ext = GUIDES.find((g) => g.slug === "visa-stay-status-guide")!.cases[1];
  assert.equal(guideDeadlines(ext, { "extend-open": "2027-03-31" })[0].due, "2026-11-30");
});

test("설명·적합성 기록: 빠진 항목을 알려 주고, 다 채우면 통과해요", () => {
  const empty = { customer: "", product: "", date: "2026-11-17", suitability: [], explained: [], delivered: "" as const, confirm: "" as const, replace: false, note: "" };
  const r = recordCheck(empty);
  assert.equal(r.ok, false);
  assert.equal(r.problems.length, 4);
  assert.equal(r.withdrawBy, "2026-12-17");
  assert.equal(r.keepUntil, "2036-11-17");
  const full = { ...empty, customer: "김OO", product: "정기보험", suitability: SUITABILITY_ITEMS.map((x) => x.id), explained: EXPLAIN_ITEMS.filter((x) => x.id !== "compare").map((x) => x.id), delivered: "paper" as const, confirm: "sign" as const };
  assert.equal(recordCheck(full).ok, true);
  assert.equal(recordCheck({ ...full, replace: true }).ok, false, "갈아타기면 비교 설명 필요");
  assert.match(recordText(full), /금소법 제46조/);
  assert.doesNotMatch(recordText(full), /undefined|NaN|보완 필요/);
});
