import { test } from "node:test";
import assert from "node:assert/strict";
import { contractCheck, dependentCheck, requiredClauses, supportTest } from "./kr-office-checks-2026.ts";

test("근로계약서 필수 항목: 정규 7·기간제 9·단시간 10", () => {
  assert.equal(requiredClauses("regular").length, 7);
  assert.equal(requiredClauses("fixedTerm").length, 9);
  assert.equal(requiredClauses("partTime").length, 10);
  const r = contractCheck({ kind: "partTime", written: ["wage", "hours"], handedOver: false, weeklyHours: 10 });
  assert.ok(r.missing.includes("workdays"));
  assert.ok(r.items.some((i) => i.cite.includes("제24조②2")));
  assert.ok(r.items.some((i) => i.cite.includes("제18조③")));
  const ok = contractCheck({ kind: "regular", written: requiredClauses("regular"), handedOver: true });
  assert.equal(ok.missing.length, 0);
  assert.ok(!ok.items.some((i) => i.text.includes("벌금")));
});

test("피부양자 부양요건(별표 1)", () => {
  assert.equal(supportTest("spouse", false).result, "yes");
  assert.equal(supportTest("parent", true).result, "yes");
  assert.equal(supportTest("parent", false).result, "cond");
  assert.equal(supportTest("childSpouse", false).result, "no");
  assert.equal(supportTest("spouseChild", false).result, "no");
  assert.equal(supportTest("sibling", true).result, "cond");
});

test("피부양자 소득·재산(별표 1의2)", () => {
  const base = { relation: "parent" as const, livingTogether: true, annualIncome: 20_000_000, businessIncome: 0, bizRegistered: false, propertyTaxBase: 540_000_000 };
  assert.equal(dependentCheck(base).ok, true);
  assert.equal(dependentCheck({ ...base, annualIncome: 20_000_001 }).ok, false);
  assert.equal(dependentCheck({ ...base, propertyTaxBase: 600_000_000 }).ok, false);
  assert.equal(dependentCheck({ ...base, propertyTaxBase: 600_000_000, annualIncome: 10_000_000 }).ok, true);
  assert.equal(dependentCheck({ ...base, businessIncome: 5_000_000 }).ok, true);
  assert.equal(dependentCheck({ ...base, businessIncome: 5_000_000, bizRegistered: true }).ok, false);
  assert.equal(dependentCheck({ ...base, relation: "sibling", propertyTaxBase: 180_000_001 }).ok, false);
});
