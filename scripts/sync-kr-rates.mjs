#!/usr/bin/env node
// Copies the canonical api-oiyo src/modules/kr-rates-2026.mjs into src/lib/ byte-for-byte.
// WHY (2026-10-17, audit A-1): tools must not re-type rates. The api file is the SSOT;
// this copy exists only because the two repos deploy separately.
//   npm run sync:kr-rates             (api checkout found via OIYO_API_DIR or ../api, ../../api)
import { copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const API_RATES_REL = "src/modules/kr-rates-2026.mjs";
export const LOCAL_RATES = resolve(root, "src/lib/kr-rates-2026.mjs");
export const RATE_FILES = ["kr-rates-2026.mjs", "kr-rates-2027.mjs", "kr-rates-registry.mjs"];

export function findApiRates() {
  for (const dir of [process.env.OIYO_API_DIR, resolve(root, "../api"), resolve(root, "../../api")].filter(Boolean)) {
    const file = resolve(dir, API_RATES_REL);
    if (existsSync(file)) return file;
  }
  return null;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = findApiRates();
  if (!source) {
    console.error("api checkout not found; set OIYO_API_DIR=/path/to/api");
    process.exit(1);
  }
  // 2026-10-25: validate the whole set before copying, so an old API checkout
  // cannot silently produce a mixed-year registry. Existing calculators stay 2026.
  const sources = RATE_FILES.map(name => resolve(dirname(source), name));
  if (sources.some(file => !existsSync(file))) {
    console.error("canonical rate set incomplete; update OIYO_API_DIR before syncing");
    process.exit(1);
  }
  for (const file of sources) {
    const target = resolve(root, "src/lib", file.split("/").at(-1));
    copyFileSync(file, target);
    console.log(`synced ${file} -> ${target}`);
  }
}
