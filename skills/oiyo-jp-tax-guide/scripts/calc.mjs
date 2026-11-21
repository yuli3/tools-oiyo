#!/usr/bin/env node
// 日本の税務・会計ガイド CLI。計算は jp-tax-pack-2026.mjs（tools.oiyo.net の日本ページ・api.oiyo.net MCP と同じコード）。
//   node scripts/calc.mjs <tool> '<json>'
//   tool: calendar | blue | consumption | penalty | appeal | depreciation | scope
import * as jp from "./jp-tax-pack-2026.mjs";

const TOOLS = {
  calendar: (x) => jp.jpTaxCalendar(x),
  blue: (x) => jp.jpBlueReturn(x),
  consumption: (x) => jp.jpConsumptionTax(x),
  penalty: (x) => jp.jpPenalty(x),
  appeal: (x) => jp.jpAppealDeadlines(x),
  depreciation: (x) => jp.jpDepreciation(x),
  scope: () => jp.JP_SCOPE,
};
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
const result = TOOLS[tool](JSON.parse(json));
console.log(JSON.stringify({ asOf: jp.JP_TAX_AS_OF, note: jp.JP_TAX_NOTE, result }, null, 2));
