import { test } from "node:test";
import assert from "node:assert/strict";
import { plan, roastHours, suggestLb, thawHours } from "./turkey.ts";

test("roast table rows by weight (USDA 325°F)", () => {
  assert.deepEqual(roastHours(12, false), { min: 2.75, max: 3, inTable: true });
  assert.deepEqual(roastHours(13, true), { min: 3.5, max: 4, inTable: true });
  assert.deepEqual(roastHours(16, false), { min: 3.75, max: 4.25, inTable: true });
  assert.deepEqual(roastHours(22, true), { min: 4.75, max: 5.25, inTable: true });
  assert.equal(roastHours(26, false)?.inTable, false);
  assert.equal(roastHours(0, false), null);
});

test("thaw: fridge 24 h per 4 lb (rounded up), cold water 30 min per lb", () => {
  assert.equal(thawHours(16, "fridge"), 96);
  assert.equal(thawHours(15, "fridge"), 96);
  assert.equal(thawHours(15, "water"), 7.5);
  assert.equal(thawHours(15, "thawed"), 0);
});

test("guests rule of thumb", () => {
  assert.equal(suggestLb(10, false), 13);
  assert.equal(suggestLb(10, true), 15);
  assert.equal(suggestLb(2, false), 4);
});

test("plan works back from carving time", () => {
  const p = plan(16, false, "fridge", new Date("2026-11-26T17:00:00Z"))!;
  assert.equal(p.restFrom.toISOString(), "2026-11-26T16:40:00.000Z");
  assert.equal(p.ovenIn.toISOString(), "2026-11-26T12:25:00.000Z");
  assert.equal(p.checkFrom.toISOString(), "2026-11-26T16:10:00.000Z");
  assert.equal(p.thawStart?.toISOString(), "2026-11-22T12:25:00.000Z");
});
