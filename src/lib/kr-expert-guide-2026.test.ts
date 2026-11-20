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
  for (const p of Object.values(PROFESSIONS)) assert.doesNotMatch(p.name, /세무사|회계사|노무사|행정사|법무사|계리사|손해사정사|설계사|관세사|변리사|감정평가사|중개사|건축사|의사|약사|사회복지사|변호사/);
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

test("분야 팩: 관세·특허·감정평가·중개가 붙고 기한이 맞아요", () => {
  assert.equal(Object.keys(PROFESSIONS).length, 17);
  for (const d of ["customs", "ip", "appraisal", "realty"] as const) {
    assert.ok(TOPICS.filter((t) => t.domain === d).length >= 2, d);
    assert.ok(STATUTES.some((x) => x.domain === d), d);
    assert.ok(SCOPE_MATRIX.some((m) => m.who[d] === "yes"), d);
    assert.ok(PROFESSIONS[d].exclusive.length >= 1 && PROFESSIONS[d].freeHelp.length >= 1, d);
  }
  const refund = intake("customs-correct", { situation: "over", payDate: "2026-03-10" }, "2026-11-17").deadlines.find((x) => x.id === "refund");
  assert.equal(refund?.due, "2031-03-10");
  const appeal = intake("customs-correct", { situation: "assessed", noticeDate: "2026-11-02" }, "2026-11-17").deadlines;
  assert.equal(appeal.length, 1);
  assert.equal(appeal[0].due, "2027-02-01"); // 90일째 2027-01-31이 일요일이라 다음 날
  const grace = intake("ip-disclosed", { discloseDate: "2026-05-20", byInventor: "yes" }, "2026-11-17").deadlines[0];
  assert.equal(grace.due, "2027-05-20");
  const exp = intake("appr-expropriation", { decisionDate: "2026-11-10" }, "2026-11-17").deadlines;
  assert.deepEqual(exp.map((x) => x.id), ["objection", "suit"]);
  assert.equal(exp[0].due, "2026-12-10");
  const fee = intake("realty-fee", { dealType: "sale", contractDate: "2026-11-01" }, "2026-11-17");
  assert.equal(fee.deadlines[0].due, "2026-12-01");
  assert.ok(fee.tools.some((t) => t.href === "/ko/brokerage-calculator/"));
  const direct = intake("customs-direct", { price: 180, fromUs: "yes", resale: "no" }).flags;
  assert.equal(direct[0].tone, "good");
  assert.equal(intake("customs-direct", { price: 180, fromUs: "no", resale: "no" }).flags[0].tone, "warn");
  assert.equal(suggestTopics("해외직구 200달러 관세")[0].id, "customs-direct");
  assert.equal(suggestTopics("수용 보상금 이의신청")[0].id, "appr-expropriation");
  assert.equal(findStatutes("공지예외")[0].id, "pa-30");
});

test("분야 팩 11-20: 건축·보건·가사·복지급여 14분야, 기한과 경고", () => {
  for (const d of ["building", "health", "family", "welfare"] as const) {
    assert.ok(TOPICS.filter((t) => t.domain === d).length >= 2, d);
    assert.ok(STATUTES.filter((x) => x.domain === d).length >= 5, d);
    assert.ok(SCOPE_MATRIX.some((m) => m.who[d] === "yes"), d);
    assert.ok(PROFESSIONS[d].exclusive.length >= 1 && PROFESSIONS[d].freeHelp.length >= 2, d);
  }
  const ids = new Set(STATUTES.map((x) => x.id));
  for (const t of TOPICS) for (const id of t.statutes) assert.ok(ids.has(id), `${t.id}:${id}`);
  // 이행강제금 행정심판 90일
  const bld = intake("bld-violation", { stage: "fine", noticeDate: "2026-11-02", cause: "extension" }, "2026-11-20");
  assert.equal(bld.deadlines[0].due, "2027-02-01");
  assert.ok(bld.flags.some((f) => f.cite === "건축법 제80조"));
  // 85㎡ 이내 증축은 신고(착공 1년), 넘으면 허가(2년)
  assert.deepEqual(intake("bld-permit", { work: "extend", area: 30, approvedDate: "2026-03-03" }).deadlines.map((x) => x.id), ["start-report"]);
  assert.deepEqual(intake("bld-permit", { work: "extend", area: 120, approvedDate: "2026-03-03" }).deadlines.map((x) => x.id), ["start-permit"]);
  // 협의이혼: 자녀 있으면 숙려 3개월, 확인 후 신고 3개월, 재산분할 2년
  const div = intake("fam-divorce", { kids: "yes", applyDate: "2026-11-02", confirmDate: "2027-02-03", divorceDate: "2027-02-10" }, "2026-11-20").deadlines;
  assert.deepEqual(div.map((x) => x.id), ["cooling", "report", "split"]);
  assert.equal(div.find((x) => x.id === "split")?.due, "2029-02-12"); // 2029-02-10 토요일
  assert.equal(intake("fam-divorce", { kids: "no", applyDate: "2026-11-02" }).deadlines[0].id, "cooling-1");
  const sup = intake("fam-support", { decided: "yes", missed: 4, monthly: 500_000, order: "yes" }).flags;
  assert.ok(sup.some((f) => f.text.includes("2,000,000원")));
  assert.ok(sup.some((f) => f.cite === "가사소송법 제68조"));
  // 의료분쟁 3년·10년, 기록 보존
  assert.deepEqual(intake("health-dispute", { issue: "injury", knewDate: "2026-05-01", treatEnd: "2026-04-01" }).deadlines.map((x) => x.id), ["mediate", "mediate-long"]);
  assert.equal(intake("health-records", { who: "self", what: "rx", visitDate: "2026-01-05" }).deadlines[0].id, "keep-rx");
  // 기초생활 이의신청 90일, 긴급복지 129
  assert.equal(intake("welfare-basic", { stage: "denied", noticeDate: "2026-11-02" }, "2026-11-20").deadlines[0].due, "2027-02-01");
  assert.equal(intake("welfare-emergency", { cause: "job", urgentNow: "yes" }).flags[0].tone, "warn");
  assert.equal(suggestTopics("이행강제금 위반건축물")[0].id, "bld-violation");
  assert.equal(suggestTopics("양육비 안 줘요 감치")[0].id, "fam-support");
  assert.equal(suggestTopics("기초생활수급 탈락 이의신청")[0].id, "welfare-basic");
  assert.equal(findStatutes("진료기록 사본")[0].id, "med-21");
});

test("분야 팩 11-20: 소비자·온라인 구매 청약철회·해지", () => {
  const on = intake("cons-online", { deliveredDate: "2026-11-02", reason: "change" }, "2026-11-20").deadlines;
  assert.deepEqual(on.map((x) => x.id), ["withdraw"]);
  assert.equal(on[0].due, "2026-11-09");
  const diff = intake("cons-online", { deliveredDate: "2026-11-02", reason: "differs", knewDate: "2026-11-10" }, "2026-11-20").deadlines;
  assert.deepEqual(diff.map((x) => x.id), ["withdraw", "differs-knew", "differs"]); // 마감일 순
  assert.equal(diff[1].due, "2026-12-10");
  assert.equal(diff[2].due, "2027-02-02");
  assert.equal(intake("cons-contract", { type: "visit", contractDate: "2026-11-02" }).deadlines[0].due, "2026-11-16");
  const inst = intake("cons-contract", { type: "installment", contractDate: "2026-11-02", price: 300_000, months: 6, problem: "yes" });
  assert.equal(inst.deadlines[0].due, "2026-11-09");
  assert.ok(inst.flags.some((f) => f.cite === "할부거래법 제16조" && f.tone === "good"));
  assert.equal(intake("cons-contract", { type: "continuing" }).flags[0].tone, "good");
  assert.equal(suggestTopics("온라인 쇼핑 환불 반품 7일")[0].id, "cons-online");
  assert.equal(suggestTopics("헬스장 중도 해지 위약금")[0].id, "cons-contract");
});

test("분야 팩 11-20: 개인정보 17분야, 72시간은 휴일에도 미루지 않아요", () => {
  assert.ok(TOPICS.filter((t) => t.domain === "privacy").length >= 3);
  assert.ok(STATUTES.filter((x) => x.domain === "privacy").length >= 8);
  assert.ok(SCOPE_MATRIX.some((m) => m.who.privacy === "yes"));
  assert.equal(dueDate({ hours: 72 }, "2026-12-24")?.due, "2026-12-27");
  const small = intake("privacy-breach", { knownDate: "2026-12-24", count: 120, sensitive: "no", hacking: "no", contact: "yes" }, "2026-12-24");
  assert.deepEqual(small.deadlines.map((d) => d.id), ["notify"]);
  assert.equal(small.deadlines[0].due, "2026-12-27");
  const big = intake("privacy-breach", { knownDate: "2026-12-24", count: 5000 }, "2026-12-24");
  assert.deepEqual(big.deadlines.map((d) => d.id).sort(), ["notify", "report"]);
  assert.equal(big.flags[0].tone, "warn");
  assert.equal(intake("privacy-breach", { knownDate: "2026-12-24", count: 3, hacking: "yes" }).deadlines.length, 2);
  const pol = intake("privacy-policy", { website: "yes", outsource: "yes", rrn: "yes" });
  assert.match(pol.flags[0].text, /11가지/);
  assert.equal(pol.flags[1].tone, "warn");
  assert.equal(intake("privacy-victim", { noticeDate: "2026-11-20" }).deadlines[0].due, "2029-11-20");
  assert.equal(suggestTopics("고객 개인정보 유출 72시간 신고")[0].id, "privacy-breach");
  assert.equal(findStatutes("처리방침")[0].id, "pipa-30");
});

test("분야 팩 11-20: 교통사고 17분야, 12대 중과실·보험 특례", () => {
  assert.ok(TOPICS.filter((t) => t.domain === "traffic").length >= 2);
  assert.ok(STATUTES.filter((x) => x.domain === "traffic").length >= 6);
  assert.ok(SCOPE_MATRIX.some((m) => m.who.traffic === "yes"));
  const ok = intake("traffic-driver", { accidentDate: "2026-11-20", harm: "injury", comprehensive: "yes", gross: "no", left: "no" });
  assert.equal(ok.flags[0].tone, "good");
  assert.equal(ok.handOff, null);
  const gross = intake("traffic-driver", { accidentDate: "2026-11-20", harm: "injury", comprehensive: "yes", gross: "yes" });
  assert.equal(gross.flags[0].tone, "warn");
  assert.ok(gross.handOff);
  const v = intake("traffic-victim", { accidentDate: "2026-11-20", injured: "yes", other: "hitrun" }).deadlines;
  assert.deepEqual(v.map((d) => d.id).sort(), ["claim", "gov"]);
  assert.equal(v[0].due, "2029-11-20");
  assert.equal(suggestTopics("교통사고 가해자 12대 중과실 신호위반")[0].id, "traffic-driver");
  assert.equal(findStatutes("가불금")[0].id, "capa-11");
});
