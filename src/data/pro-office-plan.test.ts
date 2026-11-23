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
