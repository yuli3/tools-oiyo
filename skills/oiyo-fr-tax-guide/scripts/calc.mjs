#!/usr/bin/env node
// Guide fiscal et comptable France — CLI. Calculs : fr-tax-pack-2026.mjs (même code que les pages tools.oiyo.net/fr/ et le MCP api.oiyo.net).
//   node scripts/calc.mjs <outil> '<json>'
//   outil : calendar | micro | tva | penalty | claim | amortissement | scope
import * as fr from "./fr-tax-pack-2026.mjs";

const TOOLS = {
  calendar: (x) => fr.frTaxCalendar(x),
  micro: (x) => fr.frMicro(x),
  tva: (x) => fr.frTvaFranchise(x),
  penalty: (x) => fr.frPenalty(x),
  claim: (x) => fr.frClaimDeadline(x),
  amortissement: (x) => fr.frAmortissement(x),
  scope: () => fr.FR_SCOPE,
};
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: fr.FR_TAX_AS_OF, note: fr.FR_TAX_NOTE, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
