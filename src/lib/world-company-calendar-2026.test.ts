import { test } from "node:test";
import assert from "node:assert/strict";
import { addMonths, jpCompanyCalendar, ukCompanyCalendar, usCompanyCalendar, frCompanyCalendar } from "./world-company-calendar-2026.ts";

const by = (r: { dates: { id: string; date: string }[] }) => Object.fromEntries(r.dates.map((d) => [d.id, d.date]));
test("addMonths month end", () => {
  assert.equal(addMonths("2026-03-31", 2), "2026-05-31");
  assert.equal(addMonths("2026-02-28", 2), "2026-04-30");
  assert.equal(addMonths("2026-01-15", 1), "2026-02-15");
});
test("jp: March year end", () => {
  const r = by(jpCompanyCalendar({ yearEnd: "2026-03-31", consumptionTax: true }));
  assert.equal(r.corp, "2026-06-01"); // 5/31 is Sunday
  assert.equal(r.interim, "2025-12-01"); // 2025-11-30 is a Sunday
  assert.equal(r.ct, "2026-06-01");
  const e = by(jpCompanyCalendar({ yearEnd: "2026-12-31", consumptionTax: true, extensionFiled: true }));
  assert.equal(e.ct, "2027-03-31");
});
test("uk: deadlines", () => {
  const r = by(ukCompanyCalendar({ yearEnd: "2026-03-31" }));
  assert.equal(r.accounts, "2026-12-31");
  assert.equal(r.ctpay, "2027-01-01");
  assert.equal(r.ct600, "2027-03-31");
  assert.equal(by(ukCompanyCalendar({ yearEnd: "2026-03-31", firstAccounts: true, incorporated: "2025-04-10" })).accounts, "2027-01-10");
});
test("us: 1120 and June", () => {
  const r = by(usCompanyCalendar({ yearEnd: "2026-12-31", entity: "ccorp" }));
  assert.equal(r["1120"], "2027-04-15");
  assert.equal(r.ext, "2027-10-15");
  assert.equal(by(usCompanyCalendar({ yearEnd: "2026-03-31", entity: "ccorp" }))["1120"], "2026-07-15");
  const j = by(usCompanyCalendar({ yearEnd: "2026-06-30", entity: "ccorp" }));
  assert.equal(j["1120"], "2026-09-15");
  assert.equal(j.ext, "2027-04-15");
  assert.equal(by(usCompanyCalendar({ yearEnd: "2026-12-31", entity: "scorp" }))["1120s"], "2027-03-15");
});
test("fr: approval and greffe", () => {
  const r = by(frCompanyCalendar({ yearEnd: "2024-12-31" }));
  assert.equal(r.ag, "2025-06-30");
  assert.equal(r.greffe, "2025-07-31");
  assert.equal(by(frCompanyCalendar({ yearEnd: "2024-12-31", approvedOn: "2025-05-20", online: true })).greffe, "2025-07-20");
});
