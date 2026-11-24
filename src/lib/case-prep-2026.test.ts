import test from "node:test";
import assert from "node:assert/strict";
import { CASE_FLOWS, buildCasePrep, parseCasePrepFile, toCasePrepFile, caseFileKey } from "./case-prep-2026.ts";

test("deposit: moved out without lease registration warns and builds memo", () => {
  const r = buildCasePrep("deposit", { answers: { stage: "moved", fixed: "no", lease: "no", guarantee: "yes", house: "auction" }, dates: { end: "2026-10-31", moveout: "2026-11-02" }, amount: 200000000 });
  assert.ok(r.checks.some((c) => c.includes("원래 순위를 잃었을 수")));
  assert.ok(r.checks.some((c) => c.includes("우선변제권")));
  assert.ok(r.checks.some((c) => c.includes("배당요구 종기")));
  assert.ok(r.checks.some((c) => c.includes("이행청구")));
  assert.ok(r.memo.includes("- 2026-10-31 계약 만료(예정)"));
  assert.ok(r.memo.includes("200,000,000원"));
  assert.ok(r.memo.includes("10. 무료 창구"));
  assert.ok(!r.tools.some((t) => t.href === "/ko/deposit-return-consult-prep/"));
  assert.equal(new Set(r.tools.map((t) => t.href)).size, r.tools.length);
});

test("lend: small claim, no address, admitted debt", () => {
  const r = buildCasePrep("lend", { answers: { kind: "loan", proof: "transfer", debtor: "noaddr", admitted: "yes" }, amount: 5000000 });
  assert.ok(r.checks.some((c) => c.includes("소액사건")));
  assert.ok(r.checks.some((c) => c.includes("공시송달")));
  assert.ok(r.checks.some((c) => c.includes("제168조")));
  assert.ok(r.laws.includes("민법 제174조"));
  const w = buildCasePrep("lend", { answers: { kind: "wage", proof: "note", debtor: "reach", admitted: "no" } });
  assert.ok(w.checks[0].includes("퇴사·해고·체불"));
  assert.ok(!w.checks.some((c) => c.includes("내용증명은")));
});

test("rejects incomplete answers; case file round-trips per flow", () => {
  assert.throws(() => buildCasePrep("lend", { answers: { kind: "loan" } }));
  for (const id of ["deposit", "lend"] as const) for (const q of CASE_FLOWS[id].questions) assert.ok(q.choices.length >= 2);
  const input = { answers: { kind: "trade", proof: "none", debtor: "hide", admitted: "unknown" } };
  const f = toCasePrepFile("lend", input, new Date("2026-11-24T00:00:00Z"));
  assert.deepEqual(parseCasePrepFile("lend", JSON.stringify(f)), f);
  assert.equal(parseCasePrepFile("deposit", JSON.stringify(f)), null);
  assert.equal(parseCasePrepFile("lend", "{bad"), null);
  assert.notEqual(caseFileKey("lend"), "oiyo-case-v1");
});
