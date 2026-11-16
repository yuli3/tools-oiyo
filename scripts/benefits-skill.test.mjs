import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { BENEFITS_SKILL_LIBS, BENEFITS_SKILL_DIR } from "./build-benefits-skill.mjs";
import { renderSkillLib } from "./build-advisor-skill.mjs";

test("benefits skill script matches src/lib", () => {
  for (const name of BENEFITS_SKILL_LIBS) assert.equal(readFileSync(resolve(BENEFITS_SKILL_DIR, "scripts", `${name}.mjs`), "utf8"), renderSkillLib(name), `${name}: run node scripts/build-benefits-skill.mjs`);
});

test("benefits skill calculator runs every tool", () => {
  const run = (tool, json = "{}") => JSON.parse(execFileSync(process.execPath, [resolve(BENEFITS_SKILL_DIR, "scripts/calc.mjs"), tool, json], { encoding: "utf8" })).result;
  assert.equal(run("work-child-incentive", '{"income":20000000}').ctc, 1_000_000);
  assert.equal(run("maternity-leave").maternity.days, 90);
  assert.equal(run("wage-guarantee").total, 10_000_000);
  assert.equal(run("injury-leave", '{"avgDailyWage":150000,"days":30}').total, 3_150_000);
  assert.equal(run("rent-credit").rate, 0.17);
  assert.ok(run("pension-db-dc").breakEvenReturn > 0);
  assert.equal(run("ordinary-wage").hourly, 15_789);
  assert.equal(run("fixed-overtime", '{"months":36,"night":0}').months, 36);
  assert.equal(run("comprehensive-real-estate-tax", '{"age":0,"holdYears":0}').totalTax, 691_200);
  assert.equal(run("rental-income-tax", '{"registered":true,"otherIncome":50000000,"deposits":0}').separateTax, 739_200);
});
