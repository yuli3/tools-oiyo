import test from "node:test";
import assert from "node:assert/strict";
import { sweep, tornado, bridgeLayout, parseKoreanAmount, roughWon, moneyRange, niceStep } from "./scenario.ts";
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
  assert.match(p.headline, /약 4\.4만 원/);
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
  assert.equal(roughWon(43_999), "4.4만 원");
  assert.equal(roughWon(830), "830원");
  assert.equal(roughWon(-150_000_000), "−1.5억 원");
  assert.deepEqual(moneyRange(600_000_000), [0, 1_200_000_000]);
  const [lo, hi] = moneyRange(600_000_000, { signed: true });
  assert.ok(lo < 0 && hi === 1_200_000_000);
  assert.equal(niceStep(1_200_000_000), 20_000_000);
});
