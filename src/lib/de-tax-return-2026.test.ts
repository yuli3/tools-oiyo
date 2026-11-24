import test from "node:test";
import assert from "node:assert/strict";
import { deCommuteDeduction, deLateSurcharge } from "./de-tax-return-2026.ts";

test("§ 152 AO: 0,25 % je Monat, mindestens 25 €, höchstens 25.000 €", () => {
  assert.equal(deLateSurcharge({ tax: 20_000, prepaid: 4_000, monthsLate: 3 }).surcharge, 120); // 16.000 × 0,25 % × 3
  assert.equal(deLateSurcharge({ tax: 3_000, prepaid: 2_000, monthsLate: 2 }).surcharge, 50); // min 25 × 2
  assert.equal(deLateSurcharge({ tax: 9_000_000, prepaid: 0, monthsLate: 14 }).surcharge, 25_000);
  assert.equal(deLateSurcharge({ tax: 5_000, prepaid: 6_000, monthsLate: 5 }).surcharge, 0);
  assert.equal(deLateSurcharge({ tax: 5_000, prepaid: 0, monthsLate: 2.2 }).months, 3);
});

test("Pendler- und Homeoffice-Pauschale 2026 gegen 1.230 €", () => {
  const r = deCommuteDeduction({ km: 25, officeDays: 120, homeDays: 90, car: true });
  assert.equal(r.commute, 1140);
  assert.equal(r.homeOffice, 540);
  assert.equal(r.extra, 450);
  assert.equal(deCommuteDeduction({ km: 100, officeDays: 220, homeDays: 0, car: false }).commute, 4500);
  assert.equal(deCommuteDeduction({ km: 0, officeDays: 0, homeDays: 300, car: true }).homeOffice, 1260);
});
