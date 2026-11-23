#!/usr/bin/env node
// US federal tax and accounting guide CLI. Math lives in us-tax-pack-2026.mjs (same code as the tools.oiyo.net /en/ pages and api.oiyo.net MCP).
//   node scripts/calc.mjs <tool> '<json>'
//   tool: calendar | california | selfemployment | estimated | penalty | appeal | depreciation | scope
import * as us from "./us-tax-pack-2026.mjs";

const TOOLS = {
  calendar: (x) => us.usTaxCalendar(x),
  california: (x) => us.caIncomeTax2025(x),
  selfemployment: (x) => us.usSelfEmployment(x),
  estimated: (x) => us.usEstimatedTax(x),
  penalty: (x) => us.usPenalty(x),
  appeal: (x) => us.usAppealDeadlines(x),
  depreciation: (x) => us.usDepreciation(x),
  scope: () => us.US_SCOPE,
};
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: us.US_TAX_AS_OF, note: us.US_TAX_NOTE, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
