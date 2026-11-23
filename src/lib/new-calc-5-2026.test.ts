import assert from "node:assert/strict";
import { test } from "node:test";
import { caIncomeTax2025, jpFurusatoLimit, krPensionEstimate, krQuitPlan, npsConstant, ukMarriageAllowance } from "./new-calc-5-2026.ts";

test("NPS constants follow the NPS table", () => {
  assert.equal(npsConstant(1990), 2.4);
  assert.equal(npsConstant(2005), 1.8);
  assert.equal(npsConstant(2008), 1.5);
  assert.equal(npsConstant(2010), 1.47);
  assert.equal(npsConstant(2025), 1.245);
  assert.equal(npsConstant(2030), 1.29);
});

test("NPS: 20 years from 2026 at A value = 1.29 × 2A / 12", () => {
  const r = krPensionEstimate({ startYear: 2026, endYear: 2045, monthlyIncome: 3_193_511 });
  assert.equal(r.months, 240);
  assert.equal(r.payRatePct, 100);
  assert.equal(r.monthlyBasic, Math.floor(Math.floor(1.29 * 2 * 3_193_511) / 12));
  const short = krPensionEstimate({ startYear: 2026, endYear: 2035, monthlyIncome: 3_193_511 });
  assert.equal(short.payRatePct, 50);
  assert.equal(krPensionEstimate({ startYear: 2026, endYear: 2030, monthlyIncome: 2_000_000 }).eligible, false);
  const capped = krPensionEstimate({ startYear: 2026, endYear: 2045, monthlyIncome: 20_000_000 });
  assert.equal(capped.B, 6_590_000);
});

test("Furusato limit matches Kobe coefficient 23.558% at 5%", () => {
  const r = jpFurusatoLimit({ residentIncomeLevy: 100_000, incomeTaxRatePct: 5 });
  assert.equal(r.limit, Math.floor(20_000 / 0.84895) + 2000);
  assert.equal(r.coefficientPct, 23.558);
  const b = jpFurusatoLimit({ residentIncomeLevy: 100_000, incomeTaxRatePct: 5, donation: 25_000 }).breakdown!;
  assert.equal(b.capped, false);
  assert.ok(Math.abs(b.selfBurden - 2000) <= 2);
  assert.equal(jpFurusatoLimit({ residentIncomeLevy: 100_000, incomeTaxRatePct: 5, donation: 100_000 }).breakdown!.capped, true);
});

test("Quit plan wraps severance, retirement tax and unemployment", () => {
  const r = krQuitPlan({ monthlyWage: 3_000_000, years: 5, insuredYears: 5, age50OrDisabled: false, involuntary: true });
  assert.equal(r.severanceGross, Math.floor((9_000_000 / 91) * 30 * 5));
  assert.ok(r.severanceNet > 0 && r.severanceNet < r.severanceGross);
  assert.equal(r.unemploymentDays, 210);
  assert.ok(r.unemploymentTotal > 0);
  assert.equal(krQuitPlan({ monthlyWage: 3_000_000, years: 0.5, insuredYears: 0.5, age50OrDisabled: false, involuntary: false }).severanceGross, 0);
});

test("UK Marriage Allowance", () => {
  const r = ukMarriageAllowance({ lowerIncome: 8000, higherIncome: 30000, scotland: false, married: true });
  assert.equal(r.eligible, true);
  assert.equal(r.yearlySaving, 252);
  assert.equal(ukMarriageAllowance({ lowerIncome: 8000, higherIncome: 60000, scotland: false, married: true }).eligible, false);
  assert.equal(ukMarriageAllowance({ lowerIncome: 8000, higherIncome: 45000, scotland: true, married: true }).eligible, false);
});

test("California 2025 schedule X", () => {
  assert.equal(caIncomeTax2025({ taxableIncome: 50_000, filing: "single" }).tax, Math.round((1022.01 + (50_000 - 41452) * 0.06) * 100) / 100);
  assert.equal(caIncomeTax2025({ taxableIncome: 100_000, filing: "mfj" }).marginalPct, 6);
});
