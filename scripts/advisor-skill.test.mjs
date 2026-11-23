import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { SKILL_LIBS, SKILL_MJS, SKILL_DIR, renderSkillLib, renderSkillMjs } from "./build-advisor-skill.mjs";

test("skill scripts match src/lib", () => {
  for (const name of SKILL_LIBS) {
    assert.equal(readFileSync(resolve(SKILL_DIR, "scripts", `${name}.mjs`), "utf8"), renderSkillLib(name), `${name}: run node scripts/build-advisor-skill.mjs`);
  }
  for (const name of SKILL_MJS) {
    assert.equal(readFileSync(resolve(SKILL_DIR, "scripts", `${name}.mjs`), "utf8"), renderSkillMjs(name), `${name}: run node scripts/build-advisor-skill.mjs`);
  }
});

test("skill: 간이세액표·입퇴사 4대보험·중도퇴사 정산", () => {
  const run = (t, j) => JSON.parse(execFileSync(process.execPath, [resolve(SKILL_DIR, "scripts/calc.mjs"), t, j], { encoding: "utf8" })).result;
  assert.equal(run("withholding-table", '{"pay":3000000,"family":1}').tableTax, 74_350);
  const jl = run("join-leave", '{"join":"2026-03-15","leave":"2026-06-10","monthlyPay":3000000}');
  assert.equal(jl.lines[0].total, 0);
  assert.equal(jl.lines.at(-1).employmentCheck, true);
  assert.equal(run("leaver", "{}").mayDeadline, "2027-05-31");
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
