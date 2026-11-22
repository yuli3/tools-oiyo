#!/usr/bin/env node
// World employer payroll cost guide (JP, UK, US, ES) — CLI. Logic: world-employer-cost-pack-2026.mjs (the same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs <country> '<json>'     country: jp | uk | us | es
import * as w from "./world-employer-cost-pack-2026.mjs";

const TOOLS = { jp: w.jpEmployerCost, uk: w.ukEmployerCost, us: w.usEmployerCost, es: w.esEmployerCost };
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: w.EMPLOYER_AS_OF, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
