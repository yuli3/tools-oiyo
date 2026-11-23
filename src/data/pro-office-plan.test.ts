import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { FLAGS, PLAN_FLOOR_TOOLS, ROOMS, floor, type FloorId } from "./pro-office.ts";
import { OFFICE_COPY } from "./pro-office-copy.ts";

const pageExists = (href: string) => {
  const [, loc, slug] = href.split("/");
  return existsSync(new URL(`../pages/${loc}/${slug}.astro`, import.meta.url)) || existsSync(new URL(`../pages/[locale]/${slug}.astro`, import.meta.url));
};

test("재무설계실은 다섯 번째 방이고 모든 층에 있어요", () => {
  assert.equal(ROOMS[ROOMS.length - 1], "plan");
  for (const id of Object.keys(FLAGS) as FloorId[]) assert.ok(floor(id).rooms.some((r) => r.id === "plan"), id);
});

test("재무설계실 도구는 실제 페이지로 이어져요", () => {
  for (const [fl, tools] of Object.entries(PLAN_FLOOR_TOOLS)) for (const t of tools ?? []) assert.ok(pageExists(t.href), `${fl} ${t.href}`);
});

test("한국 층 재무설계실에는 절세계좌·연금 도구와 무료 창구가 있어요", () => {
  const plan = floor("KR").rooms.find((r) => r.id === "plan")!;
  assert.ok(plan.tools.some((t) => t.href === "/ko/isa-vs-pension-calculator/"));
  assert.ok(plan.help.some((h) => h.includes("1332")));
});

test("6개 언어 모두 재무설계실 이름·설명·접수 질문 5개가 있어요", () => {
  for (const [loc, c] of Object.entries(OFFICE_COPY)) {
    assert.ok(c.rooms.plan && c.roomDesc.plan, loc);
    assert.equal(c.intake.plan.length, 5, loc);
  }
});

test("한국 본관에는 보험·부동산·창업경영·복지의료 방이 있고 도구가 비어 있지 않아요", () => {
  const kr = floor("KR");
  for (const id of ["insurance", "realty", "biz", "welfare"] as const) {
    const r = kr.rooms.find((x) => x.id === id);
    assert.ok(r && r.tools.length >= 3, id);
    for (const t of r.tools) assert.ok(pageExists(t.href.split("#")[0]), `${id} ${t.href}`);
    assert.ok(r.help.length > 0 && r.skills.length > 0, id);
    assert.equal(OFFICE_COPY.ko.intake[id]?.length, 5, id);
  }
  assert.equal(kr.rooms[kr.rooms.length - 1].id, "plan");
  // 해외 층은 기존 다섯 방 그대로예요.
  assert.deepEqual(floor("JP").rooms.map((r) => r.id), ROOMS);
});
