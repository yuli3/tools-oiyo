import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { COUNTRY_SKILLS, skillDir } from "./build-country-tax-skill.mjs";
import { renderSkillLib } from "./build-advisor-skill.mjs";

test("country tax skills: scripts match src/lib", () => {
  for (const [c, s] of Object.entries(COUNTRY_SKILLS))
    for (const name of s.libs) assert.equal(readFileSync(resolve(skillDir(c), "scripts", `${name}.mjs`), "utf8"), renderSkillLib(name), `${c}/${name}: run node scripts/build-country-tax-skill.mjs ${c}`);
});

test("jp skill CLI", () => {
  const run = (...a) => JSON.parse(execFileSync(process.execPath, [resolve(skillDir("jp"), "scripts/calc.mjs"), ...a], { encoding: "utf8" })).result;
  assert.equal(run("calendar", '{"year":2027,"prepaid":true}').events.find((e) => e.id === "prepay1").date, "2027-08-02");
  assert.equal(run("penalty", '{"kind":"none","stage":"audit","tax":1000000}').additionalTax, 175000);
  assert.equal(run("consumption", '{"year":2027,"baseSales":8000000,"invoice":true,"wasExempt":true,"sales":8000000}').best, "thirty");
  assert.equal(run("depreciation", '{"cost":350000,"life":4,"acquired":"2026-05-01","blue":true,"sme":true}').treatment, "sme");
  assert.ok(run("scope").some((s) => s.cite.includes("第52条")));
  const md = readFileSync(resolve(skillDir("jp"), "SKILL.md"), "utf8");
  assert.match(md, /^name: oiyo-jp-tax-guide$/m);
});
