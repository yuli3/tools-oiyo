import { test } from "node:test";
import assert from "node:assert/strict";
import { directBundles, rvc, simpleRefund, travelerTax } from "./kr-customs-pack-2026.ts";

test("휴대품 1,800달러, 환율 1,400원: 초과 1,000달러 × 20% = 28만 원, 자진신고 감면 8.4만 원", () => {
  const r = travelerTax({ totalUsd: 1800, fx: 1400, selfReport: true });
  assert.equal(r.base, 1_400_000);
  assert.equal(r.tax, 280_000);
  assert.equal(r.reduction, 84_000);
  assert.equal(r.total, 196_000);
});

test("자진신고 감면은 20만 원 한도, 미신고로 걸리면 40%·반복 60%", () => {
  assert.equal(travelerTax({ totalUsd: 10800, fx: 1400, selfReport: true }).reduction, 200_000);
  const c = travelerTax({ totalUsd: 1800, fx: 1400, caught: "once" });
  assert.equal(c.penalty, 112_000);
  assert.equal(travelerTax({ totalUsd: 1800, fx: 1400, caught: "repeat" }).penalty, 168_000);
  assert.equal(travelerTax({ totalUsd: 700, fx: 1400 }).total, 0);
});

test("직구 같은 날 입항 합산: 100 + 80달러 → 150 초과로 둘 다 과세, 다른 날은 면세", () => {
  const r = directBundles([
    { label: "운동화", priceUsd: 100, shippingUsd: 10, arrival: "2026-11-25" },
    { label: "셔츠", priceUsd: 80, arrival: "2026-11-25" },
    { label: "책", priceUsd: 90, arrival: "2026-11-27" },
  ], 1400, 0.13);
  assert.equal(r[0].taxed, true);
  assert.equal(r[0].value, 266_000);
  assert.equal(r[0].duty, 34_580);
  assert.equal(r[0].vat, 30_050);
  assert.equal(r[1].taxed, false);
  assert.equal(directBundles([{ label: "a", priceUsd: 190, arrival: "2026-11-25", fromUs: true }], 1400)[0].taxed, false);
});

test("RVC 공제법 55% 기준: FOB 100, 비원산지 40 → 60% 충족, 5만큼 여유", () => {
  const r = rvc({ value: 100_000, nonOriginating: 40_000, threshold: 55, method: "build-down" });
  assert.equal(r.rate, 60);
  assert.equal(r.pass, true);
  assert.equal(r.headroom, 5_000);
  assert.equal(rvc({ value: 100_000, nonOriginating: 0, originating: 30_000, threshold: 35, method: "build-up" }).pass, false);
});

test("간이정액환급: FOB 1억 2,345만 원, 1만 원당 30원 → 12,345 × 30, 청구는 수리일부터 2년", () => {
  const r = simpleRefund({ fobKrw: 123_456_789, perTenThousand: 30, accepted: "2026-11-20" });
  assert.equal(r.units, 12_345);
  assert.equal(r.amount, 370_350);
  assert.equal(r.due, "2028-11-20");
});
