#!/usr/bin/env node
// WHY 2026-11-02: API is managed remotely. Pin both commit and hashes so
// removing a sibling checkout never disables parity checks or follows main silently.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const API_RATES_REL = "src/modules/kr-rates-2026.mjs";
export const LOCAL_RATES = resolve(root, "src/lib/kr-rates-2026.mjs");
export const RATE_FILES = ["kr-rates-2026.mjs", "kr-rates-2027.mjs", "kr-rates-registry.mjs"];
export function findApiRates() {
  const dir = process.env.OIYO_API_DIR;
  return dir && existsSync(resolve(dir, API_RATES_REL)) ? resolve(dir, API_RATES_REL) : null;
}
function validateSource(source) {
  if (source.repository !== "yuli3/api-oiyo" || !/^[a-f0-9]{40}$/.test(source.commit) ||
      Object.keys(source.files ?? {}).sort().join() !== [...RATE_FILES].sort().join()) {
    throw new Error("Invalid pinned API source");
  }
  if (RATE_FILES.some(n => !/^[a-f0-9]{64}$/.test(source.files[n]))) throw new Error("Invalid pinned API hash");
}
export function verifyRateSet(source, buffers) {
  validateSource(source);
  for (const name of RATE_FILES) {
    if (!Buffer.isBuffer(buffers[name]) || !/^[a-f0-9]{64}$/.test(source.files[name]) ||
        createHash("sha256").update(buffers[name]).digest("hex") !== source.files[name]) {
      throw new Error(`API source missing or hash mismatch: ${name}`);
    }
  }
}
export function syncRates({ source, getFile, target = resolve(root, "src/lib"), check = false }) {
  // Validate metadata before constructing a request, then validate ALL inputs
  // before writing any file. Network/hash errors preserve the existing set.
  validateSource(source);
  const buffers = Object.fromEntries(RATE_FILES.map(name => [name, getFile(name)]));
  verifyRateSet(source, buffers);
  if (check) verifyRateSet(source, Object.fromEntries(RATE_FILES.map(n => [n, readFileSync(resolve(target, n))])));
  if (!check) for (const name of RATE_FILES) writeFileSync(resolve(target, name), buffers[name]);
  return RATE_FILES.length;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some(a => a !== "--check")) throw new Error("Usage: sync:kr-rates [--check]");
    const source = JSON.parse(readFileSync(resolve(root, "scripts/kr-rates-source.json"), "utf8"));
    const getFile = name => {
      if (process.env.OIYO_API_DIR) return readFileSync(resolve(process.env.OIYO_API_DIR, "src/modules", name));
      try {
        return execFileSync("gh", ["api", `repos/${source.repository}/contents/src/modules/${name}?ref=${source.commit}`,
          "-H", "Accept: application/vnd.github.raw+json"], { timeout: 30000, maxBuffer: 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
      } catch { throw new Error(`Pinned GitHub API source unavailable: ${name}`); }
    };
    console.log(`verified ${syncRates({ source, getFile, check: args.includes("--check") })} pinned API files at ${source.commit}`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
