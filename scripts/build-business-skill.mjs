// Builds the downloadable Claude skill (skills/oiyo-business-strategist → public/downloads/oiyo-business-strategist-skill.zip).
// WHY 2026-11-14: the skill calculates with the same tested code as the web tools, and its framework and
// checklist references come from the same data, so scripts and references are generated from src/.
//   node scripts/build-business-skill.mjs      (Node >= 22.13; needs the `zip` command)
// scripts/business-skill.test.mjs fails when the committed files drift from src/.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { renderSkillLib } from "./build-advisor-skill.mjs";

export const BIZ_SKILL_LIBS = ["kr-business-day", "biz-strategy", "biz-checklist"];
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const BIZ_SKILL_DIR = resolve(root, "skills/oiyo-business-strategist");

export async function renderReferences() {
  const { FRAMEWORKS, FRAMEWORK_GROUPS } = await import(pathToFileURL(resolve(root, "src/data/biz-tools.ts")).href);
  const { MUST_ITEMS, ROLE_LABEL, STAGE_LABEL, AREA_LABEL, CHECKLIST_AS_OF } = await import(pathToFileURL(resolve(root, "src/lib/biz-checklist.ts")).href);
  const fw = ["# 경영 이론 지도 (GENERATED from tools-oiyo src/data/biz-tools.ts — do not edit here)", "", "상황에 맞는 틀을 고를 때 본다. '도구'가 있으면 scripts/calc.mjs 또는 웹 도구로 계산한다.", ""];
  for (const [g, label] of Object.entries(FRAMEWORK_GROUPS)) {
    fw.push(`## ${label}`, "", "| 이론 | 언제 | 핵심 방법 | 도구 |", "|---|---|---|---|");
    for (const f of FRAMEWORKS.filter((x) => x.group === g)) fw.push(`| ${f.name} | ${f.when} | ${f.how} | ${f.tool ? `https://tools.oiyo.net/ko/${f.tool}/` : ""} |`);
    fw.push("");
  }
  const ck = [`# 반드시 할 것 / 하지 말 것 (GENERATED from tools-oiyo src/lib/biz-checklist.ts, 기준일 ${CHECKLIST_AS_OF} — do not edit here)`, "", "근거가 없는 항목은 경험칙(법적 의무 아님)이다. 단계·역할로 골라 쓴다.", ""];
  for (const [s, label] of Object.entries(STAGE_LABEL)) {
    const items = MUST_ITEMS.filter((i) => i.stages[0] === s);
    if (!items.length) continue;
    ck.push(`## ${label}`, "");
    for (const i of items) ck.push(`- ${i.kind === "do" ? "[할 것]" : "[하지 말 것]"} ${i.text} — ${i.why} (${AREA_LABEL[i.area]}; ${i.roles.map((r) => ROLE_LABEL[r]).join("·")}; ${i.basis ? `근거 ${i.basis}` : "경험칙"}${i.risk ? `; ${i.risk}` : ""})`);
    ck.push("");
  }
  return { "references/frameworks.md": fw.join("\n"), "references/checklist.md": ck.join("\n") };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const name of BIZ_SKILL_LIBS) writeFileSync(resolve(BIZ_SKILL_DIR, "scripts", `${name}.mjs`), renderSkillLib(name));
  for (const [rel, text] of Object.entries(await renderReferences())) writeFileSync(resolve(BIZ_SKILL_DIR, rel), text);
  const out = resolve(root, "public/downloads/oiyo-business-strategist-skill.zip");
  mkdirSync(dirname(out), { recursive: true });
  rmSync(out, { force: true });
  execFileSync("zip", ["-r", "-X", out, "oiyo-business-strategist"], { cwd: resolve(root, "skills"), stdio: "inherit" });
  console.log(`wrote ${out}`);
}
