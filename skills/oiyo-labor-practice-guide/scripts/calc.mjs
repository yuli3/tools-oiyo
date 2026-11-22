#!/usr/bin/env node
// Overtime caps (JP) and irregular-hours holiday accrual (UK) — CLI. Logic: world-labor-practice-2026.mjs (same code as the tools.oiyo.net page and api.oiyo.net MCP tools).
//   node scripts/calc.mjs '<json>'
import { laborPractice, LABOR_PRACTICE_AS_OF } from "./world-labor-practice-2026.mjs";

const [json] = process.argv.slice(2);
if (!json) {
  console.error("usage: node scripts/calc.mjs '{\"country\":\"JP\",\"special\":true,\"months\":[{\"overtime\":90,\"holiday\":5}]}'");
  process.exit(2);
}
console.log(JSON.stringify({ asOf: LABOR_PRACTICE_AS_OF, result: laborPractice(JSON.parse(json)) }, null, 2));
