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

test("us skill CLI", () => {
  const run = (...a) => JSON.parse(execFileSync(process.execPath, [resolve(skillDir("us"), "scripts/calc.mjs"), ...a], { encoding: "utf8" })).result;
  assert.equal(run("calendar", '{"taxYear":2026}').events[0].date, "2027-04-15");
  assert.equal(run("depreciation", '{"cost":10000,"life":5,"placed":"2026-05-01","bonus":false}').firstYear, 2000);
  assert.ok(run("scope").some((s) => s.cite.includes("10.3")));
});

test("fr skill CLI", () => {
  const run = (...a) => JSON.parse(execFileSync(process.execPath, [resolve(skillDir("fr"), "scripts/calc.mjs"), ...a], { encoding: "utf8" })).result;
  assert.equal(run("tva", '{"activity":"vente","caPrev":50000,"ca":60000}').status, "franchise");
  assert.equal(run("amortissement", '{"cost":10000,"life":5,"start":"2026-04-10","method":"degressif"}').schedule[0].amount, 2625);
});

test("es skill CLI", () => {
  const run = (...a) => JSON.parse(execFileSync(process.execPath, [resolve(skillDir("es"), "scripts/calc.mjs"), ...a], { encoding: "utf8" })).result;
  assert.equal(run("iva", '{"base":1000,"tipo":21,"recargo":true}').total, 1262);
  assert.equal(run("calendar", '{"year":2026,"sociedad":true}').events.find((e) => e.id === "200").date, "2026-07-27");
  assert.ok(run("scope").some((s) => s.cite.includes("art. 46")));
});

test("cn skill CLI", () => {
  const run = (...a) => JSON.parse(execFileSync(process.execPath, [resolve(skillDir("cn"), "scripts/calc.mjs"), ...a], { encoding: "utf8" })).result;
  assert.equal(run("vat", '{"sales":100000,"period":"month"}').tax, 1000);
  assert.equal(run("calendar", '{"year":2026,"vat":"month"}').events.find((e) => e.id === "vat-10").date, "2026-10-26");
  assert.ok(run("scope").some((s) => s.cite.includes("第89条")));
});

test("uk skill CLI", () => {
  const run = (...a) => JSON.parse(execFileSync(process.execPath, [resolve(skillDir("uk"), "scripts/calc.mjs"), ...a], { encoding: "utf8" })).result;
  assert.equal(run("vat", '{"last12":91000}').status, "must-register");
  assert.equal(run("calendar", '{"taxYear":2025}').events.find((e) => e.id === "online").date, "2027-01-31");
  assert.ok(run("scope").some((s) => s.body.includes("0300 200 3300")));
});

test("tw skill CLI", () => {
  const run = (...a) => JSON.parse(execFileSync(process.execPath, [resolve(skillDir("tw"), "scripts/calc.mjs"), ...a], { encoding: "utf8" })).result;
  assert.equal(run("businesstax", '{"goodsSales":90000}').status, "below-threshold");
  assert.equal(run("calendar", '{"year":2026}').events.find((e) => e.id === "bt-3").date, "2026-03-16");
  assert.ok(run("scope").some((s) => s.cite.includes("記帳士法")));
});

test("world labor skill CLI", () => {
  const run = (...a) => JSON.parse(execFileSync(process.execPath, [resolve(skillDir("labor"), "scripts/calc.mjs"), ...a], { encoding: "utf8" })).result;
  assert.equal(run("tw", '{"start":"2026-01-01","end":"2026-05-01","averageMonthlyWage":30000,"system":"old"}').noticeDays, 10);
  assert.equal(run("es", '{"start":"2016-11-21","end":"2026-11-21","annualSalary":36500,"type":"improcedente"}').indemnizacion, 33000);
});

test("world tenancy skill CLI", () => {
  const run = (...a) => JSON.parse(execFileSync(process.execPath, [resolve(skillDir("tenancy"), "scripts/calc.mjs"), ...a], { encoding: "utf8" })).result;
  assert.equal(run("uk", '{"monthlyRent":1300,"deposit":1600,"received":"2026-11-01"}').cap, 1500);
  assert.equal(run("tw", '{"rent":20000,"deposit":50000}').cap, 40000);
  const md = readFileSync(resolve(skillDir("tenancy"), "SKILL.md"), "utf8");
  assert.match(md, /^name: oiyo-world-tenancy-guide$/m);
});
