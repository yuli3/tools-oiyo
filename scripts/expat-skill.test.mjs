import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { EXPAT_SKILL_DIR, EXPAT_SKILL_LIBS } from "./build-expat-skill.mjs";
import { renderSkillLib } from "./build-advisor-skill.mjs";

test("expat skill scripts match src", () => {
  for (const name of EXPAT_SKILL_LIBS) assert.equal(readFileSync(resolve(EXPAT_SKILL_DIR, "scripts", `${name}.mjs`), "utf8"), renderSkillLib(name), `${name}: run node scripts/build-expat-skill.mjs`);
});

test("expat skill CLI: topics and deadlines", () => {
  const run = (...args) => JSON.parse(execFileSync(process.execPath, [resolve(EXPAT_SKILL_DIR, "scripts/expat.mjs"), ...args], { encoding: "utf8" }));
  assert.deepEqual(run("topics", "I was injured at work").topics.map((t) => t.id), ["injury"]);
  const d = run("deadlines", '{"arrival":"2026-09-01"}', "2026-11-20");
  assert.equal(d.deadlines[0].due, "2026-11-30");
  assert.equal(d.deadlines[0].daysLeft, 10);
});
