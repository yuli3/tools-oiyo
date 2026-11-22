import { test } from "node:test";
import assert from "node:assert/strict";
import { caLimitation, cnSmallClaims, frLimitation, jpLimitation, twLimitation, ukClaimFee, ukLimitation } from "./world-limitation-pack-2026.ts";

test("Japan: earlier of 5 years from knowledge and 10 years from exercisable; 60万円 small claims", () => {
  const r = jpLimitation({ claim: "general", knew: "2022-04-01", couldExercise: "2021-04-01", amount: 500_000, today: "2027-04-02" });
  assert.equal(r.deadline, "2027-04-01");
  assert.equal(r.status, "expired");
  assert.equal(jpLimitation({ claim: "tort", knew: "2025-01-10" }).deadline, "2028-01-10");
});

test("England: 6 years contract, 3 years injury from later knowledge; fees", () => {
  assert.equal(ukLimitation({ claim: "contract", accrued: "2020-02-29" }).deadline, "2026-02-28");
  assert.equal(ukLimitation({ claim: "injury", accrued: "2024-01-01", knowledge: "2025-06-01" }).deadline, "2028-06-01");
  assert.equal(ukClaimFee(800), 70);
  assert.equal(ukClaimFee(20_000), 1_000);
  assert.equal(ukClaimFee(300_000), 10_000);
});

test("California: written 4, oral 2, injury 2", () => {
  assert.equal(caLimitation({ claim: "writtenContract", start: "2023-05-01" }).deadline, "2027-05-01");
  assert.equal(caLimitation({ claim: "injury", start: "2025-11-01", today: "2026-11-22" }).status, "open");
});

test("France: 5 ans principe, 2 ans pro contre consommateur", () => {
  assert.equal(frLimitation({ claim: "general", start: "2021-11-22" }).deadline, "2026-11-22");
  assert.equal(frLimitation({ claim: "proConsommateur", start: "2025-01-15" }).deadline, "2027-01-15");
});

test("Taiwan: 15/5/2 years; China small-claims 50% of average wage", () => {
  assert.equal(twLimitation({ claim: "shortTwoYear", start: "2025-03-01" }).deadline, "2027-03-01");
  assert.equal(cnSmallClaims({ amount: 50_000, provincialAverageWage: 120_000 }).route, "small");
  assert.equal(cnSmallClaims({ amount: 100_000, provincialAverageWage: 120_000 }).route, "byAgreement");
  assert.equal(cnSmallClaims({ amount: 300_000, provincialAverageWage: 120_000 }).route, "ordinary");
});
