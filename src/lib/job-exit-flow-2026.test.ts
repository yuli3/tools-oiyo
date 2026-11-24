import test from "node:test";
import assert from "node:assert/strict";
import { buildJobExitFlow, parseCaseFile, toCaseFile } from "./job-exit-flow-2026.ts";

test("dismissed with unpaid wages gathers the three desks without duplicate tools", () => {
  const r = buildJobExitFlow({ how: "dismissed", unpaid: "both", written: "no", size: "under5", start: "2023-03-02", last: "2026-10-31", amount: 6000000 });
  assert.deepEqual(r.desks.map((d) => d.id), ["dismissal", "unpaid", "quit"]);
  assert.equal(new Set(r.tools.map((t) => t.href)).size, r.tools.length);
  assert.ok(r.laws.includes("근로기준법 제28조"));
  assert.ok(r.checks.some((c) => c.includes("효력이 없어요")));
  assert.ok(r.checks.some((c) => c.includes("5명 미만")));
  assert.ok(r.memo.includes("- 2023-03-02 입사"));
  assert.ok(r.memo.includes("6,000,000원"));
  assert.ok(r.memo.includes("9. 무료 창구"));
});

test("still working with no unpaid money has no desk; case file round-trips and rejects junk", () => {
  assert.equal(buildJobExitFlow({ how: "working", unpaid: "none" }).desks.length, 0);
  const f = toCaseFile({ how: "resign", unpaid: "wage" }, new Date("2026-11-24T00:00:00Z"));
  assert.deepEqual(parseCaseFile(JSON.stringify(f)), f);
  assert.equal(parseCaseFile("{bad"), null);
  assert.equal(parseCaseFile(JSON.stringify({ flow: "job-exit", input: { how: "x", unpaid: "none" } })), null);
});
