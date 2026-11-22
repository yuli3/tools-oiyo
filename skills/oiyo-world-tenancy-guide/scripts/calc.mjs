#!/usr/bin/env node
// World tenancy guide (JP, England, CA/NY, FR, ES, CN, TW) — CLI. Logic: world-tenancy-pack-2026.mjs (the same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs <place> '<json>'     place: jp | uk | us | fr | es | cn | tw
import * as w from "./world-tenancy-pack-2026.mjs";

const TOOLS = { jp: w.jpTenancy, uk: w.ukTenancy, us: w.usTenancy, fr: w.frTenancy, es: w.esTenancy, cn: w.cnTenancy, tw: w.twTenancy };
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: w.TENANCY_AS_OF, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
