// Builds the per-country tax/accounting guide skills (2026-11-21, 各国現地化).
// WHY: each country gets its own skill in its own language, computed by the same src/lib code as its tools.oiyo.net pages
//   and the api.oiyo.net MCP tools. Add US/FR/ES/CN here as their packs land.
//   node scripts/build-country-tax-skill.mjs [jp]      (Node >= 22.13; needs the `zip` command)
// scripts/country-tax-skill.test.mjs fails when the committed scripts drift from src/lib.
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { renderSkillLib } from "./build-advisor-skill.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const COUNTRY_SKILLS = {
  jp: { dir: "oiyo-jp-tax-guide", libs: ["jp-tax-pack-2026", "japan-salary", "scenario"], zip: "oiyo-jp-tax-guide-skill.zip" },
  us: { dir: "oiyo-us-tax-guide", libs: ["us-tax-pack-2026"], zip: "oiyo-us-tax-guide-skill.zip" },
  fr: { dir: "oiyo-fr-tax-guide", libs: ["fr-tax-pack-2026"], zip: "oiyo-fr-tax-guide-skill.zip" },
  es: { dir: "oiyo-es-tax-guide", libs: ["es-tax-pack-2026"], zip: "oiyo-es-tax-guide-skill.zip" },
  cn: { dir: "oiyo-cn-tax-guide", libs: ["cn-tax-pack-2026"], zip: "oiyo-cn-tax-guide-skill.zip" },
};
export const skillDir = (c) => resolve(root, "skills", COUNTRY_SKILLS[c].dir);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const only = process.argv[2];
  for (const [c, s] of Object.entries(COUNTRY_SKILLS)) {
    if (only && only !== c) continue;
    for (const name of s.libs) writeFileSync(resolve(skillDir(c), "scripts", `${name}.mjs`), renderSkillLib(name));
    const out = resolve(root, "public/downloads", s.zip);
    mkdirSync(dirname(out), { recursive: true });
    rmSync(out, { force: true });
    execFileSync("zip", ["-r", "-X", out, s.dir], { cwd: resolve(root, "skills"), stdio: "inherit" });
    console.log(`wrote ${out}`);
  }
}
