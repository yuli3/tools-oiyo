#!/usr/bin/env node
// OIYO business-strategist skill calculator. Same formulas as tools.oiyo.net (vendored libs are generated, do not edit them).
// Usage: node scripts/calc.mjs <tool> '<json>'   ·   node scripts/calc.mjs help
import {
  BIZ_AS_OF, bcgMatrix, breakEven, compareOptions, deadlineProbability, evaluateTree, factorScore, ieMatrix, positioningMap,
  riceScores, runway, scheduleCpm, swotPosition, treeFromOptions, unitEconomics, weightedDecision,
} from "./biz-strategy.mjs";
import { taxCalendar, filterItems } from "./biz-checklist.mjs";

const EXAMPLES = {
  "decision-options": { question: "신규 사업?", options: [{ label: "새 사업", successProb: 0.3, ifSuccess: 1000, ifFail: -200 }, { label: "현상 유지", successProb: 1, ifSuccess: 400, ifFail: 400 }] },
  "decision-tree": { tree: { id: "r", label: "출시?", kind: "decision", branches: [{ label: "출시", cost: 100, node: { id: "c", label: "반응", kind: "chance", branches: [{ label: "좋음", prob: 0.4, node: { id: "a", label: "", kind: "outcome", value: 500 } }, { label: "나쁨", prob: 0.6, node: { id: "b", label: "", kind: "outcome", value: 50 } }] } }, { label: "보류", node: { id: "s", label: "", kind: "outcome", value: 90 } }] } },
  schedule: { tasks: [{ id: "a", name: "기획", duration: 3 }, { id: "b", name: "디자인", duration: 5, deps: ["a"] }, { id: "c", name: "개발", duration: 10, deps: ["a"], optimistic: 7, pessimistic: 16 }, { id: "d", name: "출시", duration: 0, deps: ["b", "c"] }], deadline: 14 },
  swot: { items: [{ kind: "S", text: "충성 고객", impact: 5, weight: 0.5, rating: 4 }, { kind: "W", text: "작은 팀", impact: 2, weight: 0.5, rating: 2 }, { kind: "O", text: "AI 수요", impact: 4, weight: 0.5, rating: 3 }, { kind: "T", text: "대기업 진입", impact: 5, weight: 0.5, rating: 2 }] },
  bcg: { units: [{ name: "A", revenue: 60, marketGrowth: 0.03, share: 0.4, rivalShare: 0.2 }, { name: "B", revenue: 20, marketGrowth: 0.2, share: 0.3, rivalShare: 0.15 }], growthThreshold: 0.1 },
  positioning: { brands: [{ name: "우리", x: 5, y: 5, ours: true }, { name: "A", x: 6, y: 5 }, { name: "B", x: -8, y: -8 }], ideal: null },
  "unit-economics": { arpu: 50000, grossMargin: 0.8, monthlyChurn: 0.05, cac: 200000, discountRate: 0 },
  runway: { cash: 100, revenue: 10, revenueGrowth: 0, expenses: 30, expenseGrowth: 0, months: 12 },
  "break-even": { fixedCost: 1000, price: 30, variableCost: 10 },
  rice: { items: [{ name: "a", reach: 100, impact: 1, confidence: 0.8, effort: 2 }, { name: "b", reach: 1000, impact: 0.5, confidence: 0.5, effort: 5 }] },
  "weighted-decision": { criteria: [{ name: "비용", weight: 0.5 }, { name: "속도", weight: 0.5 }], options: [{ name: "X", scores: [5, 1] }, { name: "Y", scores: [2, 3] }] },
  "tax-calendar": { year: 2026, profile: { entity: "corp", vat: "general", employer: true, halfYearWithholding: false, sincere: false } },
  checklist: { roles: ["ceo"], stages: ["start"] },
};

const [tool, json] = process.argv.slice(2);
if (!tool || tool === "help" || !EXAMPLES[tool]) {
  console.log(`tools: ${Object.keys(EXAMPLES).join(", ")}\n`);
  for (const [k, v] of Object.entries(EXAMPLES)) console.log(`node scripts/calc.mjs ${k} '${JSON.stringify(v)}'`);
  process.exit(tool && tool !== "help" ? 1 : 0);
}
const i = { ...EXAMPLES[tool], ...(json ? JSON.parse(json) : {}) };
let result;
switch (tool) {
  case "decision-options": result = { ...compareOptions(i.options), tree: evaluateTree(treeFromOptions(i.question ?? "", i.options)) }; break;
  case "decision-tree": result = evaluateTree(i.tree); break;
  case "schedule": {
    const s = scheduleCpm(i.tasks);
    result = { ...s, deadlineProbability: i.deadline ? deadlineProbability(s.duration, s.stdDev, i.deadline) : null };
    break;
  }
  case "swot": {
    const ife = factorScore(i.items.filter((x) => x.kind === "S" || x.kind === "W"));
    const efe = factorScore(i.items.filter((x) => x.kind === "O" || x.kind === "T"));
    result = { ...swotPosition(i.items), ife, efe, ie: ieMatrix(ife.total, efe.total) };
    break;
  }
  case "bcg": result = bcgMatrix(i.units, i.growthThreshold ?? 0.1, i.shareThreshold ?? 1); break;
  case "positioning": result = positioningMap(i.brands, i.ideal ?? undefined); break;
  case "unit-economics": result = unitEconomics(i); break;
  case "runway": result = runway(i); break;
  case "break-even": result = breakEven(i.fixedCost, i.price, i.variableCost); break;
  case "rice": result = riceScores(i.items); break;
  case "weighted-decision": result = weightedDecision(i.criteria, i.options); break;
  case "tax-calendar": result = taxCalendar(i.year, i.profile); break;
  case "checklist": result = filterItems(i); break;
}
console.log(JSON.stringify({ tool, asOf: BIZ_AS_OF, input: i, result }, null, 2));
