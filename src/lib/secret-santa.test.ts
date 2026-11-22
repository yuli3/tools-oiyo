import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeReveal, draw, encodeReveal, parseNames } from "./secret-santa.ts";

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

test("parseNames splits lines and commas, trims, drops duplicates", () => {
  assert.deepEqual(parseNames("민지\n 서준 ,하은\n\n민지\nALEX\nalex"), ["민지", "서준", "하은", "ALEX"]);
});

test("draw: everyone gives once and receives once, never themselves", () => {
  const names = ["A", "B", "C", "D", "E", "F", "G"];
  for (let seed = 1; seed < 200; seed++) {
    const r = draw({ names }, seeded(seed));
    assert.ok(r);
    assert.equal(r.length, names.length);
    assert.deepEqual(r.map((x) => x.giver), names);
    assert.deepEqual(new Set(r.map((x) => x.receiver)).size, names.length);
    for (const x of r) assert.notEqual(x.giver, x.receiver);
  }
});

test("draw respects exclusions in both directions", () => {
  const names = ["A", "B", "C", "D"];
  const exclusions: [string, string][] = [["A", "B"], ["C", "D"]];
  for (let seed = 1; seed < 100; seed++) {
    const r = draw({ names, exclusions }, seeded(seed))!;
    for (const x of r) {
      assert.ok(!(x.giver === "A" && x.receiver === "B") && !(x.giver === "B" && x.receiver === "A"));
      assert.ok(!(x.giver === "C" && x.receiver === "D") && !(x.giver === "D" && x.receiver === "C"));
    }
  }
});

test("draw returns null when impossible", () => {
  assert.equal(draw({ names: ["A"] }), null);
  assert.equal(draw({ names: ["A", "B"], exclusions: [["A", "B"]] }), null);
  // two people: the only draw is a swap
  const two = draw({ names: ["A", "B"] })!;
  assert.deepEqual(two, [{ giver: "A", receiver: "B" }, { giver: "B", receiver: "A" }]);
});

test("reveal token round-trips Korean, Japanese and emoji text", () => {
  const data = { g: "김민지", r: "たなか 🎁", e: "우리 팀 마니또", b: "3만 원", d: "2026-12-24" };
  const t = encodeReveal(data);
  assert.ok(t.startsWith("s1."));
  assert.ok(!t.includes("민지"));
  assert.match(t, /^[A-Za-z0-9._-]+$/);
  assert.deepEqual(decodeReveal(t), data);
  assert.equal(decodeReveal("junk"), null);
  assert.equal(decodeReveal("s1.@@@"), null);
});
