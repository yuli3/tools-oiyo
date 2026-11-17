import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { CATEGORIES, COMPETENCIES, JOBS, MCP_TOOLS, SKILLS, TOOL_NAMES, coverage, isGap } from "./pro-competencies.ts";

const page = (slug: string) => existsSync(`src/pages/ko/${slug}.astro`) || existsSync(`src/pages/[locale]/${slug}.astro`);

test("역량 지도: 연결한 도구·스킬·MCP가 모두 실제로 있어요", () => {
  const used = new Set<string>();
  for (const x of COMPETENCIES) {
    for (const t of x.tools) {
      used.add(t);
      assert.ok(page(t), `${x.id}: 페이지 없음 ${t}`);
      assert.ok(TOOL_NAMES[t], `${x.id}: TOOL_NAMES에 ${t} 이름 없음`);
    }
    for (const s of x.skills) {
      assert.ok(SKILLS[s], `${x.id}: 스킬 ${s}`);
      assert.ok(existsSync(`skills/${s}/SKILL.md`), `skills/${s}`);
      assert.ok(existsSync(`public${SKILLS[s].zip}`), SKILLS[s].zip);
    }
    for (const m of x.mcp) assert.ok((MCP_TOOLS as readonly string[]).includes(m), `${x.id}: MCP ${m}`);
  }
  assert.deepEqual(Object.keys(TOOL_NAMES).filter((k) => !used.has(k)), [], "쓰지 않는 TOOL_NAMES");
});

test("역량 지도: 직업 13개 모두 분류 4개 이상, 업무 범위(ethics) 역량이 있어요", () => {
  assert.equal(JOBS.length, 13);
  const ids = new Set(COMPETENCIES.map((x) => x.id));
  assert.equal(ids.size, COMPETENCIES.length, "id 중복");
  for (const j of JOBS) {
    const mine = COMPETENCIES.filter((x) => x.job === j.id);
    assert.ok(mine.length >= 7, `${j.name}: ${mine.length}개`);
    assert.ok(new Set(mine.map((x) => x.cat)).size >= 4, `${j.name}: 분류가 적어요`);
    assert.ok(mine.some((x) => x.cat === "ethics"), `${j.name}: 업무 범위 역량 없음`);
  }
  for (const x of COMPETENCIES) assert.ok(CATEGORIES.some((c) => c.id === x.cat));
});

test("역량 지도: 빈칸(gap)은 다음 제작 목록이고, 커버리지 합이 맞아요", () => {
  const gaps = COMPETENCIES.filter(isGap);
  // 2026-11-17 세운 "업무범위에 필요한 모든 도구 추가"로 빈칸 0개. 새 직업을 넣으면 빈칸이 다시 생길 수 있어요.
  assert.ok(gaps.length < COMPETENCIES.length / 3);
  const cov = coverage();
  const total = cov.flatMap((r) => r.cells).reduce((a, c) => a + c.total, 0);
  const linked = cov.flatMap((r) => r.cells).reduce((a, c) => a + c.linked, 0);
  assert.equal(total, COMPETENCIES.length);
  assert.equal(total - linked, gaps.length);
});

test("역량 지도: 우리 도구·스킬 이름에 자격 명칭을 쓰지 않아요", () => {
  const banned = /(세무사|회계사|노무사|행정사|법무사|계리사|손해사정사|설계사)/;
  for (const n of Object.values(TOOL_NAMES)) assert.doesNotMatch(n, banned, n);
  for (const s of Object.values(SKILLS)) assert.doesNotMatch(s.name, banned, s.name);
});

test("역량 지도: 허브 설명의 역량 수가 데이터와 같아요", async () => {
  const { lawGuides } = await import("./law-guides.ts");
  const g = lawGuides.find((x) => x.slug === "pro-competency-map");
  assert.ok(g?.description.includes(`역량 ${COMPETENCIES.length}개`));
});
