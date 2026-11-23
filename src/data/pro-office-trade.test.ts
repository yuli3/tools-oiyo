import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { FLAGS, ROOMS, TRADE_FLOOR_TOOLS, floor, type FloorId } from "./pro-office.ts";
import { OFFICE_COPY } from "./pro-office-copy.ts";

test("통관·무역실은 모든 층에 있고, 해외 층은 원문을 확인한 나라만 열려요", () => {
  assert.ok(ROOMS.includes("trade"));
  for (const id of Object.keys(FLAGS) as FloorId[]) assert.ok(floor(id).rooms.some((r) => r.id === "trade"), id);
  const open = (Object.keys(FLAGS) as FloorId[]).filter((id) => id !== "KR" && floor(id).rooms.find((r) => r.id === "trade")!.tools.length > 0);
  assert.deepEqual(open.sort(), ["CA", "JP", "UK"]);
});

test("한국 본관 관세 직업 도구는 행정실이 아니라 통관·무역실에 있어요", () => {
  const trade = floor("KR").rooms.find((r) => r.id === "trade")!;
  assert.ok(trade.tools.length > 0);
});

test("통관·무역실 도구는 실제 페이지로 이어져요", () => {
  for (const tools of Object.values(TRADE_FLOOR_TOOLS)) for (const t of tools ?? []) {
    const [, loc, slug] = t.href.split("/");
    assert.ok(existsSync(new URL(`../pages/${loc}/${slug}.astro`, import.meta.url)), t.href);
  }
});

test("6개 언어 모두 통관·무역실 이름·설명·접수 질문 5개가 있어요", () => {
  for (const [loc, c] of Object.entries(OFFICE_COPY)) {
    assert.ok(c.rooms.trade && c.roomDesc.trade, loc);
    assert.equal(c.intake.trade.length, 5, loc);
  }
});
