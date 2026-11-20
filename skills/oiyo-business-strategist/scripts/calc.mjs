#!/usr/bin/env node
// OIYO business-strategist skill calculator. Same formulas as tools.oiyo.net (vendored libs are generated, do not edit them).
// Usage: node scripts/calc.mjs <tool> '<json>'   ·   node scripts/calc.mjs help
import {
  BIZ_AS_OF, bcgMatrix, breakEven, compareOptions, deadlineProbability, evaluateTree, factorScore, ieMatrix, positioningMap,
  riceScores, runway, scheduleCpm, swotPosition, treeFromOptions, unitEconomics, weightedDecision,
} from "./biz-strategy.mjs";
import { taxCalendar, filterItems, monthlyBackoffice } from "./biz-checklist.mjs";
import {
  acquisitionCheck, campaignSupply, influencerDeal, marketEntry, materialSwitch, orderAllocation, proportionTest, qualityRecovery, rebateCheck,
  sampleSizePerGroup,
} from "./biz-ops.mjs";

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
  month: { month: "2026-12", profile: { entity: "indiv", vat: "general", employer: true, payday: 25 }, events: { hires: ["2026-11-17"], leaves: [] }, today: "2026-11-20" },
  "campaign-supply": { demand: [100, 100, 300, 300, 100], openingStock: 100, capacityPerWeek: 150, leadTimeWeeks: 1, safetyStock: 0 },
  influencer: { fee: 3000000, views: 200000, clickRate: 0.02, conversionRate: 0.05, aov: 30000, grossMargin: 0.7, payee: "freelancer" },
  "quality-recovery": { lots: [{ id: "L1", units: 1000, defectRate: 0.1, shippedRatio: 0.5 }], recallCostPerUnit: 500, remakeCostPerUnit: 2000, goodStock: 600, customers: [{ name: "A", demand: 600, priority: 2, penaltyPerUnit: 1000 }, { name: "B", demand: 400, priority: 1, penaltyPerUnit: 200 }] },
  "material-switch": { currentPrice: 1000, annualVolume: 100000, candidates: [{ name: "X", unitPrice: 900, quality: 4, supply: 3, testWeeks: 6, testCost: 5000000 }, { name: "Y", unitPrice: 800, quality: 2, supply: 2, testWeeks: 12, testCost: 8000000, needsFiling: true }], weights: { cost: 1, quality: 1, supply: 1, speed: 1 } },
  "order-allocation": { capacity: 1000, existing: [{ name: "핵심", qty: 500, price: 100, unitCost: 60, penaltyPerUnit: 100, locked: true }, { name: "일반", qty: 300, price: 80, unitCost: 60, penaltyPerUnit: 5 }], newOrder: { name: "대형", qty: 500, price: 110, unitCost: 60 } },
  "market-test": { baseline: 0.05, lift: 0.2, convA: 100, nA: 2000, convB: 140, nB: 2000, entry: { visitors: 10000, conversionRate: 0.02, aov: 50000, costRatio: 0.6, monthlyFixed: 10000000, entryCost: 60000000, scaleFactor: 5 } },
  rebate: { tiers: [{ from: 0, rate: 0.01 }, { from: 100000000, rate: 0.03 }], partners: [{ name: "D1", sales: 60000000, group: "G", related: true, paid: 1800000 }, { name: "D2", sales: 50000000, group: "G", related: true }, { name: "E", sales: 80000000, paid: 800000 }], aggregateGroups: false, armsLengthCheck: true },
  acquisition: { price: 10000, targetNetIncome: 1000, acquirerNetIncome: 5000, acquirerShares: 1000, sharePrice: 50, stockPortion: 1, debtRate: 0.05, taxRate: 0.2, synergy: 0, rampYears: 1, integrationCost: 0, years: 12 },
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
  case "month": result = monthlyBackoffice(i.month, i.profile, i.events ?? {}, i.today); break;
  case "campaign-supply": result = campaignSupply(i); break;
  case "influencer": result = influencerDeal(i); break;
  case "quality-recovery": result = qualityRecovery(i); break;
  case "material-switch": result = materialSwitch(i); break;
  case "order-allocation": result = orderAllocation(i); break;
  case "market-test": result = { sampleSizePerGroup: sampleSizePerGroup(i.baseline, i.lift), test: proportionTest(i.convA, i.nA, i.convB, i.nB), entry: marketEntry(i.entry) }; break;
  case "rebate": result = rebateCheck(i); break;
  case "acquisition": result = acquisitionCheck(i); break;
}
console.log(JSON.stringify({ tool, asOf: BIZ_AS_OF, input: i, result }, null, 2));
