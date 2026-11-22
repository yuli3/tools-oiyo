#!/usr/bin/env node
// National corporate income tax 2026 (JP, UK, US, FR, ES, DE) — CLI. Logic: world-corporate-tax-2026.mjs (same code as the tools.oiyo.net page and api.oiyo.net MCP tools).
//   node scripts/calc.mjs '<json>'
import { corporateTax, CIT_AS_OF } from "./world-corporate-tax-2026.mjs";

const [json] = process.argv.slice(2);
if (!json) {
  console.error("usage: node scripts/calc.mjs '{\"country\":\"UK\",\"profit\":90000}'");
  process.exit(2);
}
console.log(JSON.stringify({ asOf: CIT_AS_OF, result: corporateTax(JSON.parse(json)) }, null, 2));
