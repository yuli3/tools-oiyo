#!/usr/bin/env node
// World claims and time-limits guide (JP, England & Wales, California, FR, TW, CN) — CLI. Logic: world-limitation-pack-2026.mjs (the same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs <place> '<json>'     place: jp | uk | ca | fr | tw | cn
import * as w from "./world-limitation-pack-2026.mjs";

const TOOLS = { jp: w.jpLimitation, uk: w.ukLimitation, ca: w.caLimitation, fr: w.frLimitation, tw: w.twLimitation, cn: w.cnSmallClaims };
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: w.LIMITATION_AS_OF, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
