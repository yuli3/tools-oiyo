import test from "node:test";
import assert from "node:assert/strict";
import { bridgeLayout, tornado, type BridgeStep } from "./scenario.ts";
import * as S from "./kr-money-scenarios.ts";

const closes = (steps: BridgeStep[], tol = 20) => {
  let run = 0;
  for (const b of bridgeLayout(steps)) {
    if (b.kind === "total") {
      assert.ok(run === 0 || Math.abs(run - b.value) <= tol, `${b.label}: ${run} vs ${b.value}`);
      run = b.value;
    } else run += b.value;
  }
};

test("적금: 다리가 만기 금액으로 닫히고, 비과세면 세금이 0", () => {
  const i: S.DepositLite = { kind: "savings", amount: 500_000, rate: 0.035, months: 12, compound: false, taxRate: 0.154 };
  closes(S.depositBridge(i));
  assert.equal(S.depositResult({ ...i, taxRate: 0 }).tax, 0);
  assert.ok(S.depositNet({ ...i, rate: 0.04 }) > S.depositNet(i));
});

test("인건비: 식대는 20만 원까지만 보험료를 줄여요", () => {
  const i: S.LaborLite = { salary: 3_000_000, meal: 0, workComp: 0.015, size: "under150", severance: true };
  closes(S.laborBridge(i));
  assert.ok(S.laborTotal({ ...i, meal: 200_000 }) < S.laborTotal(i));
  assert.equal(S.laborTotal({ ...i, meal: 200_000 }), S.laborTotal({ ...i, meal: 300_000 }));
});

test("주휴수당: 주 15시간 경계에서 생겨요", () => {
  assert.equal(S.weeklyResult({ hourly: 10_320, days: 5, hours: 2.5 }).holidayPay, 0);
  assert.ok(S.weeklyResult({ hourly: 10_320, days: 5, hours: 3 }).holidayPay > 0);
  closes(S.weeklyBridge({ hourly: 10_320, days: 5, hours: 4 }));
  assert.equal(tornado({ hourly: 10_320, days: 5, hours: 4 }, S.WEEKLY_ASSUMPTIONS, S.weeklyMonthly).length, 3);
});

test("의료비: 연봉 3% 문턱 아래는 0, 다리가 공제 대상으로 닫혀요", () => {
  const i: S.MedicalLite = { salary: 50_000_000, specific: 1_000_000, general: 0, premature: 0, infertility: 0 };
  assert.equal(S.medicalSaved(i), 0);
  const big = { ...i, general: 10_000_000 };
  closes(S.medicalBridge(big));
  assert.ok(S.medicalPlain(big).headline.includes("줄어요"));
});
