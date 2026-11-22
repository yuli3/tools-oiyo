#!/usr/bin/env node
// Withholding on payments to non-residents (JP, US, FR, ES, TW, DE) — CLI. Logic: world-withholding-2026.mjs (same code as the tools.oiyo.net page and api.oiyo.net MCP tools).
//   node scripts/calc.mjs '<json>'
import { withholding, WHT_AS_OF } from "./world-withholding-2026.mjs";

const [json] = process.argv.slice(2);
if (!json) {
  console.error("usage: node scripts/calc.mjs '{\"country\":\"JP\",\"type\":\"royalty\",\"amount\":1000000}'");
  process.exit(2);
}
console.log(JSON.stringify({ asOf: WHT_AS_OF, result: withholding(JSON.parse(json)) }, null, 2));
