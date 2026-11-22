import { test } from "node:test";
import assert from "node:assert/strict";
import { cnTenancy, esTenancy, frLatePenalty, frTenancy, jpTenancy, twTenancy, ukTenancy, usLandlordDays, usTenancy } from "./world-tenancy-pack-2026.ts";

test("Japan: 3-month tenant notice, 6-month landlord notice, 1-month fixed-term exit", () => {
  const r = jpTenancy({ rent: 100_000, deposit: 200_000, lease: "ordinary", noticeDate: "2026-11-30" });
  assert.equal(r.depositMonths, 2);
  assert.equal(r.dates.find((d) => d.id === "tenant")!.date, "2027-02-28");
  assert.equal(r.dates.find((d) => d.id === "landlord")!.date, "2027-05-30");
  const f = jpTenancy({ rent: 100_000, deposit: 0, lease: "fixed", noticeDate: "2026-01-31" });
  assert.equal(f.dates[0].date, "2026-02-28");
});

test("England: 5-week cap under £50k, 6 weeks at £50k+, 30-day protection", () => {
  const r = ukTenancy({ monthlyRent: 1300, deposit: 1600, received: "2026-11-01", agreed: "2026-12-01" });
  assert.equal(r.capWeeks, 5);
  assert.equal(r.cap, 1500);
  assert.equal(r.over, 100);
  assert.equal(r.dates.find((d) => d.id === "protect")!.date, "2026-12-01");
  assert.equal(r.dates.find((d) => d.id === "return")!.date, "2026-12-11");
  assert.equal(ukTenancy({ monthlyRent: 5000, deposit: 0 }).capWeeks, 6);
});

test("US: CA 21 days / NY 14 days, landlord notice tiers", () => {
  const ca = usTenancy({ state: "CA", rent: 2000, deposit: 3000, moveOut: "2026-12-01", monthsLived: 18, region: "bay" });
  assert.equal(ca.cap, 2000);
  assert.equal(ca.landlordDays, 60);
  assert.equal(ca.maxIncreasePct, 8.8);
  assert.equal(ca.dates[0].date, "2026-12-22");
  assert.equal(usTenancy({ state: "CA", rent: 2000, deposit: 0, monthsLived: 1, smallLandlord: true }).cap, 4000);
  const ny = usTenancy({ state: "NY", rent: 2000, deposit: 2000, moveOut: "2026-12-01", monthsLived: 6, leaseMonths: 12, nycStabilized: true, leaseStart: "2026-10-15" });
  assert.equal(ny.landlordDays, 60);
  assert.equal(ny.maxIncreasePct, 0);
  assert.equal(ny.dates[0].date, "2026-12-15");
  assert.equal(usLandlordDays("NY", 30), 90);
  assert.equal(usLandlordDays("CA", 3, true), 90);
});

test("France: 1/2 months return, 10% per started month late, IRL cap", () => {
  const r = frTenancy({ lease: "vide", rentHC: 1000, deposit: 1000, keysReturned: "2026-10-15", sameInventory: true, refundedOn: "2026-12-20", revisionClause: true, quarter: "T3 2026" });
  assert.equal(r.due, "2026-11-15");
  assert.equal(r.late, 35);
  assert.equal(r.penalty, 200);
  assert.equal(r.newRent, 1015.7);
  assert.equal(frLatePenalty(1000, 1), 100);
  assert.equal(frTenancy({ lease: "meuble", rentHC: 800, deposit: 2000, sameInventory: false }).capMonths, 2);
});

test("Spain: 5/7-year term, 30 days but not before 6 months, 1-month deposit return", () => {
  const r = esTenancy({ rent: 900, fianza: 900, extraGuarantee: 1800, start: "2026-03-01", company: false, keysReturned: "2026-12-10", noticeDate: "2026-04-01" });
  assert.equal(r.dates.find((d) => d.id === "min-term")!.date, "2031-03-01");
  assert.equal(r.dates.find((d) => d.id === "tenant")!.date, "2026-09-01");
  assert.equal(r.dates.find((d) => d.id === "return")!.date, "2027-01-10");
  assert.equal(r.max2, 918);
  assert.equal(esTenancy({ rent: 900, fianza: 900, extraGuarantee: 0, start: "2026-03-01", company: true }).years, 7);
});

test("China 20-year limit and Taiwan 2-month deposit cap", () => {
  assert.equal(cnTenancy({ termMonths: 300, written: true, deposit: 0, rent: 1 }).validMonths, 240);
  const tw = twTenancy({ rent: 20_000, deposit: 50_000, noticeDate: "2026-11-01", rebuild: true });
  assert.equal(tw.cap, 40_000);
  assert.equal(tw.dates.find((d) => d.id === "landlord")!.date, "2027-02-01");
});
