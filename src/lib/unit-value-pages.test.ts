import { test } from "node:test";
import assert from "node:assert/strict";
import { cmToFeet, kgToPounds, heightValues, weightValues, heightSlug, weightSlug, feetInches } from "./unit-value-pages.ts";

test("170 cm is 5'7\" (66.93 in)", () => {
  const v = cmToFeet(170);
  assert.equal(feetInches(v), `5'7"`);
  assert.equal(v.totalInches, 66.93);
  assert.equal(v.feetDecimal, 5.58);
  assert.equal(v.meters, 1.7);
});

test("inches carry into feet at 12", () => {
  // 182.5 cm = 71.85 in -> 6'0"
  assert.equal(feetInches(cmToFeet(182.5)), `6'0"`);
  assert.equal(feetInches(cmToFeet(183)), `6'0"`);
  assert.equal(feetInches(cmToFeet(152.4)), `5'0"`);
});

test("70 kg is 154.3 lb, 11 st 0 lb", () => {
  const w = kgToPounds(70);
  assert.equal(w.pounds, 154.3);
  assert.equal(w.lbWhole, 154);
  assert.equal(w.ounces, 5);
  assert.equal(w.stone, 11);
  assert.equal(w.stoneLb, 0);
});

test("ranges and slugs", () => {
  assert.equal(heightValues().length, 71);
  assert.equal(weightValues().length, 111);
  assert.equal(heightSlug(170), "170-cm-in-feet");
  assert.equal(weightSlug(70), "70-kg-in-pounds");
});
