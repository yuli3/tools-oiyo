import test from "node:test";
import assert from "node:assert/strict";
import * as P from "./kr-pension-scenarios.ts";

test("연금 세액공제: 600만·900만 한도와 5,500만 경계", () => {
  const i: P.PensionCreditLite = { type: "earned", income: 50_000_000, savings: 8_000_000, irp: 3_000_000 };
  const r = P.pensionCreditOf(i);
  assert.equal(r.savingsCounted, 6_000_000);
  assert.equal(r.base, 9_000_000);
  assert.equal(r.refund, 1_485_000);
  assert.equal(P.pensionRefund({ ...i, income: 55_000_001 }), 1_188_000);
  assert.equal(P.pensionRefund({ ...i, type: "comprehensive", income: 50_000_000 }), 1_188_000);
  assert.equal(P.pensionCreditOf({ ...i, savings: 3_000_000, irp: 0 }).room, 6_000_000);
});

test("ISA vs 연금: 공제율이 높을수록 연금 쪽이 유리해져요", () => {
  const i: P.IsaPensionLite = { annual: 9_000_000, years: 10, ret: 0.06, income: 50_000_000, type: "normal" };
  const r = P.isaPensionResult(i);
  assert.equal(r.pension.credits, 1_485_000 * 10);
  assert.ok(r.isa.gain > 0 && r.isa.tax === Math.floor((r.isa.gain - 2_000_000) * 0.099));
  assert.ok(P.isaPensionGap(i) > P.isaPensionGap({ ...i, income: 80_000_000 }));
  assert.equal(P.isaPensionCompare(i).filter((x) => x.current).length >= 1, true);
});

test("연금 최적화: 수익률 0이면 넣은 돈을 기간으로 나눠요", () => {
  const i: P.PensionPlanLite = { age: 35, retireAge: 65, lifeAge: 85, balance: 0, savingsMonthly: 500_000, irpMonthly: 250_000, income: 50_000_000, national: 1_000_000, ret: 0 };
  const r = P.pensionPlanResult(i);
  assert.equal(r.asset, 750_000 * 12 * 30);
  assert.equal(r.fromAccount, Math.floor(r.asset / 240));
  assert.equal(r.credit.refund, 1_485_000);
  assert.ok(P.pensionPlanMonthly({ ...i, ret: 0.05 }) > r.monthly);
});

test("해외주식: 250만 공제·22%, 손실 실현과 공제 채우기", () => {
  assert.equal(P.overseasTaxOf(3_500_000), 200_000 + 20_000);
  assert.equal(P.overseasTaxOf(2_000_000), 0);
  const r = P.overseasResult({ realized: 5_000_000, openGain: 0, openLoss: 1_000_000 });
  assert.equal(r.harvest, 1_000_000);
  assert.equal(r.saveNow, 220_000);
  const s = P.overseasResult({ realized: 1_000_000, openGain: 3_000_000, openLoss: 0 });
  assert.equal(s.stepUp, 1_500_000);
  assert.equal(s.saveLater, 330_000);
});

test("분리 vs 종합: 2천만 이하는 추가 세금 없음, 넘으면 엔진과 같아요", () => {
  const base: P.FinIncomeLite = { fin: 15_000_000, mode: "base", gross: 0, persons: 1, base: 50_000_000 };
  assert.equal(P.finExtra(base), 0);
  assert.ok(P.finExtra({ ...base, fin: 40_000_000 }) > 0);
  assert.ok(P.finOtherBase({ ...base, mode: "salary", gross: 70_000_000 }) < 70_000_000);
});

test("부가세: 포함 금액 나누기, 매입 공제, 카드 발행 공제", () => {
  assert.deepEqual(P.splitVat(110_000, true), { supply: 100_000, vat: 10_000, total: 110_000 });
  assert.deepEqual(P.splitVat(100_000, false), { supply: 100_000, vat: 10_000, total: 110_000 });
  const i: P.VatLite = { sales: 30_000_000, purchases: 10_000_000, cardShare: 0, individual: true };
  assert.equal(P.vatPayable(i), 2_000_000);
  assert.equal(P.vatResult({ ...i, cardShare: 1 }).card, Math.floor(33_000_000 * 0.013));
  assert.equal(P.vatResult({ ...i, cardShare: 1, individual: false }).card, 0);
  assert.equal(P.vatPayable({ ...i, purchases: 40_000_000 }), -1_000_000);
});
