import assert from "node:assert/strict";
import { test } from "node:test";
import {
  COPAY_CAP_2026,
  copayCapRefund,
  groupFromPremium,
  medicalExpenseCredit,
  medicalFloor,
} from "./kr-medical-cost-2026.ts";
import { medicalCredit } from "./kr-year-end-2026.ts";

test("pins the 2026 copay caps so a change is a deliberate edit", () => {
  assert.deepEqual(
    Object.values(COPAY_CAP_2026).map((c) => c.general / 10_000),
    [90, 112, 173, 326, 446, 536, 843],
  );
  assert.deepEqual(
    Object.values(COPAY_CAP_2026).map((c) => c.longStay / 10_000),
    [143, 181, 245, 404, 580, 698, 1_096],
  );
});

test("refund is what was paid over the cap", () => {
  const r = copayCapRefund("d4_5", 2_500_000);
  assert.equal(r.cap, 1_730_000);
  assert.equal(r.refund, 770_000);
  assert.equal(r.remaining, 0);
  const under = copayCapRefund("d1", 600_000);
  assert.equal(under.refund, 0);
  assert.equal(under.remaining, 300_000);
  assert.equal(copayCapRefund("d1", 2_000_000, true).refund, 570_000);
});

test("premium bands map to deciles, boundary inclusive", () => {
  assert.equal(groupFromPremium(57_790, "employee"), "d1");
  assert.equal(groupFromPremium(57_791, "employee"), "d2_3");
  assert.equal(groupFromPremium(150_000, "employee"), "d6_7");
  assert.equal(groupFromPremium(300_000, "employee"), "d10");
  assert.equal(groupFromPremium(13_850, "regional"), "d1");
  assert.equal(groupFromPremium(100_000, "regional"), "d8");
  assert.throws(() => groupFromPremium(-1, "employee"));
});

test("medical credit matches the year-end calculator for general + specific", () => {
  for (const [salary, general, specific] of [
    [50_000_000, 3_000_000, 0],
    [50_000_000, 1_000_000, 2_000_000],
    [80_000_000, 12_000_000, 500_000],
    [30_000_000, 0, 4_000_000],
  ]) {
    assert.equal(medicalExpenseCredit(salary, { general, specific }).credit, medicalCredit(salary, general, specific));
  }
});

test("3% floor falls through general → specific → premature → infertility", () => {
  // 총급여 5,000만 → 문턱 150만. 일반 50만, 특정 30만, 미숙아 20만, 난임 400만.
  const r = medicalExpenseCredit(50_000_000, { general: 500_000, specific: 300_000, premature: 200_000, infertility: 4_000_000 });
  assert.equal(r.floor, 1_500_000);
  assert.equal(r.generalBase, 0);
  assert.equal(r.specificBase, 0);
  assert.equal(r.prematureBase, 0);
  assert.equal(r.infertilityBase, 3_500_000);
  assert.equal(r.credit, 1_050_000);
  assert.equal(r.withLocal, 1_155_000);
});

test("general expenses are capped at 7 million after the floor", () => {
  const r = medicalExpenseCredit(40_000_000, { general: 10_000_000 });
  assert.equal(r.generalBase, 7_000_000);
  assert.equal(r.credit, 1_050_000);
  assert.equal(medicalFloor(40_000_000), 1_200_000);
});
