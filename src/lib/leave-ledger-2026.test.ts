import test from "node:test";
import assert from "node:assert/strict";
import { leaveCsv, leaveLedger, leaveLine } from "./leave-ledger-2026.ts";

test("1년 미만은 매달 1일, 입사 1년 되기 전날까지 써요", () => {
  const l = leaveLine({ name: "가", start: "2026-03-02", used: 2 }, "2026-11-24");
  assert.equal(l.kind, "monthly");
  assert.equal(l.granted, 8);
  assert.equal(l.left, 6);
  assert.equal(l.useBy, "2027-03-01");
  assert.equal(l.nextDate, "2026-12-02");
});

test("3년 차 16일, 다음 발생일 전날까지 써요", () => {
  const l = leaveLine({ name: "나", start: "2023-05-10", used: 20 }, "2026-11-24");
  assert.equal(l.years, 3);
  assert.equal(l.granted, 16);
  assert.equal(l.left, 0);
  assert.equal(l.useBy, "2027-05-09");
  const r = leaveLedger([{ name: "나", start: "2023-05-10", used: 20 }, { name: "다", start: "잘못", used: 0 }], "2026-11-24");
  assert.deepEqual(r.over, ["나"]);
  assert.equal(r.lines[1].ok, false);
  assert.ok(leaveCsv([{ name: "나", start: "2023-05-10", used: 1 }], "2026-11-24").includes('"나","2023-05-10","3","연 단위","16","1","15","2027-05-09"'));
});
