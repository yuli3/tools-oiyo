import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { BIZ_SKILL_LIBS, BIZ_SKILL_DIR, renderReferences } from "./build-business-skill.mjs";
import { renderSkillLib } from "./build-advisor-skill.mjs";

test("business skill scripts and references match src", async () => {
  for (const name of BIZ_SKILL_LIBS) assert.equal(readFileSync(resolve(BIZ_SKILL_DIR, "scripts", `${name}.mjs`), "utf8"), renderSkillLib(name), `${name}: run node scripts/build-business-skill.mjs`);
  for (const [rel, text] of Object.entries(await renderReferences())) assert.equal(readFileSync(resolve(BIZ_SKILL_DIR, rel), "utf8"), text, `${rel}: run node scripts/build-business-skill.mjs`);
});

test("business skill calculator runs every tool", () => {
  const run = (tool, json = "{}") => JSON.parse(execFileSync(process.execPath, [resolve(BIZ_SKILL_DIR, "scripts/calc.mjs"), tool, json], { encoding: "utf8" }));
  assert.equal(run("decision-options").result.best, 1);
  assert.equal(run("schedule").result.duration, 13.5);
  assert.equal(run("swot").result.stance, "ST");
  assert.equal(run("bcg").result.rows[0].quadrant, "cashCow");
  assert.equal(run("unit-economics").result.ltvToCac, 4);
  assert.equal(run("runway").result.zeroMonth, 6);
  assert.ok(run("tax-calendar").result.events.length > 10);
  assert.equal(run("weighted-decision").result.ranked[0].name, "X");
  assert.ok(run("positioning").result.gap);
  assert.ok(run("rice").result.length === 2);
  assert.ok(run("decision-tree").result.ev);
});
