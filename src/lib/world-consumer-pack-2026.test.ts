import { test } from "node:test";
import assert from "node:assert/strict";
import { cnCoolingOff, esCoolingOff, frCoolingOff, jpCoolingOff, twCoolingOff, ukCoolingOff, usCoolingOff } from "./world-consumer-pack-2026.ts";

test("Japan: 8 days counting the receipt day, 20 for MLM, none for mail order", () => {
  assert.equal(jpCoolingOff({ kind: "visit", documentReceived: "2026-04-01" }).lastDay, "2026-04-08");
  assert.equal(jpCoolingOff({ kind: "mlm", documentReceived: "2026-04-01" }).lastDay, "2026-04-20");
  assert.equal(jpCoolingOff({ kind: "mailOrder" }).days, null);
});

test("UK: 14 days after delivery, extended 12 months when info missing", () => {
  assert.equal(ukCoolingOff({ kind: "goods", delivered: "2026-11-03" }).lastDay, "2026-11-17");
  assert.equal(ukCoolingOff({ kind: "services", contractDate: "2026-11-03", infoGiven: false }).lastDay, "2027-11-17");
  assert.equal(ukCoolingOff({ kind: "services", contractDate: "2026-11-03", infoGiven: false, infoDate: "2027-01-10" }).lastDay, "2027-01-24");
});

test("France: delivery 3 June → 17 June inclusive; weekend pushes to Monday; refund 14 days", () => {
  assert.equal(frCoolingOff({ kind: "biens", delivered: "2025-06-03" }).lastDay, "2025-06-17");
  const s = frCoolingOff({ kind: "biens", delivered: "2026-11-07", withdrawalSent: "2026-11-10" }); // ends Sat 21 Nov
  assert.equal(s.lastDay, "2026-11-23");
  assert.equal(s.dates.find((d) => d.id === "refund")!.date, "2026-11-24");
});

test("Spain: 14 natural days from receipt; 12-month extension", () => {
  assert.equal(esCoolingOff({ kind: "bienes", delivered: "2026-11-01" }).lastDay, "2026-11-15");
  assert.equal(esCoolingOff({ kind: "bienes", delivered: "2026-11-01", infoGiven: false }).lastDay, "2027-11-15");
});

test("China: 7 days from the day after signing; excluded goods get no deadline", () => {
  assert.equal(cnCoolingOff({ online: true, signedFor: "2026-11-11" }).lastDay, "2026-11-18");
  assert.equal(cnCoolingOff({ online: true, signedFor: "2026-11-11", excluded: "custom" }).lastDay, null);
  assert.equal(cnCoolingOff({ online: false }).days, null);
});

test("Taiwan: 7 days after receipt, Sunday rolls to Monday, refund 15 days", () => {
  assert.equal(twCoolingOff({ channel: "mail", received: "2026-11-10" }).lastDay, "2026-11-17");
  assert.equal(twCoolingOff({ channel: "mail", received: "2026-11-15" }).lastDay, "2026-11-23"); // 22 is Sunday
  assert.equal(twCoolingOff({ channel: "visit", received: "2026-11-10", noticeOrReturn: "2026-11-12" }).dates.find((d) => d.id === "refund")!.date, "2026-11-27");
  assert.equal(twCoolingOff({ channel: "store" }).days, null);
});

test("US: three business days (Saturday counts), thresholds $25/$130", () => {
  // Fri 2026-11-20 → Sat 21, (Sun 22 skipped), Mon 23, Tue 24
  assert.equal(usCoolingOff({ place: "home", price: 500, saleDate: "2026-11-20" }).lastDay, "2026-11-24");
  assert.equal(usCoolingOff({ place: "home", price: 20, saleDate: "2026-11-20" }).covered, false);
  assert.equal(usCoolingOff({ place: "temporary", price: 100, saleDate: "2026-11-20" }).covered, false);
  assert.equal(usCoolingOff({ place: "online", price: 500 }).covered, false);
});
