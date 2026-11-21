// 스킬 품질 평가 세트 실행기 (2026-11-20, 다음 10종 #9). evals/skill-evals.json의 시나리오마다 스킬 스크립트를 그대로 실행해
// 답(주제)·기한·경계를 확인하고, 모든 스킬 문서에서 금지 문구(대리·단정·자격 명칭)를 찾아요.
// WHY: 법 개정이나 공용 코드 변경이 스킬 답을 조용히 바꾸지 않게 하는 회귀 방지. 기한 기대값은 손으로 검산한 값만 넣어요.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EVALS = JSON.parse(readFileSync(resolve(root, "evals/skill-evals.json"), "utf8"));
const SKILL_CLI = { "oiyo-kr-law-guide": "scripts/guide.mjs", "oiyo-kr-benefits-navigator": "scripts/calc.mjs", "kr-tax-advisor": "scripts/calc.mjs", "oiyo-business-strategist": "scripts/calc.mjs", "oiyo-korea-expat-guide": "scripts/expat.mjs", "oiyo-jp-tax-guide": "scripts/calc.mjs", "oiyo-us-tax-guide": "scripts/calc.mjs", "oiyo-fr-tax-guide": "scripts/calc.mjs", "oiyo-es-tax-guide": "scripts/calc.mjs", "oiyo-cn-tax-guide": "scripts/calc.mjs", "oiyo-uk-tax-guide": "scripts/calc.mjs", "oiyo-tw-tax-guide": "scripts/calc.mjs", "oiyo-world-labor-guide": "scripts/calc.mjs" };

export function get(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function check(out, e) {
  const v = get(out, e.path);
  if ("eq" in e) return Object.is(v, e.eq) || JSON.stringify(v) === JSON.stringify(e.eq) ? null : `${e.path}: ${JSON.stringify(v)} ≠ ${JSON.stringify(e.eq)}`;
  if ("gte" in e) return v >= e.gte ? null : `${e.path}: ${v} < ${e.gte}`;
  if (e.truthy) return v ? null : `${e.path}: 비어 있음`;
  if (e.falsy) return !v ? null : `${e.path}: ${JSON.stringify(v)}가 있음`;
  if (e.has) return Array.isArray(v) && v.some((x) => Object.entries(e.has).every(([k, w]) => x?.[k] === w)) ? null : `${e.path}: ${JSON.stringify(e.has)} 없음 (${JSON.stringify((v ?? []).map((x) => [x.id, x.due]))})`;
  return `${e.path}: 알 수 없는 기대값`;
}

function run(s) {
  const dir = resolve(root, "skills", s.skill);
  const [script, ...rest] = s.runScript ?? [SKILL_CLI[s.skill], ...s.run];
  const args = rest.map((a) => (typeof a === "string" ? a : JSON.stringify(a)));
  return JSON.parse(execFileSync(process.execPath, [join(dir, script), ...args], { encoding: "utf8" }));
}

test("평가 세트 형식: id가 겹치지 않고 스킬마다 시나리오가 있어요", () => {
  const ids = EVALS.scenarios.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(EVALS.scenarios.filter((s) => s.skill === "oiyo-kr-law-guide").length >= 20);
  for (const s of EVALS.scenarios) assert.ok(s.ask && s.expect.length, s.id);
});

for (const s of EVALS.scenarios) {
  test(`[${s.skill}] ${s.id}: ${s.ask}`, () => {
    const out = run(s);
    const problems = s.expect.map((e) => check(out, e)).filter(Boolean);
    assert.deepEqual(problems, []);
  });
}

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

test("경계: 스킬 문서에 대리·단정·자격 명칭 문구가 없고 기준일을 밝혀요", () => {
  const { mustInclude, forbidden } = EVALS.boundaries;
  for (const skill of readdirSync(resolve(root, "skills"))) {
    const docs = walk(resolve(root, "skills", skill)).filter((p) => p.endsWith(".md"));
    const all = docs.map((p) => readFileSync(p, "utf8")).join("\n");
    for (const w of mustInclude) assert.ok(all.includes(w) || /기준|基準日|As-of date|Date de référence|Fecha de referencia|基准日期/.test(readFileSync(resolve(root, "skills", skill, "SKILL.md"), "utf8")), `${skill}: "${w}" 없음`);
    for (const p of docs) {
      const t = readFileSync(p, "utf8");
      for (const w of forbidden) assert.ok(!t.includes(w), `${p.replace(root + "/", "")}: 금지 문구 "${w}"`);
    }
  }
});
