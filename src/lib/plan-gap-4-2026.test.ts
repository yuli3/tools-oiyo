import assert from "node:assert/strict";
import { test } from "node:test";
import { auSuper, deBasisrente, deRiester, krNpsEarlyDefer, krNpsStartAge, twLaborPensionVoluntary } from "./plan-gap-4-2026.ts";

test("KR start ages by birth year (NPS table)", () => {
  assert.deepEqual(krNpsStartAge(1955), { normal: 61, early: 56 });
  assert.deepEqual(krNpsStartAge(1966), { normal: 64, early: 59 });
  assert.deepEqual(krNpsStartAge(1975), { normal: 65, early: 60 });
  assert.throws(() => krNpsStartAge(1950));
});

test("KR early: 5 years early = 70%, 1 year = 94%", () => {
  const r = krNpsEarlyDefer({ birthYear: 1966, monthly: 1_000_000, mode: "early", earlyYears: 5 });
  assert.equal(r.monthly, 700_000);
  assert.equal(r.startAge, 59);
  assert.equal(r.ratePct, 70);
  assert.equal(krNpsEarlyDefer({ birthYear: 1966, monthly: 1_000_000, mode: "early", earlyYears: 1 }).monthly, 940_000);
  // 5y early: 60 months × 700k = 42m head start; normal gains 300k/month → caught up after 140 months from 64 → age 75.67
  assert.equal(r.breakEvenAge, 75.6);
  assert.throws(() => krNpsEarlyDefer({ birthYear: 1966, monthly: 1_000_000, mode: "early", earlyYears: 6 }));
});

test("KR defer: 0.6%/month simple, full and partial", () => {
  const full = krNpsEarlyDefer({ birthYear: 1970, monthly: 1_000_000, mode: "defer", deferMonths: 60 });
  assert.equal(full.monthly, 1_360_000);
  assert.equal(full.startAge, 70);
  const part = krNpsEarlyDefer({ birthYear: 1970, monthly: 1_000_000, mode: "defer", deferMonths: 12, deferSharePct: 50 });
  assert.equal(part.partialKeep, 500_000);
  assert.equal(part.monthly, 1_036_000); // 500k + 500k × 1.072
  assert.throws(() => krNpsEarlyDefer({ birthYear: 1970, monthly: 1_000_000, mode: "defer", deferMonths: 12, deferSharePct: 55 }));
});

test("TW voluntary 6%", () => {
  const r = twLaborPensionVoluntary({ monthlyWage: 50_000, voluntaryPct: 6, marginalRatePct: 12 });
  assert.equal(r.annualVoluntary, 36_000);
  assert.equal(r.taxSaving, 4_320);
  assert.equal(r.employerAnnualMin, 36_000);
  assert.throws(() => twLaborPensionVoluntary({ monthlyWage: 50_000, voluntaryPct: 7, marginalRatePct: 12 }));
});

test("DE Riester: full and reduced Zulage, Günstigerprüfung", () => {
  const r = deRiester({ vorjahresEinnahmen: 40_000, eigenbeitrag: 1_115, kinderVor2008: 0, kinderAb2008: 1, berufseinsteiger: false, grenzsteuersatzPct: 30 });
  assert.equal(r.zulageVoll, 475);
  assert.equal(r.mindesteigenbeitrag, 1_125); // 1.600 − 475
  assert.ok(r.gekuerzt);
  const ok = deRiester({ vorjahresEinnahmen: 40_000, eigenbeitrag: 1_125, kinderVor2008: 0, kinderAb2008: 1, berufseinsteiger: false, grenzsteuersatzPct: 30 });
  assert.equal(ok.zulage, 475);
  assert.equal(ok.sonderausgaben, 1_600);
  assert.equal(ok.steuerwirkung, 480);
  assert.equal(ok.zusaetzlicheErstattung, 5);
  const low = deRiester({ vorjahresEinnahmen: 1_000, eigenbeitrag: 60, kinderVor2008: 0, kinderAb2008: 0, berufseinsteiger: false, grenzsteuersatzPct: 0 });
  assert.equal(low.mindesteigenbeitrag, 60);
});

test("DE Basisrente: 2025 cap, 2026 not computed", () => {
  const r = deBasisrente({ jahr: 2025, beitrag: 10_000, grvBeitraegeGesamt: 20_000, zusammen: false, grenzsteuersatzPct: 42 });
  assert.equal(r.verified, true);
  if (r.verified) { assert.equal(r.abziehbar, 9_343); assert.equal(r.ueberHoechstbetrag, 657); }
  assert.equal(deBasisrente({ jahr: 2026, beitrag: 1, grvBeitraegeGesamt: 0, zusammen: false, grenzsteuersatzPct: 30 }).verified, false);
});

test("AU super: cap, carry-forward, Division 293", () => {
  const r = auSuper({ year: "2025-26", salary: 150_000, salarySacrifice: 15_000, personalDeductible: 0, unusedCarryForward: 0, tsbUnder500k: false, div293Income: 150_000, nonConcessional: 0, marginalRatePct: 39 });
  assert.equal(r.sg, 18_000);
  assert.equal(r.concessional, 33_000);
  assert.equal(r.excess, 3_000);
  assert.equal(r.div293, 0);
  const cf = auSuper({ year: "2025-26", salary: 150_000, salarySacrifice: 15_000, personalDeductible: 0, unusedCarryForward: 5_000, tsbUnder500k: true, div293Income: 240_000, nonConcessional: 0, marginalRatePct: 47 });
  assert.equal(cf.excess, 0);
  assert.equal(cf.div293, Math.round(Math.min(240_000 + 33_000 - 250_000, 33_000) * 0.15));
  assert.equal(auSuper({ year: "2026-27", salary: 300_000, salarySacrifice: 0, personalDeductible: 0, unusedCarryForward: 0, tsbUnder500k: false, div293Income: 0, nonConcessional: 0, marginalRatePct: 0 }).sg, 32_500 - 0 > 0 ? Math.round(270_830 * 0.12) : 0);
});
