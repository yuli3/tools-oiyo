#!/usr/bin/env node
// B2B late payment interest (DE, FR, ES, UK) — CLI. Logic: world-late-payment-2026.mjs (same code as the tools.oiyo.net page and api.oiyo.net MCP tools).
//   node scripts/calc.mjs '<json>'
import { lateInterest, LATE_AS_OF } from "./world-late-payment-2026.mjs";

const [json] = process.argv.slice(2);
if (!json) {
  console.error("usage: node scripts/calc.mjs '{\"country\":\"DE\",\"amount\":10000,\"due\":\"2026-08-01\",\"paid\":\"2026-08-31\"}'");
  process.exit(2);
}
console.log(JSON.stringify({ asOf: LATE_AS_OF, result: lateInterest(JSON.parse(json)) }, null, 2));
