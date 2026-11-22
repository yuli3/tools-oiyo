#!/usr/bin/env node
// Court fees (JP, DE) — CLI. Logic: world-court-fees-2026.mjs (same code as the tools.oiyo.net page and api.oiyo.net MCP tools).
//   node scripts/calc.mjs '<json>'
import { courtFee, COURT_FEES_AS_OF } from "./world-court-fees-2026.mjs";

const [json] = process.argv.slice(2);
if (!json) {
  console.error("usage: node scripts/calc.mjs '{\"country\":\"DE\",\"value\":5000}'");
  process.exit(2);
}
console.log(JSON.stringify({ asOf: COURT_FEES_AS_OF, result: courtFee(JSON.parse(json)) }, null, 2));
