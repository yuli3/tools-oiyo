import { test } from "node:test";
import assert from "node:assert/strict";
import { frEInvoice, jpInvoiceTransition, jpTransitionRate, esVerifactu } from "./world-einvoice-pack-2026.ts";

test("fr: sizes", () => {
  const p = frEInvoice({ size: "pme", today: "2026-11-22" });
  assert.equal(p.dates[1].date, "2027-09-01");
  assert.deepEqual(p.now, { receive: true, issue: false });
  assert.equal(frEInvoice({ size: "eti", today: "2026-11-22" }).now.issue, true);
});
test("jp: transition rates", () => {
  assert.equal(jpTransitionRate("2026-09-30"), 80);
  assert.equal(jpTransitionRate("2026-10-01"), 70);
  assert.equal(jpTransitionRate("2029-01-01"), 50);
  assert.equal(jpTransitionRate("2031-09-30"), 30);
  assert.equal(jpTransitionRate("2031-10-01"), 0);
  const r = jpInvoiceTransition({ purchaseDate: "2026-11-22", taxAmount: 10_000 });
  assert.equal(r.deductible, 7_000);
  assert.equal(r.notDeductible, 3_000);
});
test("es: verifactu", () => {
  assert.equal(esVerifactu({ sociedades: true }).due, "2027-01-01");
  assert.equal(esVerifactu({ sociedades: false }).due, "2027-07-01");
  assert.equal(esVerifactu({ sociedades: true, sii: true }).applies, false);
  assert.equal(esVerifactu({ sociedades: false, usesSoftware: false }).due, null);
});
