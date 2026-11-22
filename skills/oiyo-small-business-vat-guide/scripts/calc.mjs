#!/usr/bin/env node
// Small business VAT/GST registration (DE, SG) — CLI. Logic: world-small-business-vat-2026.mjs (same code as the tools.oiyo.net page and api.oiyo.net MCP tools).
//   node scripts/calc.mjs '<json>'
import { smallBusinessVat, SMALL_VAT_AS_OF } from "./world-small-business-vat-2026.mjs";

const [json] = process.argv.slice(2);
if (!json) {
  console.error("usage: node scripts/calc.mjs '{\"country\":\"DE\",\"priorYear\":20000,\"currentYear\":60000}'");
  process.exit(2);
}
console.log(JSON.stringify({ asOf: SMALL_VAT_AS_OF, result: smallBusinessVat(JSON.parse(json)) }, null, 2));
