import test from "node:test";
import assert from "node:assert/strict";
import {
  addDays, bcgMatrix, breakEven, compareOptions, deadlineProbability, evaluateTree, factorScore, iceScore, ieMatrix, normalCdf,
  optionProbabilitySweep, positioningMap, riceScores, runway, scheduleCpm, slipImpact, swotPosition, treeFromOptions, unitEconomics,
  weightedDecision, type TreeNode,
} from "./biz-strategy.ts";

test("의사결정 트리: 확률 가중·최적 선택·비용", () => {
  const tree: TreeNode = {
    id: "r", label: "신제품 출시?", kind: "decision", branches: [
      { label: "출시", cost: 100, node: { id: "c", label: "시장 반응", kind: "chance", branches: [
        { label: "좋음", prob: 0.4, node: { id: "a", label: "", kind: "outcome", value: 500 } },
        { label: "나쁨", prob: 0.6, node: { id: "b", label: "", kind: "outcome", value: 50 } },
      ] } },
      { label: "보류", node: { id: "s", label: "", kind: "outcome", value: 90 } },
    ],
  };
  const r = evaluateTree(tree);
  // 출시: 0.4·500 + 0.6·50 − 100 = 130 > 보류 90
  assert.equal(r.ev, 130);
  assert.equal(r.root.best, 0);
  assert.deepEqual(r.path, ["출시"]);
  assert.deepEqual(r.profile, [{ value: -50, prob: 0.6 }, { value: 400, prob: 0.4 }]);
  assert.equal(r.lossProbability, 0.6);
  assert.equal(r.worst, -50);
});

test("의사결정 트리: 확률 합 보정 경고", () => {
  const r = evaluateTree({ id: "c", label: "x", kind: "chance", branches: [
    { label: "a", prob: 1, node: { id: "a", label: "", kind: "outcome", value: 10 } },
    { label: "b", prob: 1, node: { id: "b", label: "", kind: "outcome", value: 0 } },
  ] });
  assert.equal(r.ev, 5);
  assert.equal(r.warnings.length, 1);
});

test("쉬운 모드 선택지 비교와 손익분기 확률", () => {
  const opts = [
    { label: "새 사업", successProb: 0.3, ifSuccess: 1000, ifFail: -200 },
    { label: "현상 유지", successProb: 1, ifSuccess: 100, ifFail: 100 },
  ];
  const c = compareOptions(opts);
  assert.deepEqual(c.evs, [160, 100]);
  assert.equal(c.best, 0);
  // 새 사업 p: 1200p − 200 = 100 → p = 0.25
  assert.equal(c.breakeven[0], 0.25);
  assert.equal(c.breakeven[1], null);
  assert.equal(evaluateTree(treeFromOptions("q", opts)).ev, 160);
  const sw = optionProbabilitySweep(opts, 0, 4);
  assert.equal(sw.length, 5);
  assert.equal(sw[0].best, 1);
  assert.equal(sw[4].best, 0);
});

test("CPM: 핵심 경로와 여유", () => {
  const tasks = [
    { id: "a", name: "기획", duration: 3 },
    { id: "b", name: "디자인", duration: 5, deps: ["a"] },
    { id: "c", name: "개발", duration: 10, deps: ["a"] },
    { id: "d", name: "출시", duration: 0, deps: ["b", "c"] },
  ];
  const r = scheduleCpm(tasks);
  assert.equal(r.duration, 13);
  assert.deepEqual(r.criticalPath, ["a", "c", "d"]);
  const b = r.tasks.find((t) => t.id === "b")!;
  assert.equal(b.slack, 5);
  assert.equal(b.critical, false);
  assert.ok(r.tasks.find((t) => t.id === "d")!.milestone);
  assert.deepEqual(r.errors, []);
  assert.equal(slipImpact(tasks, "b", 3).projectDelay, 0);
  assert.equal(slipImpact(tasks, "b", 7).projectDelay, 2);
  assert.equal(slipImpact(tasks, "c", 2).projectDelay, 2);
});

test("CPM: 순환·없는 선행 작업은 오류로 알리고 계산은 계속", () => {
  const r = scheduleCpm([
    { id: "a", name: "A", duration: 2, deps: ["b"] },
    { id: "b", name: "B", duration: 3, deps: ["a", "zz"] },
  ]);
  assert.ok(r.errors.some((e) => e.includes("순환")));
  assert.ok(r.errors.some((e) => e.includes("없는 id")));
  assert.ok(r.duration >= 3);
});

test("PERT: 기대 기간·표준편차·마감 확률", () => {
  const r = scheduleCpm([
    { id: "a", name: "A", duration: 4, optimistic: 2, pessimistic: 12 },
    { id: "b", name: "B", duration: 6, optimistic: 6, pessimistic: 6, deps: ["a"] },
  ]);
  // A 기대 (2+16+12)/6 = 5, 분산 (10/6)^2
  assert.equal(r.duration, 11);
  assert.equal(r.stdDev, Math.round((10 / 6) * 1e6) / 1e6);
  assert.equal(deadlineProbability(r.duration, r.stdDev, r.duration), 0.5);
  assert.ok(Math.abs(normalCdf(1.96) - 0.975) < 1e-4);
  assert.equal(deadlineProbability(10, 0, 9), 0);
});

test("날짜 더하기: 달력일과 작업일", () => {
  assert.equal(addDays("2026-11-13", 3), "2026-11-16");
  // 금요일 + 작업일 1 = 월요일
  assert.equal(addDays("2026-11-13", 1, true), "2026-11-16");
  // 토요일 시작은 월요일로 밀어요
  assert.equal(addDays("2026-11-14", 0, true), "2026-11-16");
});

test("SWOT 위치와 TOWS 조합", () => {
  const r = swotPosition([
    { kind: "S", text: "충성 고객", impact: 5 },
    { kind: "W", text: "작은 팀", impact: 2 },
    { kind: "O", text: "AI 수요", impact: 4 },
    { kind: "T", text: "대기업 진입", impact: 5 },
    { kind: "T", text: "", impact: 5 },
  ]);
  assert.deepEqual(r.totals, { S: 5, W: 2, O: 4, T: 5 });
  assert.equal(r.stance, "ST");
  assert.deepEqual(r.tows.ST, ["충성 고객 → 대기업 진입 위협을 막는 데 쓰기"]);
});

test("IFE·EFE 가중 점수와 IE 매트릭스", () => {
  const f = factorScore([
    { kind: "S", text: "a", weight: 2, rating: 4 },
    { kind: "W", text: "b", weight: 2, rating: 1 },
  ]);
  assert.equal(f.total, 2.5);
  assert.ok(f.weightsAdjusted);
  assert.equal(ieMatrix(3.2, 3.5).strategy, "grow");
  assert.equal(ieMatrix(2.5, 2.5).strategy, "hold");
  assert.equal(ieMatrix(1.5, 1.8).strategy, "harvest");
  assert.equal(ieMatrix(1.5, 3.5).strategy, "hold");
});

test("BCG 분류와 매출 구성", () => {
  const r = bcgMatrix([
    { name: "A", revenue: 60, marketGrowth: 0.03, share: 0.4, rivalShare: 0.2 },
    { name: "B", revenue: 20, marketGrowth: 0.2, share: 0.3, rivalShare: 0.15 },
    { name: "C", revenue: 15, marketGrowth: 0.25, share: 0.05, rivalShare: 0.3 },
    { name: "D", revenue: 5, marketGrowth: 0.01, share: 0.02, rivalShare: 0.4 },
  ]);
  assert.deepEqual(r.rows.map((x) => x.quadrant), ["cashCow", "star", "question", "dog"]);
  assert.equal(r.rows[0].relativeShare, 2);
  assert.deepEqual(r.byQuadrant, { star: 0.2, cashCow: 0.6, question: 0.15, dog: 0.05 });
});

test("포지셔닝 맵: 가장 가까운 경쟁자와 빈자리", () => {
  const r = positioningMap([
    { name: "우리", x: 5, y: 5, ours: true },
    { name: "A", x: 6, y: 5 },
    { name: "B", x: -8, y: -8 },
  ]);
  assert.equal(r.brands[0].nearest, "A");
  assert.equal(r.brands[0].nearestDistance, 1);
  assert.deepEqual(r.crowded, ["우리", "A"]);
  // 빈자리는 브랜드가 없는 모서리 쪽
  assert.ok(r.gap.radius > 10);
});

test("단위경제: LTV·회수 기간·등급", () => {
  const u = unitEconomics({ arpu: 50_000, grossMargin: 0.8, monthlyChurn: 0.05, cac: 200_000 });
  assert.equal(u.contributionPerMonth, 40_000);
  assert.equal(u.ltv, 800_000);
  assert.equal(u.paybackMonths, 5);
  assert.equal(u.ltvToCac, 4);
  assert.equal(u.grade, "good");
  const d = unitEconomics({ arpu: 50_000, grossMargin: 0.8, monthlyChurn: 0.05, cac: 200_000, discountRate: 0.12 });
  assert.ok(d.ltv < 800_000 && d.ltv > 600_000);
});

test("런웨이: 현금 소진 달과 흑자 전환", () => {
  const r = runway({ cash: 100, revenue: 10, revenueGrowth: 0, expenses: 30, expenseGrowth: 0, months: 12 });
  assert.equal(r.simpleRunwayMonths, 5);
  assert.equal(r.zeroMonth, 6);
  assert.equal(r.defaultAlive, false);
  const g = runway({ cash: 100, revenue: 10, revenueGrowth: 0.3, expenses: 20, expenseGrowth: 0, months: 24 });
  assert.equal(g.breakEvenMonth, 3);
  assert.equal(g.zeroMonth, null);
  assert.ok(g.defaultAlive);
});

test("손익분기·RICE·ICE", () => {
  assert.deepEqual(breakEven(1000, 30, 10), { units: 50, revenue: 1500, contributionMargin: 20, cmRatio: 0.666667 });
  assert.equal(breakEven(1000, 10, 10).units, Infinity);
  const r = riceScores([
    { name: "a", reach: 100, impact: 1, confidence: 0.8, effort: 2 },
    { name: "b", reach: 1000, impact: 0.5, confidence: 0.5, effort: 5 },
  ]);
  assert.deepEqual(r.map((x) => [x.name, x.score]), [["b", 50], ["a", 40]]);
  assert.equal(iceScore(8, 5, 7), 280);
});

test("가중 의사결정표와 순위가 뒤집히는 가중치", () => {
  const r = weightedDecision(
    [{ name: "비용", weight: 0.5 }, { name: "속도", weight: 0.5 }],
    [{ name: "X", scores: [5, 1] }, { name: "Y", scores: [2, 3] }],
  );
  assert.equal(r.ranked[0].name, "X");
  assert.equal(r.rows[0].total, 3);
  assert.equal(r.rows[1].total, 2.5);
  // 비용 가중치 x: X = 5x + 1(1−x), Y = 2x + 3(1−x) → 같아지는 x = 2/5
  assert.equal(r.flips[0].weightNeeded, 0.4);
});
