#!/usr/bin/env node
// Singapore guide (CPF contributions, notice period) — CLI. Logic: world-de-sg-pack-2026.mjs (the same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs <tool> '<json>'     tool: cpf | notice
import * as w from "./world-de-sg-pack-2026.mjs";

const TOOLS = { cpf: w.sgCpf, notice: w.sgNotice };
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: w.DESG_AS_OF, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
