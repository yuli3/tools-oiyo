import { test } from "node:test";
import assert from "node:assert/strict";
import { FURNITURE_BY_KEY, PRESETS, checkPlan, decodePlan, encodePlan, gapBetween, overlapArea, placeIn, planArea, presetPlan, rect, roomOf, roomStats, summary, type Plan } from "./furniture-layout.ts";

test("평면 예시: 방끼리 겹치지 않고 넓이가 평형에 맞아요", () => {
  for (const p of PRESETS) {
    for (let i = 0; i < p.rooms.length; i++) for (let j = i + 1; j < p.rooms.length; j++) assert.equal(overlapArea(p.rooms[i], p.rooms[j]), 0, `${p.id} ${p.rooms[i].name}/${p.rooms[j].name}`);
  }
  const area = (id: string) => planArea(PRESETS.find((p) => p.id === id)!.rooms);
  assert.ok(area("studio25") >= 24 && area("studio25") <= 27, String(area("studio25")));
  assert.ok(area("apt59") >= 59 && area("apt59") <= 78, String(area("apt59")));
  assert.ok(area("apt84") >= 84 && area("apt84") <= 105, String(area("apt84")));
  assert.ok(area("apt114") >= 114 && area("apt114") <= 140, String(area("apt114")));
});

test("방 가운데 놓기, 회전하면 가로·세로가 바뀌어요", () => {
  const plan = presetPlan("room");
  const bed = placeIn(FURNITURE_BY_KEY["bed-queen"], plan.rooms[0], "a");
  assert.deepEqual([bed.x, bed.y], [105, 100]);
  assert.deepEqual(rect({ ...bed, rot: 90 }), { x: 105, y: 100, w: 200, h: 150 });
  assert.equal(roomOf(bed, plan.rooms)?.id, "room");
});

test("겹침·벽 넘음은 오류, 60cm 미만 통로는 주의", () => {
  const plan: Plan = presetPlan("room"); // 360×400
  plan.items = [
    { id: "bed", key: "bed-queen", label: "퀸 침대", x: 0, y: 0, w: 150, d: 200, rot: 0 },
    { id: "wd", key: "wardrobe-2", label: "옷장", x: 190, y: 0, w: 100, d: 60, rot: 0 }, // 침대와 40cm
  ];
  let issues = checkPlan(plan);
  assert.ok(issues.some((i) => i.level === "warn" && i.text.includes("40cm")), JSON.stringify(issues));
  assert.ok(!issues.some((i) => i.level === "error"));
  plan.items[1].x = 120;
  issues = checkPlan(plan);
  assert.ok(issues.some((i) => i.level === "error" && i.text.includes("겹쳐요")));
  plan.items[1].x = 300; // 300+100 > 360
  issues = checkPlan(plan);
  assert.ok(issues.some((i) => i.level === "error" && i.text.includes("벽을 넘어요")));
  assert.equal(gapBetween({ x: 0, y: 0, w: 10, h: 100 }, { x: 80, y: 0, w: 10, h: 100 }), 70);
  assert.equal(gapBetween({ x: 0, y: 0, w: 10, h: 10 }, { x: 80, y: 50, w: 10, h: 10 }), null);
});

test("러그는 겹쳐도 괜찮고 차지 비율에서 빠져요", () => {
  const plan = presetPlan("room");
  plan.items = [placeIn(FURNITURE_BY_KEY["rug"], plan.rooms[0], "r"), placeIn(FURNITURE_BY_KEY["coffee"], plan.rooms[0], "c")];
  assert.equal(checkPlan(plan).filter((i) => i.level === "error").length, 0);
  const s = roomStats(plan)[0];
  assert.ok(Math.abs(s.used - 0.605) < 1e-9, String(s.used));
  assert.equal(s.level, "여유");
  assert.match(summary(plan), /가구 2개/);
});

test("공유 주소로 저장했다 되살리면 같은 배치", () => {
  const plan = presetPlan("apt84");
  const living = plan.rooms.find((m) => m.id === "living")!;
  plan.items = [placeIn(FURNITURE_BY_KEY["sofa-3"], living, "s"), { id: "c", key: "custom", label: "내 책상", x: 10, y: 500, w: 133, d: 66, rot: 90 }];
  const back = decodePlan(encodePlan(plan))!;
  assert.equal(back.preset, "apt84");
  assert.deepEqual(back.rooms, plan.rooms);
  assert.deepEqual(back.items.map(({ id, ...r }) => r), plan.items.map(({ id, ...r }) => r));
  plan.rooms[0] = { ...plan.rooms[0], w: 999, name: "서재" };
  assert.equal(decodePlan(encodePlan(plan))!.rooms[0].name, "서재");
  assert.equal(decodePlan("!!!"), null);
});

test("두 번째 가구는 이미 놓인 가구와 겹치지 않는 자리에 놓여요", () => {
  const plan = presetPlan("apt84");
  const master = plan.rooms.find((m) => m.id === "master")!;
  const bed = placeIn(FURNITURE_BY_KEY["bed-queen"], master, "b");
  const wd = placeIn(FURNITURE_BY_KEY["wardrobe-4"], master, "w", [bed]);
  assert.equal(overlapArea(rect(bed), rect(wd)), 0);
  assert.equal(roomOf(wd, plan.rooms)?.id, "master");
  const rug = placeIn(FURNITURE_BY_KEY["rug"], master, "r", [bed]);
  assert.equal(rug.x, bed.x - 25);
});
