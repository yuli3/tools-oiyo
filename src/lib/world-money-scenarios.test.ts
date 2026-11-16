import test from "node:test";
import assert from "node:assert/strict";
import * as W from "./world-money-scenarios.ts";

test("대출: 세 상환 방식의 이자 순서와 원금균등 공식", () => {
  const i: W.LoanLite = { amount: 120_000_000, rate: 0.06, months: 120, method: "annuity" };
  const a = W.repay(i.amount, i.rate, i.months, "annuity");
  const p = W.repay(i.amount, i.rate, i.months, "principal");
  const b = W.repay(i.amount, i.rate, i.months, "bullet");
  assert.ok(p.interest < a.interest && a.interest < b.interest);
  assert.equal(Math.round(p.interest), Math.round(0.005 * 1_000_000 * 120 * 121 / 2));
  assert.equal(Math.round(a.first), 1_332_246);
  assert.equal(b.interest, 120_000_000 * 0.005 * 120);
  assert.equal(W.repay(1_200_000, 0, 12, "annuity").first, 100_000);
});

test("주담대: 대출액·LTV와 금리 민감도", () => {
  const i: W.MortgageLite = { price: 500_000_000, down: 150_000_000, rate: 0.04, years: 30 };
  const r = W.mortgageResult(i);
  assert.equal(r.loan, 350_000_000);
  assert.equal(r.ltv, 0.7);
  assert.ok(W.mortgageMonthly({ ...i, rate: 0.05 }) > r.monthly);
  assert.equal(W.mortgageTerms(i).filter((x) => x.current).length, 1);
});

test("복리: 수익률 0이면 넣은 돈 그대로, 월복리 공식", () => {
  assert.equal(W.compoundFv({ principal: 1_000_000, monthly: 100_000, rate: 0, years: 2 }), 3_400_000);
  const r = W.compoundResult({ principal: 10_000_000, monthly: 0, rate: 0.12, years: 1 });
  assert.equal(Math.round(r.fv), Math.round(10_000_000 * Math.pow(1.01, 12)));
});

test("FIRE: 4% 규칙 목표와 저축을 늘리면 빨라져요", () => {
  const i: W.FireLite = { age: 30, assets: 100_000_000, monthlySave: 2_000_000, ret: 0.05, spending: 36_000_000, withdraw: 0.04 };
  const r = W.fireResult(i);
  assert.equal(r.target, 900_000_000);
  assert.ok(r.reached && r.years > 0);
  assert.ok(W.fireYears({ ...i, monthlySave: 3_000_000 }) < r.years);
  assert.equal(W.fireYears({ ...i, assets: 1_000_000_000 }), 0);
});

test("2차: 물가·ROI·임대·평단가", () => {
  const inf = W.inflationResult({ amount: 1_000_000, rate: 0.03, years: 10 });
  assert.equal(Math.round(inf.needed), Math.round(1_000_000 * Math.pow(1.03, 10)));
  const roi = W.roiResult({ cost: 10_000_000, value: 15_000_000, years: 2 });
  assert.equal(roi.roi, 0.5);
  assert.ok(Math.abs(roi.cagr - (Math.sqrt(1.5) - 1)) < 1e-12);
  const rent = W.rentalResult({ price: 500_000_000, deposit: 50_000_000, rent: 2_000_000, loan: 200_000_000, loanRate: 0.045, vacancy: 0, costs: 0 });
  assert.equal(rent.equity, 250_000_000);
  assert.equal(rent.net, 24_000_000 - 9_000_000);
  assert.ok(W.rentalNet({ price: 500_000_000, deposit: 50_000_000, rent: 2_000_000, loan: 200_000_000, loanRate: 0.045, vacancy: 0.1, costs: 1_000_000 }) < rent.net);
  const avg = W.avgResult({ price: 10_000, qty: 100, addPrice: 8_000, addQty: 100, market: 8_000 });
  assert.equal(avg.avg, 9_000);
  assert.equal(avg.pl, -200_000);
});
