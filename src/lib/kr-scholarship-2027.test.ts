import { test } from "node:test";
import assert from "node:assert/strict";
import { annual2026, bracketBars, scholarship } from "./kr-scholarship-2027.ts";

test("2026 annual amounts by bracket and children", () => {
  assert.equal(annual2026(1, "none"), 6_000_000);
  assert.equal(annual2026(3, "firstSecond"), 6_100_000);
  assert.equal(annual2026(5, "none"), 4_400_000);
  assert.equal(annual2026(6, "firstSecond"), 5_050_000);
  assert.equal(annual2026(8, "none"), 3_600_000);
  assert.equal(annual2026(7, "firstSecond"), 4_650_000);
  assert.equal(annual2026(9, "none"), 1_000_000);
  assert.equal(annual2026(9, "firstSecond"), 1_350_000);
  assert.equal(annual2026(9, "third"), 2_000_000);
  assert.equal(annual2026(8, "third"), null);
  assert.equal(annual2026("basic", "none"), null);
  assert.equal(annual2026(10, "firstSecond"), 0);
});

test("semester amount is capped by tuition; deadlines count down in KST", () => {
  const r = scholarship({ bracket: 2, children: "none", tuitionPerSemester: 2_500_000, student: "enrolled", now: "2027-01-07T08:00:00Z" });
  assert.equal(r.semester, 3_000_000);
  assert.equal(r.capped, 2_500_000);
  assert.equal(r.applyMinutesLeft, 60); // 18:00 KST = 09:00Z
  const full = scholarship({ bracket: "basic", children: "none", tuitionPerSemester: 4_000_000, student: "freshman" });
  assert.equal(full.fullTuition, true);
  assert.equal(full.capped, 4_000_000);
  assert.equal(full.applyMinutesLeft, null);
  assert.ok(r.items.some((i) => i.text.includes("5구간")));
});

test("bars draw full tuition at the tuition level", () => {
  const bars = bracketBars("none", 8_000_000);
  assert.equal(bars[0].value, 8_000_000);
  assert.equal(bars.at(-1)!.value, 0);
});
