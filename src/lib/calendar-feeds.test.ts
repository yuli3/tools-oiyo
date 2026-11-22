import { test } from "node:test";
import assert from "node:assert/strict";
import { FEEDS, buildIcs, feedEvents, fold, solarTerms } from "./calendar-feeds.ts";

test("24절기: 2026년 한국천문연구원 역서 날짜와 같아요", () => {
  const t = Object.fromEntries(solarTerms(2026).map((s) => [s.name, s.date]));
  assert.equal(solarTerms(2026).length, 24);
  // KASI 2026 역서
  assert.equal(t["소한"], "2026-01-05");
  assert.equal(t["입춘"], "2026-02-04");
  assert.equal(t["춘분"], "2026-03-20");
  assert.equal(t["하지"], "2026-06-21");
  assert.equal(t["추분"], "2026-09-23");
  assert.equal(t["동지"], "2026-12-22");
  const t27 = Object.fromEntries(solarTerms(2027).map((s) => [s.name, s.date]));
  assert.equal(t27["입춘"], "2027-02-04");
  assert.equal(t27["동지"], "2027-12-22");
});

test("세금 피드: 휴일이면 다음 영업일, 1주 전 알림", () => {
  const ev = feedEvents("kr-tax-indiv-general", [2027]);
  const vat = ev.find((e) => e.title.includes("2기 부가세 확정"));
  assert.ok(vat);
  assert.equal(vat.date, "2027-01-25");
  assert.equal(vat.alarmDays, 7);
  const income = ev.find((e) => e.title.includes("종합소득세·개인지방소득세"));
  assert.equal(income?.date, "2027-05-31");
});

test("직원 피드에는 원천세만, 부가세는 없어요", () => {
  const ev = feedEvents("kr-tax-employer", [2027]);
  assert.ok(ev.some((e) => e.title.includes("원천세")));
  assert.ok(!ev.some((e) => e.title.includes("부가세")));
  assert.ok(!ev.some((e) => e.title.includes("종합소득세")));
});

test("ics: 줄은 75바이트 이하, 필수 필드", () => {
  for (const f of FEEDS) {
    const ics = buildIcs(f);
    assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
    assert.ok(ics.trimEnd().endsWith("END:VCALENDAR"));
    for (const line of ics.split("\r\n")) assert.ok(new TextEncoder().encode(line).length <= 75, `${f.slug}: ${line}`);
    const uids = [...ics.matchAll(/^UID:(.+)$/gm)].map((m) => m[1]);
    assert.ok(uids.length > 5, f.slug);
    assert.equal(new Set(uids).size, uids.length, `${f.slug} UID 중복`);
  }
  assert.equal(fold("a".repeat(80)).split("\r\n ").join(""), "a".repeat(80));
});
