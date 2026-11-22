#!/usr/bin/env node
// World consumer cooling-off guide (JP, UK, FR, ES, CN, TW, US) — CLI. Logic: world-consumer-pack-2026.mjs (the same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs <place> '<json>'     place: jp | uk | fr | es | cn | tw | us
import * as w from "./world-consumer-pack-2026.mjs";

const TOOLS = { jp: w.jpCoolingOff, uk: w.ukCoolingOff, fr: w.frCoolingOff, es: w.esCoolingOff, cn: w.cnCoolingOff, tw: w.twCoolingOff, us: w.usCoolingOff };
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: w.CONSUMER_AS_OF, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
