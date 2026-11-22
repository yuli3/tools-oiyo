#!/usr/bin/env node
// World law intake (JP, US, FR, ES, CN, UK, TW) — CLI. Logic: world-law-intake-2026.mjs (same code as the api.oiyo.net start_world_law_intake MCP tool).
//   node scripts/calc.mjs <JP|US|FR|ES|CN|UK|TW> "<question>"
import { intake } from "./world-law-intake-2026.mjs";

const [country, ...q] = process.argv.slice(2);
const cc = (country ?? "").toUpperCase();
if (!["JP", "US", "FR", "ES", "CN", "UK", "TW"].includes(cc)) {
  console.error('usage: node scripts/calc.mjs <JP|US|FR|ES|CN|UK|TW> "<question>"');
  process.exit(2);
}
console.log(JSON.stringify({ result: intake({ country: cc, question: q.join(" ") }) }, null, 2));
