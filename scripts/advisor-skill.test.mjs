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

test("bridge: 통장 예시를 분개하고 시즌 일정을 내요", () => {
  const sample = execFileSync(process.execPath, [resolve(SKILL_DIR, "scripts/bridge.mjs"), "sample", "bank"], { encoding: "utf8" });
  const out = JSON.parse(execFileSync(process.execPath, [resolve(SKILL_DIR, "scripts/bridge.mjs"), "journal", "-", "bank"], { input: sample, encoding: "utf8" }));
  assert.equal(out.summary.n, 12);
  assert.equal(out.summary.unclassified, 1);
  assert.ok(out.csv.startsWith("일자,차변계정"));
  const season = JSON.parse(execFileSync(process.execPath, [resolve(SKILL_DIR, "scripts/bridge.mjs"), "season", "2026-11-20", "employer"], { encoding: "utf8" }));
  assert.equal(season.tasks[0].due, "2026-12-10");
});
