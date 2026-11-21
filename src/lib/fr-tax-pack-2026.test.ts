import { test } from "node:test";
import assert from "node:assert/strict";
import { frTaxCalendar, frMicro, frIncomeTax, frTvaFranchise, frPenalty, frClaimDeadline, frAmortissement, frShift, FR_SCOPE } from "./fr-tax-pack-2026.ts";

test("calendar", () => {
  const r = frTaxCalendar({ year: 2027, is: true, cfe: true, tva: "simplifie", today: "2027-03-01" });
  const by = Object.fromEntries(r.events.map((e) => [e.id, e]));
  assert.equal(by.is1.date, "2027-03-15");
  assert.equal(by.is3.date, "2027-09-15");
  assert.equal(by.cfe.date, "2027-12-15");
  assert.equal(by.is1.daysLeft, 14);
  assert.equal(by["tva-ac1"].month, "2027-07");
  assert.equal(frShift(new Date(Date.UTC(2029, 11, 15))).toISOString().slice(0, 10), "2029-12-17"); // Sat → Mon
});

test("barème 2025 and micro", () => {
  assert.equal(frIncomeTax(11_600), 0);
  assert.equal(frIncomeTax(29_579), Math.round((29_579 - 11_600) * 0.11));
  assert.equal(frIncomeTax(59_158, 2), Math.round((29_579 - 11_600) * 0.11 * 2));
  const r = frMicro({ activity: "services", ca: 50_000, rfr: 20_000, vl: true });
  assert.equal(r.social, 10_600);
  assert.equal(r.taxableMicro, 25_000);
  assert.equal(r.vlTax, 850);
  assert.equal(r.vlEligible, true);
  assert.equal(r.incomeTax, 850);
  assert.equal(r.baremeTax, frIncomeTax(25_000));
  const b = frMicro({ activity: "bnc", ca: 40_000, rfr: 40_000, vl: true });
  assert.equal(b.vlEligible, false);
  assert.equal(b.incomeTax, b.baremeTax);
  assert.equal(frMicro({ activity: "vente", ca: 100_000 }).social, 12_300);
  assert.ok(frMicro({ activity: "services", ca: 90_000, caPrev: 90_000, caPrev2: 85_000 }).items[0].text.includes("deux années"));
});

test("TVA franchise", () => {
  assert.equal(frTvaFranchise({ activity: "services", caPrev: 30_000, ca: 30_000 }).status, "franchise");
  assert.equal(frTvaFranchise({ activity: "services", caPrev: 30_000, ca: 40_000 }).status, "redevable-n1");
  assert.equal(frTvaFranchise({ activity: "services", caPrev: 30_000, ca: 42_000 }).status, "redevable-n");
  assert.equal(frTvaFranchise({ activity: "vente", caPrev: 86_000, ca: 10_000 }).status, "redevable-n");
});

test("penalties and réclamation", () => {
  const r = frPenalty({ tax: 10_000, fault: "defaut-apres-mise-en-demeure", due: "2027-05-15", paid: "2027-11-20" });
  assert.equal(r.months, 6);
  assert.equal(r.interest, 120);
  assert.equal(r.majoration, 4_000);
  assert.equal(frPenalty({ tax: 10_000, fault: "retard", months: 3 }).total, 1_060);
  assert.equal(frClaimDeadline({ eventYear: 2026 })[0].date, "2028-12-31");
  assert.equal(frPenalty({ tax: 1_000, fault: "retard-apres-mise-en-demeure", incomeTax: true }).majoration, 200);
  assert.equal(frPenalty({ tax: 1_000, fault: "retard-apres-mise-en-demeure" }).majoration, 100);
  assert.equal(frPenalty({ tax: 1_000, fault: "defaut-apres-mise-en-demeure", incomeTax: true }).majoration, 400);
  assert.ok(frClaimDeadline({ eventYear: 2026 }).some((x) => x.id === "tribunal"));
  assert.equal(frClaimDeadline({ eventYear: 2026, local: true })[0].date, "2027-12-31");
});

test("amortissement", () => {
  assert.equal(frAmortissement({ cost: 450, life: 3, start: "2026-05-01", toolUnder500: true }).method, "charge");
  const l = frAmortissement({ cost: 10_000, life: 5, start: "2026-07-01" });
  assert.equal(l.schedule[0].amount, Math.round(2_000 * 184 / 365));
  assert.equal(l.schedule.at(-1)!.vnc, 0);
  assert.equal(l.schedule.reduce((s, x) => s + x.amount, 0), 10_000);
  const d = frAmortissement({ cost: 10_000, life: 5, start: "2026-04-10", method: "degressif" });
  assert.equal(d.rate, 0.35);
  assert.equal(d.schedule[0].amount, 2_625); // 10 000 × 35 % × 9/12
  assert.equal(d.schedule[1].amount, 2_581); // 7 375 × 35 %
  assert.equal(d.schedule.length, 5);
  assert.equal(d.schedule.at(-1)!.vnc, 0);
  assert.ok(FR_SCOPE.some((x) => x.cite.includes("71-1130")));
  assert.equal(frAmortissement({ cost: 1_000, life: 2, start: "2026-01-01", method: "degressif" }).method, "lineaire");
});
