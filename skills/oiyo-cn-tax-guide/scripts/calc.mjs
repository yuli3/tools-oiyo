#!/usr/bin/env node
// 中国税务与会计指南 — CLI。计算：cn-tax-pack-2026.mjs（与 tools.oiyo.net/zh/ 页面和 api.oiyo.net MCP 相同的代码）。
//   node scripts/calc.mjs <工具> '<json>'
//   工具：calendar | business | comprehensive | cit | vat | latefee | appeal | depreciation | scope
import * as cn from "./cn-tax-pack-2026.mjs";

const TOOLS = {
  calendar: (x) => cn.cnTaxCalendar(x),
  business: (x) => cn.cnBusinessIncome(x),
  comprehensive: (x) => cn.cnComprehensive(x),
  cit: (x) => cn.cnSmallProfitCit(x),
  vat: (x) => cn.cnSmallScaleVat(x),
  latefee: (x) => cn.cnLateFee(x),
  appeal: (x) => cn.cnAppealDeadlines(x),
  depreciation: (x) => cn.cnDepreciation(x),
  scope: () => cn.CN_SCOPE,
};
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: cn.CN_TAX_AS_OF, note: cn.CN_TAX_NOTE, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
