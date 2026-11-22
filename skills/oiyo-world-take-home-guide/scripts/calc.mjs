#!/usr/bin/env node
// Take-home pay guide (JP, UK, US, FR, ES) — CLI. Logic: world-take-home-2026.mjs (the same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs <tool> '<json>'     tool: uk | us | jp | fr | es
import * as w from "./world-take-home-2026.mjs";

const TOOLS = { uk: w.ukTakeHome, us: w.usTakeHome, jp: w.jpTakeHome, fr: w.frTakeHome, es: w.esTakeHome };
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: w.TAKE_HOME_AS_OF, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
