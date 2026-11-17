import test from "node:test";
import assert from "node:assert/strict";
import { PROFESSIONS, STATUTES, TOPICS, SCOPE_MATRIX, amendRelief, auditTest, booksDuty, dueDate, findStatutes, giftLimit, intake, lateRelief, statuteUrl, suggestTopics, twistingTest, visibleQuestions, withdrawDeadline } from "./kr-expert-guide-2026.ts";

test("자료: 주제가 가리키는 조문이 모두 있고, 다섯 분야 모두 주제가 있어요", () => {
  const ids = new Set(STATUTES.map((s) => s.id));
  assert.equal(ids.size, STATUTES.length, "조문 id 중복");
  for (const t of TOPICS) for (const id of t.statutes) assert.ok(ids.has(id), `${t.id} → ${id}`);
  for (const d of Object.keys(PROFESSIONS)) assert.ok(TOPICS.some((t) => t.domain === d), d);
  assert.equal(new Set(TOPICS.map((t) => t.id)).size, TOPICS.length);
  for (const t of TOPICS) for (const r of t.deadlines) assert.ok(t.questions.some((q) => q.key === r.from), `${t.id} 기한 ${r.id}의 기산일 질문`);
  assert.ok(SCOPE_MATRIX.length >= 8);
});

test("자격 명칭을 이름으로 쓰지 않아요(유사명칭 금지)", () => {
  for (const p of Object.values(PROFESSIONS)) assert.doesNotMatch(p.name, /세무사|회계사|노무사|행정사|법무사|계리사|손해사정사|설계사/);
});

test("기한: 초일 불산입, 월 단위는 같은 날, 말일 기준은 그 달 말일", () => {
  // 해고 2026-03-10 → 3개월 → 2026-06-10(수)
  assert.equal(dueDate({ months: 3 }, "2026-03-10")?.due, "2026-06-10");
  // 8-31 + 6개월 → 2027-02-28 (없는 날은 그 달 말일)
  assert.equal(dueDate({ months: 6 }, "2026-08-31")?.nominal, "2027-02-28");
  // 상속: 2026-03-10 사망 → 3월 말일부터 6개월 → 9-30(수)
  assert.equal(dueDate({ fromMonthEnd: true, months: 6, tax: true }, "2026-03-10")?.due, "2026-09-30");
  // 양도: 2026-08-14 잔금 → 8월 말일부터 2개월 → 10-31(토) → 11-02(월)
  const cgt = dueDate({ fromMonthEnd: true, months: 2, tax: true }, "2026-08-14");
  assert.equal(cgt?.nominal, "2026-10-31");
  assert.equal(cgt?.due, "2026-11-02");
  assert.equal(cgt?.shifted, true);
  // 90일: 2026-01-02 + 90 = 2026-04-02(목)
  assert.equal(dueDate({ days: 90 }, "2026-01-02")?.due, "2026-04-02");
  // 국세: 근로자의 날(5/1, 금)이면 다음 영업일. 2026-01-31 + 90일 = 2026-05-01 → 05-04(월)
  assert.equal(dueDate({ days: 90, tax: true }, "2026-01-31")?.due, "2026-05-04");
  // 민사 기한은 근로자의 날을 휴일로 보지 않아요
  assert.equal(dueDate({ days: 90 }, "2026-01-31")?.due, "2026-05-01");
  // 0일(문서에 적힌 날)·음수 개월은 휴일로 미루지 않아요
  assert.equal(dueDate({ days: 0 }, "2026-10-31")?.due, "2026-10-31");
  assert.equal(dueDate({ months: -2 }, "2026-12-31")?.due, "2026-10-31");
  assert.equal(dueDate({ days: 3 }, "잘못"), null);
});

test("가산세 감면: 수정신고·기한 후 신고 구간", () => {
  assert.deepEqual([0.5, 1, 2, 5, 11, 17, 23, 30].map(amendRelief), [90, 90, 75, 50, 30, 20, 10, 0]);
  assert.deepEqual([0.5, 2, 5, 7].map(lateRelief), [50, 30, 20, 0]);
});

test("장부 의무: 업종별 간편장부·복식부기·성실신고 기준", () => {
  assert.equal(booksDuty({ entity: "person", industry: "service", revenue: 74_999_999 })?.level, "simple");
  assert.equal(booksDuty({ entity: "person", industry: "service", revenue: 75_000_000 })?.level, "double");
  assert.equal(booksDuty({ entity: "person", industry: "retail", revenue: 1_500_000_000 })?.level, "sincere");
  assert.equal(booksDuty({ entity: "person", industry: "manufacturing", revenue: 149_000_000 })?.level, "simple");
  assert.equal(booksDuty({ entity: "corp" })?.level, "double");
  assert.equal(booksDuty({ entity: "person", newBiz: true })?.level, "simple");
  assert.equal(booksDuty({ entity: "person", industry: "service" }), null);
});

test("외부감사: 500억 단독 기준, 4개 중 2개(유한회사 5개 중 3개)", () => {
  const base = { listed: false, corpType: "stock", assets: 5_000_000_000, liabilities: 1_000_000_000, sales: 5_000_000_000, employees: 20 };
  assert.equal(auditTest(base)?.subject, false);
  assert.equal(auditTest({ ...base, sales: 50_000_000_000 })?.subject, true);
  assert.equal(auditTest({ ...base, assets: 12_000_000_000 })?.subject, false);
  assert.equal(auditTest({ ...base, assets: 12_000_000_000, employees: 100 })?.subject, true);
  assert.equal(auditTest({ ...base, corpType: "llc", assets: 12_000_000_000, employees: 100 })?.subject, false);
  assert.equal(auditTest({ ...base, corpType: "llc", assets: 12_000_000_000, employees: 100, members: 50 })?.subject, true);
  assert.equal(auditTest({ listed: true })?.subject, true);
  assert.equal(auditTest({ listed: false }), null);
});

test("intake: 필수 질문부터 묻고, 답이 쌓이면 기한과 경고가 나와요", () => {
  const first = intake("labor-dismissal", {}, "2026-11-16");
  assert.equal(first.readiness, 0);
  assert.equal(first.nextQuestions[0].key, "size");
  assert.equal(first.nextQuestions.length, 3);
  assert.equal(first.deadlines.length, 0);

  const r = intake("labor-dismissal", { size: "5plus", dismissDate: "2026-10-30", written: "no", notice30: "no", tenureMonths: 14 }, "2026-11-16");
  assert.equal(r.readiness, 100);
  const remedy = r.deadlines.find((d) => d.id === "remedy");
  assert.equal(remedy?.due, "2027-02-01"); // 2027-01-30 토요일 → 월요일
  assert.ok(remedy && remedy.daysLeft > 60);
  const settle = r.deadlines.find((d) => d.id === "settle");
  assert.equal(settle?.due, "2026-11-13");
  assert.equal(settle?.status, "passed");
  assert.ok(r.flags.some((f) => f.cite === "근로기준법 제27조"));
  assert.ok(r.flags.some((f) => f.cite === "근로기준법 제26조"));
  assert.ok(r.statutes.every((s) => s.url.startsWith("https://www.law.go.kr/법령/")));

  const small = intake("labor-dismissal", { size: "under5", dismissDate: "2026-10-30" }, "2026-11-16");
  assert.ok(!small.deadlines.some((d) => d.id === "remedy"), "5인 미만은 구제신청 기한을 보이지 않아요");
  assert.equal(small.handOff, null);
});

test("intake: 조건부 질문(askIf)과 세금 기한", () => {
  const t = TOPICS.find((x) => x.id === "tax-estate")!;
  assert.ok(!visibleQuestions(t, { kind: "gift" }).some((q) => q.key === "abroad"));
  assert.ok(visibleQuestions(t, { kind: "inherit" }).some((q) => q.key === "abroad"));
  const r = intake("tax-estate", { kind: "inherit", eventDate: "2026-03-10", realEstate: "yes", relation: "child", value: 400_000_000 }, "2026-04-01");
  const ids = r.deadlines.map((d) => d.id);
  assert.deepEqual(ids, ["renounce", "inherit-tax", "acq-inherit"]);
  assert.equal(r.deadlines[1].due, "2026-09-30");
  assert.ok(r.flags.some((f) => f.cite === "상속세 및 증여세법 제21조"));

  const fix = intake("tax-fix", { direction: "under", taxType: "income", dueDate: "2026-06-01" }, "2026-06-20");
  assert.ok(fix.flags.some((f) => f.text.includes("90%")));
  const late = intake("tax-fix", { direction: "none", taxType: "income", dueDate: "2026-06-01" }, "2026-08-20");
  assert.ok(late.flags.some((f) => f.text.includes("30%")));
});

test("intake: 시효는 청구 종류에 따라, 소액사건 3,000만 원", () => {
  const r = intake("court-money", { claim: "commercial", dueDate: "2022-01-10", amount: 30_000_000, address: "yes" }, "2026-11-16");
  assert.equal(r.deadlines[0].id, "limit-commercial");
  assert.equal(r.deadlines[0].due, "2027-01-11"); // 2027-01-10 일요일 → 월요일
  assert.ok(r.flags.some((f) => f.text.includes("소액사건")));
  assert.throws(() => intake("없는-주제"));
});

test("찾기: 조문 키워드·상황 문장으로 주제 추천", () => {
  assert.equal(findStatutes("부당해고 구제신청")[0].id, "lsa-28");
  assert.equal(findStatutes("임차권등기", "court")[0].id, "hla-3-3");
  assert.ok(findStatutes("", "tax").length > 0);
  assert.equal(suggestTopics("회사에서 문자로 해고 통보를 받았어요")[0].id, "labor-dismissal");
  assert.equal(suggestTopics("전세 보증금을 못 돌려받아요")[0].id, "court-deposit");
  assert.equal(statuteUrl({ law: "소득세법 시행령", article: "제208조 제5항" }), "https://www.law.go.kr/법령/소득세법시행령/제208조");
  assert.equal(statuteUrl({ law: "근로기준법", article: "제76조의2·제76조의3" }), "https://www.law.go.kr/법령/근로기준법/제76조의2");
});

test("보험: 청약철회는 15일·30일 중 먼저, 사은품 한도는 10%와 20만 원 중 적은 금액, 승환 1·6개월", () => {
  // 증권 2026-11-10 → 11-25(수), 청약 2026-11-01 → 12-01 → 증권 기준이 먼저
  assert.deepEqual(withdrawDeadline("2026-11-01", "2026-11-10"), { due: "2026-11-25", by: "policy" });
  // 증권을 늦게 받으면 청약 30일이 먼저: 청약 10-01 → 10-31(토) → 11-02(월)
  assert.deepEqual(withdrawDeadline("2026-10-01", "2026-10-25"), { due: "2026-11-02", by: "apply" });
  assert.equal(giftLimit(1_200_000), 120_000);
  assert.equal(giftLimit(3_600_000), 200_000);
  assert.equal(giftLimit(0), 0);
  assert.equal(twistingTest("2026-05-01", "2026-05-20", true)?.level, "deemed");
  assert.equal(twistingTest("2026-05-01", "2026-08-01", false)?.level, "deemed");
  assert.equal(twistingTest("2026-05-01", "2026-08-01", true)?.level, "check");
  assert.equal(twistingTest("2026-01-01", "2026-09-01", false)?.level, "clear");
  // 새 계약을 먼저 들고 기존을 나중에 깨도 같은 기준
  assert.equal(twistingTest("2026-06-10", "2026-06-01", false)?.level, "deemed");
});

test("보험 주제: 질문·기한·확인할 점", () => {
  const r = intake("ins-undo", { why: "mind", applyDate: "2026-11-01", policyDate: "2026-11-10" }, "2026-11-17");
  assert.equal(r.deadlines[0].id, "withdraw-15");
  assert.equal(r.deadlines[0].due, "2026-11-25");
  assert.ok(r.flags.some((f) => f.text.includes("2026-11-25")));
  const c = intake("ins-claim", { status: "rescind", accidentDate: "2026-09-01", contractDate: "2022-03-01", noticeDate: "2026-10-01" }, "2026-11-17");
  assert.equal(c.deadlines[0].due, "2029-09-03"); // 2029-09-01(토) → 09-03(월)
  assert.ok(c.flags.some((f) => f.tone === "good" && f.cite === "상법 제651조"));
  const sc = intake("ins-sales-check", { premium: 1_200_000, gift: 150_000, replace: "yes", oldEndDate: "2026-10-01", newApplyDate: "2026-10-15", compared: "yes" }, "2026-11-17");
  assert.ok(sc.flags.some((f) => f.tone === "warn" && f.text.includes("120,000원")));
  assert.ok(sc.flags.some((f) => f.text.includes("1개월 안")));
  assert.equal(intake("ins-pro-scope", { role: "adjuster", task: "settle" }).flags[0].tone, "warn");
  assert.equal(suggestTopics("보험 청약철회 하고 싶어요")[0].id, "ins-undo");
  assert.equal(findStatutes("사은품", "insurance")[0].id, "ins-98");
  assert.equal(statuteUrl({ law: "금융소비자 보호에 관한 법률", article: "제46조" }), "https://www.law.go.kr/법령/금융소비자보호에관한법률/제46조");
});
