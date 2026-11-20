import test from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_BANK, SAMPLE_CARD, orderFromHeader, parseStatement, suggestAccount, summarize, toCsv, toJournal, upcomingTasks } from "./bookkeeping-bridge-2026.ts";

test("통장 내역: 머리글로 열을 찾고 계정을 추천해요", () => {
  const p = parseStatement(SAMPLE_BANK, "bank");
  assert.equal(p.guessed, false);
  assert.equal(p.rows.length, 12);
  assert.equal(p.rows[1].in, 3_200_000);
  const j = toJournal(p.rows, "bank");
  const acc = j.map((l) => (l.debit === "보통예금" ? l.credit : l.debit));
  assert.deepEqual(acc, ["지급임차료", "외상매출금", "수도광열비", "예수금", "급여", "세금과공과", "미지급금", "미분류", "기업업무추진비", "미지급세금", "미지급세금", "이자수익"]);
  assert.ok(j[0].flags.some((f) => f.includes("증빙불비가산세")), "월세 계좌이체는 증빙 확인");
  assert.ok(j[8].flags.some((f) => f.includes("비용 불인정")), "3만 원 넘는 접대 계좌이체");
  assert.ok(j[9].flags.some((f) => f.includes("중복")) && j[10].flags.some((f) => f.includes("중복")));
  assert.equal(j[4].flags.length, 0, "급여는 증빙 신호 없음");
  const s = summarize(j);
  assert.equal(s.unclassified, 1);
  assert.equal(s.debit, s.credit);
});

test("카드 내역: 공급가액·부가세를 나누고 불공제를 표시해요", () => {
  const p = parseStatement(SAMPLE_CARD, "card");
  assert.equal(p.rows.length, 8);
  const j = toJournal(p.rows, "card");
  assert.equal(j[0].debit, "복리후생비");
  assert.equal(j[0].credit, "미지급금");
  assert.equal(j[0].supply + j[0].vat, 18_500);
  assert.equal(j[0].vat, 18_500 - Math.round(18_500 * 10 / 11));
  const taxi = j[3];
  assert.equal(taxi.debit, "여비교통비");
  assert.equal(taxi.vat, 0);
  assert.ok(taxi.flags.includes("매입세액 불공제"));
  const golf = j[4];
  assert.equal(golf.debit, "기업업무추진비");
  assert.ok(golf.flags.some((f) => f.includes("주말")));
  assert.equal(summarize(j).vat, j.reduce((a, l) => a + l.vat, 0));
});

test("머리글 없는 붙여넣기, 탭, 음수 금액 열", () => {
  const p = parseStatement("2026.10.3\t스타벅스\t5,000원\n2026.10.4\t쿠팡\t12,000", "card");
  assert.equal(p.guessed, true);
  assert.equal(p.rows[1].out, 12_000);
  const q = parseStatement("날짜,내용,금액\n2026-10-01,월세,-500000\n2026-10-02,입금,700000", "bank");
  assert.equal(q.rows[0].out, 500_000);
  assert.equal(q.rows[1].in, 700_000);
  assert.equal(suggestAccount({ desc: "토스페이먼츠 정산", out: 0, in: 10 }).account, "외상매출금");
});

test("내보내기: 프로그램 샘플 머리글 순서대로 CSV", () => {
  const j = toJournal(parseStatement(SAMPLE_CARD, "card").rows, "card");
  const order = orderFromHeader("전표일자,계정과목,상대계정,합계금액,거래처명,적요");
  assert.deepEqual(order, ["date", "debit", "credit", "amount", "counterparty", "memo"]);
  const csv = toCsv(j.slice(0, 1), order).split("\n");
  assert.equal(csv[0], "일자,차변계정,대변계정,금액,거래처,적요");
  assert.equal(csv[1], "2026-10-03,복리후생비,미지급금,18500,스타벅스 강남점,스타벅스 강남점");
});

test("신고 시즌: 마감일이 휴일이면 다음 영업일", () => {
  const t = upcomingTasks("2026-11-20", ["employer", "vat"], 3);
  assert.equal(t[0].due, "2026-12-10");
  const vat = t.find((x) => x.label.startsWith("부가가치세"));
  assert.equal(vat?.due, "2027-01-25");
  const may = upcomingTasks("2027-05-01", ["individual"], 1);
  assert.equal(may[0].due, "2027-05-31");
  assert.equal(may[1].due, "2027-06-30");
});
