import { test } from "node:test";
import assert from "node:assert/strict";
import { legalHeirs, reserveShortfall } from "./kr-inheritance-share-2026.ts";

test("배우자 + 자녀 2명: 1.5 : 1 : 1 → 3/7, 2/7, 2/7", () => {
  const { rank, heirs } = legalHeirs({ spouse: true, children: 2, parents: 2, siblings: 1 });
  assert.equal(rank, 1);
  assert.deepEqual(heirs.map((h) => h.id), ["spouse", "child1", "child2"]);
  assert.ok(Math.abs(heirs[0].share - 3 / 7) < 1e-12);
  assert.ok(Math.abs(heirs[1].share - 2 / 7) < 1e-12);
});

test("자녀 없으면 배우자 + 부모, 둘 다 없으면 배우자 단독, 형제자매는 유류분 없음", () => {
  const p = legalHeirs({ spouse: true, children: 0, parents: 2, siblings: 3 });
  assert.equal(p.rank, 2);
  assert.ok(Math.abs(p.heirs[0].share - 1.5 / 3.5) < 1e-12);
  assert.equal(p.heirs[1].reserveRatio, 1 / 3);
  const s = legalHeirs({ spouse: true, children: 0, parents: 0, siblings: 3 });
  assert.deepEqual(s.heirs.map((h) => [h.id, h.share]), [["spouse", 1]]);
  const b = legalHeirs({ spouse: false, children: 0, parents: 0, siblings: 2 });
  assert.equal(b.rank, 3);
  assert.equal(b.heirs[0].reserveRatio, 0);
});

test("자녀 2명, 재산 2억 + 큰아들 생전 증여 8억: 둘째 유류분 2.5억, 받은 1억 → 부족 1.5억", () => {
  const r = reserveShortfall({ family: { spouse: false, children: 2, parents: 0, siblings: 0 }, estate: 200_000_000, gifts: { child1: 800_000_000 }, death: "2026-05-10" });
  assert.equal(r.basis, 1_000_000_000);
  const c2 = r.rows.find((x) => x.id === "child2")!;
  assert.equal(c2.reserve, 250_000_000);
  assert.equal(c2.inherited, 100_000_000);
  assert.equal(c2.shortfall, 150_000_000);
  assert.equal(r.rows.find((x) => x.id === "child1")!.shortfall, 0);
  assert.equal(r.deadline.tenYear, "2036-05-10");
});

test("제3자 유증 전부 + 채무: 배우자·자녀 1명", () => {
  const r = reserveShortfall({ family: { spouse: true, children: 1, parents: 0, siblings: 0 }, estate: 500_000_000, debts: 100_000_000, thirdBequests: 500_000_000 });
  assert.equal(r.basis, 400_000_000);
  const sp = r.rows[0];
  // 유류분 4억 × 3/5 × 1/2 = 1.2억, 받은 것 0 − 채무 분담 6천만 → 부족 1.8억
  assert.equal(sp.reserve, 120_000_000);
  assert.equal(sp.debtShare, 60_000_000);
  assert.equal(sp.shortfall, 180_000_000);
});
