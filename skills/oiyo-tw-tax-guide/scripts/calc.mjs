#!/usr/bin/env node
// 臺灣稅務與會計指南 — CLI。計算：tw-tax-pack-2026.mjs（與 tools.oiyo.net/zh/ 臺灣頁面及 api.oiyo.net MCP 相同的程式）。
//   node scripts/calc.mjs <工具> '<json>'
//   工具：calendar | incometax | businesstax | latefee | appeal | depreciation | scope
import * as tw from "./tw-tax-pack-2026.mjs";

const TOOLS = {
  calendar: (x) => tw.twTaxCalendar(x),
  incometax: (x) => tw.twIncomeTax(x),
  businesstax: (x) => tw.twBusinessTax(x),
  latefee: (x) => tw.twLateFee(x),
  appeal: (x) => tw.twAppealDeadlines(x),
  depreciation: (x) => tw.twDepreciation(x),
  scope: () => tw.TW_SCOPE,
};
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: tw.TW_TAX_AS_OF, note: tw.TW_TAX_NOTE, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
