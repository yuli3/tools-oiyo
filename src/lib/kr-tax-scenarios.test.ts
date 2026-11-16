import test from "node:test";
import assert from "node:assert/strict";
import { bridgeLayout, sweep, tornado, type BridgeStep } from "./scenario.ts";
import * as S from "./kr-tax-scenarios.ts";

// 다리 그래프의 마지막 합계 막대가 앞 단계를 더한 값과 같아야 해요(10원 절사 오차 허용).
const closes = (steps: BridgeStep[], tol = 20) => {
  const bars = bridgeLayout(steps);
  let run = 0;
  for (const b of bars) {
    if (b.kind === "total") {
      assert.ok(Math.abs(run - b.value) <= tol || run === 0, `${b.label}: ${run} vs ${b.value}`);
      run = b.value;
    } else run += b.value;
  }
};

test("퇴직소득세: 다리가 실수령액으로 닫히고 근속연수가 길면 세금이 줄어요", () => {
  const i = { gross: 80_000_000, years: 10 };
  closes(S.retirementBridge(i));
  assert.ok(S.retirementNet({ ...i, years: 20 }) > S.retirementNet(i));
});

test("양도세: 1주택 12억 이하 비과세, 넘으면 세금이 생겨요", () => {
  const i = { kind: "house" as const, sale: 1_100_000_000, purchase: 800_000_000, expenses: 0, holdYears: 5, liveYears: 5, houses: 1 as const, exemptEligible: true, regulated: false };
  assert.equal(S.gainsTotal(i), 0);
  const over = { ...i, sale: 1_500_000_000 };
  assert.ok(S.gainsTotal(over) > 0);
  closes(S.gainsBridge(over), 3_000_000); // 기본공제 이후 과세표준은 0 하한이라 큰 허용치
  const pts = sweep(over, S.GAINS_ASSUMPTIONS[0], S.gainsTotal, [0, 2_000_000_000], 20);
  assert.ok(pts.some((p) => p.x === 1_200_000_000));
});

test("취득세·재산세: 합계 다리가 닫혀요", () => {
  closes(S.acquisitionBridge({ price: 700_000_000, houses: 1, regulated: false, temporaryTwo: false, over85: true }));
  closes(S.propertyBridge({ official: 500_000_000, oneHouse: true, urban: true }));
});

test("월급: 다리가 실수령액으로 닫히고 비과세가 늘면 실수령액이 늘어요", () => {
  const i = { monthly: 3_000_000, dependents: 1, nonTaxable: 0 };
  closes(S.salaryBridge(i));
  assert.ok(S.salaryNet({ ...i, nonTaxable: 200_000 }) > S.salaryNet(i));
  assert.equal(tornado(i, S.SALARY_ASSUMPTIONS, S.salaryNet)[0].key, "monthly");
});

test("프리랜서: 3.3% 원천징수보다 세금이 적으면 환급(음수)", () => {
  const i: S.IncomeInput = { revenue: 30_000_000, expenseMode: "simple", expenses: 0, salary: 0, other: 0, people: 1, pension: 0, prepaid: 0 };
  const due = S.incomeDue(true)(i);
  assert.ok(due < 0);
  closes(S.incomeBridge(i, true));
  // 비용 가정을 움직이면 실제 비용 방식으로 바뀌어요
  const a = S.incomeAssumptions(true).find((x) => x.key === "expenses")!;
  assert.equal(a.set(i, 1_000_000).expenseMode, "actual");
});

test("종합소득세: 기납부세액은 사실(fact)이라 토네이도에서 빠져요", () => {
  const i: S.IncomeInput = { revenue: 80_000_000, expenseMode: "actual", expenses: 20_000_000, salary: 40_000_000, other: 0, people: 2, pension: 2_000_000, prepaid: 3_000_000 };
  const bars = tornado(i, S.incomeAssumptions(false), S.incomeDue(false));
  assert.ok(!bars.some((b) => b.key === "prepaid"));
  closes(S.incomeBridge(i, false));
});

test("상속세: 배우자 있고 10억 이하면 0, 배우자 몫 30억에서 공제가 멈춰요", () => {
  const i = { estate: 1_000_000_000, debts: 0, funeral: 0, spouse: true, spouseAmount: 300_000_000, financial: 0 };
  assert.equal(S.inheritanceTotal(i), 0);
  const big = { ...i, estate: 8_000_000_000, spouseAmount: 3_000_000_000 };
  assert.equal(S.inheritanceTotal(big), S.inheritanceTotal({ ...big, spouseAmount: 3_500_000_000 }));
  closes(S.inheritanceBridge(big));
});

test("증여세: 성년 자녀 5천만 원까지 0, 점선은 관계별 공제를 따라가요", () => {
  assert.equal(S.giftTotal({ amount: 50_000_000, relation: "child_adult" }), 0);
  assert.ok(S.giftTotal({ amount: 60_000_000, relation: "child_adult" }) > 0);
  assert.equal(S.giftMarks("spouse")[0].at, 600_000_000);
  assert.equal(S.giftPlain({ amount: 150_000_000, relation: "marriage_child" }).headline.includes("원을"), true);
});

test("연말정산: 연금저축을 넣으면 환급이 늘고 900만 원에서 멈춰요", () => {
  const i: S.YearEndLite = { salary: 50_000_000, persons: 1, children: 0, withheld: S.estimateWithheld(50_000_000, 1), credit: 10_000_000, debit: 5_000_000, pension: 0, medical: 0, rent: 0 };
  const r0 = S.yearEndRefund(i);
  assert.ok(S.yearEndRefund({ ...i, pension: 6_000_000 }) > r0);
  assert.equal(S.yearEndRefund({ ...i, pension: 9_000_000 }), S.yearEndRefund({ ...i, pension: 12_000_000 }));
  closes(S.yearEndBridge(i));
  closes(S.yearEndTaxBridge(i), 1_000);
});

test("퇴직금: 1년 미만 0, 월 300만 × 5년 ≈ 1,480만 원", () => {
  assert.equal(S.severanceGross({ monthly: 3_000_000, years: 0.5, bonus: 0, leavePay: 0 }), 0);
  const g = S.severanceGross({ monthly: 3_000_000, years: 5, bonus: 0, leavePay: 0 });
  assert.ok(g > 14_500_000 && g < 15_200_000, String(g));
  closes(S.severanceBridge({ monthly: 3_000_000, years: 5, bonus: 1_000_000, leavePay: 0 }));
});
