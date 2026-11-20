// Builds the English Claude skill for foreign residents (skills/oiyo-korea-expat-guide → public/downloads/oiyo-korea-expat-guide-skill.zip).
// WHY 2026-11-20 (next-10 #7): the skill computes deadlines with the same tested code as /en/korea-foreign-resident-guide/.
//   node scripts/build-expat-skill.mjs      (Node >= 22.13; needs the `zip` command)
// scripts/expat-skill.test.mjs fails when the committed scripts drift from src/.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { renderSkillLib } from "./build-advisor-skill.mjs";

export const EXPAT_SKILL_LIBS = ["kr-business-day", "korea-expat-guide-2026"];
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const EXPAT_SKILL_DIR = resolve(root, "skills/oiyo-korea-expat-guide");

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const name of EXPAT_SKILL_LIBS) writeFileSync(resolve(EXPAT_SKILL_DIR, "scripts", `${name}.mjs`), renderSkillLib(name));
  const out = resolve(root, "public/downloads/oiyo-korea-expat-guide-skill.zip");
  mkdirSync(dirname(out), { recursive: true });
  rmSync(out, { force: true });
  execFileSync("zip", ["-r", "-X", out, "oiyo-korea-expat-guide"], { cwd: resolve(root, "skills"), stdio: "inherit" });
  console.log(`wrote ${out}`);
}
