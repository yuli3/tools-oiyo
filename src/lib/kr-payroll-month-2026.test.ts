import test from "node:test";
import assert from "node:assert/strict";
import { aboveTenMillion, childReduction, joinLeaveMonths, simplifiedWithholding } from "./kr-payroll-month-2026.ts";
import { WITHHOLDING_TABLE } from "./kr-withholding-table-2026.ts";
import { employeeInsurance2026 } from "./kr-rates-2026.mjs";

test("표 구조: 770~10,000천원 646구간이 끊김 없이 이어져요", () => {
  assert.equal(WITHHOLDING_TABLE.length, 646);
  assert.equal(WITHHOLDING_TABLE[0][0], 770);
  assert.equal(WITHHOLDING_TABLE.at(-1)![1], 10_000);
  for (let i = 1; i < WITHHOLDING_TABLE.length; i++) assert.equal(WITHHOLDING_TABLE[i][0], WITHHOLDING_TABLE[i - 1][1]);
});

test("원문 표본 행과 국세청 예시(3,500천원·4명 49,340원)", () => {
  assert.equal(simplifiedWithholding({ pay: 3_000_000, family: 1 }).incomeTax, 74_350);
  assert.equal(simplifiedWithholding({ pay: 3_019_999, family: 4 }).tableTax, 26_690);
  assert.equal(simplifiedWithholding({ pay: 3_510_000, family: 4 }).tableTax, 49_340);
  assert.equal(simplifiedWithholding({ pay: 5_010_000, family: 3 }).tableTax, 237_850);
  assert.equal(simplifiedWithholding({ pay: 7_000_000, family: 2 }).tableTax, 684_290);
});

test("1천만 원과 그 초과 산식", () => {
  assert.equal(simplifiedWithholding({ pay: 10_000_000, family: 1 }).tableTax, 1_507_400);
  assert.equal(aboveTenMillion(12_000_000), 2_000_000 * 0.98 * 0.35 + 25_000);
  assert.equal(simplifiedWithholding({ pay: 12_000_000, family: 1 }).tableTax, 1_507_400 + 686_000 + 25_000);
  assert.equal(aboveTenMillion(50_000_000), 13_394_600 + 5_000_000 * 0.42);
});

test("자녀 차감(2026.2.27 개정)·비율·지방소득세", () => {
  assert.equal(childReduction(1), 20_830);
  assert.equal(childReduction(2), 45_830);
  assert.equal(childReduction(4), 45_830 + 2 * 33_330);
  const r = simplifiedWithholding({ pay: 5_010_000, family: 4, children: 2, ratio: 80 });
  assert.equal(r.baseTax, 219_100 - 45_830);
  assert.equal(r.incomeTax, Math.floor((173_270 * 0.8) / 10) * 10);
  assert.equal(r.localTax, Math.floor(r.incomeTax * 0.1 / 10) * 10);
  assert.equal(simplifiedWithholding({ pay: 3_000_000, family: 4, children: 3 }).incomeTax, 0);
});

test("가족 11명 초과(주4)와 표 아래 급여", () => {
  const r11 = simplifiedWithholding({ pay: 7_000_000, family: 11 }).tableTax;
  const r10 = simplifiedWithholding({ pay: 7_000_000, family: 10 }).tableTax;
  assert.equal(simplifiedWithholding({ pay: 7_000_000, family: 12 }).tableTax, r11 - (r10 - r11));
  const low = simplifiedWithholding({ pay: 500_000, family: 1 });
  assert.equal(low.incomeTax, 0);
  assert.equal(low.belowTable, true);
});

test("월 중간 입사: 그 달은 없고 다음 달부터, 퇴사 달까지 부과", () => {
  const r = joinLeaveMonths({ join: "2026-03-15", leave: "2026-06-10", monthlyPay: 3_000_000 });
  const m = employeeInsurance2026(3_000_000, { payMonth: "2026-04" });
  assert.deepEqual(r.lines.map((l) => l.month), ["2026-03", "2026-04", "2026-05", "2026-06"]);
  assert.equal(r.lines[0].total, 0);
  assert.equal(r.lines[1].pension, m.nationalPension);
  assert.equal(r.lines[1].health, m.healthInsurance);
  assert.equal(r.lines[1].employment, m.employmentInsurance);
  assert.equal(r.lines[3].pension, m.nationalPension);
  assert.equal(r.lines[3].employment, 0);
  assert.equal(r.lines[3].employmentCheck, true);
});

test("1일 입사는 그 달부터, 국민연금 희망 시 입사 달부터", () => {
  const a = joinLeaveMonths({ join: "2026-03-01", monthlyPay: 3_000_000 });
  assert.ok(a.lines[0].health > 0 && a.lines[0].pension > 0 && a.lines[0].employment > 0);
  const b = joinLeaveMonths({ join: "2026-03-15", monthlyPay: 3_000_000, pensionFromJoinMonth: true });
  assert.ok(b.lines[0].pension > 0);
  assert.equal(b.lines[0].health, 0);
  assert.equal(b.firstPensionMonth, "2026-03");
  assert.equal(b.firstHealthMonth, "2026-04");
});
