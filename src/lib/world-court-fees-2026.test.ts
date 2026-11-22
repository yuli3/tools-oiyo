import { test } from "node:test";
import assert from "node:assert/strict";
import { jpSuitFee, jpCourtFee, gkgFee, deCourtFee } from "./world-court-fees-2026.ts";

test("court fees", () => {
  assert.equal(jpSuitFee(100_000), 1_000);
  assert.equal(jpSuitFee(1_000_000), 10_000);
  assert.equal(jpSuitFee(5_000_000), 30_000);
  assert.equal(jpSuitFee(10_000_000), 50_000);
  assert.equal(jpSuitFee(100_000_000), 320_000);
  assert.equal(jpSuitFee(150_000), 2_000);
  const c = jpCourtFee({ value: 1_000_000, kind: "chotei" });
  assert.ok(c.ok && c.fee === 5_000);
  const s = jpCourtFee({ value: 10_000_000, kind: "shiharai", firstFiled: "2026-01-10" });
  assert.ok(s.ok && s.fee === 25_000 && !s.items.some((i) => i.text.includes("新法")));
  assert.equal(jpCourtFee({ value: 1_000_000, kind: "appeal" }).ok && jpCourtFee({ value: 1_000_000, kind: "appeal" }).fee, 15_000);
  assert.equal(jpCourtFee({ nonProperty: true }).ok && jpCourtFee({ nonProperty: true }).fee, 13_000);
  assert.equal(gkgFee(500), 40);
  assert.equal(gkgFee(1_000), 61);
  assert.equal(gkgFee(5_000), 170.5);
  assert.equal(gkgFee(10_000), 283);
  assert.equal(gkgFee(50_000), 638);
  assert.equal(gkgFee(100_000), 1_198);
  const d = deCourtFee({ value: 5_000 });
  assert.ok(d.ok && d.fee === 511.5);
  const m = deCourtFee({ value: 100, kind: "mahn" });
  assert.ok(m.ok && m.fee === 38);
});
