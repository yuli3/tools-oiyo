#!/usr/bin/env node
// World tax residency guide (US, UK, ES, TW, JP, FR) — CLI. Logic: world-tax-residency-2026.mjs (the same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs <country> '<json>'     country: us | uk | es | tw | jp | fr
import * as w from "./world-tax-residency-2026.mjs";

const TOOLS = { us: w.usSubstantialPresence, uk: w.ukStatutoryResidence, es: w.esResidency, tw: w.twResidency, jp: w.jpResidency, fr: w.frResidency };
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: w.RESIDENCY_AS_OF, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
