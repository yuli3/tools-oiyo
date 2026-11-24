import assert from "node:assert/strict";
import { test } from "node:test";
import { FACTORS, workerStatusCheck } from "./worker-status-check-2026.ts";
import { DOC_JOBS, buildDocRequest } from "./doc-request-2026.ts";

test("근로자성 점검은 세기만 하고 판정하지 않아요", () => {
  assert.equal(new Set(FACTORS.map((f) => f.id)).size, FACTORS.length);
  const none = workerStatusCheck([]);
  assert.equal(none.count, 0);
  const many = workerStatusCheck(["task", "supervise", "time", "pay"]);
  assert.equal(many.main, 4);
  assert.equal(many.lean, "근로자 쪽 요소가 많아요");
  assert.ok(many.notes.some((n) => n.includes("판정이 아니에요")));
});

test("자료 요청 문자와 빠진 자료 재요청", () => {
  const j = DOC_JOBS.find((d) => d.id === "income")!;
  const r = buildDocRequest({ job: "income", client: "김OO 님", office: "OO사무소", due: "2026-05-20", received: j.docs.slice(0, 3), extra: ["해외 소득 내역"] });
  assert.ok(r.first.includes("5월 20일까지"));
  assert.equal(r.missing.length, j.docs.length - 3 + 1);
  assert.ok(r.reminder.includes("해외 소득 내역"));
  const all = buildDocRequest({ job: "vat", received: DOC_JOBS.find((d) => d.id === "vat")!.docs });
  assert.equal(all.done, true);
  assert.throws(() => buildDocRequest({ job: "x" as never }));
});
