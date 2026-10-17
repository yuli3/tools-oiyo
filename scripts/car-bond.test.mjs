// Vectors for src/lib/car-bond-2026.mjs (2026-10-17). Each case is tied to the official source noted in the data file.
import test from "node:test";
import assert from "node:assert/strict";
import { carBond2026, roundBondAmount, CAR_BOND_REGIONS } from "../src/lib/car-bond-2026.mjs";

const run = (regionId, sizeClass, isEv = false, taxBase = 35_000_000, discountRate = 0.06) =>
  carBond2026({ regionId, sizeClass, isEv, taxBase, discountRate });

test("서울: 소형 면제(2028-12-31까지), 중형 12%, 대형 20%, 7년·2.5% 복리", () => {
  assert.equal(run("seoul", "small").status, "exempt");
  const mid = run("seoul", "mid");
  assert.equal(mid.bondAmount, 4_200_000);
  assert.equal(mid.discountCost, 252_000);
  assert.equal(mid.maturity.years, 7);
  assert.equal(mid.maturity.amount, Math.floor(4_200_000 * 1.025 ** 7));
  assert.equal(run("seoul", "large").bondAmount, 7_000_000);
});

test("서울 전기차: 크기별 비율에서 250만 원 면제", () => {
  assert.equal(run("seoul", "small", true).bondAmount, 650_000); // 3,150,000 − 2,500,000
  assert.equal(run("seoul", "small", true, 20_000_000).status, "exempt"); // 1,800,000 ≤ 250만
});

test("부산: 신규등록 소형·중형·대형 모두 2026-12-31까지 면제", () => {
  for (const s of ["small", "mid", "large"]) assert.equal(run("busan", s).status, "exempt");
});

test("대구: 소형·중형 면제, 대형 5%", () => {
  assert.equal(run("daegu", "mid").status, "exempt");
  assert.equal(run("daegu", "large").bondAmount, 1_750_000);
  assert.equal(run("daegu", "large").maturity, null); // 상환 조건 미확인 → 확인 필요
});

test("인천: 2026년도 1,600~2,000cc 면제, 2,000cc 이상 5%, 지역개발채권 5년", () => {
  assert.equal(run("incheon", "mid").status, "exempt");
  const large = run("incheon", "large");
  assert.equal(large.bondAmount, 1_750_000);
  assert.equal(large.maturity.years, 5);
});

test("경기: 1,600cc 초과 8%, 2,000cc 초과 12%", () => {
  assert.equal(run("gyeonggi", "mid").bondAmount, 2_800_000);
  assert.equal(run("gyeonggi", "large").bondAmount, 4_200_000);
});

test("확인 못 한 칸은 추측하지 않고 unknown", () => {
  assert.equal(run("jeju", "mid").status, "unknown");
  assert.equal(run("gwangju", "small").status, "unknown");
  assert.equal(run("daegu", "mid", true).status, "unknown");
  for (const r of CAR_BOND_REGIONS) {
    assert.ok(r.source && r.url && r.basisDate, `${r.id} needs source/url/basisDate`);
  }
});

test("끝수: 최저 5천 원, 2,500원 기준 5천 원 단위", () => {
  assert.equal(roundBondAmount(1), 5000);
  assert.equal(roundBondAmount(12_499), 10_000);
  assert.equal(roundBondAmount(12_500), 15_000);
  assert.equal(roundBondAmount(0), 0);
});
