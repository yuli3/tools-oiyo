#!/usr/bin/env node
// Fresh start checks (TW debt clearance, ES second chance, ES inheritance deadline) — CLI. Logic: world-fresh-start-2026.mjs (same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs '<json>'
import { freshStart, FRESH_START_AS_OF } from "./world-fresh-start-2026.mjs";

const [json] = process.argv.slice(2);
if (!json) {
  console.error("usage: node scripts/calc.mjs '{\"topic\":\"tw_debt\",\"totalDebt\":3000000,\"hasBankDebt\":true}'");
  process.exit(2);
}
console.log(JSON.stringify({ asOf: FRESH_START_AS_OF, result: freshStart(JSON.parse(json)) }, null, 2));
