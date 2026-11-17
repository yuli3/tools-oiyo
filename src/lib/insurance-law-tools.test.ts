import test from "node:test";
import assert from "node:assert/strict";
import { premiumBridge, premiumPlain, premiumResult, qx, salesPlain, salesResult } from "./insurance-law-tools.ts";

const P = { sex: "m" as const, age: 40, term: 20, sum: 100_000_000, rate: 0.025, expense: 0.2, risk: 1 };

test("보험료 원리: 나이·기간·위험률이 오르면 비싸지고, 예정이율이 오르면 싸져요", () => {
  const r = premiumResult(P);
  assert.ok(Math.abs(qx(40, "m") - 0.0012) < 1e-9);
  assert.ok(Math.abs(qx(48, "m") / qx(40, "m") - 2) < 0.02, "8살마다 약 2배");
  assert.ok(Math.abs(r.gross - r.net / 0.8) < 1e-6);
  assert.ok(r.noInterest > r.net);
  assert.ok(premiumResult({ ...P, age: 50 }).gross > r.gross);
  assert.ok(premiumResult({ ...P, term: 30 }).gross > r.gross);
  assert.ok(premiumResult({ ...P, risk: 1.5 }).gross > r.gross);
  assert.ok(premiumResult({ ...P, rate: 0.035 }).gross < r.gross);
  assert.ok(premiumResult({ ...P, sex: "f" }).gross < r.gross);
  // 워터폴 마지막 = 영업보험료
  const b = premiumBridge(P);
  assert.ok(Math.abs(b[2].value - (b[0].value + b[1].value)) < 1e-6);
  assert.ok(Math.abs(b[4].value - (b[2].value + b[3].value)) < 1e-6);
  assert.doesNotMatch(premiumPlain(P).headline + premiumPlain(P).reasons.join(""), /NaN|undefined/);
});

test("모집 점검: 한도 10%·20만 원, 승환 판정이 결과 문장에 들어가요", () => {
  const s = { monthly: 100_000, months: 12, gift: 150_000, replace: true, oldEnd: "2026-10-01", newApply: "2026-10-15", compared: false };
  const r = salesResult(s);
  assert.equal(r.limit, 120_000);
  assert.equal(r.over, true);
  assert.equal(r.twist?.level, "deemed");
  assert.equal(salesResult({ ...s, monthly: 300_000 }).limit, 200_000);
  assert.equal(salesResult({ ...s, replace: false }).twist, null);
  assert.match(salesPlain(s).headline, /30,000원 많아요/);
  assert.match(salesPlain({ ...s, gift: 50_000 }).headline, /한도 안/);
});
