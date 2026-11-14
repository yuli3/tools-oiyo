import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { SKILL_LIBS, SKILL_DIR, renderSkillLib } from "./build-advisor-skill.mjs";

test("skill scripts match src/lib", () => {
  for (const name of SKILL_LIBS) {
    assert.equal(readFileSync(resolve(SKILL_DIR, "scripts", `${name}.mjs`), "utf8"), renderSkillLib(name), `${name}: run node scripts/build-advisor-skill.mjs`);
  }
});

test("skill calculator runs", () => {
  const out = JSON.parse(execFileSync(process.execPath, [resolve(SKILL_DIR, "scripts/calc.mjs"), "unlisted-shares", "{}"], { encoding: "utf8" }));
  assert.equal(out.result.perShare, 43_999);
});
