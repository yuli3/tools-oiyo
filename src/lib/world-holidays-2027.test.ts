import { test } from "node:test";
import assert from "node:assert/strict";
import { DE_STATE_2027, HOLIDAYS_2027, holidays2027 } from "./world-holidays-2027.ts";
import { bestByLeave, topEfficient } from "./leave-bridge.ts";

const wd = (d: string) => new Date(`${d}T00:00:00Z`).getUTCDay();

test("Japan 2027 matches the Cabinet Office table (17 days, 3/22 substitute)", () => {
  const jp2027 = HOLIDAYS_2027.jp.filter((d) => d.date.startsWith("2027"));
  assert.equal(jp2027.length, 17);
  assert.equal(wd("2027-03-21"), 0);
  assert.ok(jp2027.some((d) => d.date === "2027-03-22"));
});

test("Easter-based dates follow Easter Sunday 2027-03-28", () => {
  assert.equal(wd("2027-03-28"), 0);
  for (const c of ["uk", "de"] as const) assert.ok(HOLIDAYS_2027[c].some((d) => d.date === "2027-03-26"));
  for (const c of ["uk", "fr", "de"] as const) assert.ok(HOLIDAYS_2027[c].some((d) => d.date === "2027-03-29"));
  assert.ok(HOLIDAYS_2027.fr.some((d) => d.date === "2027-05-06")); // Easter + 39
  assert.ok(DE_STATE_2027.some((d) => d.date === "2027-05-27")); // Fronleichnam = Easter + 60
});

test("US observed dates never fall on a weekend", () => {
  for (const d of HOLIDAYS_2027.us) assert.ok(![0, 6].includes(wd(d.date)), d.date);
  for (const d of HOLIDAYS_2027.uk) assert.ok(![0, 6].includes(wd(d.date)), d.date);
});

test("Germany: state days add to the nationwide set", () => {
  assert.ok(!holidays2027("de").has("2027-05-27"));
  assert.ok(holidays2027("de", { state: "BY" }).has("2027-05-27"));
  assert.ok(holidays2027("de", { state: "SN" }).has("2027-11-17"));
});

test("France: Ascension Thursday gives a 4-day pont for 1 day of leave", () => {
  const w = topEfficient(2027, 1, 10, { holidays: holidays2027("fr") });
  assert.ok(w.some((x) => x.start === "2027-05-06" && x.end === "2027-05-09" && x.leave[0] === "2027-05-07"));
});

test("Japan defaults include 年末年始, and GW 2027 grows with leave", () => {
  const set = holidays2027("jp");
  assert.ok(set.has("2027-12-30"));
  const best = bestByLeave(2027, 3, { holidays: set });
  assert.ok(best[1].best && best[1].best.days >= 9);
});
