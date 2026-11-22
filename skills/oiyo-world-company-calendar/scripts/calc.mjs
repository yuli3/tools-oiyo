#!/usr/bin/env node
// World company annual calendar (JP, UK, US, FR) — CLI. Logic: world-company-calendar-2026.mjs (the same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs <country> '<json>'     country: jp | uk | us | fr
import * as w from "./world-company-calendar-2026.mjs";

const TOOLS = { jp: w.jpCompanyCalendar, uk: w.ukCompanyCalendar, us: w.usCompanyCalendar, fr: w.frCompanyCalendar };
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: w.CALENDAR_AS_OF, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
