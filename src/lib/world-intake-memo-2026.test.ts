import test from "node:test";
import assert from "node:assert/strict";
import { INTAKE, buildIntakeMemo } from "./world-intake-memo-2026.ts";

test("six countries with three areas each, in the local language", () => {
  assert.deepEqual(Object.keys(INTAKE), ["jp", "us", "uk", "de", "fr", "es"]);
  for (const p of Object.values(INTAKE)) assert.deepEqual(p.areas.map((a) => a.id), ["tax", "labor", "family"]);
  assert.ok(buildIntakeMemo({ country: "de", area: "labor" }).memo.startsWith("Notiz zum Erstgespräch"));
});

test("answered and open items split; parties listed for the conflict check", () => {
  const q = INTAKE.jp.common[0];
  const r = buildIntakeMemo({ country: "jp", area: "tax", client: "山田", date: "2026-11-24", answers: { [q]: "還付申告\n医療費" }, parties: "A社、B氏" });
  assert.deepEqual(r.answered, [q]);
  assert.equal(r.open.length, r.questions.length - 1);
  assert.ok(r.memo.includes(`- ${q}: 還付申告 / 医療費`));
  assert.ok(r.memo.includes("利益相反の確認が必要な相手方: A社, B氏"));
  assert.ok(buildIntakeMemo({ country: "us", area: "x", date: "bad" }).memo.includes("Date: -"));
  assert.ok(buildIntakeMemo({ country: "us", area: "x" }).memo.includes("No other party named"));
});
