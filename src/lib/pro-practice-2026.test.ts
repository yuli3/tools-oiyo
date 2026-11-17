import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeEntries, claimPlain, claimResult, csmBridge, csmPlain, csmResult, dutyPlain, dutyResult, fineBridge, finePlain, fineResult,
  kicsBridge, kicsPlain, kicsResult, parseEntries, BENFORD, SAMPLE_ENTRIES,
} from "./pro-practice-2026.ts";

const noBad = (o: { headline: string; reasons: string[] }) => assert.doesNotMatch(o.headline + o.reasons.join(""), /NaN|undefined|Infinity/);

test("과태료: 자진납부 20%, 약자 50%, 가산금 3% + 매월 1.2% 60개월 한도", () => {
  const F = { fine: 500_000, noticeDate: "2026-11-02", opinionDays: 10, when: "early" as const, monthsLate: 0, vulnerable: false };
  assert.equal(fineResult(F).pay, 400_000);
  assert.equal(fineResult(F).opinionDue, "2026-11-12");
  assert.equal(fineResult({ ...F, vulnerable: true }).pay, 250_000, "큰 감경 하나만");
  assert.equal(fineResult({ ...F, when: "due" }).pay, 500_000);
  const late = fineResult({ ...F, when: "late", monthsLate: 10 });
  assert.equal(late.addOn, 15_000);
  assert.equal(late.heavy, 60_000);
  assert.equal(late.pay, 575_000);
  assert.equal(fineResult({ ...F, when: "late", monthsLate: 99 }).pay, 500_000 + 15_000 + 360_000, "총 75%");
  const b = fineBridge({ ...F, when: "late", monthsLate: 10 });
  assert.equal(b.at(-1)!.value, b.slice(0, -1).reduce((a, x) => a + x.value, 0));
  noBad(finePlain({ ...F, vulnerable: true }));
});

test("관세: CIF×세율, 부가세는 (과세가격+관세)×10%, FTA는 원산지증명 있을 때만, 직구 면세", () => {
  const D = { price: 1000, freight: 50, insurance: 0, fx: 1400, baseRate: 0.13, ftaRate: 0, hasOrigin: true, personal: false, fromUS: true };
  const r = dutyResult(D);
  assert.equal(r.cif, 1_470_000);
  assert.equal(r.base.duty, 191_100);
  assert.equal(r.base.vat, 166_110);
  assert.equal(r.fta.total, 147_000);
  assert.equal(r.saving, 191_100 + 166_110 - 147_000);
  assert.equal(dutyResult({ ...D, hasOrigin: false }).chosen.total, r.base.total);
  assert.equal(dutyResult({ ...D, personal: true, price: 190 }).exempt, true);
  assert.equal(dutyResult({ ...D, personal: true, price: 190, fromUS: false }).exempt, false);
  noBad(dutyPlain(D));
});

test("IFRS 17: 이익 계약은 CSM, 손실 계약은 손실요소, 풀림 합 = CSM + 이자", () => {
  const C = { premium: 1_000_000, years: 10, claims: 600_000, expense: 100_000, acquisition: 300_000, rate: 0.03, ra: 0.05 };
  const r = csmResult(C);
  assert.ok(r.csm > 0 && r.loss === 0);
  const rel = r.release.reduce((a, x) => a + x.released, 0);
  const acc = r.release.reduce((a, x) => a + x.accrete, 0);
  assert.ok(Math.abs(rel - (r.csm + acc)) < 1e-3);
  assert.ok(Math.abs(r.release.at(-1)!.close) < 1e-6);
  const b = csmBridge(C);
  assert.ok(Math.abs(b.at(-1)!.value - b.slice(0, -1).reduce((a, x) => a + x.value, 0)) < 1e-6);
  const bad = csmResult({ ...C, claims: 1_000_000 });
  assert.ok(bad.loss > 0 && bad.csm === 0);
  assert.notEqual(csmResult({ ...C, rate: 0.05 }).csm, r.csm);
  noBad(csmPlain(C));
  noBad(csmPlain({ ...C, claims: 1_000_000 }));
});

test("K-ICS: 분산효과로 요구자본이 단순합보다 작고, 구간을 판정해요", () => {
  const K = { available: 300e9, life: 100e9, nonlife: 0, market: 100e9, credit: 0, operational: 10e9, taxAdj: 0 };
  const r = kicsResult(K);
  assert.ok(Math.abs(r.basic - Math.sqrt(100e9 ** 2 * 2 + 2 * 0.25 * 100e9 * 100e9)) < 1);
  assert.ok(r.diversification > 0);
  assert.equal(r.level, "ok");
  assert.equal(kicsResult({ ...K, available: 100e9 }).level, "advise");
  assert.equal(kicsResult({ ...K, available: 50e9 }).level, "demand");
  assert.equal(kicsResult({ ...K, available: -1 }).level, "order");
  const b = kicsBridge(K);
  assert.ok(Math.abs(b.at(-1)!.value - r.required) < 1);
  noBad(kicsPlain(K));
});

test("보험금: 장해 지급률 합산 100% 한도·기왕장해 차감, 과실상계·자기부담·한도", () => {
  const base = { kind: "disability" as const, sum: 100_000_000, rates: [0.5, 0.25, 0], prior: 0, damage: 0, fault: 0, deductible: 0, limit: 0 };
  assert.equal(claimResult(base).pay, 75_000_000);
  assert.equal(claimResult({ ...base, rates: [0.5, 0.5, 0.25] }).pay, 100_000_000);
  assert.equal(claimResult({ ...base, prior: 0.25 }).pay, 50_000_000);
  const f = { ...base, kind: "fault" as const, damage: 10_000_000, fault: 0.3, deductible: 200_000, limit: 0 };
  assert.equal(claimResult(f).pay, 6_800_000);
  assert.equal(claimResult({ ...f, limit: 5_000_000 }).pay, 5_000_000);
  noBad(claimPlain(base));
  noBad(claimPlain(f));
});

test("전표 분석: 예시 데이터에서 중복·결재 한도 아래·주말·끝자리 0을 찾아요", () => {
  assert.ok(Math.abs(BENFORD.reduce((a, b) => a + b, 0) - 1) < 1e-9);
  const { rows, skipped } = parseEntries("날짜,계정,금액\n" + SAMPLE_ENTRIES);
  assert.equal(skipped, 1);
  assert.equal(rows.length, 12);
  const a = analyzeEntries(rows, { approvalLimit: 5_000_000 });
  assert.equal(a.total.duplicate, 2);
  assert.equal(a.total.belowLimit, 3, "4,980,000 두 건 + 4,990,000");
  assert.equal(a.total.weekend, 3, "3/7 토요일 두 건, 3/15 일요일");
  assert.equal(a.total.round, 2);
  assert.ok(a.flagged[0].flags.duplicate || a.flagged[0].flags.belowLimit);
  assert.equal(parseEntries("2026.3.5\t복리후생비\t1,200원").rows[0].amount, 1200);
});
