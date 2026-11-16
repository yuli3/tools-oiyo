import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { LAW_SKILL_LIBS, LAW_SKILL_DIR, renderReferences } from "./build-law-guide-skill.mjs";
import { renderSkillLib } from "./build-advisor-skill.mjs";

test("law guide skill scripts and references match src/lib", async () => {
  for (const name of LAW_SKILL_LIBS) assert.equal(readFileSync(resolve(LAW_SKILL_DIR, "scripts", `${name}.mjs`), "utf8"), renderSkillLib(name), `${name}: run node scripts/build-law-guide-skill.mjs`);
  for (const [d, md] of Object.entries(await renderReferences())) assert.equal(readFileSync(resolve(LAW_SKILL_DIR, "references", `${d}.md`), "utf8"), md, `references/${d}.md: run node scripts/build-law-guide-skill.mjs`);
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
