// Builds the downloadable Claude skill (skills/oiyo-kr-benefits-navigator → public/downloads/oiyo-kr-benefits-navigator-skill.zip).
// WHY 2026-11-16: the skill calculates with the same tested code as the web tools (src/lib/kr-welfare-2026.ts, types stripped).
//   node scripts/build-benefits-skill.mjs      (Node >= 22.13; needs the `zip` command)
// scripts/benefits-skill.test.mjs fails when the committed script drifts from src/lib.
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { renderSkillLib } from "./build-advisor-skill.mjs";

export const BENEFITS_SKILL_LIBS = ["kr-welfare-2026"];
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const BENEFITS_SKILL_DIR = resolve(root, "skills/oiyo-kr-benefits-navigator");

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const name of BENEFITS_SKILL_LIBS) writeFileSync(resolve(BENEFITS_SKILL_DIR, "scripts", `${name}.mjs`), renderSkillLib(name));
  const out = resolve(root, "public/downloads/oiyo-kr-benefits-navigator-skill.zip");
  mkdirSync(dirname(out), { recursive: true });
  rmSync(out, { force: true });
  execFileSync("zip", ["-r", "-X", out, "oiyo-kr-benefits-navigator"], { cwd: resolve(root, "skills"), stdio: "inherit" });
  console.log(`wrote ${out}`);
}
