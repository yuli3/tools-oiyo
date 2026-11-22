#!/usr/bin/env node
// World e-invoicing timeline guide (FR, JP, ES) — CLI. Logic: world-einvoice-pack-2026.mjs (the same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs <country> '<json>'     country: fr | jp | es
import * as w from "./world-einvoice-pack-2026.mjs";

const TOOLS = { fr: w.frEInvoice, jp: w.jpInvoiceTransition, es: w.esVerifactu };
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: w.EINVOICE_AS_OF, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
