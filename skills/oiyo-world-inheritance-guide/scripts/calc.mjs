#!/usr/bin/env node
// World inheritance and gift guide (JP, UK, US, FR, TW) — CLI. Logic: world-inheritance-pack-2026.mjs (the same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs <tool> '<json>'     tool: jp | jp-gift | uk | us | fr | tw
import * as w from "./world-inheritance-pack-2026.mjs";

const TOOLS = { jp: w.jpInheritance, "jp-gift": w.jpGift, uk: w.ukInheritance, us: w.usEstateGift, fr: w.frSuccession, tw: w.twEstate };
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: w.INHERITANCE_AS_OF, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
