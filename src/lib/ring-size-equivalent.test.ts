import assert from "node:assert/strict";
import { test } from "node:test";
import { ringFromJp, ringFromUs, ringSizePages } from "./ring-size-equivalent.ts";

test("US 7 matches the published 17.32 mm / 54.4 mm", () => {
  const r = ringFromUs(7);
  assert.equal(r.diameter, 17.32);
  assert.equal(Math.round(r.circumference * 10) / 10, 54.4);
  assert.equal(r.us, 7);
  assert.equal(r.eu, 54);
});

test("JIS 10 is exactly 16.0 mm inside diameter", () => {
  const r = ringFromJp(10);
  assert.equal(r.diameter, 16);
  assert.equal(r.jp, 10);
});

test("US 6 lands on Japan 11.5 (the documented chart disagreement)", () => {
  assert.ok(Math.abs(ringFromUs(6).jpExact - 11.6) < 0.2);
});

test("page slugs are unique and cover the advertised ranges", () => {
  const en = ringSizePages("en");
  const ko = ringSizePages("ko");
  assert.equal(en.length, 21);
  assert.equal(ko.length, 27);
  assert.equal(new Set(en.map((p) => p.slug)).size, en.length);
  assert.equal(en[0].slug, "us-3");
  assert.equal(en.at(-1)?.slug, "us-13");
  assert.ok(en.some((p) => p.slug === "us-7-5"));
  assert.equal(ko[12].slug, "13ho");
  for (const p of [...en, ...ko]) assert.ok(p.data.uk !== "—", p.slug);
});
