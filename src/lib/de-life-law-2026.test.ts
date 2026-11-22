import { test } from "node:test";
import assert from "node:assert/strict";
import { erbschaftsteuer, mietkaution, pfaendung, verjaehrung, widerruf } from "./de-life-law-2026.ts";

test("Widerruf, Kaution, Verjährung", () => {
  const w = widerruf({ start: "2026-11-02", kind: "goods" });
  assert.ok(w.ok && w.deadline === "2026-11-16" && w.latest === "2027-11-16");
  assert.equal(mietkaution({ coldRent: 800, asked: 3000 }).max, 2400);
  assert.equal(mietkaution({ coldRent: 800, asked: 3000 }).over, 600);
  const v = verjaehrung({ arose: "2026-03-10" });
  assert.ok(v.ok && v.end === "2029-12-31");
  const late = verjaehrung({ arose: "2020-01-15", known: "2029-06-01" });
  assert.ok(late.ok && late.end === "2030-01-15"); // 10-year cap is earlier than 2032-12-31
});

test("Pfändung 2026 and Erbschaftsteuer", () => {
  assert.equal(pfaendung({ net: 1_500 }).seizable, 0);
  // 2,000 € net, no dependants: 7/10 of (2,000 − 1,587.40)
  assert.equal(pfaendung({ net: 2_000 }).seizable, 288.82);
  assert.equal(pfaendung({ net: 2_000, dependents: 1 }).seizable, 0);
  // above the cap the excess is fully seizable
  const hi = pfaendung({ net: 6_000 });
  assert.equal(hi.seizable, Math.round(((4_866.30 - 1_587.40) * 0.7 + (6_000 - 4_866.30)) * 100) / 100);
  assert.equal(erbschaftsteuer({ value: 1_000_000, relation: "child" }).tax, 90_000);
  const h = erbschaftsteuer({ value: 1_010_000, relation: "child" });
  assert.equal(h.tax, 95_000);
  assert.equal(h.hardship, true);
  assert.equal(erbschaftsteuer({ value: 100_000, relation: "other" }).tax, 24_000);
});
