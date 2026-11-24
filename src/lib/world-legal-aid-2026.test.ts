import { test } from "node:test";
import assert from "node:assert/strict";
import { frAideJuridictionnelle, jpAssetLimit, jpHouterasu, jpIncomeLimit } from "./world-legal-aid-2026.ts";

test("法テラス 収入・資産基準（公表表と例）", () => {
  assert.equal(jpIncomeLimit(3, true), 299_200);
  assert.equal(jpIncomeLimit(5, true), 361_900); // 公表例: 東京5人 361,900円
  assert.equal(jpIncomeLimit(1, false), 182_000);
  assert.equal(jpIncomeLimit(5, false), 329_000);
  assert.equal(jpAssetLimit(3), 2_700_000);
  assert.equal(jpAssetLimit(6), 3_000_000);
  const r = jpHouterasu({ people: 1, bigCity: true, tokyo23: true, monthlyTakeHome: 250_000, rentOrLoan: 80_000, cashSavings: 1_000_000 });
  assert.equal(r.counted, 197_000); // 特別区1人の控除上限 53,000円
  assert.equal(r.eligible, true);
});

test("Aide juridictionnelle : taux selon RFR et plafonds de patrimoine", () => {
  assert.equal(frAideJuridictionnelle({ people: 1, rfr: 12_957, movable: 0, property: 0 }).rate, 100);
  assert.equal(frAideJuridictionnelle({ people: 1, rfr: 12_958, movable: 0, property: 0 }).rate, 55);
  assert.equal(frAideJuridictionnelle({ people: 1, rfr: 19_433, movable: 0, property: 0 }).rate, 25);
  assert.equal(frAideJuridictionnelle({ people: 1, rfr: 19_434, movable: 0, property: 0 }).rate, 0);
  assert.equal(frAideJuridictionnelle({ people: 4, rfr: 10_000, movable: 19_096, property: 0 }).rate, 0);
  assert.equal(frAideJuridictionnelle({ people: 6, rfr: 10_000, movable: 0, property: 0 }).rate, null);
});
