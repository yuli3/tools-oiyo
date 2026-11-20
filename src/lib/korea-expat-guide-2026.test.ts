import { test } from "node:test";
import assert from "node:assert/strict";
import { EXPAT_TOPICS, expatDeadlines, suggestExpatTopics } from "./korea-expat-guide-2026.ts";

test("expat deadlines: 90 days, 15 days, holiday roll-over", () => {
  const r = expatDeadlines({ arrival: "2026-09-01", moved: "2026-11-20" }, "2026-11-20");
  const reg = r.find((x) => x.id === "register");
  assert.equal(reg?.due, "2026-11-30");
  assert.equal(reg?.daysLeft, 10);
  const mv = r.find((x) => x.id === "move");
  assert.equal(mv?.due, "2026-12-07"); // 12-05 is Saturday
  assert.equal(mv?.shifted, true);
  assert.equal(r.find((x) => x.id === "nhis")?.due, "2027-03-01");
});

test("expat deadlines: stay expiry, leaving a job, injury", () => {
  const r = expatDeadlines({ expiry: "2027-03-31", leftJob: "2026-11-02", injury: "2026-10-15" });
  assert.equal(r.find((x) => x.id === "extend-open")?.due, "2026-11-30");
  assert.equal(r.find((x) => x.id === "extend-last")?.due, "2027-03-31");
  assert.equal(r.find((x) => x.id === "final-pay")?.due, "2026-11-16");
  assert.equal(r.find((x) => x.id === "injury-claim")?.due, "2029-10-15");
  assert.deepEqual(expatDeadlines({ arrival: "2026-02-30" }), []);
});

test("expat topics: keyword pick and every topic has help and a citation", () => {
  assert.deepEqual(suggestExpatTopics("My boss has not paid my salary").map((t) => t.id), ["wages"]);
  assert.deepEqual(suggestExpatTopics("I moved, do I need to report my address?").map((t) => t.id), ["register"]);
  for (const t of EXPAT_TOPICS) assert.ok(t.help.length && t.cite.length && t.steps.length >= 3, t.id);
});
