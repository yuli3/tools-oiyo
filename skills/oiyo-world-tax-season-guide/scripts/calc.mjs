#!/usr/bin/env node
// Tax season guide (US 2026 refund, Japan 令和8年分 確定申告, Canada and Australia take-home) — CLI.
// Logic: world-tax-season-2027.mjs (the same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs <tool> '<json>'     tool: us-refund | jp-kakutei | ca | au
import * as w from "./world-tax-season-2027.mjs";

const TOOLS = { "us-refund": w.usRefund2026, "jp-kakutei": w.jpKakutei2026, ca: w.caTakeHome2026, au: w.auTakeHome };
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: w.SEASON_AS_OF, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
