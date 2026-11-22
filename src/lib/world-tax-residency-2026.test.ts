import { test } from "node:test";
import assert from "node:assert/strict";
import { usSubstantialPresence, ukStatutoryResidence, esResidency, twResidency, jpResidency, frResidency } from "./world-tax-residency-2026.ts";

test("us: IRS example 120x3 → 180", () => {
  const r = usSubstantialPresence({ current: 120, prior1: 120, prior2: 120 });
  assert.equal(r.weighted, 180);
  assert.equal(r.verdict, "nonresident");
  assert.equal(usSubstantialPresence({ current: 150, prior1: 120, prior2: 120 }).verdict, "resident");
  assert.equal(usSubstantialPresence({ current: 30, prior1: 365, prior2: 365 }).verdict, "nonresident");
});
test("uk: SRT", () => {
  assert.equal(ukStatutoryResidence({ days: 15, residentInPrior3: true }).verdict, "nonresident");
  assert.equal(ukStatutoryResidence({ days: 45, residentInPrior3: false }).verdict, "nonresident");
  assert.equal(ukStatutoryResidence({ days: 183, residentInPrior3: false }).verdict, "resident");
  assert.equal(ukStatutoryResidence({ days: 100, residentInPrior3: true, ties: 2 }).verdict, "resident");
  assert.equal(ukStatutoryResidence({ days: 100, residentInPrior3: false, ties: 2 }).verdict, "nonresident");
  assert.equal(ukStatutoryResidence({ days: 80, residentInPrior3: true, ties: 4, fullTimeAbroad: true, ukWorkDays: 10 }).verdict, "nonresident");
});
test("es / tw / jp / fr", () => {
  assert.equal(esResidency({ days: 183 }).verdict, "nonresident");
  assert.equal(esResidency({ days: 184 }).verdict, "resident");
  assert.equal(esResidency({ days: 10, economicCentre: true }).verdict, "resident");
  assert.equal(twResidency({ days: 31, householdRegistration: true }).verdict, "resident");
  assert.equal(twResidency({ days: 20, householdRegistration: true, lifeCentre: true }).verdict, "resident");
  assert.equal(twResidency({ days: 182, householdRegistration: false }).verdict, "nonresident");
  assert.equal(twResidency({ days: 183, householdRegistration: false }).verdict, "resident");
  assert.equal(jpResidency({ domicileInJapan: true }).verdict, "resident");
  assert.equal(frResidency({ economicCentreInFrance: true }).verdict, "resident");
  assert.equal(frResidency({}).verdict, "depends");
});
