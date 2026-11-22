#!/usr/bin/env node
// World law intake (JP, US, FR, ES, CN, UK, TW) — CLI. Logic: world-law-intake-2026.mjs (same code as the api.oiyo.net start_world_law_intake MCP tool).
//   node scripts/calc.mjs <JP|US|FR|ES|CN|UK|TW> "<question>" [--audience=person|pro]
import { intake } from "./world-law-intake-2026.mjs";

const args = process.argv.slice(2);
const audArg = args.find((a) => a.startsWith("--audience="));
const audience = audArg ? audArg.slice(11) : undefined;
const [country, ...q] = args.filter((a) => a !== audArg);
const cc = (country ?? "").toUpperCase();
if (!["JP", "US", "FR", "ES", "CN", "UK", "TW"].includes(cc)) {
  console.error('usage: node scripts/calc.mjs <JP|US|FR|ES|CN|UK|TW> "<question>"');
  process.exit(2);
}
console.log(JSON.stringify({ result: intake({ country: cc, question: q.join(" "), audience }) }, null, 2));
