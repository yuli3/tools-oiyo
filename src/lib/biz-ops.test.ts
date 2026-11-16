// 운영 문제 8유형 엔진 테스트 (2026-11-16)
import test from "node:test";
import assert from "node:assert/strict";
import {
  acquisitionCheck, allocateSupply, campaignSupply, influencerDeal, marketEntry, materialSwitch, normCdf, normInv, orderAllocation,
  proportionTest, qualityRecovery, rebateCheck, sampleSizePerGroup, tierRate,
} from "./biz-ops.ts";

test("campaign supply: stockout week and uniform extra production", () => {
  const r = campaignSupply({ demand: [100, 100, 300, 300, 100], openingStock: 100, capacityPerWeek: 150, leadTimeWeeks: 1 });
  assert.equal(r.firstStockoutWeek, 4);
  assert.equal(r.totalShortage, 100);
  // week 4: demand 800 vs supply 100 + 4×150 = 700 → 100 short over weeks 2-4 → 34/week
  assert.equal(r.extraPerWeek, 34);
  const fixed = campaignSupply({ demand: [100, 100, 300, 300, 100], openingStock: 100, capacityPerWeek: 150 + 34, leadTimeWeeks: 0 });
  assert.equal(fixed.totalShortage, 0);
  const early = campaignSupply({ demand: [500], openingStock: 0, capacityPerWeek: 100, leadTimeWeeks: 2 });
  assert.equal(early.unfixableShortage, 400);
});

test("influencer: ROAS, withholding by payee type, breakeven", () => {
  const base = { fee: 3_000_000, views: 200_000, clickRate: 0.02, conversionRate: 0.05, aov: 30_000, grossMargin: 0.7 };
  const r = influencerDeal({ ...base, payee: "freelancer" });
  assert.equal(r.orders, 200);
  assert.equal(r.revenue, 6_000_000);
  assert.equal(r.roas, 2);
  assert.equal(r.withholding, 99_000);
  assert.equal(r.contribution, 1_200_000);
  assert.equal(r.breakEvenOrders, Math.round((3_000_000 / 21_000) * 10) / 10);
  assert.equal(influencerDeal({ ...base, payee: "oneOff" }).withholding, 264_000);
  assert.equal(influencerDeal({ ...base, payee: "business" }).vat, 300_000);
});

test("quality recovery: scopes and allocation rules", () => {
  const customers = [
    { name: "A", demand: 600, priority: 2, penaltyPerUnit: 1000 },
    { name: "B", demand: 400, priority: 1, penaltyPerUnit: 200 },
  ];
  const r = qualityRecovery({ lots: [{ id: "L1", units: 1000, defectRate: 0.1, shippedRatio: 0.5 }], recallCostPerUnit: 500, remakeCostPerUnit: 2000, goodStock: 600, customers });
  assert.equal(r.totals.defects, 100);
  assert.equal(r.scopes[0].cost, 250_000);
  assert.equal(r.scopes[2].cost, 500 * 500 + 1000 * 2000);
  const pri = allocateSupply(600, customers, "priority");
  assert.deepEqual(pri.rows.map((x) => x.allocated), [200, 400]);
  assert.equal(allocateSupply(600, customers, "penalty").totalPenalty, 80_000);
  assert.equal(r.cheapestRule, "penalty");
});

test("material switch: saving, payback, ranking", () => {
  const r = materialSwitch({
    currentPrice: 1000, annualVolume: 100_000,
    candidates: [
      { name: "X", unitPrice: 900, quality: 4, supply: 3, testWeeks: 6, testCost: 5_000_000 },
      { name: "Y", unitPrice: 800, quality: 2, supply: 2, testWeeks: 12, testCost: 8_000_000, needsFiling: true },
    ],
    weights: { cost: 1, quality: 1, supply: 1, speed: 1 },
  });
  assert.equal(r.rows[0].annualSaving, 10_000_000);
  assert.equal(r.rows[0].paybackMonths, 6);
  assert.equal(r.rows[1].weeksToApproval, 20);
  assert.equal(r.best, "X");
  assert.ok(r.warnings.some((w) => w.startsWith("Y")));
});

test("order allocation: protects locked promises, finds the profitable quantity", () => {
  const r = orderAllocation({
    capacity: 1000,
    existing: [
      { name: "핵심", qty: 500, price: 100, unitCost: 60, penaltyPerUnit: 100, locked: true },
      { name: "일반", qty: 300, price: 80, unitCost: 60, penaltyPerUnit: 5 },
    ],
    newOrder: { name: "대형", qty: 500, price: 110, unitCost: 60 },
  });
  const full = r.options.find((o) => o.key === "full")!;
  assert.equal(full.rows.find((x) => x.name === "일반")!.delivered, 0);
  assert.equal(full.profit, 500 * 40 - 300 * 5 + 500 * 50);
  assert.equal(r.recommended, "full");
  assert.equal(r.spareCapacity, 200);
});

test("market test: normal helpers, sample size, z test, entry economics", () => {
  assert.ok(Math.abs(normCdf(1.96) - 0.975) < 1e-4);
  assert.ok(Math.abs(normInv(0.975) - 1.959964) < 1e-5);
  const n = sampleSizePerGroup(0.05, 0.2);
  assert.ok(n > 8000 && n < 8300, String(n));
  const t = proportionTest(100, 2000, 140, 2000);
  assert.ok(t.pValue < 0.01 && t.pValue > 0.005, String(t.pValue));
  const m = marketEntry({ visitors: 10_000, conversionRate: 0.02, aov: 50_000, costRatio: 0.6, monthlyFixed: 10_000_000, entryCost: 60_000_000, scaleFactor: 5 });
  assert.equal(m.monthlyContribution, 20_000_000);
  assert.equal(m.paybackMonths, 6);
  assert.equal(m.verdict, "go");
});

test("rebate: group aggregation, overpayment, related-party range", () => {
  const tiers = [{ from: 0, rate: 0.01 }, { from: 100_000_000, rate: 0.03 }];
  assert.equal(tierRate(tiers, 150_000_000), 0.03);
  const partners = [
    { name: "D1", sales: 60_000_000, group: "G", related: true, paid: 1_800_000 },
    { name: "D2", sales: 50_000_000, group: "G", related: true },
    { name: "E", sales: 80_000_000, paid: 800_000 },
  ];
  const sep = rebateCheck({ tiers, partners, aggregateGroups: false, armsLengthCheck: true });
  assert.equal(sep.rows[0].due, 600_000);
  assert.ok(sep.flags.some((f) => f.name === "D1" && f.level === "block"));
  assert.ok(sep.flags.some((f) => f.name === "D1" && /부당행위/.test(f.text)));
  assert.ok(sep.flags.some((f) => /합치면/.test(f.text)));
  const agg = rebateCheck({ tiers, partners, aggregateGroups: true, armsLengthCheck: false });
  assert.equal(agg.rows[0].due, 1_800_000);
  assert.ok(!agg.flags.some((f) => f.name === "D1"));
});

test("acquisition: EPS accretion, payback, breakeven synergy", () => {
  const base = { price: 10_000, targetNetIncome: 1000, acquirerNetIncome: 5000, acquirerShares: 1000, sharePrice: 50, stockPortion: 1, debtRate: 0.05, taxRate: 0.2, synergy: 0, rampYears: 1, integrationCost: 0, years: 12 };
  const r = acquisitionCheck(base);
  assert.equal(r.newShares, 200);
  assert.equal(r.epsBefore, 5);
  assert.equal(r.series[0].eps, 5); // 6000 / 1200: target P/E 10 = acquirer P/E 10 → neutral
  assert.equal(r.paybackYear, 10);
  const debt = acquisitionCheck({ ...base, stockPortion: 0 });
  assert.equal(debt.interestAfterTax, 400);
  assert.equal(debt.series[0].eps, 5.6);
  const pricey = acquisitionCheck({ ...base, price: 20_000, rampYears: 2 });
  assert.ok(pricey.year1Accretion < 0);
  assert.ok(pricey.synergyForBreakeven > 0);
});
