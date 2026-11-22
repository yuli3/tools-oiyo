#!/usr/bin/env node
// Germany guide (Einkommensteuer, Kündigungsfrist, Mindestlohn, E-Rechnung) — CLI. Logic: world-de-sg-pack-2026.mjs (the same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs <tool> '<json>'     tool: tax | notice | wage | einvoice
import * as w from "./world-de-sg-pack-2026.mjs";

const TOOLS = { tax: w.deIncomeTax, notice: w.deNoticePeriod, wage: w.deMinimumWage, einvoice: w.deEInvoice };
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: w.DESG_AS_OF, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
