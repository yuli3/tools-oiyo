#!/usr/bin/env node
// World labour guide (JP, UK, US, FR, ES, CN, TW) — CLI. Logic: world-labor-pack-2026.mjs (the same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs <country> '<json>'     country: jp | uk | us | fr | es | cn | tw
import * as w from "./world-labor-pack-2026.mjs";

const TOOLS = { jp: w.jpLaborExit, uk: w.ukLaborExit, us: w.usLaborExit, fr: w.frLaborExit, es: w.esLaborExit, cn: w.cnLaborExit, tw: w.twLaborExit };
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: w.LABOR_AS_OF, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
