import test from "node:test";
import assert from "node:assert/strict";
import { bridgeLayout, type BridgeStep } from "./scenario.ts";
import * as H from "./kr-home-scenarios.ts";

const closes = (steps: BridgeStep[], tol = 20) => {
  let run = 0;
  for (const b of bridgeLayout(steps)) {
    if (b.kind === "total") {
      assert.ok(run === 0 || Math.abs(run - b.value) <= tol, `${b.label}: ${run} vs ${b.value}`);
      run = b.value;
    } else run += b.value;
  }
};

test("DSR: 한도는 세 한도 중 가장 작은 값이고 금리가 오르면 줄어요", () => {
  const i: H.DsrLite = { income: 60_000_000, housePrice: 800_000_000, existing: 5_000_000, rate: 0.04, years: 30, area: "metro", rateType: "variable", fixedYears: 0 };
  const limits = H.dsrLimits(i).slice(0, -1).map((l) => l.value);
  assert.equal(H.dsrMaxLoan(i), Math.min(...limits));
  assert.ok(H.dsrMaxLoan({ ...i, rate: 0.06 }) <= H.dsrMaxLoan(i));
  assert.ok(!/[을를이가]\s*[을를이가]/.test(H.dsrPlain(i).headline));
});

test("전세 vs 월세: 손익분기 월세에서 차이가 거의 0", () => {
  const i: H.JeonseLite = { jeonse: 300_000_000, loanRatio: 0.7, loanRate: 0.038, savingsRate: 0.032, rentDeposit: 30_000_000, monthlyRent: 1_000_000, creditRate: 0 };
  const even = H.jeonseBreakEvenRent(i);
  assert.ok(Math.abs(H.jeonseGap({ ...i, monthlyRent: even })) <= 1);
  assert.ok(H.jeonseGap({ ...i, monthlyRent: even + 100_000 }) > 0);
  assert.ok(Math.abs(H.jeonseGap({ ...i, creditRate: 0.17, monthlyRent: H.jeonseBreakEvenRent({ ...i, creditRate: 0.17 }) })) <= 1);
});

test("ISA: 다리가 ISA 세금으로 닫히고 서민형이 더 아껴요", () => {
  const i: H.IsaLite = { type: "normal", profit: 5_000_000, loss: 1_000_000 };
  closes(H.isaBridge(i));
  assert.ok(H.isaSaved({ ...i, type: "eligible" }) > H.isaSaved(i));
  assert.equal(H.isaSaved({ ...i, profit: 0, loss: 0 }), 0);
});

test("분양: 다리가 내 돈 합계로 닫히고 무이자면 이자가 0", () => {
  const i: H.PresaleLite = { price: 600_000_000, depositRate: 0.1, midRate: 0.6, midCount: 6, months: 35, loanShare: 1, loanRate: 0.045, interestMode: "deferred", options: 15_000_000, over85: false };
  closes(H.presaleBridge(i));
  assert.equal(H.presaleResult({ ...i, interestMode: "free" }).interestTotal, 0);
  assert.ok(H.presaleCash({ ...i, loanShare: 0.5 }) > H.presaleCash(i));
});
