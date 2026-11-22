import { test } from "node:test";
import assert from "node:assert/strict";
import { deKleinunternehmer, sgGstRegistration } from "./world-small-business-vat-2026.ts";

test("small business VAT registration", () => {
  assert.equal(deKleinunternehmer({ priorYear: 20_000, currentYear: 60_000 }).status, "kleinunternehmer");
  assert.equal(deKleinunternehmer({ priorYear: 30_000, currentYear: 20_000 }).status, "regelbesteuerung");
  assert.equal(deKleinunternehmer({ priorYear: 20_000, currentYear: 120_000 }).status, "wechsel_unterjaehrig");
  assert.equal(deKleinunternehmer({ priorYear: 0, currentYear: 10_000, optedOut: true }).status, "verzicht");
  const sg = sgGstRegistration({ forecastNext12: 1_200_000, forecastDate: "2026-09-02" });
  assert.ok(sg.liable && sg.applyBy === "2026-10-02" && sg.registeredFrom === "2026-11-02");
  assert.equal(sgGstRegistration({ calendarYearTurnover: 900_000, forecastNext12: 800_000 }).liable, false);
  assert.equal(sgGstRegistration({ calendarYearTurnover: 1_000_001 }).retrospective, true);
  assert.equal(sgGstRegistration({ forecastNext12: 1_500_000, forecastDate: "2026-12-31" }).registeredFrom, "2027-02-28");
});
