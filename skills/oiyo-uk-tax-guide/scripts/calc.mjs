#!/usr/bin/env node
// UK tax and accounting guide — CLI. Logic: uk-tax-pack-2026.mjs (the same code as the tools.oiyo.net/en/ UK pages and the api.oiyo.net MCP tools).
//   node scripts/calc.mjs <tool> '<json>'
//   tools: calendar | selfemployed | incometax | mtd | vat | penalty | interest | appeal | capital | scope
import * as uk from "./uk-tax-pack-2026.mjs";

const TOOLS = {
  calendar: (x) => uk.ukTaxCalendar(x),
  selfemployed: (x) => uk.ukSelfEmployed(x),
  incometax: (x) => uk.ukIncomeTax(x.total),
  mtd: (x) => ({ from: uk.ukMtdStart(x) }),
  vat: (x) => uk.ukVatCheck(x),
  penalty: (x) => uk.ukSaPenalties(x),
  interest: (x) => uk.ukInterest(x.amount, x.from, x.to),
  appeal: (x) => uk.ukAppealDeadlines(x),
  capital: (x) => uk.ukCapitalAllowances(x),
  scope: () => uk.UK_SCOPE,
};
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: uk.UK_TAX_AS_OF, note: uk.UK_TAX_NOTE, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
