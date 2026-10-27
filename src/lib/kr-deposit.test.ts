import assert from "node:assert/strict";
import test from "node:test";
import { depositInterest } from "./kr-deposit.ts";

test("정기예금 1천만 원, 연 3.5%, 12개월 단리, 일반과세", () => {
  const r = depositInterest({ kind: "deposit", amount: 10_000_000, annualRate: 0.035, months: 12, compound: false, taxRate: 0.154 })!;
  assert.equal(r.interest, 350_000);
  assert.equal(r.tax, 53_900); // 소득세 49,000 + 지방소득세 4,900
  assert.equal(r.total, 10_296_100);
});

test("적금 월 50만 원, 연 4%, 12개월 단리: 78개월치 이자", () => {
  const r = depositInterest({ kind: "savings", amount: 500_000, annualRate: 0.04, months: 12, compound: false, taxRate: 0 })!;
  assert.equal(r.principal, 6_000_000);
  assert.equal(r.interest, 130_000);
  assert.equal(r.tax, 0);
});

test("월복리는 단리보다 크고, 잘못된 입력은 null", () => {
  const s = depositInterest({ kind: "deposit", amount: 10_000_000, annualRate: 0.035, months: 12, compound: false, taxRate: 0.154 })!;
  const c = depositInterest({ kind: "deposit", amount: 10_000_000, annualRate: 0.035, months: 12, compound: true, taxRate: 0.154 })!;
  assert.ok(c.interest > s.interest);
  assert.equal(depositInterest({ kind: "deposit", amount: 0, annualRate: 0.03, months: 12, compound: false, taxRate: 0.154 }), null);
  assert.equal(depositInterest({ kind: "savings", amount: 1, annualRate: 0.03, months: 1.5, compound: false, taxRate: 0.154 }), null);
});

test("직접 입력 세율(조합 예탁금 1.4%)", () => {
  const r = depositInterest({ kind: "deposit", amount: 10_000_000, annualRate: 0.035, months: 12, compound: false, taxRate: 0.014 })!;
  assert.equal(r.tax, 4_900);
});
