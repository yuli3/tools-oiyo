import test from "node:test";
import assert from "node:assert/strict";
import { midYearLeaver } from "./kr-midyear-leaver-2026.ts";
import { settleYearEnd } from "./kr-year-end-2026.ts";

const base = { year: 2026, salaryToDate: 24_000_000, withheld: 600_000, nationalPension: 1_140_000, healthEmployment: 1_080_000 };

test("회사 정산은 본인 1명으로 연말정산 엔진과 같아요", () => {
  const r = midYearLeaver(base);
  const ref = settleYearEnd({ salary: 24_000_000, persons: 1, nationalPension: 1_140_000, healthEmployment: 1_080_000, withheld: 600_000 });
  assert.equal(r.company.finalTax, ref.finalTax);
  assert.equal(r.companyRefund, ref.refund!.total);
  // 더할 것이 없으면 5월 신고도 같아요
  assert.equal(r.extraByFiling, 0);
  assert.equal(r.drivers.length, 0);
});

test("부양가족·카드·의료비를 더하면 5월 신고 환급이 커져요", () => {
  const r = midYearLeaver({ ...base, extra: { persons: 3, card: { credit: 12_000_000 }, medical: 3_000_000 } });
  assert.ok(r.mayRefund > r.companyRefund);
  assert.equal(r.extraByFiling, r.mayRefund - r.companyRefund);
  assert.ok(r.drivers.some((d) => d.label === "부양가족 기본공제" && d.amount === 3_000_000));
  assert.ok(r.may.finalTax <= r.company.finalTax);
});

test("5월 신고 기한: 2027-05-31(월)", () => {
  assert.equal(midYearLeaver(base).mayDeadline, "2027-05-31");
});

test("떼인 세금이 결정세액보다 적으면 추가 납부(음수)", () => {
  const r = midYearLeaver({ ...base, salaryToDate: 60_000_000, withheld: 0 });
  assert.ok(r.companyRefund < 0);
});
