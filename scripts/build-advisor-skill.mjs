// Builds the downloadable Claude skill (skills/kr-tax-advisor → public/downloads/oiyo-kr-tax-advisor-skill.zip).
// WHY 2026-11-14: the skill must calculate with the same tested formulas as the web pages, so its
// scripts are generated from src/lib (types stripped). Run after changing kr-advisory-2026.ts:
//   node scripts/build-advisor-skill.mjs      (Node >= 22.13; needs the `zip` command)
// scripts/advisor-skill.test.mjs fails when the committed scripts drift from src/lib.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { stripTypeScriptTypes } from "node:module";
import { execFileSync } from "node:child_process";

export const SKILL_LIBS = ["kr-vat-2026", "kr-payroll-2026", "kr-advisory-2026"];
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const SKILL_DIR = resolve(root, "skills/kr-tax-advisor");

export function renderSkillLib(name) {
  const source = readFileSync(resolve(root, "src/lib", `${name}.ts`), "utf8");
  const code = stripTypeScriptTypes(source).replace(/from "\.\/([\w-]+)\.ts"/g, 'from "./$1.mjs"');
  return `// GENERATED from tools-oiyo src/lib/${name}.ts by scripts/build-advisor-skill.mjs. Do not edit here.\n${code}`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const name of SKILL_LIBS) writeFileSync(resolve(SKILL_DIR, "scripts", `${name}.mjs`), renderSkillLib(name));
  const out = resolve(root, "public/downloads/oiyo-kr-tax-advisor-skill.zip");
  mkdirSync(dirname(out), { recursive: true });
  rmSync(out, { force: true });
  execFileSync("zip", ["-r", "-X", out, "kr-tax-advisor"], { cwd: resolve(root, "skills"), stdio: "inherit" });
  console.log(`wrote ${out}`);
}
