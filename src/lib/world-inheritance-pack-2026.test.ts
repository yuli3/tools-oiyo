import { test } from "node:test";
import assert from "node:assert/strict";
import { frSuccession, jpGift, jpInheritance, twEstate, ukGiftRate, ukInheritance, usEstateGift } from "./world-inheritance-pack-2026.ts";

test("Japan: basic deduction 3,000万+600万×heirs, 10-month deadline, gift 500万 = 53万/48.5万", () => {
  const r = jpInheritance({ estate: 100_000_000, heirs: 2, death: "2026-01-15" });
  assert.equal(r.basicDeduction, 42_000_000);
  // 58,000,000 / 2 = 29,000,000 each → ×15% − 500,000 = 3,850,000 each
  assert.equal(r.totalTax, 7_700_000);
  assert.equal(r.dates[0].date, "2026-11-15");
  assert.equal(jpInheritance({ estate: 40_000_000, heirs: 2 }).totalTax, 0);
  assert.equal(jpGift({ amount: 5_000_000, special: false }).tax, 530_000);
  assert.equal(jpGift({ amount: 5_000_000, special: true, year: 2026 }).tax, 485_000);
});

test("UK: £325k + £175k RNRB, 40%/36%, pay by end of 6th month, taper", () => {
  const r = ukInheritance({ estate: 600_000, homeToDescendants: true, homeValue: 300_000, death: "2026-03-10" });
  assert.equal(r.threshold, 500_000);
  assert.equal(r.tax, 40_000);
  assert.equal(r.dates[0].date, "2026-09-30");
  assert.equal(ukInheritance({ estate: 425_000, charity10: true }).tax, 36_000);
  assert.equal(ukGiftRate(2), 0.40);
  assert.equal(ukGiftRate(4.5), 0.24);
  assert.equal(ukGiftRate(7), 0);
});

test("US: $15M exclusion, 706 at 9 months, $19k annual gift exclusion", () => {
  const r = usEstateGift({ estate: 16_000_000, death: "2026-02-28", giftToOnePerson: 25_000, giftYear: 2026 });
  assert.equal(r.overExclusion, 1_000_000);
  assert.equal(r.dates.find((d) => d.id === "706")!.date, "2026-11-28");
  assert.equal(r.dates.find((d) => d.id === "709")!.date, "2027-04-15");
});

test("France: enfant 100 000 € abattement and barème; conjoint exonéré; 6/12 mois", () => {
  // 200 000 − 100 000 = 100 000 → 403.6 + 403.7 + 573.15 + 16 813.6 = 18 194
  const r = frSuccession({ part: 200_000, relation: "enfant", death: "2026-05-31" });
  assert.equal(r.droits, 18_194);
  assert.equal(r.dates[0].date, "2026-11-30");
  assert.equal(frSuccession({ part: 1_000_000, relation: "conjoint" }).droits, 0);
  assert.equal(frSuccession({ part: 20_000, relation: "neveu", abroad: true, death: "2026-01-01" }).droits, Math.round((20_000 - 7_967) * 0.55));
});

test("Taiwan: 6 months from the day after death, +3 months extension", () => {
  const r = twEstate({ death: "2026-01-15", extended: true });
  assert.equal(r.dates[0].date, "2026-07-15");
  assert.equal(r.dates[1].date, "2026-10-15");
});
