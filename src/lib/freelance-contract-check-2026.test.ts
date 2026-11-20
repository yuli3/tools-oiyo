import { test } from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_CONTRACT, checkContract, contractPay } from "./freelance-contract-check-2026.ts";

test("예시 계약서: 빠진 항목과 조심할 문장", () => {
  const r = checkContract(SAMPLE_CONTRACT, { creative: true });
  assert.equal(r.required, 13);
  assert.deepEqual(r.missing.map((m) => m.id), ["acceptance", "portfolio", "liability", "dispute"]);
  assert.deepEqual(r.flags.map((f) => f.id), ["allRights", "unlimitedRevision", "payAfterClient", "oneSidedTermination", "workerLike"]);
});

test("저작권 결과물이 아니면 권리 항목은 세지 않고 안내만", () => {
  const r = checkContract(SAMPLE_CONTRACT);
  assert.equal(r.required, 11);
  assert.ok(!r.items.some((i) => i.id === "ip"));
  assert.ok(r.notes.some((n) => n.includes("저작권이 생기는")));
});

test("받을 돈: 3.3%와 부가세", () => {
  const w = contractPay(3_000_000);
  assert.equal(w?.incomeTax, 90_000);
  assert.equal(w?.localTax, 9_000);
  assert.equal(w?.receive, 2_901_000);
  const v = contractPay(3_000_000, true);
  assert.equal(v?.vat, 300_000);
  assert.equal(v?.receive, 3_300_000);
  assert.equal(contractPay(0), null);
});

test("지급 기한 60일 넘으면 알려요", () => {
  const r = checkContract("대금은 결과물을 넘긴 날부터 90일 이내 지급한다.", {}, 1_000_000);
  assert.equal(r.payWithinDays, 90);
  assert.ok(r.notes.some((n) => n.includes("60일")));
  assert.equal(r.pay?.receive, 967_000);
});

test("사업자 문구 어긋남", () => {
  assert.ok(checkContract("금액 100만 원, 부가세 별도", {}).notes.some((n) => n.includes("사업자등록이 없으면")));
  assert.ok(checkContract("3.3% 원천징수", { registered: true }).notes.some((n) => n.includes("일반과세자")));
});

test("빈 글", () => {
  const r = checkContract("");
  assert.equal(r.found, 0);
  assert.equal(r.flags.length, 0);
  assert.equal(r.pay, null);
});
