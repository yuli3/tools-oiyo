#!/usr/bin/env node
// Taxes when you buy a home (UK, JP, FR, ES, CN) — CLI. Logic: world-home-purchase-2026.mjs (same code as the tools.oiyo.net pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs '<json>'
import { homePurchaseTax, HOME_AS_OF } from "./world-home-purchase-2026.mjs";

const [json] = process.argv.slice(2);
if (!json) {
  console.error("usage: node scripts/calc.mjs '{\"country\":\"UK\",\"price\":295000,\"firstTime\":true}'");
  process.exit(2);
}
console.log(JSON.stringify({ asOf: HOME_AS_OF, result: homePurchaseTax(JSON.parse(json)) }, null, 2));
