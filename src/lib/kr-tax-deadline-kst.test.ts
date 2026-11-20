// Regression (2026-11-21): tax-type deadlines came out one day early in a Korean browser (UTC+9)
// because a UTC-midnight date went through local-time holiday rolling and back through toISOString.
// This file pins the process to Asia/Seoul, where users actually are; CI otherwise runs in UTC.
process.env.TZ = "Asia/Seoul";
import assert from "node:assert/strict";
import { test } from "node:test";
import { krTaxDeadlineUTC } from "./kr-business-day.ts";
import { dueDate } from "./kr-expert-guide-2026.ts";

const utc = (s: string) => new Date(`${s}T00:00:00Z`);
const iso = (d: Date) => d.toISOString().slice(0, 10);

test("runs in Asia/Seoul", () => assert.equal(new Date(Date.UTC(2026, 0, 1)).getHours(), 9));
test("UTC helper keeps a business day", () => assert.equal(iso(krTaxDeadlineUTC(utc("2026-11-12"))), "2026-11-12"));
test("UTC helper rolls a Sunday to Monday", () => assert.equal(iso(krTaxDeadlineUTC(utc("2027-01-31"))), "2027-02-01"));
test("UTC helper skips 설날 and its substitute", () => assert.equal(iso(krTaxDeadlineUTC(utc("2027-02-06"))), "2027-02-10"));
test("dueDate tax rule on a weekday is not moved", () => assert.deepEqual(dueDate({ days: 10, tax: true }, "2026-11-02"), { due: "2026-11-12", nominal: "2026-11-12", shifted: false }));
test("dueDate tax rule on a Sunday moves to Monday", () => assert.deepEqual(dueDate({ days: 90, tax: true }, "2026-11-02"), { due: "2027-02-01", nominal: "2027-01-31", shifted: true }));
test("tax and civil rules agree on the same Sunday", () => assert.equal(dueDate({ days: 90, tax: true }, "2026-11-02")?.due, dueDate({ days: 90 }, "2026-11-02")?.due));
