import { test } from "node:test";
import assert from "node:assert/strict";
import { lateInterest, ukCompensation } from "./world-late-payment-2026.ts";

test("B2B late payment interest", () => {
  const de = lateInterest({ country: "DE", amount: 10_000, due: "2026-08-01", paid: "2026-08-31" });
  assert.ok(de.ok);
  assert.equal(de.interest, Math.round(10_000 * 0.1052 * 30 / 365 * 100) / 100);
  assert.equal(de.compensation, 40);
  const fr = lateInterest({ country: "FR", amount: 10_000, due: "2026-06-21", paid: "2026-07-11" });
  assert.ok(fr.ok && fr.segments.length === 2 && fr.segments[0].rate === 12.15 && fr.segments[1].rate === 12.4);
  const es = lateInterest({ country: "ES", amount: 1_000, due: "2026-09-01", paid: "2026-10-01" });
  assert.ok(es.ok && es.compensation === 0 && es.segments[0].rate === 10.4);
  const uk = lateInterest({ country: "UK", amount: 5_000, due: "2026-09-01", paid: "2026-12-10", baseRate: 3.75 });
  assert.ok(uk.ok && uk.compensation === 70 && uk.segments[0].rate === 11.75);
  assert.equal(lateInterest({ country: "UK", amount: 5_000, due: "2026-09-01", paid: "2026-12-10" }).ok, false);
  assert.equal(ukCompensation(999.99), 40);
  assert.equal(ukCompensation(10_000), 100);
  const consumer = lateInterest({ country: "DE", amount: 1_000, due: "2026-08-01", paid: "2026-08-31", consumerDebtor: true });
  assert.ok(consumer.ok && consumer.segments[0].rate === 6.52 && consumer.compensation === 0);
});
