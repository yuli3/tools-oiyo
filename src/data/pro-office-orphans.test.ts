import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { FLAGS, WORLD_EXTRA_TOOLS, floor, type FloorId } from "./pro-office.ts";

const pages = new URL("../pages/", import.meta.url);
const COUNTRY_PREFIX: [FloorId, RegExp][] = [["TW", /^taiwan-/], ["SG", /^(singapore-|cpf-)/], ["DE", /^germany-/], ["UK", /^uk-/], ["US", /^us-/], ["CA", /^canada-/], ["AU", /^australia-/], ["JP", /^japan-/], ["CN", /^china-/], ["FR", /^france-/], ["ES", /^spain-/]];

test("추가로 연결한 나라 페이지는 실제로 있어요", () => {
  for (const rooms of Object.values(WORLD_EXTRA_TOOLS)) for (const list of Object.values(rooms ?? {})) for (const t of list ?? []) {
    const [, loc, slug] = t.href.split("/");
    assert.ok(existsSync(new URL(`${loc}/${slug}.astro`, pages)), t.href);
  }
});

test("나라 이름으로 시작하는 페이지는 모두 그 나라 층의 어느 방에든 있어요", () => {
  const used = new Map<FloorId, Set<string>>();
  for (const id of Object.keys(FLAGS) as FloorId[]) used.set(id, new Set(floor(id).rooms.flatMap((r) => r.tools.map((t) => t.href))));
  const missing: string[] = [];
  for (const loc of ["en", "ja", "zh", "fr", "es", "de"]) {
    if (!existsSync(new URL(`${loc}/`, pages))) continue;
    for (const f of readdirSync(new URL(`${loc}/`, pages))) {
      const slug = f.replace(/\.astro$/, ""), href = `/${loc}/${slug}/`;
      for (const [fl, re] of COUNTRY_PREFIX) if (re.test(slug) && !used.get(fl)!.has(href)) missing.push(`${fl} ${href}`);
    }
  }
  assert.deepEqual(missing, []);
});
