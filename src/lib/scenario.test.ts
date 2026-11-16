import test from "node:test";
import assert from "node:assert/strict";
import { sweep, tornado, bridgeLayout, parseKoreanAmount, roughWon, compactWon, moneyRange, niceStep } from "./scenario.ts";
import { valueUnlistedShares, type UnlistedShareInput } from "./kr-advisory-2026.ts";
import { UNLISTED_ASSUMPTIONS, unlistedAssumption, unlistedBridge, unlistedPerShare, unlistedPlain } from "./kr-advisory-scenarios.ts";

const base: UnlistedShareInput = {
  sharesOutstanding: 100_000, netIncome: [600_000_000, 500_000_000, 400_000_000],
  netAssets: 3_000_000_000, goodwill: 0, realEstateRatio: 0.2, heldShares: 60_000, isMajorityHolder: false, premiumExempt: true,
};

test("훑기 곡선의 현재 점 = 지금 결과, 경계값 포함", () => {
  const a = unlistedAssumption("realEstateRatio");
  const pts = sweep(base, a, unlistedPerShare, a.range(0.2), 20);
  const now = pts.find((p) => p.x === 0.2);
  assert.ok(now);
  assert.equal(now.y, valueUnlistedShares(base).perShare);
  assert.ok(pts.some((p) => p.x === 0.5));
  assert.ok(pts.some((p) => p.x === 0.8));
  // 80% 이상은 순자산가치만: 30,000
  assert.equal(pts.at(-1)?.y, 30_000);
  // x는 오름차순
  for (let i = 1; i < pts.length; i++) assert.ok(pts[i].x > pts[i - 1].x);
});

test("토네이도: 사실·0인 가정 제외, 영향 큰 순서", () => {
  const bars = tornado(base, UNLISTED_ASSUMPTIONS, unlistedPerShare);
  const keys = bars.map((b) => b.key);
  assert.ok(!keys.includes("realEstateRatio"));
  assert.ok(!keys.includes("goodwill"));
  assert.deepEqual(keys.slice(0, 1), ["y1"]);
  for (let i = 1; i < bars.length; i++) assert.ok(bars[i - 1].span >= bars[i].span);
  // 최근 1년 이익 ±20%: 주당 6,000 ± 1,200 → 가중 ±600 → 순손익가치 ±6,000 → ×3/5 = ±3,600
  const y1 = bars[0];
  assert.equal(y1.base, 43_999);
  assert.ok(Math.abs(y1.high - y1.low - 7_200) <= 2);
});

test("다리: 마지막 막대 = 1주당 평가액, 단계 합 = 합계", () => {
  for (const input of [
    base,
    { ...base, realEstateRatio: 0.6 },
    { ...base, realEstateRatio: 0.9 },
    { ...base, netIncome: [-900_000_000, 100_000_000, 100_000_000] as [number, number, number] },
    { ...base, isMajorityHolder: true, premiumExempt: false },
    { ...base, netAssets: -500_000_000, realEstateRatio: 0.9 },
  ]) {
    const r = valueUnlistedShares(input);
    const bars = bridgeLayout(unlistedBridge(r));
    const last = bars.at(-1);
    assert.equal(last?.kind, "total");
    assert.equal(last?.end, r.perShare);
    const beforeLast = bars.at(-2);
    assert.ok(beforeLast && Math.abs(beforeLast.end - r.perShare) < 1, `run ${beforeLast?.end} vs ${r.perShare}`);
  }
  const floorBars = unlistedBridge(valueUnlistedShares({ ...base, netIncome: [-900_000_000, 100_000_000, 100_000_000] }));
  assert.ok(floorBars.some((s) => s.label.includes("하한")));
});

test("bridgeLayout 누적", () => {
  const bars = bridgeLayout([
    { label: "a", value: 10, kind: "add" },
    { label: "b", value: -3, kind: "add" },
    { label: "합", value: 7, kind: "total" },
  ]);
  assert.deepEqual(bars.map((b) => [b.start, b.end]), [[0, 10], [10, 7], [0, 7]]);
});

test("쉬운 문장", () => {
  const r = valueUnlistedShares(base);
  const p = unlistedPlain(r, tornado(base, UNLISTED_ASSUMPTIONS, unlistedPerShare)[0]);
  assert.match(p.headline, /약 44,000원/);
  assert.match(p.headline, /약 26\.4억 원/);
  assert.match(p.driver ?? "", /작년 순이익/);
});

test("한국어 금액 읽기", () => {
  assert.equal(parseKoreanAmount("6억"), 600_000_000);
  assert.equal(parseKoreanAmount("6억 3,000만"), 630_000_000);
  assert.equal(parseKoreanAmount("6억3천만"), 630_000_000);
  assert.equal(parseKoreanAmount("1.5억"), 150_000_000);
  assert.equal(parseKoreanAmount("3천만원"), 30_000_000);
  assert.equal(parseKoreanAmount("-2억"), -200_000_000);
  assert.equal(parseKoreanAmount("250,000,000"), 250_000_000);
  assert.equal(parseKoreanAmount("1조 2000억"), 1_200_000_000_000);
  assert.equal(parseKoreanAmount("만"), 10_000);
  assert.equal(parseKoreanAmount("12억 5"), 1_200_000_005);
  assert.equal(parseKoreanAmount(""), null);
  assert.equal(parseKoreanAmount("abc"), null);
});

test("표기·범위 도우미", () => {
  assert.equal(roughWon(2_639_940_000), "26.4억 원");
  assert.equal(roughWon(43_999), "44,000원");
  assert.equal(roughWon(16_000_000), "1,600만 원");
  assert.equal(compactWon(10_017), "1.00만");
  assert.equal(compactWon(120_000_000), "1.2억");
  assert.equal(roughWon(830), "830원");
  assert.equal(roughWon(-150_000_000), "−1.5억 원");
  assert.deepEqual(moneyRange(600_000_000), [0, 1_200_000_000]);
  const [lo, hi] = moneyRange(600_000_000, { signed: true });
  assert.ok(lo < 0 && hi === 1_200_000_000);
  assert.equal(niceStep(1_200_000_000), 20_000_000);
});

import { incorporationConversion, dcfValuation, familyBusinessInheritance, type FamilyBusinessInput, type ConversionInput, type DcfInput } from "./kr-advisory-2026.ts";
import {
  FAMILY_ASSUMPTIONS, familyBridge, familyPlain, familyTax, CONVERSION_ASSUMPTIONS, conversionBridge, conversionCgt, conversionPlain,
  DCF_ASSUMPTIONS, dcfBridge, dcfPerShare, dcfPlain,
} from "./kr-advisory-scenarios.ts";

const fam: FamilyBusinessInput = {
  businessValue: 10_000_000_000, unrelatedAssetRatio: 0.1, years: 15, size: "sme", otherEstate: 2_000_000_000,
  netFinancial: 300_000_000, debts: 0, funeralSpent: 10_000_000, hasSpouse: true, spouseInherited: 500_000_000,
};

test("가업상속: 다리 끝 = 과세표준, 경영 기간 곡선은 10·20·30년 계단", () => {
  for (const i of [fam, { ...fam, years: 8 }, { ...fam, businessValue: 100_000_000, otherEstate: 0 }, { ...fam, debts: 3_000_000_000 }]) {
    const r = familyBusinessInheritance(i);
    const bars = bridgeLayout(familyBridge(r));
    assert.equal(bars.at(-1)?.end, r.with.base);
    assert.ok(Math.abs((bars.at(-2)?.end ?? 0) - r.with.base) < 1);
  }
  const years = FAMILY_ASSUMPTIONS.find((a) => a.key === "years")!;
  const pts = sweep(fam, years, familyTax, years.range(15), 40);
  const at = (x: number) => pts.find((p) => p.x === x)!.y;
  assert.ok(at(9) > at(10));
  assert.equal(at(15), familyTax(fam));
  // 가업상속재산 90억 < 300억 한도 → 10년 이후는 같아요
  assert.equal(at(10), at(30));
  const bars = tornado(fam, FAMILY_ASSUMPTIONS, familyTax);
  assert.ok(!bars.some((b) => b.key === "years"));
  assert.match(familyPlain(fam, familyBusinessInheritance(fam), bars[0]).headline, /줄어요/);
});

const conv: ConversionInput = { business: "general", realEstateMarket: 1_000_000_000, realEstateCost: 400_000_000, holdYears: 10, otherAssets: 300_000_000, liabilities: 500_000_000 };

test("법인전환: 다리 = 최소 자본금, 보유기간 늘면 양도세 감소, 부채는 양도세와 무관", () => {
  const r = incorporationConversion(conv);
  const bars = bridgeLayout(conversionBridge(conv, r));
  assert.equal(bars.at(-1)?.end, r.minCapital);
  assert.equal(bars.at(-2)?.end, r.netAssets);
  const hold = CONVERSION_ASSUMPTIONS.find((a) => a.key === "holdYears")!;
  const pts = sweep(conv, hold, conversionCgt, hold.range(10), 25);
  assert.ok(pts[0].y > pts.at(-1)!.y);
  const t = tornado(conv, CONVERSION_ASSUMPTIONS, conversionCgt);
  assert.ok(!t.some((b) => b.key === "liabilities" || b.key === "otherAssets"));
  assert.equal(t[0].key, "realEstateMarket");
  assert.match(conversionPlain(conv, r, t[0]).headline, /미뤄요/);
  assert.match(conversionPlain({ ...conv, business: "consumptionService" }, incorporationConversion({ ...conv, business: "consumptionService" })).headline, /바로 내야/);
});

const dcf: DcfInput = { revenue0: 10_000_000_000, growth: 0.1, ebitMargin: 0.12, taxRate: 0.22, daRatio: 0.03, capexRatio: 0.04, nwcRatio: 0.15, wacc: 0.1, terminalGrowth: 0.02, netDebt: 2_000_000_000, shares: 1_000_000, years: 5 };

test("DCF: 다리 = 주주가치, 계산 불가 구간은 곡선·토네이도에서 빠짐", () => {
  const r = dcfValuation(dcf);
  const bars = bridgeLayout(dcfBridge(dcf, r));
  assert.ok(Math.abs(bars.at(-1)!.end - r.equity) < 1e-6);
  const ev = bars.find((b) => b.label === "기업가치")!;
  assert.ok(Math.abs(ev.end - r.enterprise) < 1e-6);
  const w = DCF_ASSUMPTIONS.find((a) => a.key === "wacc")!;
  const pts = sweep({ ...dcf, terminalGrowth: 0.05 }, w, dcfPerShare, w.range(0.1), 42);
  assert.ok(pts.every((p) => Number.isFinite(p.y)));
  assert.ok(pts[0].x > 0.05);
  const t = tornado(dcf, DCF_ASSUMPTIONS, dcfPerShare);
  assert.ok(t.length >= 4);
  assert.ok(!t.some((b) => b.key === "taxRate"));
  assert.match(dcfPlain(r, t[0]).headline, /1주당/);
  assert.equal(dcfPlain(dcfValuation({ ...dcf, wacc: 0.01 })).driver, null);
});
