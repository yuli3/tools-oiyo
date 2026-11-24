import { test } from "node:test";
import assert from "node:assert/strict";
import { lateBand, leaseContractAmount, leaseLateFine, leaseReport, ledgerCsv, payrollLedger, payrollLine } from "./kr-office-tasks-2026.ts";
import { simplifiedWithholding } from "./kr-payroll-month-2026.ts";

test("급여대장 한 줄은 간이세액표·2026 요율 계산과 같아요", () => {
  const l = payrollLine({ name: "가", base: 3_300_000, allowances: 200_000, nonTaxable: 200_000, family: 2, children: 0 });
  assert.equal(l.gross, 3_500_000);
  assert.equal(l.taxable, 3_300_000);
  assert.equal(l.incomeTax, simplifiedWithholding({ pay: 3_300_000, family: 2 }).incomeTax);
  assert.equal(l.net, l.gross - l.deductions);
  assert.equal(l.deductions, l.pension + l.health + l.care + l.employment + l.incomeTax + l.localTax);
});

test("급여대장 합계와 CSV", () => {
  const rows = [
    { name: "가", base: 2_500_000, allowances: 0, nonTaxable: 0, family: 1, children: 0 },
    { name: "나, 주임", base: 4_000_000, allowances: 300_000, nonTaxable: 200_000, family: 4, children: 2 },
  ];
  const r = payrollLedger(rows);
  assert.equal(r.totals.gross, 6_800_000);
  assert.equal(r.totals.net, r.lines[0].net + r.lines[1].net);
  const csv = ledgerCsv(rows, "2026-11");
  assert.ok(csv.startsWith("﻿귀속월,성명"));
  assert.ok(csv.includes('"나, 주임"'));
  assert.equal(csv.split("\r\n").length, 4);
});

test("임대차 신고 대상: 6천만원 초과 또는 월 30만원 초과, 같은 조건 갱신 제외", () => {
  assert.equal(leaseReport({ deposit: 60_000_000, monthlyRent: 300_000, contractDate: "2026-11-01", today: "2026-11-02" }).required, false);
  assert.equal(leaseReport({ deposit: 60_000_001, monthlyRent: 0, contractDate: "2026-11-01", today: "2026-11-02" }).required, true);
  assert.equal(leaseReport({ deposit: 10_000_000, monthlyRent: 300_001, contractDate: "2026-11-01", today: "2026-11-02" }).required, true);
  assert.equal(leaseReport({ deposit: 100_000_000, monthlyRent: 0, renewalSameTerms: true, contractDate: "2026-11-01", today: "2026-11-02" }).required, false);
  assert.equal(leaseReport({ deposit: 100_000_000, monthlyRent: 0, contractDate: "2026-01-01", today: "2026-01-02" }).deadline, "2026-01-31");
});

test("임대차 미신고 과태료: 별표 3 마목 1)", () => {
  assert.equal(leaseContractAmount(50_000_000, 500_000), 150_000_000);
  const s = Date.UTC(2026, 0, 1);
  assert.equal(lateBand(s, Date.UTC(2026, 2, 31)), 0);
  assert.equal(lateBand(s, Date.UTC(2026, 3, 1)), 1);
  assert.equal(lateBand(s, Date.UTC(2028, 0, 1)), 4);
  assert.equal(leaseLateFine(99_999_999, 0), 20_000);
  assert.equal(leaseLateFine(100_000_000, 1), 80_000);
  assert.equal(leaseLateFine(300_000_000, 2), 160_000);
  assert.equal(leaseLateFine(500_000_000, 3), 250_000);
  assert.equal(leaseLateFine(500_000_000, "refused"), 300_000);
  const r = leaseReport({ deposit: 200_000_000, monthlyRent: 0, contractDate: "2026-01-01", today: "2026-03-01" });
  assert.equal(r.fine, 30_000);
  assert.equal(leaseReport({ deposit: 200_000_000, monthlyRent: 0, tenantMovedIn: true, contractDate: "2026-01-01", today: "2026-12-01" }).fine, 0);
});
