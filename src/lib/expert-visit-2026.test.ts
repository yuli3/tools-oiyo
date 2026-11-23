import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync } from "node:fs";
import { EXPERTS, findExpertNeeds } from "./expert-visit-2026.ts";
import { KR_DESKS } from "./kr-desks-2026.ts";
import { buildDemandLetter, LETTER_TYPES } from "./demand-letter-2026.ts";
import { householdCheckup } from "./household-checkup-2026.ts";

const exists = (href: string) => {
  const [, loc, slug] = href.split("/");
  return existsSync(new URL(`../pages/${loc}/${slug}.astro`, import.meta.url)) || existsSync(new URL(`../pages/[locale]/${slug}.astro`, import.meta.url));
};

test("전문가 7곳, 할 일마다 실제 도구와 창구가 있어요", () => {
  assert.equal(EXPERTS.length, 7);
  for (const e of EXPERTS) {
    assert.ok(e.needs.length >= 4 && e.bring.length >= 3 && e.free.length >= 1, e.id);
    assert.ok(exists(e.guide), e.guide);
    for (const n of e.needs) {
      for (const x of n.tools) assert.ok(exists(x.href), `${e.id}/${n.id} ${x.href}`);
      if (n.desk) assert.ok(KR_DESKS.some((d) => d.id === n.desk), n.desk);
    }
  }
});

test("질문으로 전문가를 찾아요", () => {
  assert.equal(findExpertNeeds("부당해고 당했어요")[0].expert, "labor");
  assert.equal(findExpertNeeds("상속등기 셀프로 할 수 있나요")[0].expert, "court");
  assert.equal(findExpertNeeds("영업정지 행정심판")[0].expert, "admin");
  assert.equal(findExpertNeeds("기장료 아까운데 장부")[0].expert, "tax");
  assert.equal(findExpertNeeds("복비 얼마")[0].expert, "broker");
  assert.equal(findExpertNeeds("보험 리모델링")[0].expert, "plan");
  assert.equal(findExpertNeeds("비상장 주식 가치")[0].expert, "cpa");
});

test("내용증명 문안에 금액·날짜·당사자가 들어가요", () => {
  const r = buildDemandLetter({ type: "loan", sender: "김갑", receiver: "이을", amount: 3_000_000, since: "2026-01-05", dueDate: "2026-12-15", today: "2026-11-23" });
  assert.match(r.text, /금 3,000,000원/);
  assert.match(r.text, /2026년 1월 5일/);
  assert.match(r.text, /2026년 12월 15일까지/);
  assert.match(r.text, /수신인: 이을/);
  for (const l of LETTER_TYPES) assert.ok(buildDemandLetter({ type: l.id, sender: "", receiver: "" }).text.includes("○"));
  assert.throws(() => buildDemandLetter({ type: "x" as never, sender: "a", receiver: "b" }));
});

test("가계 재무 건강검진 비율", () => {
  const r = householdCheckup({ monthlyNet: 4_000_000, monthlySpend: 2_000_000, monthlySaving: 800_000, monthlyDebtPay: 600_000, monthlyInsurance: 500_000, emergencyFund: 3_000_000 });
  const by = Object.fromEntries(r.items.map((i) => [i.id, i]));
  assert.equal(by.emergency.value, "생활비 1.5개월치");
  assert.equal(by.emergency.status, "watch");
  assert.equal(by.saving.value, "20%");
  assert.equal(by.saving.status, "good");
  assert.equal(by.debt.value, "15%");
  assert.equal(by.insurance.value, "12.5%");
  assert.equal(by.insurance.status, "fix");
  assert.equal(r.leftover, 100_000);
  assert.deepEqual(r.fixFirst, ["insurance"]);
  assert.throws(() => householdCheckup({ monthlyNet: 0, monthlySpend: 0, monthlySaving: 0, monthlyDebtPay: 0, monthlyInsurance: 0, emergencyFund: 0 }));
});
