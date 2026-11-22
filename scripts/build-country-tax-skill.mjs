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
  uk: { dir: "oiyo-uk-tax-guide", libs: ["uk-tax-pack-2026"], zip: "oiyo-uk-tax-guide-skill.zip" },
  tw: { dir: "oiyo-tw-tax-guide", libs: ["tw-tax-pack-2026"], zip: "oiyo-tw-tax-guide-skill.zip" },
  labor: { dir: "oiyo-world-labor-guide", libs: ["world-labor-pack-2026"], zip: "oiyo-world-labor-guide-skill.zip" },
  intake: { dir: "oiyo-world-law-intake", libs: ["world-law-intake-2026", "jp-tax-pack-2026", "japan-salary", "scenario", "us-tax-pack-2026", "fr-tax-pack-2026", "es-tax-pack-2026", "cn-tax-pack-2026", "uk-tax-pack-2026", "tw-tax-pack-2026"], zip: "oiyo-world-law-intake-skill.zip" },
  tenancy: { dir: "oiyo-world-tenancy-guide", libs: ["world-tenancy-pack-2026"], zip: "oiyo-world-tenancy-guide-skill.zip" },
  consumer: { dir: "oiyo-world-consumer-guide", libs: ["world-consumer-pack-2026"], zip: "oiyo-world-consumer-guide-skill.zip" },
  inheritance: { dir: "oiyo-world-inheritance-guide", libs: ["world-inheritance-pack-2026"], zip: "oiyo-world-inheritance-guide-skill.zip" },
  claims: { dir: "oiyo-world-claims-guide", libs: ["world-limitation-pack-2026"], zip: "oiyo-world-claims-guide-skill.zip" },
  employer: { dir: "oiyo-world-employer-cost-guide", libs: ["world-employer-cost-pack-2026"], zip: "oiyo-world-employer-cost-guide-skill.zip" },
  company: { dir: "oiyo-world-company-calendar", libs: ["world-company-calendar-2026"], zip: "oiyo-world-company-calendar-skill.zip" },
  einvoice: { dir: "oiyo-world-einvoice-guide", libs: ["world-einvoice-pack-2026"], zip: "oiyo-world-einvoice-guide-skill.zip" },
  residency: { dir: "oiyo-world-tax-residency-guide", libs: ["world-tax-residency-2026"], zip: "oiyo-world-tax-residency-guide-skill.zip" },
  de: { dir: "oiyo-de-guide", libs: ["world-de-sg-pack-2026"], zip: "oiyo-de-guide-skill.zip" },
  sg: { dir: "oiyo-sg-guide", libs: ["world-de-sg-pack-2026"], zip: "oiyo-sg-guide-skill.zip" },
  corporate: { dir: "oiyo-world-corporate-tax-guide", libs: ["world-corporate-tax-2026"], zip: "oiyo-world-corporate-tax-guide-skill.zip" },
  withholding: { dir: "oiyo-world-withholding-guide", libs: ["world-withholding-2026"], zip: "oiyo-world-withholding-guide-skill.zip" },
  takehome: { dir: "oiyo-world-take-home-guide", libs: ["world-take-home-2026", "uk-tax-pack-2026", "us-tax-pack-2026", "japan-salary", "france-salary", "spain-salary", "scenario"], zip: "oiyo-world-take-home-guide-skill.zip" },
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
