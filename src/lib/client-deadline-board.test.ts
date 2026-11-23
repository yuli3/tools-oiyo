import test from "node:test";
import assert from "node:assert/strict";
import { boardIcs, clientBoard, perClient, urgency, type Client } from "./client-deadline-board.ts";
import { taxCalendar } from "./biz-checklist.ts";

const A: Client = { id: "a", name: "가나상사", profile: { entity: "corp", vat: "general", employer: true } };
const B: Client = { id: "b", name: "김사장", profile: { entity: "indiv", vat: "general", employer: false } };

test("같은 날 같은 일정은 고객 이름을 합쳐요", () => {
  const items = clientBoard([A, B], "2027-01-01", "2027-01-31");
  const vat = items.find((i) => i.title.includes("2기 부가세 확정"));
  assert.ok(vat);
  assert.deepEqual(vat.clients, ["가나상사", "김사장"]);
  // taxCalendar 날짜를 그대로 써요
  const src = taxCalendar(2027, A.profile).events.find((e) => e.title === vat.title)!;
  assert.equal(vat.due, src.due);
});

test("기간 밖 일정은 빼고, 해를 넘겨도 모아요", () => {
  const items = clientBoard([B], "2026-11-01", "2027-02-28");
  assert.ok(items.every((i) => i.due >= "2026-11-01" && i.due <= "2027-02-28"));
  assert.ok(items.some((i) => i.due.startsWith("2026-11")));
  assert.ok(items.some((i) => i.due.startsWith("2027-01")));
  const sorted = [...items].sort((a, b) => (a.due < b.due ? -1 : 1));
  assert.deepEqual(items.map((i) => i.due), sorted.map((i) => i.due));
});

test("직원 있는 고객만 원천세가 붙어요", () => {
  const items = clientBoard([A, B], "2027-02-01", "2027-02-28");
  const wh = items.filter((i) => i.title.includes("원천세"));
  assert.ok(wh.length > 0);
  assert.ok(wh.every((i) => i.clients.length === 1 && i.clients[0] === "가나상사"));
  const pc = perClient(items);
  assert.ok(pc["가나상사"] > (pc["김사장"] ?? 0));
});

test("남은 날짜 단계", () => {
  assert.deepEqual(urgency("2027-01-20", "2027-01-19"), { days: -1, level: "late" });
  assert.equal(urgency("2027-01-20", "2027-01-20").level, "today");
  assert.equal(urgency("2027-01-20", "2027-01-27").level, "week");
  assert.equal(urgency("2027-01-20", "2027-02-20").level, "month");
  assert.equal(urgency("2027-01-20", "2027-03-31").level, "later");
});

test(".ics는 고객 이름을 제목에 넣고 줄을 75바이트로 접어요", () => {
  const ics = boardIcs(clientBoard([A, B], "2027-01-01", "2027-01-31"));
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(ics.includes("가나상사·김사장"));
  assert.ok(ics.includes("TRIGGER:-P3D"));
  const enc = new TextEncoder();
  for (const line of ics.split("\r\n")) assert.ok(enc.encode(line).length <= 75, line);
});
