import { test } from "node:test";
import assert from "node:assert/strict";
import { auctionDistribution, smallTenantRow } from "./kr-auction-distribution-2026.ts";

const MAN = 10_000;

test("소액임차인 표는 최선순위 담보물권 설정일로 골라요", () => {
  assert.equal(smallTenantRow("seoul", "2024-01-01")!.priority, 5500 * MAN);
  assert.equal(smallTenantRow("seoul", "2022-01-01")!.priority, 5000 * MAN);
  assert.equal(smallTenantRow("other", "2019-01-01")!.limit, 5000 * MAN);
  assert.equal(smallTenantRow("seoul", "2017-01-01"), null);
});

test("서울 빌라 2억 매각, 근저당(2023-05) 1.5억 뒤 확정일자 임차인 1억6천만: 5,500만 최우선만 받아요", () => {
  const r = auctionDistribution({
    sale: 20000 * MAN, cost: 300 * MAN, region: "seoul", baseDate: "2023-05-01",
    tenants: [{ label: "임차인", deposit: 16000 * MAN, date: "2024-03-02" }],
    claims: [{ label: "은행 근저당", amount: 15000 * MAN, date: "2023-05-01", kind: "mortgage" }],
  });
  assert.equal(r.distributable, 19700 * MAN);
  const t = r.tenants[0];
  assert.equal(t.small, true);
  // 5,500만 최우선 → 남은 1억4,200만은 먼저 설정한 근저당이 다 가져가요
  assert.equal(t.paid, 5500 * MAN);
  assert.equal(t.unpaid, 10500 * MAN);
  assert.equal(r.payouts.find((p) => p.label === "은행 근저당")!.paid, 14200 * MAN);
  assert.equal(r.leftover, 0);
});

test("최우선변제 합이 배당할 금액의 1/2을 넘으면 1/2로 나눠요", () => {
  const r = auctionDistribution({
    sale: 10000 * MAN, region: "other", baseDate: "2024-01-01",
    tenants: [1, 2, 3].map((i) => ({ label: `임차인${i}`, deposit: 7000 * MAN })),
  });
  assert.equal(r.smallCapped, true);
  const first = r.payouts.filter((p) => p.step === "최우선변제");
  assert.ok(5000 * MAN - first.reduce((s, p) => s + p.paid, 0) < 10);
});

test("보증금이 범위를 넘으면 최우선변제 없음, 같은 날짜는 비율로 나눠요", () => {
  const r = auctionDistribution({
    sale: 10000 * MAN, region: "metro", baseDate: "2024-01-01",
    tenants: [{ label: "임차인", deposit: 9000 * MAN, date: "2024-02-01" }],
    claims: [{ label: "세금", amount: 9000 * MAN, date: "2024-02-01", kind: "tax" }],
  });
  assert.equal(r.tenants[0].small, false);
  assert.equal(r.tenants[0].paid, 5000 * MAN);
});
