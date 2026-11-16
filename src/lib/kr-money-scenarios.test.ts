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

test("전기요금: 누진 경계를 넘으면 요금이 뛰고, 다리가 청구 금액으로 닫혀요", () => {
  const below = S.electricityTotal({ kwh: 200, season: "other" });
  const above = S.electricityTotal({ kwh: 201, season: "other" });
  assert.ok(above - below > 1_000);
  closes(S.electricityBridge({ kwh: 350, season: "other" }), 50);
  assert.equal(S.electricityMarks("summer")[0].at, 300);
});

test("간주임대료: 보증금 1억 184일 3.1%", () => {
  const r = S.deemedResult({ deposit: 100_000_000, days: 184, rate: 0.031 });
  assert.equal(r.rent, Math.floor((100_000_000 * 184 * 0.031) / 365));
  assert.equal(r.vat, Math.floor(r.rent * 0.1));
});

test("퇴사 건보 정산: 월급이 고지 기준보다 높으면 더 내요", () => {
  const i = { totalPay: 30_000_000, monthsWorked: 6, monthsCharged: 6, noticeMonthly: 4_500_000 };
  assert.ok(S.leaverTotal(i) > 0);
  assert.ok(S.leaverTotal({ ...i, noticeMonthly: 6_000_000 }) < 0);
  closes(S.leaverBridge(i));
});

test("청년미래적금: 우대형 기여금이 일반형의 2배, 월 50만 원 상한", () => {
  const g = S.youthResult({ monthly: 500_000, rate: 0.05, kind: "general" });
  const p = S.youthResult({ monthly: 500_000, rate: 0.05, kind: "preferred" });
  assert.equal(p.contribution, g.contribution * 2);
  assert.equal(S.youthResult({ monthly: 900_000, rate: 0.05, kind: "general" }).principal, g.principal);
  closes(S.youthBridge({ monthly: 500_000, rate: 0.05, kind: "general" }));
});
