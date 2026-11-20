import test from "node:test";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { LAW_SKILL_LIBS, LAW_SKILL_DIR, renderReferences, renderCompetencies, renderPractice } from "./build-law-guide-skill.mjs";
import { renderSkillLib } from "./build-advisor-skill.mjs";

test("law guide skill scripts and references match src/lib", async () => {
  for (const name of LAW_SKILL_LIBS) assert.equal(readFileSync(resolve(LAW_SKILL_DIR, "scripts", `${name}.mjs`), "utf8"), renderSkillLib(name), `${name}: run node scripts/build-law-guide-skill.mjs`);
  for (const [d, md] of Object.entries(await renderReferences())) assert.equal(readFileSync(resolve(LAW_SKILL_DIR, "references", `${d}.md`), "utf8"), md, `references/${d}.md: run node scripts/build-law-guide-skill.mjs`);
  assert.equal(readFileSync(resolve(LAW_SKILL_DIR, "references/competencies.md"), "utf8"), await renderCompetencies(), "references/competencies.md: run node scripts/build-law-guide-skill.mjs");
  assert.equal(readFileSync(resolve(LAW_SKILL_DIR, "references/practice.md"), "utf8"), await renderPractice(), "references/practice.md: run node scripts/build-law-guide-skill.mjs");
});

test("law guide CLI: 실무 계산·길잡이", () => {
  const run = (...args) => JSON.parse(execFileSync(process.execPath, [resolve(LAW_SKILL_DIR, "scripts/guide.mjs"), ...args], { encoding: "utf8" }));
  assert.equal(run("calc", "fine", '{"fine":500000,"noticeDate":"2026-11-02","opinionDays":10,"when":"early","monthsLate":0,"vulnerable":false}').result.pay, 400000);
  assert.equal(run("calc", "duty", '{"price":1000,"freight":50,"insurance":0,"fx":1400,"baseRate":0.13,"ftaRate":0,"hasOrigin":true,"personal":false,"fromUS":true}').result.fta.total, 147000);
  assert.equal(run("calc", "kics", '{"available":300e9,"life":100e9,"nonlife":0,"market":100e9,"credit":0,"operational":10e9,"taxAdj":0}').result.level, "ok");
  const p = run("practice", "eportal-practice-guide", "insurance4", '{"acquire":"2026-11-03"}');
  assert.equal(p.deadlines[0].due, "2026-12-15");
  assert.ok(run("practice").some((g) => g.slug === "pro-document-reading-guide"));
  assert.equal(run("calc", "breach", '{"knownAt":"2026-12-24T15:30","affected":10,"hacking":true}').deadline, "2026-12-27 15:30");
  const tmp = resolve(tmpdir(), `oiyo-policy-${process.pid}.txt`);
  writeFileSync(tmp, "개인정보 처리 목적과 보유 기간, 파기 방법을 적었습니다.");
  assert.ok(run("calc", "policy", tmp, '{"website":true}').missing.some((m) => m.id === "cookies"));
  writeFileSync(tmp, "대금은 고객사로부터 결제를 받은 후 지급한다. 을은 갑이 만족할 때까지 수정한다.");
  const c = run("calc", "contract", tmp, '{"creative":true}', "1000000");
  assert.deepEqual(c.flags.map((f) => f.id), ["unlimitedRevision", "payAfterClient"]);
  assert.equal(c.pay.receive, 967000);
});

test("law guide CLI: suggest → intake → statutes", () => {
  const run = (...args) => JSON.parse(execFileSync(process.execPath, [resolve(LAW_SKILL_DIR, "scripts/guide.mjs"), ...args], { encoding: "utf8" }));
  assert.equal(run("suggest", "전세 보증금을 못 돌려받아요").topics[0].id, "court-deposit");
  const r = run("intake", "labor-dismissal", '{"size":"5plus","dismissDate":"2026-10-30"}', "2026-11-16");
  assert.equal(r.nextQuestions[0].key, "written");
  assert.equal(r.deadlines.find((d) => d.id === "remedy").due, "2027-02-01");
  assert.equal(run("statutes", "경정청구")[0].id, "nts-45-2");
  assert.equal(run("scope", "court").profession.act, "법무사법");
});

test("skill never calls itself a licensed professional", () => {
  const md = readFileSync(resolve(LAW_SKILL_DIR, "SKILL.md"), "utf8");
  assert.match(md, /법령 길잡이/);
  assert.doesNotMatch(md, /^name: .*(세무사|노무사|법무사|행정사|회계사)/m);
});
