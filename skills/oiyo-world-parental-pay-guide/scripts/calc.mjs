#!/usr/bin/env node
// Parental pay and child benefit (UK, JP, DE) — CLI. Logic: world-parental-pay-2026.mjs (same code as the tools.oiyo.net page and api.oiyo.net MCP tools).
//   node scripts/calc.mjs '<json>'
import { parentalPay, PARENTAL_AS_OF } from "./world-parental-pay-2026.mjs";

const [json] = process.argv.slice(2);
if (!json) {
  console.error("usage: node scripts/calc.mjs '{\"country\":\"DE\",\"netBefore\":2000}'");
  process.exit(2);
}
console.log(JSON.stringify({ asOf: PARENTAL_AS_OF, result: parentalPay(JSON.parse(json)) }, null, 2));
