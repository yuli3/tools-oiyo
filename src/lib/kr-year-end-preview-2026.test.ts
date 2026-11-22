import { test } from "node:test";
import assert from "node:assert/strict";
import { yearEndTimeline, tipsFor, YE_TIPS } from "./kr-year-end-preview-2026.ts";

test("year-end preview timeline", () => {
  const t = yearEndTimeline("2026-11-22");
  const by = Object.fromEntries(t.map((e) => [e.id, e]));
  assert.equal(by["preview-close"].daysLeft, 26);
  assert.equal(by["year-close"].daysLeft, 39);
  assert.equal(by["simplified"].date, null);
  assert.equal(by["simplified"].daysLeft, null);
  assert.equal(by["statement"].date, "2027-03-10");
  assert.equal(new Date("2027-05-31T00:00:00Z").getUTCDay(), 1);
  assert.equal(tipsFor("renter").some((x) => x.id === "rent"), true);
  assert.equal(tipsFor("single").some((x) => x.id === "rent"), false);
  assert.equal(tipsFor("all").length, YE_TIPS.length);
});
