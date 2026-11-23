import { test } from "node:test";
import assert from "node:assert/strict";
import { DE_STATE_2027, ES_REGIONS, HOLIDAYS_2027, WORKDAYS_2027, holidays2027, workdays2027 } from "./world-holidays-2027.ts";
import { bestByLeave, bridgeWindows, topEfficient } from "./leave-bridge.ts";

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

test("China 2027: 调休 workdays break up weekends; Spring Festival 9 days", () => {
  const cn = HOLIDAYS_2027.cn.filter((d) => d.name === "春节");
  assert.equal(cn.length, 9);
  for (const d of WORKDAYS_2027.cn ?? []) assert.ok([0, 6].includes(wd(d)), d);
  // Without leave, 5/1–5/5 is 5 days, and 5/8 (Sat) is a workday so 5/6–5/7 leave gives 5/1–5/7 only.
  const opts = { holidays: holidays2027("cn"), workdays: workdays2027("cn"), fromDate: "2027-01-01", requireHoliday: true };
  const w = bridgeWindows(2027, 2, opts).find((x) => x.start === "2027-05-01" && x.leave.length === 2);
  assert.ok(w && w.end === "2027-05-07", JSON.stringify(w));
});

test("Spain 2027: 9 common days, regions add their own (BOE-A-2026-21254)", () => {
  assert.equal(HOLIDAYS_2027.es.filter((d) => d.date.startsWith("2027")).length, 9);
  const count = (r: (typeof ES_REGIONS)[number]) => [...holidays2027("es", { region: r })].filter((d) => d.startsWith("2027")).length;
  for (const r of ES_REGIONS) assert.equal(count(r), r === "CN" ? 11 : 12, r);
  assert.ok(!holidays2027("es", { region: "CT" }).has("2027-03-25"));
  assert.ok(holidays2027("es", { region: "MD" }).has("2027-03-19"));
});

test("Taiwan 2027: 春節 2/4–2/10 with 補假, no 補行上班, 2 days of leave → 11 days", () => {
  assert.equal(workdays2027("tw").size, 0);
  const set = holidays2027("tw");
  for (const d of ["2027-02-09", "2027-02-10", "2027-04-06", "2027-12-31"]) assert.ok(set.has(d), d);
  const best = bestByLeave(2027, 2, { holidays: set, fromDate: "2027-01-01", requireHoliday: true });
  assert.equal(best[1].best?.start, "2027-02-04");
  assert.equal(best[1].best?.days, 11);
});
